import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  FileDownload as FileDownloadIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { GenericListPage } from '../../components';
import { useAnnualPlanValorization } from '../../hooks/useAnnualPlanValorization';
import { IAnnualPlan } from '../../interfaces/annualPlanValorization';
import { GridColDef } from '@mui/x-data-grid';
import { useCampaign, useField, useCrops } from '../../hooks';

export const ListAnnualPlanValorization: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    annualPlanValorizations,
    isLoading,
    getAnnualPlanValorizations,
    deleteAnnualPlanValorization,
  } = useAnnualPlanValorization();

  // Cargar datos dependientes para el hook
  const { campaigns, getCampaigns } = useCampaign();
  const { fields, getFields } = useField();
  const { crops, getCrops } = useCrops();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Cargar datos dependientes primero
  useEffect(() => {
    const loadDependencies = async () => {
      await Promise.all([getCampaigns(), getFields(), getCrops()]);
      setDataLoaded(true);
    };
    loadDependencies();
  }, []);

  // Cargar valorizaciones cuando los datos dependientes estén listos
  useEffect(() => {
    if (dataLoaded && campaigns.length > 0 && fields.length > 0) {
      getAnnualPlanValorizations();
    }
  }, [dataLoaded, campaigns.length, fields.length, crops.length]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      abierto: { label: t('open'), color: 'success' as const },
      cerrado: { label: t('closed'), color: 'default' as const },
      en_proceso: { label: t('in_process'), color: 'warning' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.abierto;

    return (
      <Chip label={config.label} color={config.color} size='small' sx={{ fontWeight: 'medium' }} />
    );
  };

  // Obtener nombre de campaña para mostrar en la tabla (fallback)
  const getCampaignName = (campanaId: string) => {
    const campaign = campaigns.find(c => c._id === campanaId);
    return campaign?.name || campanaId;
  };

  const columns: GridColDef[] = [
    {
      field: 'campanaName',
      headerName: t('campaign'),
      flex: 1,
      valueGetter: (params) => params.value || getCampaignName(params.row?.campanaId),
    },
    { field: 'zafra', headerName: t('harvest'), flex: 0.8 },
    { field: 'campoNombre', headerName: t('field'), flex: 1 },
    { field: 'loteNombre', headerName: t('lot'), flex: 1 },
    {
      field: 'has',
      headerName: t('hectares'),
      flex: 0.6,
      type: 'number',
      valueFormatter: ({ value }) => value?.toFixed(1) || '0',
    },
    { field: 'cultivoNombre', headerName: t('crop'), flex: 1 },
    {
      field: 'valorizada',
      headerName: t('valorized') || 'Valorizada',
      flex: 0.8,
      renderCell: params => (
        <Chip
          label={params.value ? t('yes') || 'Sí' : t('no') || 'No'}
          color={params.value ? 'success' : 'default'}
          size='small'
        />
      ),
    },
    {
      field: 'status',
      headerName: t('status'),
      flex: 0.8,
      renderCell: params => getStatusChip(params.value),
    },
    {
      field: 'actions',
      headerName: '',
      width: 200,
      minWidth: 180,
      sortable: false,
      renderCell: (params: { row: IAnnualPlan }) => (
        <Box
          display='flex'
          justifyContent='center'
          gap={0.5}
          sx={{
            width: '100%',
            overflow: 'visible',
            '& .MuiIconButton-root': {
              padding: '6px',
              '&:hover': {
                transform: 'scale(1.1)',
                transition: 'transform 0.2s',
              },
            },
          }}
        >
          {params.row.status === 'abierto' && (
            <Tooltip title={t('start_valorization')}>
              <IconButton
                aria-label={t('start_valorization')}
                onClick={() => onClickStartValorization(params.row)}
                color='primary'
                size='small'
              >
                <PlayArrowIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={t('icon_edit')}>
            <IconButton
              aria-label={t('icon_edit')}
              onClick={() => onClickEditValorization(params.row)}
              size='small'
            >
              <EditIcon fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('export_to_excel')}>
            <IconButton
              aria-label={t('export_to_excel')}
              onClick={() => onClickExportValorization(params.row)}
              color='success'
              size='small'
            >
              <FileDownloadIcon fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('icon_delete')}>
            <IconButton
              aria-label={t('icon_delete')}
              onClick={() => handleDeleteValorization(params.row)}
              size='small'
            >
              <DeleteIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const onClickStartValorization = (item: IAnnualPlan): void => {
    console.log('Starting valorization for:', item);
    navigate(`/init/overview/annual-plan-valorization/edit/${item._id}`);
  };

  const onClickEditValorization = (item: IAnnualPlan): void => {
    navigate(`/init/overview/annual-plan-valorization/edit/${item._id}`);
  };

  const onClickExportValorization = (item: IAnnualPlan): void => {
    // Por ahora solo mostramos un mensaje, la exportación completa se hace desde la página de edición
    alert(t('export_functionality_available_in_edit_page'));
  };

  const handleDeleteValorization = async (item: IAnnualPlan) => {
    const doc = item as any;
    if (!doc?._id) {
      console.warn('[AnnualPlanValorization][List] No _id para borrar', doc);
      return;
    }

    try {
      console.log('[AnnualPlanValorization][List] Borrar valorización', { id: doc._id, rev: doc._rev });
      await deleteAnnualPlanValorization(doc._id, doc._rev);
      await getAnnualPlanValorizations();
    } catch (error) {
      console.error('[AnnualPlanValorization][List] Error borrando valorización', error);
    }
  };

  const setActiveItem = () => {
    // This is required by GenericListPage but we don't use Redux for this feature
  };

  // Filtrar datos
  const filteredData = annualPlanValorizations.filter(item => {
    // Filtro por término de búsqueda
    const campaignName = item.campanaName || getCampaignName(item.campanaId);
    const matchesSearch =
      searchTerm === '' ||
      campaignName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.campoNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.loteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cultivoNombre?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por estado
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    // Filtro por campaña
    const matchesCampaign = campaignFilter === 'all' || campaignName === campaignFilter;

    return matchesSearch && matchesStatus && matchesCampaign;
  });

  useEffect(() => {
    console.log('[AnnualPlanValorization][List] Datos raw tabla:', annualPlanValorizations);
    console.log('[AnnualPlanValorization][List] Datos filtrados tabla:', filteredData);
  }, [annualPlanValorizations, filteredData]);

  // Obtener lista única de campañas para el filtro
  const uniqueCampaigns = Array.from(
    new Set(annualPlanValorizations.map(item => item.campanaName || getCampaignName(item.campanaId)).filter(Boolean)),
  );

  return (
    <Box>
      {/* Filtros */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size='small'
              placeholder={t('search')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Box sx={{ mr: 1 }}>🔍</Box>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size='small'>
              <InputLabel>{t('status')}</InputLabel>
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                label={t('status')}
              >
                <MenuItem value='all'>{t('all')}</MenuItem>
                <MenuItem value='abierto'>{t('open')}</MenuItem>
                <MenuItem value='cerrado'>{t('closed')}</MenuItem>
                <MenuItem value='en_proceso'>{t('in_process')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size='small'>
              <InputLabel>{t('campaign')}</InputLabel>
              <Select
                value={campaignFilter}
                onChange={e => setCampaignFilter(e.target.value)}
                label={t('campaign')}
              >
                <MenuItem value='all'>{t('all')}</MenuItem>
                {uniqueCampaigns.map(campaign => (
                  <MenuItem key={campaign} value={campaign}>
                    {campaign}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant='contained'
              color='primary'
              startIcon={<AnalyticsIcon />}
              onClick={() => navigate('/init/overview/annual-plan-valorization/analysis')}
            >
              {t('view_analysis')}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <GenericListPage
        moduleRoute='/init/overview/annual-plan-valorization'
        data={filteredData}
        columns={columns}
        getData={getAnnualPlanValorizations}
        deleteData={deleteAnnualPlanValorization}
        setActiveItem={setActiveItem}
        newItemPath='/init/overview/annual-plan-valorization/new'
        editItemPath={id => `/init/overview/annual-plan-valorization/edit/${id}`}
        isLoading={isLoading}
      />
    </Box>
  );
};
