import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  Button,
  Tooltip,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  RestartAlt as RestoreIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  PlayArrow as PlayArrowIcon,
  Agriculture,
  Grass,
  LocalFlorist,
  Landscape,
  MoreVert as MoreVertIcon,
  CalendarToday,
  LocationOn,
  Person as PersonIcon,
  Terrain as TerrainIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../hooks';
import { activitiesService, EnrichedActivity } from '../services/activitiesService';
import { Field } from '@types';

const ActivitiesManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<EnrichedActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<EnrichedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<EnrichedActivity | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: '', activity: null as EnrichedActivity | null });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Data for dropdowns
  const [campos, setCampos] = useState<Field[]>([]);
  const [lotes, setLotes] = useState<Array<{ uuid: string; nombre: string; campoId: string; campoNombre: string }>>([]);
  const [users, setUsers] = useState<Array<{ userId: string; name?: string }>>([]);

  const [filters, setFilters] = useState({
    tipo: '',
    estado: '',
    campoId: '',
    loteUuid: '',
    userId: '',
    search: ''
  });

  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    completadas: 0,
    enProceso: 0
  });

  const { selectedCampaign } = useAppSelector(state => state.campaign);

  useEffect(() => {
    loadInitialData();

    // Subscribe to changes
    const unsubscribe = activitiesService.onChanges(() => {
      loadActivities();
    });

    return () => unsubscribe();
  }, [selectedCampaign]);

  useEffect(() => {
    applyFilters();
  }, [activities, filters]);

  // When campo changes, filter lotes
  const getFilteredLotes = () => {
    if (!filters.campoId) return lotes;
    return lotes.filter(lote => lote.campoId === filters.campoId);
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load all data in parallel
      const [activitiesData, camposData, lotesData, usersData] = await Promise.all([
        selectedCampaign?._id
          ? activitiesService.getActivitiesByCampaign(selectedCampaign._id)
          : activitiesService.getEnrichedActivities(),
        activitiesService.getAllFields(),
        activitiesService.getAllLotes(),
        activitiesService.getUniqueUsers()
      ]);

      setActivities(activitiesData);
      setCampos(camposData);
      setLotes(lotesData);
      setUsers(usersData);

      // Calculate stats
      setStats({
        total: activitiesData.length,
        pendientes: activitiesData.filter(a => a.estado === 'pendiente').length,
        completadas: activitiesData.filter(a => a.estado === 'completada').length,
        enProceso: activitiesData.filter(a => a.estado === 'en_proceso').length
      });
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const data = selectedCampaign?._id
        ? await activitiesService.getActivitiesByCampaign(selectedCampaign._id)
        : await activitiesService.getEnrichedActivities();

      setActivities(data);

      // Calculate stats
      setStats({
        total: data.length,
        pendientes: data.filter(a => a.estado === 'pendiente').length,
        completadas: data.filter(a => a.estado === 'completada').length,
        enProceso: data.filter(a => a.estado === 'en_proceso').length
      });
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    if (filters.tipo) {
      filtered = filtered.filter(a => a.tipo === filters.tipo);
    }

    if (filters.estado) {
      filtered = filtered.filter(a => a.estado === filters.estado);
    }

    if (filters.campoId) {
      filtered = filtered.filter(a => a.campoData?._id === filters.campoId);
    }

    if (filters.loteUuid) {
      filtered = filtered.filter(a =>
        a.lote_uuid === filters.loteUuid || a.loteUuid === filters.loteUuid
      );
    }

    if (filters.userId) {
      filtered = filtered.filter(a =>
        a.created?.userId === filters.userId ||
        a.modified?.userId === filters.userId ||
        a.accountId === filters.userId
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(a =>
        a.comentario?.toLowerCase().includes(searchLower) ||
        a._id?.toLowerCase().includes(searchLower) ||
        a.detalles?.cultivo?.descriptionES?.toLowerCase().includes(searchLower) ||
        a.detalles?.cultivo?.name?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredActivities(filtered);
    setPage(0); // Reset to first page when filtering
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, activity: EnrichedActivity) => {
    setAnchorEl(event.currentTarget);
    setSelectedActivity(activity);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedActivity(null);
  };

  const handleStatusChange = async (activity: EnrichedActivity, newStatus: 'pendiente' | 'completada' | 'en_proceso') => {
    if (!activity._id) return;

    const success = await activitiesService.updateActivityStatus(activity._id, newStatus);
    if (success) {
      loadActivities();
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!confirmDialog.activity?._id) return;

    const success = await activitiesService.deleteActivity(confirmDialog.activity._id);
    if (success) {
      loadActivities();
    }
    setConfirmDialog({ open: false, action: '', activity: null });
  };

  const handleReset = async () => {
    if (!confirmDialog.activity?._id) return;

    const success = await activitiesService.resetActivity(confirmDialog.activity._id);
    if (success) {
      loadActivities();
    }
    setConfirmDialog({ open: false, action: '', activity: null });
  };

  const openConfirmDialog = (action: string, activity: EnrichedActivity) => {
    setConfirmDialog({ open: true, action, activity });
    handleMenuClose();
  };

  const clearFilters = () => {
    setFilters({
      tipo: '',
      estado: '',
      campoId: '',
      loteUuid: '',
      userId: '',
      search: ''
    });
  };

  const getEstadoColor = (estado?: string) => {
    switch (estado) {
      case 'completada': return 'success';
      case 'pendiente': return 'warning';
      case 'en_proceso': return 'info';
      default: return 'default';
    }
  };

  const getEstadoIcon = (estado?: string) => {
    switch (estado) {
      case 'completada': return <CheckCircleIcon fontSize="small" />;
      case 'pendiente': return <HourglassEmptyIcon fontSize="small" />;
      case 'en_proceso': return <PlayArrowIcon fontSize="small" />;
      default: return null;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'siembra': return <LocalFlorist />;
      case 'cosecha': return <Agriculture />;
      case 'aplicacion': return <Grass />;
      case 'preparado': return <Landscape />;
      default: return null;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'siembra': return '#10b981';
      case 'cosecha': return '#f59e0b';
      case 'aplicacion': return '#3b82f6';
      case 'preparado': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Agriculture />
        {t('Gestión de Actividades')}
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                {t('Total')}
              </Typography>
              <Typography variant="h4">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                {t('Pendientes')}
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.pendientes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                {t('En Proceso')}
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.enProceso}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                {t('Completadas')}
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.completadas}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label={t('Buscar')}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder={t('Comentario, cultivo...')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('Tipo')}</InputLabel>
              <Select
                value={filters.tipo}
                label={t('Tipo')}
                onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
              >
                <MenuItem value="">{t('Todos')}</MenuItem>
                <MenuItem value="siembra">{t('Siembra')}</MenuItem>
                <MenuItem value="cosecha">{t('Cosecha')}</MenuItem>
                <MenuItem value="aplicacion">{t('Aplicación')}</MenuItem>
                <MenuItem value="preparado">{t('Preparado')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('Estado')}</InputLabel>
              <Select
                value={filters.estado}
                label={t('Estado')}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
              >
                <MenuItem value="">{t('Todos')}</MenuItem>
                <MenuItem value="pendiente">{t('Pendiente')}</MenuItem>
                <MenuItem value="en_proceso">{t('En Proceso')}</MenuItem>
                <MenuItem value="completada">{t('Completada')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('Usuario/Cliente')}</InputLabel>
              <Select
                value={filters.userId}
                label={t('Usuario/Cliente')}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                startAdornment={
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">{t('Todos')}</MenuItem>
                {users.map(user => (
                  <MenuItem key={user.userId} value={user.userId}>
                    {user.name || user.userId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('Campo')}</InputLabel>
              <Select
                value={filters.campoId}
                label={t('Campo')}
                onChange={(e) => setFilters({ ...filters, campoId: e.target.value, loteUuid: '' })}
                startAdornment={
                  <InputAdornment position="start">
                    <LocationOn fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">{t('Todos')}</MenuItem>
                {campos.map(campo => (
                  <MenuItem key={campo._id} value={campo._id}>
                    {campo.properties?.nombre || campo.nombre || campo.name || campo._id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small" disabled={!filters.campoId && lotes.length > 20}>
              <InputLabel>{t('Lote')}</InputLabel>
              <Select
                value={filters.loteUuid}
                label={t('Lote')}
                onChange={(e) => setFilters({ ...filters, loteUuid: e.target.value })}
                startAdornment={
                  <InputAdornment position="start">
                    <TerrainIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">{t('Todos')}</MenuItem>
                {getFilteredLotes().map(lote => (
                  <MenuItem key={lote.uuid} value={lote.uuid}>
                    {lote.nombre} {filters.campoId ? '' : `(${lote.campoNombre})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={clearFilters}
              disabled={!Object.values(filters).some(v => v)}
            >
              {t('Limpiar Filtros')}
            </Button>
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={loadInitialData}
            >
              {t('Actualizar')}
            </Button>
          </Grid>
        </Grid>

        {selectedCampaign && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('Mostrando actividades de la campaña')}: <strong>{selectedCampaign.name}</strong>
          </Alert>
        )}
      </Paper>

      {/* Table */}
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Tipo')}</TableCell>
                    <TableCell>{t('Estado')}</TableCell>
                    <TableCell>{t('Campo')}</TableCell>
                    <TableCell>{t('Lote')}</TableCell>
                    <TableCell>{t('Cultivo')}</TableCell>
                    <TableCell>{t('Fecha Tentativa')}</TableCell>
                    <TableCell>{t('Hectáreas')}</TableCell>
                    <TableCell>{t('Usuario')}</TableCell>
                    <TableCell>{t('Comentario')}</TableCell>
                    <TableCell align="center">{t('Acciones')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredActivities
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((activity) => (
                      <TableRow key={activity._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ color: getTipoColor(activity.tipo) }}>
                              {getTipoIcon(activity.tipo)}
                            </Box>
                            <Typography variant="body2">
                              {t(activity.tipo)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={t(activity.estado || 'pendiente')}
                            color={getEstadoColor(activity.estado)}
                            size="small"
                            icon={getEstadoIcon(activity.estado)}
                          />
                        </TableCell>
                        <TableCell>{activity.campo_nombre || '-'}</TableCell>
                        <TableCell>{activity.lote_nombre || '-'}</TableCell>
                        <TableCell>
                          {activity.detalles?.cultivo?.descriptionES ||
                            activity.detalles?.cultivo?.name ||
                            '-'}
                        </TableCell>
                        <TableCell>
                          {activity.detalles?.fecha_ejecucion_tentativa
                            ? format(new Date(activity.detalles.fecha_ejecucion_tentativa), 'dd/MM/yyyy', { locale: es })
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {activity.detalles?.hectareas || activity.detalles?.superficie || '-'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {activity.created?.userId || activity.accountId || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={activity.comentario || ''}>
                            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {activity.comentario || '-'}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, activity)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredActivities.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage={t('Filas por página')}
            />
          </>
        )}
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedActivity?.estado !== 'en_proceso' && (
          <MenuItem onClick={() => handleStatusChange(selectedActivity!, 'en_proceso')}>
            <ListItemIcon>
              <PlayArrowIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('Marcar En Proceso')}</ListItemText>
          </MenuItem>
        )}
        {selectedActivity?.estado !== 'completada' && (
          <MenuItem onClick={() => handleStatusChange(selectedActivity!, 'completada')}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('Marcar Completada')}</ListItemText>
          </MenuItem>
        )}
        {selectedActivity?.estado !== 'pendiente' && (
          <MenuItem onClick={() => openConfirmDialog('reset', selectedActivity!)}>
            <ListItemIcon>
              <RestoreIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('Resetear a Pendiente')}</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => openConfirmDialog('delete', selectedActivity!)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('Eliminar')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: '', activity: null })}
      >
        <DialogTitle>
          {confirmDialog.action === 'delete' ? t('Confirmar Eliminación') : t('Confirmar Reseteo')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.action === 'delete'
              ? t('¿Estás seguro de que deseas eliminar esta actividad?')
              : t('¿Estás seguro de que deseas resetear esta actividad a pendiente?')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: '', activity: null })}>
            {t('Cancelar')}
          </Button>
          <Button
            onClick={confirmDialog.action === 'delete' ? handleDelete : handleReset}
            color={confirmDialog.action === 'delete' ? 'error' : 'primary'}
            variant="contained"
          >
            {confirmDialog.action === 'delete' ? t('Eliminar') : t('Resetear')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActivitiesManagementPage;