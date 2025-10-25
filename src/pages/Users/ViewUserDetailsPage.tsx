import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Avatar,
  Chip,
  Grid,
  Button,
  Divider,
  Tabs,
  Tab,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Language as LanguageIcon,
  AccountCircle as AccountCircleIcon,
  Security as SecurityIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useMenuModules, useUser } from '../../hooks';
import { Loading, ModulePermissionsSelector } from '../../components';
import { urlImg } from '../../config';
import { UserRole } from '../../types';
import { ModulesUsers } from '../../interfaces/menuModules';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const ViewUserDetailsPage: React.FC = () => {
  const { id: userId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, getUserById, getModulesByUserId } = useUser();
  const { menuModules, getMenuModules } = useMenuModules();
  const { userActive } = useAppSelector((state) => state.users);

  const [activeTab, setActiveTab] = useState(0);
  const [userPermissions, setUserPermissions] = useState<ModulesUsers[]>([]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEdit = () => {
    navigate(`/init/overview/users/edit/${userId}`);
  };

  const handleBack = () => {
    navigate('/init/overview/users');
  };

  const getLanguageLabel = (language: string): string => {
    const languageMap: { [key: string]: string } = {
      'es': 'Español',
      'en': 'Inglés',
      'pt': 'Portugués',
    };
    return languageMap[language] || language;
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

  useEffect(() => {
    if (userId) {
      getUserById(userId);
      getMenuModules();

      // Cargar permisos del usuario
      getModulesByUserId(userId).then(permissions => {
        setUserPermissions(permissions);
      });
    }
  }, [userId]);

  if (!userActive) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Loading loading={isLoading} />
        {!isLoading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Usuario no encontrado
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ mt: 3 }}
            >
              Volver a la lista
            </Button>
          </Box>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Loading loading={isLoading} />

      {/* Header Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              src={userActive.photoName ? `${urlImg}/${userActive.photoName}` : undefined}
              sx={{
                width: 100,
                height: 100,
                bgcolor: getAvatarColor(userActive.username || userActive.email),
                fontSize: '2rem',
                fontWeight: 600,
              }}
            >
              {!userActive.photoName && getInitials(userActive.username, userActive.email)}
            </Avatar>

            <Box>
              <Typography variant="h4" fontWeight="600" gutterBottom>
                {userActive.username || 'Sin nombre'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body1" color="text.secondary">
                  {userActive.email}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={userActive.state || 'Inactivo'}
                  color={getStateColor(userActive.state)}
                  size="small"
                />
                <Chip
                  label={getLanguageLabel(userActive.language)}
                  size="small"
                  variant="outlined"
                  icon={<LanguageIcon />}
                />
                <Chip
                  label={userActive.rol === UserRole.ADMIN ? 'Administrador' : 'Usuario'}
                  size="small"
                  color={userActive.rol === UserRole.ADMIN ? 'primary' : 'default'}
                  icon={<AccountCircleIcon />}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              Volver
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              color="primary"
            >
              Editar
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabs Section */}
      <Paper elevation={3}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
          }}
        >
          <Tab label="Información General" icon={<AccountCircleIcon />} iconPosition="start" />
          <Tab label="Permisos y Módulos" icon={<SecurityIcon />} iconPosition="start" />
        </Tabs>

        {/* Tab 1: Información General */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ px: 3, pb: 3 }}>
            <Grid container spacing={3}>
              {/* Información Personal */}
              <Grid item xs={12} md={8}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountCircleIcon color="primary" />
                      Información Personal
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Nombre completo
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {userActive.username || '-'}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Correo electrónico
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {userActive.email}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Idioma
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {getLanguageLabel(userActive.language)}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Rol
                        </Typography>
                        <Chip
                          label={userActive.rol === UserRole.ADMIN ? 'Administrador' : 'Usuario'}
                          color={userActive.rol === UserRole.ADMIN ? 'primary' : 'default'}
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Estado
                        </Typography>
                        <Chip
                          label={userActive.state || 'Inactivo'}
                          color={getStateColor(userActive.state)}
                          size="small"
                        />
                      </Grid>

                      {userActive.isAdmin && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Privilegios
                          </Typography>
                          <Chip
                            label="Administrador del Sistema"
                            color="warning"
                            size="small"
                          />
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Foto de Perfil */}
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <PhotoCameraIcon color="primary" />
                      Foto de Perfil
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    {userActive.photoName ? (
                      <Box
                        component="img"
                        src={`${urlImg}/${userActive.photoName}`}
                        alt="Foto de perfil"
                        sx={{
                          width: '100%',
                          maxWidth: 200,
                          height: 'auto',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          mx: 'auto',
                          border: '4px solid',
                          borderColor: 'primary.main',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 200,
                          height: 200,
                          borderRadius: '50%',
                          bgcolor: getAvatarColor(userActive.username || userActive.email),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                        }}
                      >
                        <Typography variant="h1" color="white" fontWeight="600">
                          {getInitials(userActive.username, userActive.email)}
                        </Typography>
                      </Box>
                    )}

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                      {userActive.photoName ? 'Foto configurada' : 'Sin foto de perfil'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Tab 2: Permisos y Módulos */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ px: 3, pb: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <SecurityIcon color="primary" />
                  Módulos Asignados
                </Typography>

                <ModulePermissionsSelector
                  selectedPermissions={userPermissions.map(mp => Number(mp.moduleId))}
                  onPermissionsChange={() => {}} // Función vacía, es solo lectura
                  menuModules={menuModules}
                  isLoading={isLoading}
                  disabled={true} // Modo solo lectura
                />

                {userPermissions.length === 0 && !isLoading && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Este usuario no tiene módulos asignados
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};
