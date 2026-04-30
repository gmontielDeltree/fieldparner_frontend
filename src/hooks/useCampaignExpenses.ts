import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { dbContext } from '../services/pouchdbService';
import { useAppDispatch, useAppSelector } from './useRedux';
import { onLogout } from '../redux/auth';
import { NotificationService } from '../services/notificationService';

import { CampaingExpenses } from '../interfaces/campaignExpenses';
import {
    IActividadPlanificacion,
    ICiclosPlanificacion,
    IInsumosPlanificacion,
    ILaboresPlanificacion,
} from '../interfaces/planification';

const createCampaignExpenseId = () => {
    const randomId =
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    return `campaign-expense:${randomId}`;
};

const normalizeCampaignExpense = (expense: CampaingExpenses): CampaingExpenses => ({
    ...expense,
    zafra: expense.zafra || '',
    partial: expense.partial || '',
    listCamapingExpeses: Array.isArray(expense.listCamapingExpeses) ? expense.listCamapingExpeses : [],
    insumosLabor: Array.isArray(expense.insumosLabor) ? expense.insumosLabor : [],
    serviciosLabor: Array.isArray(expense.serviciosLabor) ? expense.serviciosLabor : [],
    detalleGastos: Array.isArray(expense.detalleGastos) ? expense.detalleGastos : [],
    cosechaLine: expense.cosechaLine ?? null,
});

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
    /** Hectáreas tomadas de la actividad (si están disponibles). */
    hectareas?: number;
    cultivoId?: string;
}

export const useCampaingExpenses = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const [error, setError] = useState<unknown>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [campaingExpenses, setCampaingExpenses] = useState<CampaingExpenses[]>([]);
    const { t } = useTranslation();

    const handleDatabaseError = (currentError: unknown, notificationLabel?: string) => {
        console.error(t('databaseErrorLog'), currentError);
        NotificationService.showError(
            t('databaseError', {
                error: currentError instanceof Error ? currentError.message : t('unexpectedError'),
            }),
            currentError,
            notificationLabel || t('error_label'),
        );
        setError(currentError);
    };

    const ensureUser = () => {
        if (!user) {
            dispatch(onLogout(t('sessionExpired')));
            throw new Error(t('sessionExpired'));
        }
        return user;
    };

    const getCampaingExpenses = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const currentUser = ensureUser();
            const response = await dbContext.campaingExpenses.find({
                selector: {
                    accountId: currentUser.accountId,
                    licenceId: currentUser.licenceId,
                },
            });

            const documents = response.docs.map(doc =>
                normalizeCampaignExpense(doc as CampaingExpenses),
            );
            setCampaingExpenses(documents);
            return documents;
        } catch (currentError) {
            handleDatabaseError(currentError, t('campaign_expense_label'));
            setCampaingExpenses([]);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const getCampaingExpenseById = async (id: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const currentUser = ensureUser();
            const document = normalizeCampaignExpense(
                (await dbContext.campaingExpenses.get(id)) as CampaingExpenses,
            );

            if (
                document.accountId &&
                document.licenceId &&
                (document.accountId !== currentUser.accountId ||
                    document.licenceId !== currentUser.licenceId)
            ) {
                throw new Error(t('expense_not_found'));
            }

            return document;
        } catch (currentError) {
            handleDatabaseError(currentError, t('campaign_expense_label'));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const buildCampaignExpenseDocument = (draft: CampaingExpenses) => {
        const currentUser = ensureUser();
        const now = new Date().toISOString();

        return normalizeCampaignExpense({
            ...draft,
            _id: draft._id || createCampaignExpenseId(),
            accountId: currentUser.accountId,
            licenceId: currentUser.licenceId,
            createdAt: draft.createdAt || now,
            updatedAt: now,
        });
    };

    const createCampingExpeses = async (draft: CampaingExpenses) => {
        setIsLoading(true);
        setError(null);

        try {
            const document = buildCampaignExpenseDocument(draft);
            const response = await dbContext.campaingExpenses.put(document);

            if (response.ok) {
                NotificationService.showAdded(document, t('campaign_expense_label'));
                navigate('/init/overview/campaign-expenses');
                return true;
            }

            NotificationService.showError(t('genericError'), null, t('campaign_expense_label'));
            return false;
        } catch (currentError) {
            handleDatabaseError(currentError, t('campaign_expense_label'));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateCampingExpeses = async (draft: CampaingExpenses) => {
        setIsLoading(true);
        setError(null);

        try {
            if (!draft._id?.trim()) {
                throw new Error(t('noIdError'));
            }

            const document = buildCampaignExpenseDocument(draft);
            const response = await dbContext.campaingExpenses.put(document);

            if (response.ok) {
                NotificationService.showUpdated(document, t('campaign_expense_label'));
                navigate('/init/overview/campaign-expenses');
                return true;
            }

            NotificationService.showError(t('updateError'), null, t('campaign_expense_label'));
            return false;
        } catch (currentError) {
            handleDatabaseError(currentError, t('campaign_expense_label'));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const removeCampingExpeses = async (campaignExpenseId: string, campaignExpenseRev: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await dbContext.campaingExpenses.remove(
                campaignExpenseId,
                campaignExpenseRev,
            );

            if (response.ok) {
                NotificationService.showDeleted({ id: campaignExpenseId }, t('campaign_expense_label'));
                await getCampaingExpenses();
                return true;
            }

            NotificationService.showError(t('delete_failed'), null, t('campaign_expense_label'));
            return false;
        } catch (currentError) {
            handleDatabaseError(currentError, t('campaign_expense_label'));
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
     * Solo lectura: no muta la planificacion.
     */
    const getExecutedLaborsContext = async (
        campanaId: string,
        _campoId: string,
        loteId: string,
    ): Promise<ExecutedLaborsContext> => {
        const empty: ExecutedLaborsContext = { insumos: [], servicios: [], hasHarvest: false };
        if (!campanaId || !loteId) return empty;

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

            const cultivoId = ciclos.find(c => !!c.cultivoId)?.cultivoId;

            const actividadIds = ciclos.flatMap(c => c.actividadesIds || []);
            if (!actividadIds.length) return { ...empty, cultivoId };

            const actividadesResp = await db.allDocs({
                keys: actividadIds,
                include_docs: true,
            });
            const actividades = actividadesResp.rows
                .map((r: any) => r.doc)
                .filter(Boolean) as IActividadPlanificacion[];

            const actividadesEjecutadas = actividades.filter(a => a?.ejecutada);

            const insumoIds: string[] = [];
            const laborLineIds: string[] = [];
            actividadesEjecutadas.forEach(a => {
                (a.insumosLineasIds || []).forEach(id => insumoIds.push(id));
                (a.laboresLineasIds || []).forEach(id => laborLineIds.push(id));
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
            actividadesEjecutadas.forEach(a => actividadById.set(a._id, a));

            const insumos: ExecutedLaborInsumoLine[] = insumosDocs
                .map(linea => {
                    const actividadId =
                        linea.actividadId ||
                        actividadesEjecutadas.find(a =>
                            a.insumosLineasIds?.includes(linea._id),
                        )?._id ||
                        '';
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
                .map(linea => {
                    const actividadId = actividadesEjecutadas.find(a =>
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
                        contratante:
                            actividad.contratista?.name || actividad.contratista?.fantasyName || '',
                        unidadPorHa: Number(linea.costoPorHectarea || 0),
                        hectareas: Number(linea.hectareas || actividad.area || 0),
                        fecha: actividad.fecha,
                    } as ExecutedLaborServiceLine;
                })
                .filter(Boolean) as ExecutedLaborServiceLine[];

            const harvestActividad = actividadesEjecutadas.find(
                a => String(a.tipo || '').toLowerCase() === 'cosecha',
            );

            const hectareas = actividadesEjecutadas
                .map(a => Number(a.area || 0))
                .find(n => n > 0);

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
        // Methods
        createCampingExpeses,
        getCampaingExpenses,
        getCampaingExpenseById,
        getExecutedLaborsContext,
        setCampaingExpenses,
        updateCampingExpeses,
        removeCampingExpeses,
    };
};
