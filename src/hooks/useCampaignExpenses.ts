import { useState } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { onLogout } from '../redux/auth';
import { dbContext } from '../services';
import { CampaingExpenses } from '../interfaces/campaignExpenses';
import {
    IActividadPlanificacion,
    ICiclosPlanificacion,
    IInsumosPlanificacion,
    ILaboresPlanificacion,
} from '../interfaces/planification';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NotificationService } from '../services/notificationService';

export interface ExecutedLaborInsumoLine {
    actividadId: string;
    insumoLineaId: string;
    laborId: string;
    laborNombre?: string;
    insumoId: string;
    insumoNombre?: string;
    cantidadPorHa: number;
    unidad?: string;
    fecha?: string;
    tipo?: string;
}

export interface ExecutedLaborServiceLine {
    actividadId: string;
    laborLineaId: string;
    laborId: string;
    laborNombre?: string;
    servicio?: string;
    contratante?: string;
    unidadPorHa: number;
    unidad?: string;
    hectareas: number;
    fecha?: string;
}

export interface ExecutedLaborsContext {
    insumos: ExecutedLaborInsumoLine[];
    servicios: ExecutedLaborServiceLine[];
    /** ¿Hay alguna labor de cosecha ejecutada en este contexto? */
    hasHarvest: boolean;
    harvestActividadId?: string;
    /** Hectáreas tomadas del lote (si están disponibles desde el GeoJSON). */
    hectareas?: number;
    cultivoId?: string;
}

export const useCampaingExpenses = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [campaingExpenses, setCampaingExpenses] = useState<CampaingExpenses[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [listCampingExpeses, setListCampingExpeses] = useState<any[]>([]);
    const [conceptoError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const getCampaingExpenses = async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (!user) {
                dispatch(onLogout("Session expired."));
                setIsLoading(false);
                return false;
            }

            if (!dbContext) {
                console.error("Database context is not initialized");
                setIsLoading(false);
                return false;
            }

            if (!dbContext.campaingExpenses) {
                console.error("campaingExpenses database is not available");
                setIsLoading(false);
                return false;
            }

            const selector = {
                selector: {
                    accountId: user.accountId,
                    licenceId: user.licenceId
                }
            };
            const response = await dbContext.campaingExpenses.find(selector);

            if (response && response.docs) {
                const expenses = response.docs.map(doc => doc as CampaingExpenses);
                setCampaingExpenses(expenses);
                setIsLoading(false);
                return true;
            } else {
                setCampaingExpenses([]);
                setIsLoading(false);
                return false;
            }
        } catch (err) {
            console.error("Error durante getCampaingExpenses:", err);
            setError(err);
            setIsLoading(false);
            return false;
        }
    };

    const handleDatabaseError = (err: any) => {
        console.error('Database error:', err);
        NotificationService.showError(
            t("database_error", { error: err.message || t("unexpected_error") }),
            {},
            t("error_label")
        );
        setIsLoading(false);
        setError(err);
    };

    const getCampaingExpenseById = async (id: string): Promise<CampaingExpenses | null> => {
        try {
            if (!dbContext?.campaingExpenses) return null;
            const doc = await dbContext.campaingExpenses.get(id);
            return doc as CampaingExpenses;
        } catch (err: any) {
            if (err?.name !== 'not_found') {
                console.error('Error fetching campaign expense by id:', err);
            }
            return null;
        }
    };

    const stamp = (doc: CampaingExpenses): CampaingExpenses => {
        const now = new Date().toISOString();
        return {
            ...doc,
            accountId: doc.accountId || user?.accountId,
            licenceId: doc.licenceId || user?.licenceId,
            creationDate: doc.creationDate || now,
            lastUpdate: now,
        };
    };

    const createCampingExpeses = async (newCampaingExpenses: CampaingExpenses) => {
        setIsLoading(true);
        setError(null);

        try {
            if (!dbContext || !dbContext.campaingExpenses) {
                throw new Error("Database context is not initialized properly");
            }

            const response = await dbContext.campaingExpenses.post(stamp(newCampaingExpenses));
            if (response.ok) {
                NotificationService.showAdded({}, t("campaign_expense_label"));
                navigate('/init/overview/campaign-expenses');
                return true;
            } else {
                NotificationService.showError(t("operation_failed"), {}, t("campaign_expense_label"));
                return false;
            }
        } catch (err) {
            handleDatabaseError(err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateCampingExpeses = async (doc: CampaingExpenses) => {
        setIsLoading(true);
        setError(null);

        try {
            if (!dbContext?.campaingExpenses) {
                throw new Error("Database context is not initialized properly");
            }
            if (!doc._id || !doc._rev) {
                throw new Error("Missing _id/_rev for update");
            }

            const response = await dbContext.campaingExpenses.put(stamp(doc));
            if (response.ok) {
                NotificationService.showUpdated({}, t("campaign_expense_label"));
                navigate('/init/overview/campaign-expenses');
                return true;
            }
            NotificationService.showError(t("operation_failed"), {}, t("campaign_expense_label"));
            return false;
        } catch (err) {
            handleDatabaseError(err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const removeCampingExpeses = async (CampingExpesesId: string, removeCampingExpeses: string) => {
        setIsLoading(true);
        setError(null);

        try {
            if (!dbContext || !dbContext.campaingExpenses) {
                throw new Error("Database context is not initialized properly");
            }

            const response = await dbContext.campaingExpenses.remove(CampingExpesesId, removeCampingExpeses);

            if (response.ok) {
                NotificationService.showDeleted({}, t("campaign_expense_label"));
                await getCampaingExpenses();
                return true;
            } else {
                NotificationService.showError(t("delete_failed"), {}, t("campaign_expense_label"));
                return false;
            }
        } catch (err) {
            console.error("Error removing campaign expense:", err);
            NotificationService.showError(t("expense_not_found"), {}, t("campaign_expense_label"));
            setError(err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Recolecta lineas de insumos y servicios de labores YA EJECUTADAS
     * para una combinacion campaña/campo/lote, mirando la planificacion
     * existente (ICiclosPlanificacion -> IActividadPlanificacion -> lineas).
     *
     * Mantiene cero efectos colaterales: solo lectura.
     */
    const getExecutedLaborsContext = async (
        campanaId: string,
        campoId: string,
        loteId: string,
    ): Promise<ExecutedLaborsContext> => {
        const empty: ExecutedLaborsContext = { insumos: [], servicios: [], hasHarvest: false };
        if (!campanaId || !campoId || !loteId) return empty;

        const db = dbContext.fields as unknown as PouchDB.Database<any>;
        try {
            const startKey = `ciclo:${campanaId}:${loteId}`;
            const ciclosResp = await db.allDocs({
                include_docs: true,
                startkey: startKey,
                endkey: startKey + '￰',
            });

            const ciclos = ciclosResp.rows
                .map((r: any) => r.doc)
                .filter(Boolean) as ICiclosPlanificacion[];

            const cultivoId = ciclos.find((c) => !!c.cultivoId)?.cultivoId;

            const actividadIds = ciclos.flatMap((c) => c.actividadesIds || []);
            if (!actividadIds.length) return { ...empty, cultivoId };

            const actividadesResp = await db.allDocs({
                keys: actividadIds,
                include_docs: true,
            });
            const actividades = actividadesResp.rows
                .map((r: any) => r.doc)
                .filter(Boolean) as IActividadPlanificacion[];

            const actividadesEjecutadas = actividades.filter((a) => a?.ejecutada);

            const insumoIds: string[] = [];
            const laborLineIds: string[] = [];
            actividadesEjecutadas.forEach((a) => {
                (a.insumosLineasIds || []).forEach((id) => insumoIds.push(id));
                (a.laboresLineasIds || []).forEach((id) => laborLineIds.push(id));
            });

            const [insumosResp, serviciosResp] = await Promise.all([
                insumoIds.length
                    ? db.allDocs({ keys: insumoIds, include_docs: true })
                    : Promise.resolve({ rows: [] } as any),
                laborLineIds.length
                    ? db.allDocs({ keys: laborLineIds, include_docs: true })
                    : Promise.resolve({ rows: [] } as any),
            ]);

            const insumosDocs = insumosResp.rows
                .map((r: any) => r.doc)
                .filter(Boolean) as IInsumosPlanificacion[];
            const laboresDocs = serviciosResp.rows
                .map((r: any) => r.doc)
                .filter(Boolean) as ILaboresPlanificacion[];

            const actividadById = new Map<string, IActividadPlanificacion>();
            actividadesEjecutadas.forEach((a) => actividadById.set(a._id, a));

            const insumos: ExecutedLaborInsumoLine[] = insumosDocs
                .map((linea) => {
                    const actividadId = linea.actividadId
                        || actividadesEjecutadas.find((a) => a.insumosLineasIds?.includes(linea._id))?._id
                        || '';
                    const actividad = actividadId ? actividadById.get(actividadId) : undefined;
                    if (!actividad) return null;
                    return {
                        actividadId: actividad._id,
                        insumoLineaId: linea._id,
                        laborId: '',
                        laborNombre: actividad.tipo,
                        insumoId: linea.insumoId,
                        cantidadPorHa: Number(linea.dosis || 0),
                        fecha: actividad.fecha,
                        tipo: actividad.tipo,
                    } as ExecutedLaborInsumoLine;
                })
                .filter(Boolean) as ExecutedLaborInsumoLine[];

            const servicios: ExecutedLaborServiceLine[] = laboresDocs
                .map((linea) => {
                    const actividadId = actividadesEjecutadas.find((a) =>
                        a.laboresLineasIds?.includes(linea._id),
                    )?._id || '';
                    const actividad = actividadId ? actividadById.get(actividadId) : undefined;
                    if (!actividad) return null;
                    return {
                        actividadId: actividad._id,
                        laborLineaId: linea._id,
                        laborId: linea.laborId,
                        laborNombre: linea.laborNombre || actividad.tipo,
                        servicio: linea.laborNombre || actividad.tipo,
                        contratante: actividad.contratista?.name || actividad.contratista?.fantasyName || '',
                        unidadPorHa: Number(linea.costoPorHectarea || 0),
                        hectareas: Number(linea.hectareas || actividad.area || 0),
                        fecha: actividad.fecha,
                    } as ExecutedLaborServiceLine;
                })
                .filter(Boolean) as ExecutedLaborServiceLine[];

            const harvestActividad = actividadesEjecutadas.find((a) =>
                String(a.tipo || '').toLowerCase() === 'cosecha',
            );

            const hectareas = actividadesEjecutadas
                .map((a) => Number(a.area || 0))
                .find((n) => n > 0);

            return {
                insumos,
                servicios,
                hasHarvest: Boolean(harvestActividad),
                harvestActividadId: harvestActividad?._id,
                hectareas,
                cultivoId,
            };
        } catch (err) {
            console.error('Error reading executed labors context:', err);
            return empty;
        }
    };

    return {
        // Properties
        error,
        isLoading,
        campaingExpenses,
        listCampingExpeses,
        conceptoError,
        // Methods
        setListCampingExpeses,
        createCampingExpeses,
        updateCampingExpeses,
        getCampaingExpenses,
        getCampaingExpenseById,
        getExecutedLaborsContext,
        setCampaingExpenses,
        removeCampingExpeses,
    };
};
