import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
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
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import { Loading, TemplateLayout } from '../../components';
import { CampaingExpenses, ListCampingExpeses } from '../../interfaces/campaignExpenses';
import { Company } from '../../interfaces/company';
import { CostsExpenses } from '../../interfaces/costsExpenses';
import {
  useCampaign,
  useCampaingExpenses,
  useCompany,
  useCostsExpensess,
  useField,
  useLaborsServices,
} from '../../hooks';
import { loadCampaignFromLS } from '../../helpers/persistence';
import { Campaign, Field, LaborsServices, Lot } from '../../types';
import {
  buildEmptyDetail,
  buildEmptyExpense,
  createDetailId,
  findCampaignByStoredValue,
  findCompanyByStoredValue,
  findCostByStoredValue,
  findFieldByStoredValue,
  findLaborByStoredValue,
  findLotByStoredValue,
  formatAmount,
  getCampaignCandidates,
  getFieldCandidates,
  getCompanyDisplayName,
  getExpenseTotalAmount,
  getFieldDisplayName,
  getLotCandidates,
  getLotDisplayName,
  matchesStoredValue,
} from './helpers';

const createInitialDetailState = (): ListCampingExpeses => buildEmptyDetail();
const createInitialExpenseState = (): CampaingExpenses => buildEmptyExpense();

const formatDetailDate = (value: string) => {
  if (!value) return '-';

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return parsedDate.toLocaleDateString('es-AR');
};

export const CampaignExpensesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isViewMode = location.pathname.endsWith('/view');
  const isEditMode = Boolean(id) && !isViewMode;
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [form, setForm] = useState<CampaingExpenses>(createInitialExpenseState);
  const [detailDraft, setDetailDraft] = useState<ListCampingExpeses>(createInitialDetailState);
  const [editingDetailId, setEditingDetailId] = useState<string | null>(null);

  const { campaigns, getCampaigns } = useCampaign();
  const { fields, getFields } = useField();
  const { companies, getCompanies } = useCompany();
  const { laborsServices, getLaborsServices } = useLaborsServices();
  const { costsExpenses, getCostsExpenses } = useCostsExpensess();
  const {
    campaingExpenses,
    createCampingExpeses,
    getCampaingExpenseById,
    getCampaingExpenses,
    isLoading,
    updateCampingExpeses,
  } = useCampaingExpenses();

  useEffect(() => {
    let isMounted = true;

    const loadPage = async () => {
      setIsBootstrapping(true);

      await Promise.all([
        getCampaigns(),
        getFields(),
        getCompanies(),
        getLaborsServices(),
        getCostsExpenses(),
        getCampaingExpenses(),
      ]);

      if (!isMounted) return;

      if (id) {
        const existingExpense = await getCampaingExpenseById(id);

        if (!isMounted) return;

        if (!existingExpense) {
          navigate('/init/overview/campaign-expenses');
          return;
        }

        setForm(existingExpense);
      } else {
        const selectedCampaign = loadCampaignFromLS();
        if (selectedCampaign) {
          const defaultZafra = Array.isArray(selectedCampaign.zafra)
            ? selectedCampaign.zafra[0] || ''
            : selectedCampaign.zafra || '';

          setForm(prevState => ({
            ...prevState,
            campaign: selectedCampaign._id || selectedCampaign.campaignId || selectedCampaign.name || '',
            zafra: defaultZafra,
          }));
        }
      }

      setIsBootstrapping(false);
    };

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const selectedField = useMemo(() => {
    return (
      findFieldByStoredValue(fields, form.field) ||
      fields.find(field => Boolean(findLotByStoredValue(field, form.lot))) ||
      null
    );
  }, [fields, form.field, form.lot]);

  const selectedCampaign = useMemo(
    () => findCampaignByStoredValue(campaigns, form.campaign),
    [campaigns, form.campaign],
  );

  const selectedLot = useMemo(
    () => findLotByStoredValue(selectedField, form.lot),
    [selectedField, form.lot],
  );

  const selectedCompany = useMemo(
    () => findCompanyByStoredValue(companies, detailDraft.company),
    [companies, detailDraft.company],
  );

  const selectedLabor = useMemo(
    () => findLaborByStoredValue(laborsServices, detailDraft.labor),
    [detailDraft.labor, laborsServices],
  );

  const selectedCost = useMemo(
    () => findCostByStoredValue(costsExpenses, detailDraft.costCode),
    [costsExpenses, detailDraft.costCode],
  );

  const availableZafras = useMemo(() => {
    if (!selectedCampaign?.zafra) return [];
    return Array.isArray(selectedCampaign.zafra) ? selectedCampaign.zafra : [selectedCampaign.zafra];
  }, [selectedCampaign]);

  const campaignOptions = useMemo(() => {
    if (id) return campaigns;
    return campaigns.filter(campaign => {
      const normalizedState = String(campaign.state || '').toLowerCase();
      return normalizedState !== 'closed' && normalizedState !== 'inactivo';
    });
  }, [campaigns, id]);

  const totalAmount = useMemo(() => getExpenseTotalAmount(form), [form]);

  const resetDetailForm = () => {
    setDetailDraft(createInitialDetailState());
    setEditingDetailId(null);
  };

  const handleFormValueChange = (key: keyof CampaingExpenses, value: string) => {
    setForm(prevState => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleDetailValueChange = (key: keyof ListCampingExpeses, value: string) => {
    setDetailDraft(prevState => ({
      ...prevState,
      [key]: value,
    }));
  };

  const validateHeader = () => {
    if (!form.campaign) {
      Swal.fire('Falta campaña', 'Seleccioná una campaña para continuar.', 'warning');
      return false;
    }

    if (!form.field) {
      Swal.fire('Falta campo', 'Seleccioná un campo para continuar.', 'warning');
      return false;
    }

    if (!form.lot) {
      Swal.fire('Falta lote', 'Seleccioná un lote para continuar.', 'warning');
      return false;
    }

    if (!form.listCamapingExpeses.length) {
      Swal.fire('Sin ítems', 'Agregá al menos un ítem de gasto antes de guardar.', 'warning');
      return false;
    }

    const duplicatedExpense = campaingExpenses.find(currentExpense => {
      if (!currentExpense._id || currentExpense._id === form._id) return false;

      const sameCampaign = matchesStoredValue(currentExpense.campaign, selectedCampaign ? getCampaignCandidates(selectedCampaign) : [form.campaign]);
      const sameField = matchesStoredValue(currentExpense.field, selectedField ? getFieldCandidates(selectedField) : [form.field]);
      const sameLot = matchesStoredValue(currentExpense.lot, selectedLot ? getLotCandidates(selectedLot) : [form.lot]);
      const sameZafra = matchesStoredValue(form.zafra, [currentExpense.zafra || '']);

      return sameCampaign && sameField && sameLot && sameZafra;
    });

    if (duplicatedExpense) {
      Swal.fire(
        'Registro duplicado',
        'Ya existe un gasto de campaña para esa combinación de campaña, zafra, campo y lote.',
        'error',
      );
      return false;
    }

    return true;
  };

  const validateDetail = () => {
    if (!detailDraft.date) {
      Swal.fire('Falta fecha', 'La fecha del ítem es obligatoria.', 'warning');
      return false;
    }

    if (!detailDraft.company) {
      Swal.fire('Falta sociedad', 'Seleccioná una sociedad para el ítem.', 'warning');
      return false;
    }

    if (!detailDraft.labor) {
      Swal.fire('Falta labor', 'Seleccioná una labor para el ítem.', 'warning');
      return false;
    }

    if (!detailDraft.costCode) {
      Swal.fire('Falta código', 'Seleccioná un código de costo para el ítem.', 'warning');
      return false;
    }

    if (!(parseFloat(detailDraft.amount || '0') > 0)) {
      Swal.fire('Importe inválido', 'Ingresá un importe mayor a cero.', 'warning');
      return false;
    }

    return true;
  };

  const handleAddOrUpdateDetail = () => {
    if (isViewMode || !validateDetail()) return;

    const nextDetail: ListCampingExpeses = {
      ...detailDraft,
      id: editingDetailId || detailDraft.id || createDetailId(),
    };

    setForm(prevState => {
      const currentDetails = prevState.listCamapingExpeses || [];

      if (editingDetailId) {
        return {
          ...prevState,
          listCamapingExpeses: currentDetails.map(currentDetail =>
            currentDetail.id === editingDetailId ? nextDetail : currentDetail,
          ),
        };
      }

      return {
        ...prevState,
        listCamapingExpeses: [...currentDetails, nextDetail],
      };
    });

    resetDetailForm();
  };

  const handleEditDetail = (detail: ListCampingExpeses) => {
    setDetailDraft(detail);
    setEditingDetailId(detail.id);
  };

  const handleDeleteDetail = (detailId: string) => {
    if (isViewMode) return;

    setForm(prevState => ({
      ...prevState,
      listCamapingExpeses: (prevState.listCamapingExpeses || []).filter(detail => detail.id !== detailId),
    }));

    if (editingDetailId === detailId) {
      resetDetailForm();
    }
  };

  const handleSave = async () => {
    if (isViewMode || !validateHeader()) return;

    const success = isEditMode
      ? await updateCampingExpeses(form)
      : await createCampingExpeses(form);

    if (!success) return;

    resetDetailForm();
    setForm(createInitialExpenseState());
  };

  const pageTitle = isViewMode
    ? 'Detalle de gasto de campaña'
    : isEditMode
      ? 'Editar gasto de campaña'
      : 'Nuevo gasto de campaña';

  return (
    <TemplateLayout key='campaign-expenses-page' viewMap={false} viewSelector={false}>
      {(isLoading || isBootstrapping) && <Loading loading />}
      <Container maxWidth='xl' sx={{ py: 4 }}>
        <Paper variant='outlined' sx={{ p: 4, borderRadius: 3 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent='space-between'
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography component='h1' variant='h4'>
                {pageTitle}
              </Typography>
              <Typography color='text.secondary'>
                Gestioná cabecera, ítems y totales del gasto de campaña.
              </Typography>
            </Box>
            <Stack direction='row' spacing={1} flexWrap='wrap'>
              <Chip label={`Ítems: ${form.listCamapingExpeses.length}`} color='primary' variant='outlined' />
              <Chip label={`Total: $ ${formatAmount(totalAmount)}`} color='success' variant='outlined' />
            </Stack>
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper variant='outlined' sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Cabecera
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Autocomplete
                      value={selectedCampaign}
                      options={campaignOptions}
                      disabled={isViewMode}
                      onChange={(_, value: Campaign | null) => {
                        const nextCampaignValue = value?._id || value?.campaignId || value?.name || '';
                        const nextZafra = Array.isArray(value?.zafra)
                          ? value?.zafra[0] || ''
                          : value?.zafra || '';

                        setForm(prevState => ({
                          ...prevState,
                          campaign: nextCampaignValue,
                          zafra: prevState.campaign === nextCampaignValue ? prevState.zafra || nextZafra : nextZafra,
                        }));
                      }}
                      getOptionLabel={option => option.name || ''}
                      renderInput={params => <TextField {...params} label='Campaña' />}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Autocomplete
                      value={form.zafra || null}
                      options={availableZafras}
                      disabled={isViewMode || !availableZafras.length}
                      onChange={(_, value: string | null) => handleFormValueChange('zafra', value || '')}
                      renderInput={params => <TextField {...params} label='Zafra' />}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Autocomplete
                      value={selectedField}
                      options={fields}
                      disabled={isViewMode}
                      onChange={(_, value: Field | null) => {
                        const nextFieldValue = value?._id || value?.uuid || value?.nombre || '';
                        setForm(prevState => ({
                          ...prevState,
                          field: nextFieldValue,
                          lot: '',
                          hectares: '',
                        }));
                      }}
                      getOptionLabel={option => option.nombre || ''}
                      renderInput={params => <TextField {...params} label='Campo' />}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Autocomplete
                      value={selectedLot}
                      options={selectedField?.lotes || []}
                      disabled={isViewMode || !selectedField}
                      onChange={(_, value: Lot | null) => {
                        setForm(prevState => ({
                          ...prevState,
                          lot: value?.properties?.uuid || value?._id || value?.properties?.nombre || '',
                          hectares: value?.properties?.hectareas?.toString() || '',
                        }));
                      }}
                      getOptionLabel={option => option.properties?.nombre || ''}
                      renderInput={params => <TextField {...params} label='Lote' />}
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <TextField
                      label='Ha'
                      value={form.hectares}
                      disabled
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label='Parcial'
                      value={form.partial}
                      onChange={event => handleFormValueChange('partial', event.target.value)}
                      disabled={isViewMode}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={9}>
                    <Typography color='text.secondary' sx={{ mt: 1 }}>
                      Campo: {getFieldDisplayName(fields, form.field) || '-'} | Lote:{' '}
                      {getLotDisplayName(fields, form.field, form.lot) || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {!isViewMode && (
              <Grid item xs={12}>
                <Paper variant='outlined' sx={{ p: 3, borderRadius: 2 }}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent='space-between'
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    spacing={1}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant='h6'>Ítem de gasto</Typography>
                    {editingDetailId && (
                      <Button color='inherit' onClick={resetDetailForm}>
                        Cancelar edición
                      </Button>
                    )}
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={2}>
                      <TextField
                        label='Fecha'
                        type='date'
                        value={detailDraft.date}
                        onChange={event => handleDetailValueChange('date', event.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Autocomplete
                        value={selectedCompany}
                        options={companies}
                        onChange={(_, value: Company | null) =>
                          handleDetailValueChange(
                            'company',
                            value?.companyId || value?._id || value?.socialReason || value?.name || '',
                          )
                        }
                        getOptionLabel={option =>
                          option.socialReason || option.fantasyName || option.name || ''
                        }
                        renderInput={params => <TextField {...params} label='Sociedad' />}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Autocomplete
                        value={selectedLabor}
                        options={laborsServices}
                        onChange={(_, value: LaborsServices | null) =>
                          handleDetailValueChange('labor', value?.service || value?.description || '')
                        }
                        getOptionLabel={option => option.service || option.description || ''}
                        renderInput={params => <TextField {...params} label='Labor' />}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Autocomplete
                        value={selectedCost}
                        options={costsExpenses}
                        onChange={(_, value: CostsExpenses | null) =>
                          handleDetailValueChange('costCode', value?.costCode || '')
                        }
                        getOptionLabel={option => option.costCode || ''}
                        renderInput={params => <TextField {...params} label='Código de costo' />}
                      />
                    </Grid>
                    <Grid item xs={12} md={1.5}>
                      <TextField
                        label='Importe'
                        type='number'
                        value={detailDraft.amount}
                        onChange={event => handleDetailValueChange('amount', event.target.value)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={1.5}>
                      <TextField
                        label='Referencia'
                        value={detailDraft.reference}
                        onChange={event => handleDetailValueChange('reference', event.target.value)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label='Detalle'
                        value={detailDraft.detail}
                        onChange={event => handleDetailValueChange('detail', event.target.value)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6} display='flex' justifyContent='flex-end' alignItems='center'>
                      <Button
                        variant='contained'
                        startIcon={<AddIcon />}
                        onClick={handleAddOrUpdateDetail}
                      >
                        {editingDetailId ? 'Actualizar ítem' : 'Agregar ítem'}
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12}>
              <Paper variant='outlined' sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Detalle cargado
                </Typography>
                {form.listCamapingExpeses.length === 0 ? (
                  <Typography color='text.secondary'>
                    Todavía no hay ítems cargados.
                  </Typography>
                ) : (
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Sociedad</TableCell>
                        <TableCell>Labor</TableCell>
                        <TableCell>Código</TableCell>
                        <TableCell>Detalle</TableCell>
                        <TableCell>Referencia</TableCell>
                        <TableCell align='right'>Importe</TableCell>
                        {!isViewMode && <TableCell align='right'>Acciones</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {form.listCamapingExpeses.map(detail => (
                        <TableRow key={detail.id}>
                          <TableCell>{formatDetailDate(detail.date)}</TableCell>
                          <TableCell>{getCompanyDisplayName(companies, detail.company) || '-'}</TableCell>
                          <TableCell>{detail.labor || '-'}</TableCell>
                          <TableCell>{detail.costCode || '-'}</TableCell>
                          <TableCell>{detail.detail || '-'}</TableCell>
                          <TableCell>{detail.reference || '-'}</TableCell>
                          <TableCell align='right'>$ {formatAmount(parseFloat(detail.amount || '0') || 0)}</TableCell>
                          {!isViewMode && (
                            <TableCell align='right'>
                              <Tooltip title='Editar ítem'>
                                <IconButton onClick={() => handleEditDetail(detail)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title='Eliminar ítem'>
                                <IconButton color='error' onClick={() => handleDeleteDetail(detail.id)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Stack direction='row' spacing={2} justifyContent='flex-end'>
            <Button color='inherit' onClick={() => navigate('/init/overview/campaign-expenses')}>
              Volver
            </Button>
            {!isViewMode && (
              <Button variant='contained' startIcon={<SaveIcon />} onClick={handleSave}>
                {isEditMode ? 'Guardar cambios' : 'Crear gasto'}
              </Button>
            )}
          </Stack>
        </Paper>
      </Container>
    </TemplateLayout>
  );
};
