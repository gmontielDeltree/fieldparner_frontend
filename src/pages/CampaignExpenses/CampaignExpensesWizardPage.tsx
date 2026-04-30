import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Container,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
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

import { TemplateLayout, Loading, CloseButtonPage } from '../../components';
import {
    useCampaign,
    useField,
    useCrops,
    useCompany,
    useCorporateContract,
    useCostsExpensess,
} from '../../hooks';
import { useCampaingExpenses, ExecutedLaborsContext } from '../../hooks/useCampaignExpenses';
import {
    CampaingExpenses,
    CosechaLine,
    DetalleGastoLine,
    InsumoLaborLine,
    ServicioLaborLine,
    isCampaignExpenseClosed,
} from '../../interfaces/campaignExpenses';
import { useAppSelector } from '../../hooks/useRedux';

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

interface Props {
    mode?: Mode;
}

export const CampaignExpensesWizardPage: React.FC<Props> = ({ mode: modeProp }) => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAppSelector((state) => state.auth);

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
        getCampaigns();
        getFields();
        getCrops();
        getCompanies();
        getCorporateContract();
        getCostsExpenses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---- Carga del documento existente ------------------------------------
    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setLoadingDoc(true);
            const found = await getCampaingExpenseById(id);
            if (found) {
                setDoc({
                    insumosLabor: [],
                    cosechaLine: null,
                    serviciosLabor: [],
                    detalleGastos: [],
                    ...found,
                });
            }
            setLoadingDoc(false);
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // ---- Selección encadenada ---------------------------------------------
    const selectedCampaign = useMemo(
        () => campaigns.find((c) => c._id === doc.campaign),
        [campaigns, doc.campaign],
    );

    const zafraOptions = useMemo(() => {
        if (!selectedCampaign?.zafra) return [] as string[];
        return Array.isArray(selectedCampaign.zafra)
            ? selectedCampaign.zafra
            : [selectedCampaign.zafra];
    }, [selectedCampaign]);

    const selectedField = useMemo(
        () => fields.find((f) => f._id === doc.fieldId),
        [fields, doc.fieldId],
    );

    const lotOptions = useMemo(() => selectedField?.lotes || [], [selectedField]);

    const selectedLot = useMemo(
        () =>
            lotOptions.find((l: any) => {
                const candidates = [
                    l?.id,
                    l?.properties?.uuid,
                    l?.properties?.nombre,
                ];
                return candidates.some((c) => c && c === doc.lotId);
            }),
        [lotOptions, doc.lotId],
    );

    // ---- Trae labores ejecutadas cuando cambia campaña/campo/lote ---------
    useEffect(() => {
        const run = async () => {
            if (!doc.campaign || !doc.fieldId || !doc.lotId) return;
            // En modo edit/view el doc ya trae los datos persistidos. Solo
            // poblamos automáticamente cuando estamos creando uno nuevo.
            if (mode !== 'new') return;

            const ctx: ExecutedLaborsContext = await getExecutedLaborsContext(
                doc.campaign,
                doc.fieldId,
                doc.lotId,
            );

            const cropFromCtx = ctx.cultivoId
                ? crops.find((c: any) => c._id === ctx.cultivoId)
                : undefined;

            const insumosLabor: InsumoLaborLine[] = ctx.insumos.map((i) => ({
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

            const serviciosLabor: ServicioLaborLine[] = ctx.servicios.map((s) => ({
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

            setDoc((prev) => ({
                ...prev,
                hectareas: ctx.hectareas ?? Number(selectedLot?.properties?.hectareas) ?? 0,
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
    }, [doc.campaign, doc.fieldId, doc.lotId, mode]);

    // ---- Recálculo de Valor Total / MonAlt --------------------------------
    const cotMonAlt = safeNum(doc.cotizacionMonedaAlternativa);
    const hectareas = safeNum(doc.hectareas);

    useEffect(() => {
        setDoc((prev) => {
            const nextInsumos = (prev.insumosLabor || []).map((line) => {
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
            const nextServicios = (prev.serviciosLabor || []).map((line) => {
                // Doc dice literal: ValorTotal = UnidadPorHa × ValorUnidad
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

    // ---- Calculados de cabecera (Gastos / Tendencia) ----------------------
    const totalGastos = useMemo(
        () => sumValorTotal(doc.insumosLabor || []),
        [doc.insumosLabor],
    );
    const totalCosecha = useMemo(
        () => safeNum(doc.cosechaLine?.valorTotal),
        [doc.cosechaLine],
    );
    // Doc literal: Tendencia = Gastos - Valor Total Cosecha. Para coloreado
    // usamos el sentido económico (ganancia neta = Cosecha - Gastos): si
    // Cosecha > Gastos ponemos verde sobre tendencia, si Gastos > Cosecha
    // ponemos rojo sobre Gastos.
    const tendencia = totalGastos - totalCosecha;
    const gastosIsRed = totalGastos > totalCosecha && totalCosecha > 0;
    const tendenciaIsGreen = totalCosecha > totalGastos;

    // ---- Validaciones -----------------------------------------------------
    const sectionAValid = useMemo(() => {
        if (!doc.campaign) return false;
        if (zafraOptions.length > 0 && !doc.zafra) return false;
        if (!doc.fieldId) return false;
        if (!doc.lotId) return false;
        if (doc.monedaAlternativa && !(safeNum(doc.cotizacionMonedaAlternativa) > 0)) {
            return false;
        }
        return true;
    }, [doc, zafraOptions]);

    const step1Valid = useMemo(() => {
        const insumosOk = (doc.insumosLabor || []).every(
            (l) => safeNum(l.valorUnidad) > 0 && !!l.sociedadId,
        );
        const cosechaOk = !doc.cosechaLine
            ? true
            : safeNum(doc.cosechaLine.valorUnidad) > 0 && !!doc.cosechaLine.sociedadId;
        return sectionAValid && insumosOk && cosechaOk;
    }, [doc, sectionAValid]);

    const step2Valid = useMemo(() => {
        return (doc.serviciosLabor || []).every((l) => safeNum(l.valorUnidad) >= 0);
    }, [doc]);

    // ---- Handlers ---------------------------------------------------------
    const setSection = (patch: Partial<CampaingExpenses>) =>
        setDoc((prev) => ({ ...prev, ...patch }));

    const updateInsumoLine = (lineId: string, patch: Partial<InsumoLaborLine>) =>
        setDoc((prev) => ({
            ...prev,
            insumosLabor: (prev.insumosLabor || []).map((l) =>
                l.id === lineId ? { ...l, ...patch } : l,
            ),
        }));

    const updateServicioLine = (lineId: string, patch: Partial<ServicioLaborLine>) =>
        setDoc((prev) => ({
            ...prev,
            serviciosLabor: (prev.serviciosLabor || []).map((l) =>
                l.id === lineId ? { ...l, ...patch } : l,
            ),
        }));

    const updateCosecha = (patch: Partial<CosechaLine>) =>
        setDoc((prev) => ({
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
            setDoc((prev) => ({
                ...prev,
                detalleGastos: (prev.detalleGastos || []).map((d) =>
                    d.id === editingDetalleId ? { ...newLine, id: editingDetalleId } : d,
                ),
            }));
            setEditingDetalleId(null);
        } else {
            setDoc((prev) => ({
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
        setDoc((prev) => ({
            ...prev,
            detalleGastos: (prev.detalleGastos || []).filter((d) => d.id !== lineId),
        }));

    // ---- Guardar ----------------------------------------------------------
    const buildPayload = (): CampaingExpenses => {
        const cName = selectedCampaign?.name || '';
        const fName = (selectedField as any)?.nombre || '';
        const lName =
            (selectedLot as any)?.properties?.nombre ||
            (selectedLot as any)?.properties?.uuid ||
            '';
        return {
            ...doc,
            campaignName: cName,
            fieldName: fName,
            lotName: lName,
            // Mantengo los campos viejos en sync para compatibilidad.
            campaign: doc.campaign,
            field: fName,
            lot: lName,
            hectares: String(doc.hectareas ?? 0),
        };
    };

    const handleSave = async () => {
        const payload = buildPayload();
        if (mode === 'new') {
            await createCampingExpeses(payload);
        } else if (mode === 'edit') {
            await updateCampingExpeses(payload);
        }
    };

    const handleNext = () => setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
    const handlePrev = () => setActiveStep((s) => Math.max(s - 1, 0));

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
                    <FormControl fullWidth size="small">
                        <InputLabel>{t('campaign') || 'Campaña'}</InputLabel>
                        <Select
                            label={t('campaign') || 'Campaña'}
                            value={doc.campaign || ''}
                            disabled={!editable || formDisabled}
                            onChange={(e) =>
                                setSection({
                                    campaign: e.target.value,
                                    zafra: '',
                                })
                            }
                        >
                            {campaigns.map((c) => (
                                <MenuItem key={c._id} value={c._id}>
                                    {c.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" disabled={!zafraOptions.length}>
                        <InputLabel>{t('harvest') || 'Zafra'}</InputLabel>
                        <Select
                            label={t('harvest') || 'Zafra'}
                            value={doc.zafra || ''}
                            disabled={!editable || formDisabled || !zafraOptions.length}
                            onChange={(e) => setSection({ zafra: e.target.value })}
                        >
                            {zafraOptions.map((z) => (
                                <MenuItem key={z} value={z}>
                                    {z}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                        <InputLabel>{t('field') || 'Campo'}</InputLabel>
                        <Select
                            label={t('field') || 'Campo'}
                            value={doc.fieldId || ''}
                            disabled={!editable || formDisabled}
                            onChange={(e) =>
                                setSection({
                                    fieldId: e.target.value,
                                    lotId: '',
                                    lotName: '',
                                })
                            }
                        >
                            {fields.map((f) => (
                                <MenuItem key={f._id} value={f._id}>
                                    {(f as any).nombre || f._id}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" disabled={!lotOptions.length}>
                        <InputLabel>{t('lot') || 'Lote'}</InputLabel>
                        <Select
                            label={t('lot') || 'Lote'}
                            value={doc.lotId || ''}
                            disabled={!editable || formDisabled || !lotOptions.length}
                            onChange={(e) => {
                                const lote = lotOptions.find((l: any) => {
                                    const candidates = [
                                        l?.id,
                                        l?.properties?.uuid,
                                        l?.properties?.nombre,
                                    ];
                                    return candidates.some((c) => c === e.target.value);
                                });
                                setSection({
                                    lotId: e.target.value,
                                    lotName: (lote as any)?.properties?.nombre || '',
                                    hectareas: Number((lote as any)?.properties?.hectareas) || doc.hectareas || 0,
                                });
                            }}
                        >
                            {lotOptions.map((l: any) => {
                                const value = l?.id || l?.properties?.uuid || l?.properties?.nombre;
                                return (
                                    <MenuItem key={value} value={value}>
                                        {l?.properties?.nombre || value}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
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
                        onChange={(e) =>
                            setSection({ monedaAlternativa: e.target.value })
                        }
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
                        onChange={(e) =>
                            setSection({ cotizacionMonedaAlternativa: safeNum(e.target.value) })
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
                            sx: tendenciaIsGreen ? { color: '#388e3c', fontWeight: 'bold' } : {},
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
                        {t('no_executed_labors') || 'No hay labores ejecutadas para esta combinación.'}
                    </Typography>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('labor') || 'Labor'}</TableCell>
                                <TableCell>{t('supply') || 'Insumo'}</TableCell>
                                <TableCell align="right">{t('qty_per_ha') || 'Cant/Ha'}</TableCell>
                                <TableCell>{t('company') || 'Sociedad'}</TableCell>
                                <TableCell>{t('contract') || 'Contrato'}</TableCell>
                                <TableCell align="right">{t('unit_value') || 'Valor Unidad'}</TableCell>
                                <TableCell align="right">{t('total_value') || 'Valor Total'}</TableCell>
                                <TableCell align="right">
                                    {t('total_value_alt') || 'V.T. Mon Alt'}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(doc.insumosLabor || []).map((line) => (
                                <TableRow key={line.id}>
                                    <TableCell>{line.laborNombre || '-'}</TableCell>
                                    <TableCell>{line.insumoNombre || line.insumoId || '-'}</TableCell>
                                    <TableCell align="right">
                                        {safeNum(line.cantidadPorHa).toFixed(2)}
                                    </TableCell>
                                    <TableCell sx={{ minWidth: 160 }}>
                                        <Select
                                            size="small"
                                            fullWidth
                                            value={line.sociedadId || ''}
                                            disabled={formDisabled}
                                            onChange={(e) => {
                                                const company = companies.find(
                                                    (c) => c._id === e.target.value,
                                                );
                                                updateInsumoLine(line.id, {
                                                    sociedadId: e.target.value,
                                                    sociedadNombre: company?.name || '',
                                                });
                                            }}
                                        >
                                            {companies.map((c) => (
                                                <MenuItem key={c._id} value={c._id}>
                                                    {c.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </TableCell>
                                    <TableCell sx={{ minWidth: 160 }}>
                                        <Select
                                            size="small"
                                            fullWidth
                                            value={line.contratoId || ''}
                                            disabled={formDisabled}
                                            onChange={(e) => {
                                                const contract = listCorporateContract.find(
                                                    (c) => c._id === e.target.value,
                                                );
                                                updateInsumoLine(line.id, {
                                                    contratoId: e.target.value,
                                                    contratoNombre: contract?.idContract || '',
                                                });
                                            }}
                                        >
                                            <MenuItem value="">
                                                <em>{t('none') || '—'}</em>
                                            </MenuItem>
                                            {listCorporateContract.map((c) => (
                                                <MenuItem key={c._id} value={c._id}>
                                                    {c.idContract} — {c.description}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </TableCell>
                                    <TableCell align="right" sx={{ minWidth: 130 }}>
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={line.valorUnidad || 0}
                                            disabled={formDisabled}
                                            onChange={(e) =>
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
                                onChange={(e) =>
                                    updateCosecha({ rindeCantidad: safeNum(e.target.value) })
                                }
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>{t('company') || 'Sociedad'}</InputLabel>
                                <Select
                                    label={t('company') || 'Sociedad'}
                                    value={doc.cosechaLine.sociedadId || ''}
                                    disabled={formDisabled}
                                    onChange={(e) => {
                                        const company = companies.find(
                                            (c) => c._id === e.target.value,
                                        );
                                        updateCosecha({
                                            sociedadId: e.target.value,
                                            sociedadNombre: company?.name || '',
                                        });
                                    }}
                                >
                                    {companies.map((c) => (
                                        <MenuItem key={c._id} value={c._id}>
                                            {c.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>{t('contract') || 'Contrato'}</InputLabel>
                                <Select
                                    label={t('contract') || 'Contrato'}
                                    value={doc.cosechaLine.contratoId || ''}
                                    disabled={formDisabled}
                                    onChange={(e) => {
                                        const contract = listCorporateContract.find(
                                            (c) => c._id === e.target.value,
                                        );
                                        updateCosecha({
                                            contratoId: e.target.value,
                                            contratoNombre: contract?.idContract || '',
                                        });
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>{t('none') || '—'}</em>
                                    </MenuItem>
                                    {listCorporateContract.map((c) => (
                                        <MenuItem key={c._id} value={c._id}>
                                            {c.idContract}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField
                                size="small"
                                fullWidth
                                type="number"
                                label={t('unit_value') || 'Valor Unidad'}
                                value={doc.cosechaLine.valorUnidad || 0}
                                disabled={formDisabled}
                                onChange={(e) =>
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
                        {t('no_executed_services') || 'No hay servicios cargados en labores ejecutadas.'}
                    </Typography>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('date') || 'Fecha'}</TableCell>
                                <TableCell>{t('labor') || 'Labor'}</TableCell>
                                <TableCell>{t('service') || 'Servicio'}</TableCell>
                                <TableCell>{t('contractor') || 'Contratante'}</TableCell>
                                <TableCell align="right">{t('units_per_ha') || 'Unid/Ha'}</TableCell>
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
                            {(doc.serviciosLabor || []).map((line) => (
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
                                            onChange={(e) =>
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
                            disabled={formDisabled}
                            value={detalleDraft.fecha}
                            onChange={(e) =>
                                setDetalleDraft((d) => ({ ...d, fecha: e.target.value }))
                            }
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <TextField
                            size="small"
                            fullWidth
                            label={t('labor') || 'Labor'}
                            disabled={formDisabled}
                            value={detalleDraft.laborNombre || ''}
                            onChange={(e) =>
                                setDetalleDraft((d) => ({
                                    ...d,
                                    laborId: e.target.value,
                                    laborNombre: e.target.value,
                                }))
                            }
                        />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>{t('company') || 'Sociedad'}</InputLabel>
                            <Select
                                label={t('company') || 'Sociedad'}
                                value={detalleDraft.sociedadId || ''}
                                disabled={formDisabled}
                                onChange={(e) => {
                                    const company = companies.find(
                                        (c) => c._id === e.target.value,
                                    );
                                    setDetalleDraft((d) => ({
                                        ...d,
                                        sociedadId: e.target.value,
                                        sociedadNombre: company?.name || '',
                                    }));
                                }}
                            >
                                {companies.map((c) => (
                                    <MenuItem key={c._id} value={c._id}>
                                        {c.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>{t('expense_type') || 'Tipo Gasto'}</InputLabel>
                            <Select
                                label={t('expense_type') || 'Tipo Gasto'}
                                value={detalleDraft.tipoGastoId || ''}
                                disabled={formDisabled}
                                onChange={(e) => {
                                    const cost = costsExpenses.find(
                                        (c) => c._id === e.target.value,
                                    );
                                    setDetalleDraft((d) => ({
                                        ...d,
                                        tipoGastoId: e.target.value,
                                        tipoGastoNombre:
                                            cost?.description || cost?.costCode || 'Otros Gastos',
                                    }));
                                }}
                            >
                                {costsExpenses.map((c) => (
                                    <MenuItem key={c._id} value={c._id}>
                                        {c.description || c.costCode}
                                    </MenuItem>
                                ))}
                                <MenuItem value="__otros__">{t('other_expenses') || 'Otros Gastos'}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <TextField
                            size="small"
                            fullWidth
                            label={t('expense') || 'Gasto'}
                            disabled={formDisabled}
                            value={detalleDraft.gasto || ''}
                            onChange={(e) =>
                                setDetalleDraft((d) => ({ ...d, gasto: e.target.value }))
                            }
                        />
                    </Grid>
                    <Grid item xs={6} md={1}>
                        <TextField
                            size="small"
                            fullWidth
                            type="number"
                            label={t('amount') || 'Importe'}
                            disabled={formDisabled}
                            value={detalleDraft.importe || 0}
                            onChange={(e) =>
                                setDetalleDraft((d) => ({
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
                            disabled={formDisabled}
                            value={detalleDraft.referencia || ''}
                            onChange={(e) =>
                                setDetalleDraft((d) => ({ ...d, referencia: e.target.value }))
                            }
                        />
                    </Grid>
                    <Grid item xs={6} md={1} textAlign="right">
                        <Tooltip
                            title={editingDetalleId ? t('save') || 'Guardar' : t('add') || 'Agregar'}
                        >
                            <span>
                                <IconButton
                                    color="success"
                                    disabled={formDisabled || !detalleDraftValid}
                                    onClick={handleAddDetalle}
                                >
                                    <AddIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Paper>

            {/* Sección F - lista */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
                    {t('section_f_loaded_expenses') || 'Sección F — Gastos Cargados'}
                </Typography>
                {(doc.detalleGastos || []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        {t('no_additional_expenses') || 'Aún no se cargaron gastos adicionales.'}
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
                                    {!formDisabled ? (t('actions') || 'Acciones') : ''}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(doc.detalleGastos || []).map((line) => (
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
        activeStep === 0 ? sectionAValid && step1Valid : activeStep === 1 ? step2Valid : true;

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
                            {STEPS.map((label) => (
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
                                    onClick={() => navigate('/init/overview/campaign-expenses')}
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
                                        disabled={formDisabled || !sectionAValid || !step1Valid}
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
