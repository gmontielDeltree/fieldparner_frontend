import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useMenuModules, useUser } from '../../hooks';
import { Loading, ModulePermissionsSelector } from '../../components';

export const EditUserPermissionsPage: React.FC = () => {
  const { id: userId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoading, getUserById, getModulesByUserId, updateUserPermissions } = useUser();
  const { menuModules, getMenuModules } = useMenuModules();
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  const handleBack = () => {
    navigate('/init/overview/users');
  };

  const handleSave = async () => {
    if (!userId) return;

    await updateUserPermissions(userId, selectedPermissions);
    navigate('/init/overview/users');
  };

  const handlePermissionsChange = (permissions: number[]) => {
    setSelectedPermissions(permissions);
  };

  useEffect(() => {
    if (userId) {
      // Cargar datos del usuario
      getUserById(userId).then(() => {
        // Los datos se cargarán en el estado de Redux, pero también podemos extraerlos
      });

      getMenuModules();

      // Cargar permisos actuales del usuario
      getModulesByUserId(userId).then(permissions => {
        const moduleIds = permissions.map(p => Number(p.moduleId));
        setSelectedPermissions(moduleIds);
      });
    }
  }, [userId]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Loading loading={isLoading} />

      {/* Header Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="600" gutterBottom>
              Editar Permisos de Usuario
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Selecciona los módulos a los que el usuario tendrá acceso
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Cancelar
          </Button>
        </Box>
      </Paper>

      {/* Permissions Section */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <SecurityIcon color="primary" />
              Asignación de Módulos
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Actualización de permisos</AlertTitle>
              Los cambios reemplazarán completamente los permisos anteriores del usuario.
              Asegúrate de seleccionar todos los módulos necesarios.
            </Alert>

            <ModulePermissionsSelector
              selectedPermissions={selectedPermissions}
              onPermissionsChange={handlePermissionsChange}
              menuModules={menuModules}
              isLoading={isLoading}
              disabled={false}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSave}
            startIcon={<SaveIcon />}
            disabled={isLoading}
          >
            Guardar Cambios
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
