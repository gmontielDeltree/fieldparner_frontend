import { dbContext } from '../db';
import { Field } from '@types';

export interface Activity {
  _id?: string;
  _rev?: string;
  uuid?: string;
  tipo: 'siembra' | 'cosecha' | 'aplicacion' | 'preparado';
  estado?: 'pendiente' | 'completada' | 'en_proceso';
  lote_uuid?: string;
  loteUuid?: string;
  campo_nombre?: string;
  lote_nombre?: string;
  comentario?: string;
  actividad_uuid?: string;
  accountId?: string;
  created?: {
    userId?: string;
    date?: string;
  };
  modified?: {
    userId?: string;
    date?: string;
  };
  campaña?: {
    campaignId?: string;
    name?: string;
  };
  detalles?: {
    cultivo?: {
      descriptionES?: string;
      name?: string;
      _id?: string;
    };
    fecha_ejecucion_tentativa?: string;
    fecha_ejecucion?: string;
    fecha_hora_inicio?: string;
    fecha_hora_fin?: string;
    rinde_obtenido?: number;
    deposito?: string;
    superficie?: number;
    hectareas?: number;
    dosis?: any[];
    servicios?: any[];
  };
  created_at?: string;
  updated_at?: string;
}

export interface EnrichedActivity extends Activity {
  campoData?: {
    _id: string;
    nombre: string;
  };
  loteData?: {
    uuid: string;
    nombre: string;
    hectareas?: number;
  };
}

class ActivitiesService {
  private db: PouchDB.Database;

  constructor() {
    this.db = dbContext.fields;
  }

  // Get all activities
  async getAllActivities(): Promise<Activity[]> {
    try {
      const result = await this.db.allDocs({
        include_docs: true,
        startkey: 'actividad:',
        endkey: 'actividad:\ufff0'
      });

      return result.rows
        .map(row => row.doc as Activity)
        .filter(doc => doc && doc.tipo);
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }

  // Get activities with field and lot information
  async getEnrichedActivities(): Promise<EnrichedActivity[]> {
    try {
      const activities = await this.getAllActivities();

      // Get all campos
      const camposResult = await this.db.allDocs({
        include_docs: true,
        startkey: 'campos_',
        endkey: 'campos_\ufff0'
      });

      // Create maps for quick lookup
      const camposMap = new Map();
      const lotesMap = new Map();

      camposResult.rows.forEach(row => {
        const campo = row.doc as any;
        if (campo) {
          camposMap.set(campo._id, {
            _id: campo._id,
            nombre: campo.properties?.nombre || campo.nombre || campo.name
          });

          // Extract lotes from campo
          if (campo.lotes && Array.isArray(campo.lotes)) {
            campo.lotes.forEach((lote: any) => {
              const loteUuid = lote.properties?.uuid || lote.uuid;
              if (loteUuid) {
                lotesMap.set(loteUuid, {
                  uuid: loteUuid,
                  nombre: lote.properties?.nombre || lote.nombre || lote.name,
                  hectareas: lote.properties?.hectareas,
                  campoId: campo._id,
                  campoNombre: campo.properties?.nombre || campo.nombre || campo.name
                });
              }
            });
          }
        }
      });

      // Enrich activities with campo and lote data
      const enrichedActivities: EnrichedActivity[] = activities.map(activity => {
        const loteUuid = activity.lote_uuid || activity.loteUuid;
        const loteInfo = loteUuid ? lotesMap.get(loteUuid) : null;

        return {
          ...activity,
          campo_nombre: loteInfo?.campoNombre || activity.campo_nombre,
          lote_nombre: loteInfo?.nombre || activity.lote_nombre,
          loteData: loteInfo,
          campoData: loteInfo ? { _id: loteInfo.campoId, nombre: loteInfo.campoNombre } : undefined
        };
      });

      return enrichedActivities;
    } catch (error) {
      console.error('Error fetching enriched activities:', error);
      return [];
    }
  }

  // Get activities by campaign
  async getActivitiesByCampaign(campaignId: string): Promise<EnrichedActivity[]> {
    const activities = await this.getEnrichedActivities();
    return activities.filter(activity =>
      activity.campaña?.campaignId === campaignId ||
      activity.campaña?.name === campaignId
    );
  }

  // Get activities by lote
  async getActivitiesByLote(loteUuid: string): Promise<Activity[]> {
    const activities = await this.getAllActivities();
    return activities.filter(activity =>
      activity.lote_uuid === loteUuid || activity.loteUuid === loteUuid
    );
  }

  // Update activity
  async updateActivity(activity: Activity): Promise<boolean> {
    try {
      if (!activity._id) {
        console.error('Activity must have an _id to update');
        return false;
      }

      const existingDoc = await this.db.get(activity._id);
      const updatedActivity = {
        ...existingDoc,
        ...activity,
        _rev: existingDoc._rev,
        updated_at: new Date().toISOString()
      };

      await this.db.put(updatedActivity);
      return true;
    } catch (error) {
      console.error('Error updating activity:', error);
      return false;
    }
  }

  // Update activity status
  async updateActivityStatus(activityId: string, estado: 'pendiente' | 'completada' | 'en_proceso'): Promise<boolean> {
    try {
      const activity = await this.db.get(activityId) as Activity;
      activity.estado = estado;
      activity.updated_at = new Date().toISOString();

      if (estado === 'completada' && !activity.detalles?.fecha_ejecucion) {
        activity.detalles = {
          ...activity.detalles,
          fecha_ejecucion: new Date().toISOString()
        };
      }

      await this.db.put(activity);
      return true;
    } catch (error) {
      console.error('Error updating activity status:', error);
      return false;
    }
  }

  // Delete activity
  async deleteActivity(activityId: string): Promise<boolean> {
    try {
      const doc = await this.db.get(activityId);
      await this.db.remove(doc);
      return true;
    } catch (error) {
      console.error('Error deleting activity:', error);
      return false;
    }
  }

  // Reset activity to pending
  async resetActivity(activityId: string): Promise<boolean> {
    return this.updateActivityStatus(activityId, 'pendiente');
  }

  // Subscribe to changes
  onChanges(callback: () => void): () => void {
    const changes = this.db.changes({
      since: 'now',
      live: true,
      include_docs: false,
      filter: (doc: any) => {
        return doc._id && doc._id.startsWith('actividad:');
      }
    }).on('change', () => {
      callback();
    });

    // Return unsubscribe function
    return () => changes.cancel();
  }

  // Get all fields (campos)
  async getAllFields(): Promise<Field[]> {
    try {
      const result = await this.db.allDocs({
        include_docs: true,
        startkey: 'campos_',
        endkey: 'campos_\ufff0'
      });

      return result.rows
        .map(row => row.doc as Field)
        .filter(doc => doc && doc._id);
    } catch (error) {
      console.error('Error fetching fields:', error);
      return [];
    }
  }

  // Get all lotes with campo info
  async getAllLotes(): Promise<Array<{ uuid: string; nombre: string; campoId: string; campoNombre: string; hectareas?: number }>> {
    try {
      const campos = await this.getAllFields();
      const lotes: Array<{ uuid: string; nombre: string; campoId: string; campoNombre: string; hectareas?: number }> = [];

      campos.forEach(campo => {
        if (campo.lotes && Array.isArray(campo.lotes)) {
          campo.lotes.forEach((lote: any) => {
            const loteUuid = lote.properties?.uuid || lote.uuid;
            if (loteUuid) {
              lotes.push({
                uuid: loteUuid,
                nombre: lote.properties?.nombre || lote.nombre || lote.name || '',
                hectareas: lote.properties?.hectareas,
                campoId: campo._id,
                campoNombre: campo.properties?.nombre || campo.nombre || campo.name || ''
              });
            }
          });
        }
      });

      return lotes;
    } catch (error) {
      console.error('Error fetching lotes:', error);
      return [];
    }
  }

  // Get unique users from activities
  async getUniqueUsers(): Promise<Array<{ userId: string; name?: string }>> {
    try {
      const activities = await this.getAllActivities();
      const usersMap = new Map<string, { userId: string; name?: string }>();

      activities.forEach(activity => {
        // Check created.userId
        if (activity.created?.userId && !usersMap.has(activity.created.userId)) {
          usersMap.set(activity.created.userId, {
            userId: activity.created.userId,
            name: activity.created.userId // We can enrich this with user names if we have a users collection
          });
        }

        // Check modified.userId
        if (activity.modified?.userId && !usersMap.has(activity.modified.userId)) {
          usersMap.set(activity.modified.userId, {
            userId: activity.modified.userId,
            name: activity.modified.userId
          });
        }

        // Check accountId as fallback
        if (activity.accountId && !usersMap.has(activity.accountId)) {
          usersMap.set(activity.accountId, {
            userId: activity.accountId,
            name: activity.accountId
          });
        }
      });

      return Array.from(usersMap.values());
    } catch (error) {
      console.error('Error fetching unique users:', error);
      return [];
    }
  }
}

export const activitiesService = new ActivitiesService();