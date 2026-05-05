import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Container,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    Step,
    StepLabel,
    Stepper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    ArrowBack as BackIcon,
    ArrowForward as ForwardIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { uuidv7 } from 'uuidv7';
import Swal from 'sweetalert2';

import { TemplateLayout, Loading, CloseButtonPage } from '../../components';
import {
    useCampaign,
    useField,
    useCrops,
    useCompany,
    useCorporateContract,
    useCostsExpensess,
} from '../../hooks';
import {
    useCampaingExpenses,
    ExecutedLaborsContext,
} from '../../hooks/useCampaignExpenses';
import {
    CampaingExpenses,
    CosechaLine,
    DetalleGastoLine,
    InsumoLaborLine,
    ServicioLaborLine,
    isCampaignExpenseClosed,
} from '../../interfaces/campaignExpenses';
import { Campaign, Field, Lot } from '../../types';
import { Company } from '../../interfaces/company';
import { CostsExpenses } from '../../interfaces/costsExpenses';
import { CorporateContract } from '../../interfaces/corporateContract';
import { useAppSelector } from '../../hooks/useRedux';
import { loadCampaignFromLS } from '../../helpers/persistence';
import {
    findCampaignByStoredValue,
    findCompanyByStoredValue,
    findFieldByStoredValue,
    findLotByStoredValue,
    getCampaignCandidates,
    getFieldCandidates,
    getLotCandidates,
    matchesStoredValue,
} from './helpers';

type Mode = 'new' | 'edit' | 'view';

const STEPS = ['labors_step', 'services_step', 'additional_expenses_step'] as const;

const safeNum = (v: any): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

const sumValorTotal = (lines: { valorTotal?: number }[]): number =>
    lines.reduce((acc, l) => acc + safeNum(l.valorTotal), 0);

const computeValorTotalMonAlt = (valorTotal: number, cotMonAlt: number): number =>
    cotMonAlt > 0 ? valorTotal / cotMonAlt : 0;

const formatMoney = (v: number): string =>
    Number.isFinite(v)
        ? new Intl.NumberFormat('es-AR', {
              style: 'decimal',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          }).format(v)
        : '0,00';

const lotStoredValue = (lot: Lot | null) =>
    (lot as any)?.id ||
    (lot as any)?.properties?.uuid ||
    (lot as any)?.properties?.id ||
    (lot as any)?.properties?.nombre ||
    (lot as any)?._id ||
    '';

const fieldStoredValue = (field: Field | null) =>
    field?._id || field?.uuid || (field as any)?.nombre || '';

const campaignStoredValue = (campaign: Campaign | null) =>
    campaign?._id || campaign?.campaignId || campaign?.name || '';

interface Props {
    mode?: Mode;
}

export const CampaignExpensesWizardPage: React.FC<Props> = ({ mode: modeProp }) => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAppSelector(state => state.auth);

    const mode: Mode = modeProp || (id ? 'edit' : 'new');
    const isView = mode === 'view';

    const [activeStep, setActiveStep] = useState(0);
    const [loadingDoc, setLoadingDoc] = useState(false);

    // ---- Hooks de datos auxiliares ----------------------------------------
    const { campaigns, getCampaigns } = useCampaign();
    const { fields, getFields } = useField();
    const { crops, getCrops } = useCrops();
    const { companies, getCompanies } = useCompany();
    const { listCorporateContract, getCorporateContract } = useCorporateContract();
    const { costsExpenses, getCostsExpenses } = useCostsExpensess();
    const {
        campaingExpenses,
        getCampaingExpenses,
        getCampaingExpenseById,
        createCampingExpeses,
        updateCampingExpeses,
        getExecutedLaborsContext,
        isLoading,
    } = useCampaingExpenses();

    // ---- Estado del documento ---------------------------------------------
    const [doc, setDoc] = useState<CampaingExpenses>({
        accountId: user?.accountId,
        licenceId: user?.licenceId,
        campaign: '',
        field: '',
        lot: '',
        hectares: '',
        partial: '',
        listCamapingExpeses: [],
        campaignName: '',
        zafra: '',
        fieldId: '',
        fieldName: '',
        lotId: '',
        lotName: '',
        cropId: '',
        cropName: '',
        hectareas: 0,
        monedaAlternativa: '',
        cotizacionMonedaAlternativa: 0,
        estaCerrada: false,
        insumosLabor: [],
        cosechaLine: null,
        serviciosLabor: [],
        detalleGastos: [],
    });

    // ---- Carga de dependencias --------------------------------------------
    useEffect(() => {
        const loadDeps = async () => {
            await Promise.all([
                getCampaigns(),
                getFields(),
                getCrops(),
                getCompanies(),
                getCorporateContract(),
                getCostsExpenses(),
                getCampaingExpenses(),
            ]);
        };
        loadDeps();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---- Carga del documento existente ------------------------------------
    useEffect(() => {
        const load = async () => {
            if (!id) {
                // En modo new, precargar campaña desde LS si hay alguna seleccionada.
                const stored = loadCampaignFromLS();
                if (stored) {
                    const defaultZafra = Array.isArray(stored.zafra)
                        ? stored.zafra[0] || ''
                        : stored.zafra || '';
                    setDoc(prev => ({
                        ...prev,
                        campaign: stored._id || stored.campaignId || stored.name || '',
                        campaignName: stored.name || '',
                        zafra: defaultZafra,
                    }));
                }
                return;
            }

            setLoadingDoc(true);
            const found = await getCampaingExpenseById(id);
            if (found) {
                setDoc({
                    insumosLabor: [],
                    cosechaLine: null,
                    serviciosLabor: [],
                    detalleGastos: [],
                    listCamapingExpeses: [],
                    ...found,
                });
            }
            setLoadingDoc(false);
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // ---- Resolución encadenada (vía helpers, robusta a IDs heterogéneos) --
    const selectedCampaign = useMemo(
        () => findCampaignByStoredValue(campaigns, doc.campaign) || null,
        [campaigns, doc.campaign],
    );

    const zafraOptions = useMemo(() => {
        if (!selectedCampaign?.zafra) return [] as string[];
        return Array.isArray(selectedCampaign.zafra)
            ? selectedCampaign.zafra
            : [selectedCampaign.zafra];
    }, [selectedCampaign]);

    const selectedField = useMemo(
        () =>
            findFieldByStoredValue(fields, doc.fieldId) ||
            findFieldByStoredValue(fields, doc.field) ||
            null,
        [fields, doc.fieldId, doc.field],
    );

    const lotOptions = useMemo(() => selectedField?.lotes || [], [selectedField]);

    const selectedLot = useMemo(
        () =>
            findLotByStoredValue(selectedField, doc.lotId) ||
            findLotByStoredValue(selectedField, doc.lot) ||
            null,
        [selectedField, doc.lotId, doc.lot],
    );

    // ---- Trae labores ejecutadas cuando cambia campaña/campo/lote ---------
    useEffect(() => {
        const run = async () => {
            if (mode !== 'new') return;
            if (!selectedCampaign || !selectedField || !selectedLot) return;

            const ctx: ExecutedLaborsContext = await getExecutedLaborsContext(
                campaignStoredValue(selectedCampaign),
                fieldStoredValue(selectedField),
                lotStoredValue(selectedLot),
            );

            const cropFromCtx = ctx.cultivoId
                ? crops.find((c: any) => c._id === ctx.cultivoId)
                : undefined;

            const insumosLabor: InsumoLaborLine[] = ctx.insumos.map(i => ({
                id: uuidv7(),
                actividadId: i.actividadId,
                insumoLineaId: i.insumoLineaId,
                laborId: i.laborId,
                laborNombre: i.laborNombre,
                insumoId: i.insumoId,
                cantidadPorHa: i.cantidadPorHa,
                unidad: i.unidad,
                valorUnidad: 0,
                valorTotal: 0,
                valorTotalMonAlt: 0,
            }));

            const serviciosLabor: ServicioLaborLine[] = ctx.servicios.map(s => ({
                id: uuidv7(),
                actividadId: s.actividadId,
                laborLineaId: s.laborLineaId,
                fecha: s.fecha,
                laborId: s.laborId,
                laborNombre: s.laborNombre,
                servicio: s.servicio,
                contratante: s.contratante,
                unidadPorHa: s.unidadPorHa,
                hectareas: s.hectareas,
                valorUnidad: 0,
                valorTotal: 0,
                valorTotalMonAlt: 0,
            }));

            const cosechaLine: CosechaLine | null = ctx.hasHarvest
                ? {
                      actividadId: ctx.harvestActividadId,
                      cultivoId: ctx.cultivoId,
                      cultivoNombre:
                          (cropFromCtx as any)?.descriptionES ||
                          (cropFromCtx as any)?.crop ||
                          '',
                      rindeCantidad: 0,
                      valorUnidad: 0,
                      valorTotal: 0,
                      valorTotalMonAlt: 0,
                  }
                : null;

            const lotHa = Number((selectedLot as any)?.properties?.hectareas) || 0;

            setDoc(prev => ({
                ...prev,
                hectareas: ctx.hectareas ?? lotHa ?? 0,
                cropId: ctx.cultivoId || prev.cropId,
                cropName:
                    (cropFromCtx as any)?.descriptionES ||
                    (cropFromCtx as any)?.crop ||
                    prev.cropName,
                insumosLabor,
                serviciosLabor,
                cosechaLine,
            }));
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCampaign?._id, selectedField?._id, selectedLot, mode]);

    // ---- Recálculo de Valor Total / MonAlt --------------------------------
    const cotMonAlt = safeNum(doc.cotizacionMonedaAlternativa);
    const hectareas = safeNum(doc.hectareas);

    useEffect(() => {
        setDoc(prev => {
            const nextInsumos = (prev.insumosLabor || []).map(line => {
                const valorTotal =
                    safeNum(line.cantidadPorHa) * hectareas * safeNum(line.valorUnidad);
                return {
                    ...line,
                    valorTotal,
                    valorTotalMonAlt: computeValorTotalMonAlt(valorTotal, cotMonAlt),
                };
            });
            const nextCosecha = prev.cosechaLine
                ? (() => {
                      const valorTotal =
                          safeNum(prev.cosechaLine.rindeCantidad) *
                          safeNum(prev.cosechaLine.valorUnidad);
                      return {
                          ...prev.cosechaLine,
                          valorTotal,
                          valorTotalMonAlt: computeValorTotalMonAlt(valorTotal, cotMonAlt),
                      };
                  })()
                : prev.cosechaLine;
            const nextServicios = (prev.serviciosLabor || []).map(line => {
                // Doc literal: ValorTotal = UnidadPorHa × ValorUnidad
                const valorTotal = safeNum(line.unidadPorHa) * safeNum(line.valorUnidad);
                return {
                    ...line,
                    valorTotal,
                    valorTotalMonAlt: computeValorTotalMonAlt(valorTotal, cotMonAlt),
                };
            });
            return {
                ...prev,
                insumosLabor: nextInsumos,
                cosechaLine: nextCosecha,
                serviciosLabor: nextServicios,
            };
        });
    }, [hectareas, cotMonAlt]);

    // ---- Cálculos de cabecera (Gastos / Tendencia) ------------------------
    const totalGastos = useMemo(
        () => sumValorTotal(doc.insumosLabor || []),
        [doc.insumosLabor],
    );
    const totalCosecha = useMemo(
        () => safeNum(doc.cosechaLine?.valorTotal),
        [doc.cosechaLine],
    );
    // Doc literal: Tendencia = Gastos − Valor Total Cosecha. Para coloreado
    // usamos el sentido económico (ganancia neta = Cosecha − Gastos).
    const tendencia = totalGastos - totalCosecha;
    const gastosIsRed = totalGastos > totalCosecha && totalCosecha > 0;
    const tendenciaIsGreen = totalCosecha > totalGastos;

    // ---- Validaciones -----------------------------------------------------
    const sectionAValid = useMemo(() => {
        if (!doc.campaign) return false;
        if (zafraOptions.length > 0 && !doc.zafra) return false;
        if (!doc.fieldId && !doc.field) return false;
        if (!doc.lotId && !doc.lot) return false;
        if (doc.monedaAlternativa && !(safeNum(doc.cotizacionMonedaAlternativa) > 0)) {
            return false;
        }
        return true;
    }, [doc, zafraOptions]);

    const step1Valid = useMemo(() => {
        const insumosOk = (doc.insumosLabor || []).every(
            l => safeNum(l.valorUnidad) > 0 && !!l.sociedadId,
        );
        const cosechaOk = !doc.cosechaLine
            ? true
            : safeNum(doc.cosechaLine.valorUnidad) > 0 && !!doc.cosechaLine.sociedadId;
        return sectionAValid && insumosOk && cosechaOk;
    }, [doc, sectionAValid]);

    const step2Valid = useMemo(() => {
        return (doc.serviciosLabor || []).every(l => safeNum(l.valorUnidad) >= 0);
    }, [doc]);

    // Detección de duplicados (mismo campaña/zafra/campo/lote).
    const findDuplicate = (): CampaingExpenses | undefined => {
        return campaingExpenses.find(other => {
            if (!other._id || other._id === doc._id) return false;
            const sameCampaign = matchesStoredValue(
                other.campaign,
                selectedCampaign ? getCampaignCandidates(selectedCampaign) : [doc.campaign],
            );
            const sameField = matchesStoredValue(
                other.field,
                selectedField ? getFieldCandidates(selectedField) : [doc.field, doc.fieldId || ''],
            );
            const sameLot = matchesStoredValue(
                other.lot,
                selectedLot ? getLotCandidates(selectedLot) : [doc.lot, doc.lotId || ''],
            );
            const sameZafra = matchesStoredValue(doc.zafra, [other.zafra || '']);
            return sameCampaign && sameField && sameLot && sameZafra;
        });
    };

    // ---- Handlers ---------------------------------------------------------
    const setSection = (patch: Partial<CampaingExpenses>) =>
        setDoc(prev => ({ ...prev, ...patch }));

    const updateInsumoLine = (lineId: string, patch: Partial<InsumoLaborLine>) =>
        setDoc(prev => ({
            ...prev,
            insumosLabor: (prev.insumosLabor || []).map(l =>
                l.id === lineId ? { ...l, ...patch } : l,
            ),
        }));

    const updateServicioLine = (lineId: string, patch: Partial<ServicioLaborLine>) =>
        setDoc(prev => ({
            ...prev,
            serviciosLabor: (prev.serviciosLabor || []).map(l =>
                l.id === lineId ? { ...l, ...patch } : l,
            ),
        }));

    const updateCosecha = (patch: Partial<CosechaLine>) =>
        setDoc(prev => ({
            ...prev,
            cosechaLine: prev.cosechaLine ? { ...prev.cosechaLine, ...patch } : prev.cosechaLine,
        }));

    // -- Sección F (gastos adicionales) -------------------------------------
    const emptyDetalle = (): DetalleGastoLine => ({
        id: uuidv7(),
        fecha: new Date().toISOString().slice(0, 10),
        importe: 0,
    });
    const [detalleDraft, setDetalleDraft] = useState<DetalleGastoLine>(emptyDetalle());
    const [editingDetalleId, setEditingDetalleId] = useState<string | null>(null);

    const detalleDraftValid = useMemo(() => {
        if (!detalleDraft.fecha) return false;
        if (!detalleDraft.laborId) return false;
        if (!detalleDraft.sociedadId) return false;
        if (!detalleDraft.tipoGastoId) return false;
        if (!(safeNum(detalleDraft.importe) > 0)) return false;
        return true;
    }, [detalleDraft]);

    const handleAddDetalle = () => {
        if (!detalleDraftValid) return;
        const newLine: DetalleGastoLine = { ...detalleDraft };
        if (editingDetalleId) {
            setDoc(prev => ({
                ...prev,
                detalleGastos: (prev.detalleGastos || []).map(d =>
                    d.id === editingDetalleId ? { ...newLine, id: editingDetalleId } : d,
                ),
            }));
            setEditingDetalleId(null);
        } else {
            setDoc(prev => ({
                ...prev,
                detalleGastos: [...(prev.detalleGastos || []), newLine],
            }));
        }
        setDetalleDraft(emptyDetalle());
    };

    const handleEditDetalle = (line: DetalleGastoLine) => {
        setDetalleDraft({ ...line });
        setEditingDetalleId(line.id);
    };

    const handleDeleteDetalle = (lineId: string) =>
        setDoc(prev => ({
            ...prev,
            detalleGastos: (prev.detalleGastos || []).filter(d => d.id !== lineId),
        }));

    // ---- Guardar ----------------------------------------------------------
    const buildPayload = (): CampaingExpenses => {
        const cName = selectedCampaign?.name || doc.campaignName || '';
        const fName = (selectedField as any)?.nombre || doc.fieldName || '';
        const lName =
            (selectedLot as any)?.properties?.nombre ||
            (selectedLot as any)?.properties?.uuid ||
            doc.lotName ||
            '';
        return {
            ...doc,
            campaign: campaignStoredValue(selectedCampaign) || doc.campaign,
            field: fieldStoredValue(selectedField) || doc.field,
            lot: lotStoredValue(selectedLot) || doc.lot,
            campaignName: cName,
            fieldName: fName,
            lotName: lName,
            fieldId: fieldStoredValue(selectedField) || doc.fieldId,
            lotId: lotStoredValue(selectedLot) || doc.lotId,
            hectares: String(doc.hectareas ?? 0),
        };
    };

    const handleSave = async () => {
        if (!sectionAValid || !step1Valid) return;

        const dup = findDuplicate();
        if (dup) {
            await Swal.fire(
                t('duplicate_record_title') || 'Registro duplicado',
                t('duplicate_record_text') ||
                    'Ya existe un gasto de campaña para esa combinación de campaña, zafra, campo y lote.',
                'error',
            );
            return;
        }

        const payload = buildPayload();
        if (mode === 'new') {
            await createCampingExpeses(payload);
        } else if (mode === 'edit') {
            await updateCampingExpeses(payload);
        }
    };

    const handleNext = () => setActiveStep(s => Math.min(s + 1, STEPS.length - 1));
    const handlePrev = () => setActiveStep(s => Math.max(s - 1, 0));

    const closed = isCampaignExpenseClosed(doc);
    const formDisabled = isView || closed;

    // ---- Renderizado ------------------------------------------------------
    const renderSectionA = (editable: boolean) => (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>
                {t('section_a_header') || 'Sección A — Cabecera'}
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                    <Autocomplete
                        size="small"
                        value={selectedCampaign}
                        options={campaigns}
                        disabled={!editable || formDisabled}
                        getOptionLabel={(option: Campaign) => option?.name || ''}
                        isOptionEqualToValue={(option, value) => option?._id === value?._id}
                        onChange={(_, value: Campaign | null) =>
                            setSection({
                                campaign: campaignStoredValue(value),
                                campaignName: value?.name || '',
                                zafra: '',
                            })
                        }
                        renderInput={params => (
                            <TextField {...params} label={t('campaign') || 'Campaña'} />
                        )}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <Autocomplete
                        size="small"
                        value={doc.zafra || null}
                        options={zafraOptions}
                        disabled={!editable || formDisabled || !zafraOptions.length}
                        onChange={(_, value: string | null) =>
                            setSection({ zafra: value || '' })
                        }
                        renderInput={params => (
                            <TextField {...params} label={t('harvest') || 'Zafra'} />
                        )}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <Autocomplete
                        size="small"
                        value={selectedField}
                        options={fields}
                        disabled={!editable || formDisabled}
                        getOptionLabel={(option: Field) => (option as any)?.nombre || ''}
                        isOptionEqualToValue={(option, value) => option?._id === value?._id}
                        onChange={(_, value: Field | null) =>
                            setSection({
                                fieldId: fieldStoredValue(value),
                                fieldName: (value as any)?.nombre || '',
                                field: fieldStoredValue(value),
                                lotId: '',
                                lotName: '',
                                lot: '',
                            })
                        }
                        renderInput={params => (
                            <TextField {...params} label={t('field') || 'Campo'} />
                        )}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <Autocomplete
                        size="small"
                        value={selectedLot}
                        options={lotOptions as Lot[]}
                        disabled={!editable || formDisabled || !lotOptions.length}
                        getOptionLabel={(option: any) => option?.properties?.nombre || ''}
                        isOptionEqualToValue={(a, b) =>
                            lotStoredValue(a as any) === lotStoredValue(b as any)
                        }
                        onChange={(_, value: Lot | null) => {
                            const v = lotStoredValue(value);
                            setSection({
                                lotId: v,
                                lot: v,
                                lotName: (value as any)?.properties?.nombre || '',
                                hectareas:
                                    Number((value as any)?.properties?.hectareas) ||
                                    doc.hectareas ||
                                    0,
                            });
                        }}
                        renderInput={params => (
                            <TextField {...params} label={t('lot') || 'Lote'} />
                        )}
                    />
                </Grid>

                <Grid item xs={6} md={2}>
                    <TextField
                        size="small"
                        fullWidth
                        type="number"
                        label={t('hectares') || 'Has'}
                        value={doc.hectareas || 0}
                        InputProps={{ readOnly: true }}
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <TextField
                        size="small"
                        fullWidth
                        label={t('crop') || 'Cultivo'}
                        value={doc.cropName || ''}
                        InputProps={{ readOnly: true }}
                    />
                </Grid>
                <Grid item xs={6} md={2}>
                    <TextField
                        size="small"
                        fullWidth
                        label={t('alternative_currency') || 'Moneda Alt'}
                        value={doc.monedaAlternativa || ''}
                        disabled={!editable || formDisabled}
                        onChange={e => setSection({ monedaAlternativa: e.target.value })}
                    />
                </Grid>
                <Grid item xs={6} md={2}>
                    <TextField
                        size="small"
                        fullWidth
                        type="number"
                        label={t('alt_currency_quote') || 'Cot Mon Alt'}
                        value={doc.cotizacionMonedaAlternativa || 0}
                        disabled={!editable || formDisabled}
                        required={Boolean(doc.monedaAlternativa)}
                        onChange={e =>
                            setSection({
                                cotizacionMonedaAlternativa: safeNum(e.target.value),
                            })
                        }
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <TextField
                        size="small"
                        fullWidth
                        label={t('expenses') || 'Gastos'}
                        value={formatMoney(totalGastos)}
                        InputProps={{
                            readOnly: true,
                            sx: gastosIsRed ? { color: '#d32f2f', fontWeight: 'bold' } : {},
                        }}
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <TextField
                        size="small"
                        fullWidth
                        label={t('trend') || 'Tendencia'}
                        value={formatMoney(tendencia)}
                        InputProps={{
                            readOnly: true,
                            sx: tendenciaIsGreen
                                ? { color: '#388e3c', fontWeight: 'bold' }
                                : {},
                        }}
                    />
                </Grid>
            </Grid>
        </Paper>
    );

    const renderStep1 = () => (
        <>
            {renderSectionA(true)}

            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
                    {t('section_b_supplies') || 'Sección B — Insumos de Labores Ejecutadas'}
                </Typography>
                {(doc.insumosLabor || []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        {t('no_executed_labors') ||
                            'No hay labores ejecutadas para esta combinación.'}
                    </Typography>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('labor') || 'Labor'}</TableCell>
                                <TableCell>{t('supply') || 'Insumo'}</TableCell>
                                <TableCell align="right">
                                    {t('qty_per_ha') || 'Cant/Ha'}
                                </TableCell>
                                <TableCell sx={{ minWidth: 180 }}>
                                    {t('company') || 'Sociedad'}
                                </TableCell>
                                <TableCell sx={{ minWidth: 180 }}>
                                    {t('contract') || 'Contrato'}
                                </TableCell>
                                <TableCell align="right">
                                    {t('unit_value') || 'Valor Unidad'}
                                </TableCell>
                                <TableCell align="right">
                                    {t('total_value') || 'Valor Total'}
                                </TableCell>
                                <TableCell align="right">
                                    {t('total_value_alt') || 'V.T. Mon Alt'}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(doc.insumosLabor || []).map(line => (
                                <TableRow key={line.id}>
                                    <TableCell>{line.laborNombre || '-'}</TableCell>
                                    <TableCell>{line.insumoNombre || line.insumoId || '-'}</TableCell>
                                    <TableCell align="right">
                                        {safeNum(line.cantidadPorHa).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Autocomplete
                                            size="small"
                                            value={
                                                companies.find(
                                                    (c: Company) => c._id === line.sociedadId,
                                                ) ||
                                                findCompanyByStoredValue(
                                                    companies,
                                                    line.sociedadId,
                                                ) ||
                                                null
                                            }
                                            options={companies}
                                            disabled={formDisabled}
                                            getOptionLabel={(option: Company) =>
                                                option?.socialReason ||
                                                option?.fantasyName ||
                                                option?.name ||
                                                ''
                                            }
                                            onChange={(_, value: Company | null) =>
                                                updateInsumoLine(line.id, {
                                                    sociedadId: value?._id || '',
                                                    sociedadNombre:
                                                        value?.socialReason ||
                                                        value?.fantasyName ||
                                                        value?.name ||
                                                        '',
                                                })
                                            }
                                            renderInput={params => (
                                                <TextField {...params} placeholder="Sociedad" />
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Autocomplete
                                            size="small"
                                            value={
                                                listCorporateContract.find(
                                                    (c: CorporateContract) =>
                                                        c._id === line.contratoId,
                                                ) || null
                                            }
                                            options={listCorporateContract}
                                            disabled={formDisabled}
                                            getOptionLabel={(option: CorporateContract) =>
                                                option?.idContract
                                                    ? `${option.idContract} — ${option.description || ''}`
                                                    : ''
                                            }
                                            onChange={(_, value: CorporateContract | null) =>
                                                updateInsumoLine(line.id, {
                                                    contratoId: value?._id || '',
                                                    contratoNombre: value?.idContract || '',
                                                })
                                            }
                                            renderInput={params => (
                                                <TextField {...params} placeholder="Contrato" />
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell align="right" sx={{ minWidth: 130 }}>
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={line.valorUnidad || 0}
                                            disabled={formDisabled}
                                            onChange={e =>
                                                updateInsumoLine(line.id, {
                                                    valorUnidad: safeNum(e.target.value),
                                                })
                                            }
                                            inputProps={{ min: 0, step: 0.01 }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {formatMoney(safeNum(line.valorTotal))}
                                    </TableCell>
                                    <TableCell align="right">
                                        {formatMoney(safeNum(line.valorTotalMonAlt))}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Paper>

            {doc.cosechaLine && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
                        {t('section_c_harvest') || 'Sección C — Cosecha'}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={2}>
                            <TextField
                                size="small"
                                fullWidth
                                label={t('crop') || 'Cultivo'}
                                value={doc.cosechaLine.cultivoNombre || ''}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField
                                size="small"
                                fullWidth
                                type="number"
                                label={t('yield') || 'Rinde'}
                                value={doc.cosechaLine.rindeCantidad || 0}
                                disabled={formDisabled}
                                onChange={e =>
                                    updateCosecha({
                                        rindeCantidad: safeNum(e.target.value),
                                    })
                                }
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Autocomplete
                                size="small"
                                value={
                                    companies.find(
                                        (c: Company) => c._id === doc.cosechaLine?.sociedadId,
                                    ) || null
                                }
                                options={companies}
                                disabled={formDisabled}
                                getOptionLabel={(option: Company) =>
                                    option?.socialReason ||
                                    option?.fantasyName ||
                                    option?.name ||
                                    ''
                                }
                                onChange={(_, value: Company | null) =>
                                    updateCosecha({
                                        sociedadId: value?._id || '',
                                        sociedadNombre:
                                            value?.socialReason ||
                                            value?.fantasyName ||
                                            value?.name ||
                                            '',
                                    })
                                }
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        label={t('company') || 'Sociedad'}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Autocomplete
                                size="small"
                                value={
                                    listCorporateContract.find(
                                        (c: CorporateContract) =>
                                            c._id === doc.cosechaLine?.contratoId,
                                    ) || null
                                }
                                options={listCorporateContract}
                                disabled={formDisabled}
                                getOptionLabel={(option: CorporateContract) =>
                                    option?.idContract || ''
                                }
                                onChange={(_, value: CorporateContract | null) =>
                                    updateCosecha({
                                        contratoId: value?._id || '',
                                        contratoNombre: value?.idContract || '',
                                    })
                                }
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        label={t('contract') || 'Contrato'}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField
                                size="small"
                                fullWidth
                                type="number"
                                label={t('unit_value') || 'Valor Unidad'}
                                value={doc.cosechaLine.valorUnidad || 0}
                                disabled={formDisabled}
                                onChange={e =>
                                    updateCosecha({ valorUnidad: safeNum(e.target.value) })
                                }
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField
                                size="small"
                                fullWidth
                                label={t('total_value') || 'Valor Total'}
                                value={formatMoney(safeNum(doc.cosechaLine.valorTotal))}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField
                                size="small"
                                fullWidth
                                label={t('total_value_alt') || 'V.T. Mon Alt'}
                                value={formatMoney(safeNum(doc.cosechaLine.valorTotalMonAlt))}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            )}
        </>
    );

    const renderStep2 = () => (
        <>
            {renderSectionA(false)}
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
                    {t('section_d_services') || 'Sección D — Servicios de Labores Ejecutadas'}
                </Typography>
                {(doc.serviciosLabor || []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        {t('no_executed_services') ||
                            'No hay servicios cargados en labores ejecutadas.'}
                    </Typography>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('date') || 'Fecha'}</TableCell>
                                <TableCell>{t('labor') || 'Labor'}</TableCell>
                                <TableCell>{t('service') || 'Servicio'}</TableCell>
                                <TableCell>{t('contractor') || 'Contratante'}</TableCell>
                                <TableCell align="right">
                                    {t('units_per_ha') || 'Unid/Ha'}
                                </TableCell>
                                <TableCell align="right">{t('hectares') || 'Has'}</TableCell>
                                <TableCell align="right">
                                    {t('unit_value') || 'Valor Unidad'}
                                </TableCell>
                                <TableCell align="right">
                                    {t('total_value') || 'Valor Total'}
                                </TableCell>
                                <TableCell align="right">
                                    {t('total_value_alt') || 'V.T. Mon Alt'}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(doc.serviciosLabor || []).map(line => (
                                <TableRow key={line.id}>
                                    <TableCell>
                                        {line.fecha
                                            ? new Date(line.fecha).toLocaleDateString()
                                            : '-'}
                                    </TableCell>
                                    <TableCell>{line.laborNombre || '-'}</TableCell>
                                    <TableCell>{line.servicio || '-'}</TableCell>
                                    <TableCell>{line.contratante || '-'}</TableCell>
                                    <TableCell align="right">
                                        {safeNum(line.unidadPorHa).toFixed(2)}
                                    </TableCell>
                                    <TableCell align="right">
                                        {safeNum(line.hectareas).toFixed(2)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ minWidth: 130 }}>
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={line.valorUnidad || 0}
                                            disabled={formDisabled}
                                            onChange={e =>
                                                updateServicioLine(line.id, {
                                                    valorUnidad: Math.max(
                                                        0,
                                                        safeNum(e.target.value),
                                                    ),
                                                })
                                            }
                                            inputProps={{ min: 0, step: 0.01 }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {formatMoney(safeNum(line.valorTotal))}
                                    </TableCell>
                                    <TableCell align="right">
                                        {formatMoney(safeNum(line.valorTotalMonAlt))}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Paper>
        </>
    );

    const renderStep3 = () => (
        <>
            {renderSectionA(false)}

            {/* Sección E - Carga de gasto adicional */}
            {!formDisabled && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
                        {t('section_e_add_expense') || 'Sección E — Cargar Gasto Adicional'}
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={6} md={2}>
                            <TextField
                                size="small"
                                fullWidth
                                type="date"
                                label={t('date') || 'Fecha'}
                                value={detalleDraft.fecha}
                                onChange={e =>
                                    setDetalleDraft(d => ({ ...d, fecha: e.target.value }))
                                }
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField
                                size="small"
                                fullWidth
                                label={t('labor') || 'Labor'}
                                value={detalleDraft.laborNombre || ''}
                                onChange={e =>
                                    setDetalleDraft(d => ({
                                        ...d,
                                        laborId: e.target.value,
                                        laborNombre: e.target.value,
                                    }))
                                }
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Autocomplete
                                size="small"
                                value={
                                    companies.find(
                                        (c: Company) => c._id === detalleDraft.sociedadId,
                                    ) || null
                                }
                                options={companies}
                                getOptionLabel={(option: Company) =>
                                    option?.socialReason ||
                                    option?.fantasyName ||
                                    option?.name ||
                                    ''
                                }
                                onChange={(_, value: Company | null) =>
                                    setDetalleDraft(d => ({
                                        ...d,
                                        sociedadId: value?._id || '',
                                        sociedadNombre:
                                            value?.socialReason ||
                                            value?.fantasyName ||
                                            value?.name ||
                                            '',
                                    }))
                                }
                                renderInput={params => (
                                    <TextField {...params} label={t('company') || 'Sociedad'} />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Autocomplete<CostsExpenses, false, false, true>
                                size="small"
                                value={
                                    costsExpenses.find(
                                        (c: CostsExpenses) =>
                                            c._id === detalleDraft.tipoGastoId,
                                    ) || null
                                }
                                options={costsExpenses}
                                getOptionLabel={(option) =>
                                    typeof option === 'string'
                                        ? option
                                        : option?.description || option?.costCode || ''
                                }
                                onChange={(_, value) => {
                                    if (typeof value === 'string') {
                                        setDetalleDraft(d => ({
                                            ...d,
                                            tipoGastoId: '__otros__',
                                            tipoGastoNombre:
                                                value || t('other_expenses') || 'Otros Gastos',
                                        }));
                                    } else {
                                        setDetalleDraft(d => ({
                                            ...d,
                                            tipoGastoId: value?._id || '__otros__',
                                            tipoGastoNombre:
                                                value?.description ||
                                                value?.costCode ||
                                                t('other_expenses') ||
                                                'Otros Gastos',
                                        }));
                                    }
                                }}
                                freeSolo
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        label={t('expense_type') || 'Tipo Gasto'}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField
                                size="small"
                                fullWidth
                                label={t('expense') || 'Gasto'}
                                value={detalleDraft.gasto || ''}
                                onChange={e =>
                                    setDetalleDraft(d => ({ ...d, gasto: e.target.value }))
                                }
                            />
                        </Grid>
                        <Grid item xs={6} md={1}>
                            <TextField
                                size="small"
                                fullWidth
                                type="number"
                                label={t('amount') || 'Importe'}
                                value={detalleDraft.importe || 0}
                                onChange={e =>
                                    setDetalleDraft(d => ({
                                        ...d,
                                        importe: safeNum(e.target.value),
                                    }))
                                }
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField
                                size="small"
                                fullWidth
                                label={t('reference') || 'Referencia'}
                                value={detalleDraft.referencia || ''}
                                onChange={e =>
                                    setDetalleDraft(d => ({
                                        ...d,
                                        referencia: e.target.value,
                                    }))
                                }
                            />
                        </Grid>
                        <Grid item xs={12} md={1} textAlign="right">
                            <Tooltip
                                title={
                                    editingDetalleId
                                        ? t('save') || 'Guardar'
                                        : t('add') || 'Agregar'
                                }
                            >
                                <span>
                                    <IconButton
                                        color="success"
                                        disabled={!detalleDraftValid}
                                        onClick={handleAddDetalle}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* Sección F - lista */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
                    {t('section_f_loaded_expenses') || 'Sección F — Gastos Cargados'}
                </Typography>
                {(doc.detalleGastos || []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        {t('no_additional_expenses') ||
                            'Aún no se cargaron gastos adicionales.'}
                    </Typography>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('date') || 'Fecha'}</TableCell>
                                <TableCell>{t('labor') || 'Labor'}</TableCell>
                                <TableCell>{t('company') || 'Sociedad'}</TableCell>
                                <TableCell>{t('expense_type') || 'Tipo Gasto'}</TableCell>
                                <TableCell>{t('expense') || 'Gasto'}</TableCell>
                                <TableCell align="right">{t('amount') || 'Importe'}</TableCell>
                                <TableCell>{t('reference') || 'Referencia'}</TableCell>
                                <TableCell align="right">
                                    {!formDisabled ? t('actions') || 'Acciones' : ''}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(doc.detalleGastos || []).map(line => (
                                <TableRow key={line.id}>
                                    <TableCell>
                                        {line.fecha
                                            ? new Date(line.fecha).toLocaleDateString()
                                            : '-'}
                                    </TableCell>
                                    <TableCell>{line.laborNombre || '-'}</TableCell>
                                    <TableCell>{line.sociedadNombre || '-'}</TableCell>
                                    <TableCell>{line.tipoGastoNombre || '-'}</TableCell>
                                    <TableCell>{line.gasto || '-'}</TableCell>
                                    <TableCell align="right">
                                        {formatMoney(safeNum(line.importe))}
                                    </TableCell>
                                    <TableCell>{line.referencia || '-'}</TableCell>
                                    <TableCell align="right">
                                        {!formDisabled && (
                                            <>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditDetalle(line)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteDetalle(line.id)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Paper>
        </>
    );

    const renderActiveStep = () => {
        if (activeStep === 0) return renderStep1();
        if (activeStep === 1) return renderStep2();
        return renderStep3();
    };

    const canGoNext =
        activeStep === 0
            ? sectionAValid && step1Valid
            : activeStep === 1
                ? step2Valid
                : true;

    return (
        <TemplateLayout key="overview-campaign-expenses-wizard" viewMap={false}>
            {(isLoading || loadingDoc) && <Loading loading />}
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Card
                    elevation={5}
                    sx={{
                        p: 2,
                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                        borderRadius: '16px',
                    }}
                >
                    <CardHeader
                        title={
                            <Typography
                                component="h2"
                                variant="h4"
                                sx={{ fontWeight: 'bold', color: '#424242' }}
                            >
                                {t('campaign_expenses_title') || 'Gastos de Campaña'}
                            </Typography>
                        }
                        action={<CloseButtonPage />}
                    />
                    <CardContent>
                        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                            {STEPS.map(label => (
                                <Step key={label}>
                                    <StepLabel>{t(label) || label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        {renderActiveStep()}

                        <Divider sx={{ my: 2 }} />

                        <Stack direction="row" spacing={2} justifyContent="space-between">
                            <Button
                                variant="outlined"
                                startIcon={<BackIcon />}
                                disabled={activeStep === 0}
                                onClick={handlePrev}
                            >
                                {t('previous') || 'Anterior'}
                            </Button>

                            <Box display="flex" gap={2}>
                                <Button
                                    variant="text"
                                    onClick={() =>
                                        navigate('/init/overview/campaign-expenses')
                                    }
                                >
                                    {t('cancel') || 'Cancelar'}
                                </Button>
                                {activeStep < STEPS.length - 1 ? (
                                    <Button
                                        variant="contained"
                                        endIcon={<ForwardIcon />}
                                        disabled={!canGoNext}
                                        onClick={handleNext}
                                    >
                                        {t('next') || 'Siguiente'}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<SaveIcon />}
                                        disabled={
                                            formDisabled || !sectionAValid || !step1Valid
                                        }
                                        onClick={handleSave}
                                    >
                                        {t('save') || 'Guardar'}
                                    </Button>
                                )}
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Container>
        </TemplateLayout>
    );
};

export default CampaignExpensesWizardPage;
