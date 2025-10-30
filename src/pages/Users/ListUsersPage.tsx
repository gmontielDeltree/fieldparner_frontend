import { useNavigate } from "react-router-dom";
import { ColumnProps, UserByAccount, UserRole } from "../../types";
import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector, useForm, useUser } from "../../hooks";
import {
  DataTable,
  ItemRow,
  Loading,
  TableCellStyled,
  TemplateLayout,
  CloseButtonPage,
  ConfirmDisableUserDialog,
} from "../../components";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import 'semantic-ui-css/semantic.min.css';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  PowerSettingsNew as PowerIcon,
  Delete as DeleteIcon,
  ListAlt as ListAltIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";





export const ListUsersPage: React.FC = () => {
  const { user: userActive } = useAppSelector(state => state.auth);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { isLoading, users, getUsers, disableUser } = useUser();

  const [searchText, setSearchText] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [selectedUserToDisable, setSelectedUserToDisable] = useState<UserByAccount | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  const columns: ColumnProps[] = [
    { text: "Usuario", align: "left" },
    { text: "Email", align: "left" },
    { text: "Rol", align: "center" },
    { text: "Idioma", align: "center" },
    { text: "Estado", align: "center" },
    { text: "Acciones", align: "center" },
  ];

  const onClickViewDetails = (item: UserByAccount): void => {
    navigate(`/init/overview/users/view/${item.userId}`);
  };

  const onClickEditPermissions = (row: UserByAccount) => {
    navigate(`/init/overview/users/edit-permissions/${row.userId}`);
  };

  const onClickDisableUser = (row: UserByAccount) => {
    setSelectedUserToDisable(row);
    setDisableDialogOpen(true);
  };

  const handleConfirmDisable = async () => {
    if (selectedUserToDisable && selectedUserToDisable._id) {
      await disableUser(selectedUserToDisable._id, selectedUserToDisable.username || selectedUserToDisable.email);
    }
    setDisableDialogOpen(false);
    setSelectedUserToDisable(null);
  };

  const handleCancelDisable = () => {
    setDisableDialogOpen(false);
    setSelectedUserToDisable(null);
  };

  const getLanguageLabel = (language: string): string => {
    const languageMap: { [key: string]: string } = {
      'es': 'ES',
      'en': 'GB',
      'pt': 'PT',
    };
    return languageMap[language] || language.toUpperCase();
  };

  const getStateColor = (state: string): "success" | "error" | "warning" | "default" => {
    switch (state?.toLowerCase()) {
      case 'activa':
      case 'activo':
        return 'success';
      case 'inactiva':
      case 'inactivo':
        return 'error';
      case 'suspendida':
      case 'suspendido':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRolColor = (rol: string): string => {
    const rolMap: { [key: string]: string } = {
      'ADM': '#E8D5F2',
      'OPER': '#D4F4DD',
      'SUPER': '#D5E5F9',
      'USER': '#FFE8CC',
    };
    return rolMap[rol] || '#E0E0E0';
  };

  const getRolTextColor = (rol: string): string => {
    const rolMap: { [key: string]: string } = {
      'ADM': '#6B2C8E',
      'OPER': '#2D7A3E',
      'SUPER': '#1565C0',
      'USER': '#E65100',
    };
    return rolMap[rol] || '#424242';
  };

  const getInitials = (username?: string, email?: string): string => {
    if (username) {
      const parts = username.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return username.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getAvatarColor = (str: string = ''): string => {
    const colors = [
      '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
      '#F59E0B', '#10B981', '#06B6D4', '#3B82F6'
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Filtered and paginated users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.username?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase());

      const matchesState = filterState === "all" || user.state?.toLowerCase() === filterState.toLowerCase();
      const matchesRole = filterRole === "all" || user.rol === filterRole;

      return matchesSearch && matchesState && matchesRole;
    });
  }, [users, searchText, filterState, filterRole]);

  const paginatedUsers = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <TemplateLayout key="overview-users" viewMap={false}>
      {isLoading && <Loading loading />}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h4" component="h1" fontWeight="600" gutterBottom>
              {t("users_and_permissions", "Usuarios y Permisos")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("manage_users_description", "Gestiona los usuarios y sus permisos del sistema")}
            </Typography>
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={() => navigate("/init/overview/users/new")}
              sx={{ textTransform: 'none', px: 3 }}
            >
              {t("new", "NUEVO")}
            </Button>
            <CloseButtonPage />
          </Box>
        </Box>

        {/* Filters Section */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder={t("search_by_user_email", "Buscar por usuario o email...")}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth sx={{ backgroundColor: 'white' }}>
                <Select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">{t("all_states", "Todos los estados")}</MenuItem>
                  <MenuItem value="activa">{t("active", "Activo")}</MenuItem>
                  <MenuItem value="inactiva">{t("inactive", "Inactivo")}</MenuItem>
                  <MenuItem value="suspendida">{t("suspended", "Suspendido")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth sx={{ backgroundColor: 'white' }}>
                <Select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">{t("all_roles", "Todos los roles")}</MenuItem>
                  <MenuItem value="ADM">ADM</MenuItem>
                  <MenuItem value="OPER">OPER</MenuItem>
                  <MenuItem value="SUPER">SUPER</MenuItem>
                  <MenuItem value="USER">USER</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        {/* Table Section */}
        <Box sx={{ backgroundColor: 'white', borderRadius: 2, overflow: 'hidden' }}>
          <DataTable
            key="datatable-users"
            columns={columns}
            isLoading={isLoading}
          >
            {paginatedUsers.map((row) => (
              <ItemRow key={row._id} hover>
                <TableCellStyled align="left">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        bgcolor: getAvatarColor(row.username || row.email),
                        width: 40,
                        height: 40,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      {getInitials(row.username, row.email)}
                    </Avatar>
                    <Typography variant="body2" fontWeight={500}>
                      {row.username || '-'}
                    </Typography>
                  </Box>
                </TableCellStyled>
                <TableCellStyled align="left">
                  <Typography variant="body2" color="text.secondary">
                    {row.email}
                  </Typography>
                </TableCellStyled>
                <TableCellStyled align="center">
                  <Chip
                    label={row.rol || 'USER'}
                    size="small"
                    sx={{
                      backgroundColor: getRolColor(row.rol || 'USER'),
                      color: getRolTextColor(row.rol || 'USER'),
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      borderRadius: 1,
                    }}
                  />
                </TableCellStyled>
                <TableCellStyled align="center">
                  <Typography variant="body2" fontWeight={500}>
                    {getLanguageLabel(row.language)}
                  </Typography>
                </TableCellStyled>
                <TableCellStyled align="center">
                  <Chip
                    label={row.state}
                    color={getStateColor(row.state)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCellStyled>
                {/* <TableCellStyled align="center">
                  {row.isAdmin && (
                    <Chip
                      label="Admin"
                      size="small"
                      sx={{
                        backgroundColor: '#FEF3E2',
                        color: '#C77700',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        borderRadius: 1,
                      }}
                    />
                  )}
                </TableCellStyled> */}
                <TableCellStyled align="center">
                  <Box display="flex" gap={0.5} justifyContent="center">
                    <Tooltip title={t("view_details", "Ver")}>
                      <IconButton
                        onClick={() => onClickViewDetails(row)}
                        size="small"
                        sx={{ color: '#64748B' }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {userActive?.rol === UserRole.ADMIN && (
                      <Tooltip title={t("edit_permissions", "Editar Permisos")}>
                        <IconButton
                          onClick={() => onClickEditPermissions(row)}
                          size="small"
                          sx={{ color: '#3B82F6' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {userActive?.rol === UserRole.ADMIN && (
                      <>
                        <Tooltip title={t("toggle_state", "Activar/Desactivar")}>
                          <IconButton
                            onClick={() => onClickDisableUser(row)}
                            size="small"
                            sx={{ color: '#F59E0B' }}
                          >
                            <PowerIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* <Tooltip title={t("delete_user", "Eliminar")}>
                          <IconButton
                            onClick={() => onClickDisableUser(row)}
                            size="small"
                            sx={{ color: '#EF4444' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip> */}
                      </>
                    )}
                  </Box>
                </TableCellStyled>
              </ItemRow>
            ))}
          </DataTable>
        </Box>

        {/* Pagination Section */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 3 }}
        >
          <Typography variant="body2" color="text.secondary">
            {t("showing_of", `Mostrando ${page * rowsPerPage + 1} a ${Math.min((page + 1) * rowsPerPage, filteredUsers.length)} de ${filteredUsers.length} usuarios`)}
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              disabled={page === 0}
              sx={{ textTransform: 'none' }}
            >
              {t("previous", "Anterior")}
            </Button>
            <Button
              variant="contained"
              onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={page >= totalPages - 1}
              sx={{ textTransform: 'none' }}
            >
              {t("next", "Siguiente")}
            </Button>
          </Box>
        </Box>
      </Container>

      <ConfirmDisableUserDialog
        open={disableDialogOpen}
        onClose={handleCancelDisable}
        onConfirm={handleConfirmDisable}
        username={selectedUserToDisable?.username || selectedUserToDisable?.email}
      />
    </TemplateLayout>
  );
};
