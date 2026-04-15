import { Actividad } from '../interfaces/activity';
import { IActividadPlanificacion } from '../interfaces/planification';
import { dbContext } from './pouchdbService';

export type LotActivityPair = {
  actividad: Actividad;
  ejecucion_id: string | undefined;
};

type LotActivitySnapshot = {
  activitiesByLot: Map<string, Actividad[]>;
  executionIdByActivityUuid: Map<string, string>;
  executionIds: string[];
  plannedCountByLot: Map<string, number>;
};

const ACTIVITY_PREFIX = 'actividad:';
const EXECUTION_PREFIX = 'ejecucion:';
const PLAN_ACTIVITY_PREFIX = 'planactividad:';

let lotActivitySnapshot: LotActivitySnapshot | null = null;
let lotActivitySnapshotPromise: Promise<LotActivitySnapshot> | null = null;
let lotActivityChangesFeed: any = null;

const fetchDocsByPrefix = async <T = any>(db: any, prefix: string): Promise<T[]> => {
  const result = await db.allDocs({
    include_docs: true,
    startkey: prefix,
    endkey: `${prefix}\ufff0`,
  });

  return result.rows.map((row: any) => row.doc as T).filter(Boolean);
};

const fetchIdsByPrefix = async (db: any, prefix: string): Promise<string[]> => {
  const result = await db.allDocs({
    startkey: prefix,
    endkey: `${prefix}\ufff0`,
  });

  return result.rows.map((row: any) => row.id as string).filter(Boolean);
};

const getExecutionActivityUuid = (executionId: string) => {
  const lastSeparatorIndex = executionId.lastIndexOf(':');
  return lastSeparatorIndex >= 0 ? executionId.slice(lastSeparatorIndex + 1) : executionId;
};

const buildLotActivitySnapshot = async (db: any): Promise<LotActivitySnapshot> => {
  const [activities, executionIds, plannedActivities] = await Promise.all([
    fetchDocsByPrefix<Actividad>(db, ACTIVITY_PREFIX),
    fetchIdsByPrefix(db, EXECUTION_PREFIX),
    fetchDocsByPrefix<IActividadPlanificacion>(db, PLAN_ACTIVITY_PREFIX),
  ]);

  const activitiesByLot = new Map<string, Actividad[]>();
  const executionIdByActivityUuid = new Map<string, string>();
  const plannedCountByLot = new Map<string, number>();

  activities.forEach((activity) => {
    const lotId = activity?.lote_uuid;
    if (!lotId) return;

    const existingActivities = activitiesByLot.get(lotId);
    if (existingActivities) {
      existingActivities.push(activity);
      return;
    }

    activitiesByLot.set(lotId, [activity]);
  });

  activitiesByLot.forEach((lotActivities, lotId) => {
    activitiesByLot.set(lotId, [...lotActivities].reverse());
  });

  executionIds.forEach((executionId) => {
    const activityUuid = getExecutionActivityUuid(executionId);
    if (!activityUuid || executionIdByActivityUuid.has(activityUuid)) return;
    executionIdByActivityUuid.set(activityUuid, executionId);
  });

  plannedActivities.forEach((plannedActivity) => {
    const lotId = plannedActivity?.loteId;
    if (!lotId) return;

    plannedCountByLot.set(lotId, (plannedCountByLot.get(lotId) || 0) + 1);
  });

  return {
    activitiesByLot,
    executionIdByActivityUuid,
    executionIds,
    plannedCountByLot,
  };
};

const ensureLotActivitySnapshotInvalidation = (db: any) => {
  if (lotActivityChangesFeed || !db?.changes) {
    return;
  }

  lotActivityChangesFeed = db
    .changes({ since: 'now', live: true, include_docs: false })
    .on('change', (change: any) => {
      if (isLotActivitiesSnapshotDocId(change?.id || '')) {
        invalidateLotActivitiesSnapshot();
      }
    })
    .on('error', () => {
      lotActivityChangesFeed = null;
    });
};

const getLotActivitySnapshot = async (db: any = dbContext.fields): Promise<LotActivitySnapshot> => {
  ensureLotActivitySnapshotInvalidation(db);

  if (lotActivitySnapshot) {
    return lotActivitySnapshot;
  }

  if (!lotActivitySnapshotPromise) {
    lotActivitySnapshotPromise = buildLotActivitySnapshot(db)
      .then((snapshot) => {
        lotActivitySnapshot = snapshot;
        return snapshot;
      })
      .finally(() => {
        lotActivitySnapshotPromise = null;
      });
  }

  return lotActivitySnapshotPromise;
};

const resolveExecutionId = (snapshot: LotActivitySnapshot, activity: Actividad) => {
  const activityUuid = activity?.uuid;
  if (!activityUuid) return undefined;

  return (
    snapshot.executionIdByActivityUuid.get(activityUuid) ||
    snapshot.executionIds.find((executionId) => executionId.includes(activityUuid))
  );
};

export const getLotActivitiesWithCounts = async (
  lotId: string,
  db: any = dbContext.fields,
): Promise<{ activities: LotActivityPair[]; plannedActivitiesCount: number }> => {
  const snapshot = await getLotActivitySnapshot(db);
  const activities = snapshot.activitiesByLot.get(lotId) || [];

  return {
    activities: activities.map((activity) => ({
      actividad: activity,
      ejecucion_id: resolveExecutionId(snapshot, activity),
    })),
    plannedActivitiesCount: snapshot.plannedCountByLot.get(lotId) || 0,
  };
};

export const invalidateLotActivitiesSnapshot = () => {
  lotActivitySnapshot = null;
  lotActivitySnapshotPromise = null;
};

export const isLotActivitiesSnapshotDocId = (id: string = '') => {
  return (
    id.startsWith(ACTIVITY_PREFIX) ||
    id.startsWith(EXECUTION_PREFIX) ||
    id.startsWith(PLAN_ACTIVITY_PREFIX)
  );
};
