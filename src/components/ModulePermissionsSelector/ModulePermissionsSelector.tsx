import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Checkbox,
  FormControlLabel,
  Chip,
  FormGroup,
  Divider,
  SelectChangeEvent,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Folder as FolderIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { MenuModules, Modules } from '../../interfaces/menuModules';
import {
  RoleTemplate,
  ROLE_TEMPLATE_INFO,
  getRoleTemplatePermissions,
  detectRoleTemplate,
} from '../../config/roleTemplates';

interface ModuleGroup {
  module: Modules;
  menuOptions: MenuModules[];
}

interface ModulePermissionsSelectorProps {
  selectedPermissions: number[];
  onPermissionsChange: (permissions: number[]) => void;
  menuModules: MenuModules[];
  isLoading?: boolean;
  disabled?: boolean;
}

export const ModulePermissionsSelector: React.FC<ModulePermissionsSelectorProps> = ({
  selectedPermissions,
  onPermissionsChange,
  menuModules,
  isLoading = false,
  disabled = false,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<RoleTemplate | ''>('');
  const [hasUserCustomized, setHasUserCustomized] = useState(false);
  const [showTemplateWarning, setShowTemplateWarning] = useState(false);

  // Agrupar menuModules por módulo padre
  const groupedModules = useMemo<ModuleGroup[]>(() => {
    const groups = new Map<string, ModuleGroup>();

    menuModules.forEach((menuModule) => {
      const moduleId = menuModule.module._id || '';

      if (!groups.has(moduleId)) {
        groups.set(moduleId, {
          module: menuModule.module,
          menuOptions: [],
        });
      }

      groups.get(moduleId)?.menuOptions.push(menuModule);
    });

    // Convertir Map a Array y ordenar por orden del módulo
    return Array.from(groups.values()).sort((a, b) => a.module.orden - b.module.orden);
  }, [menuModules]);

  // Detectar el template actual basado en permisos seleccionados
  useEffect(() => {
    const detectedTemplate = detectRoleTemplate(selectedPermissions, menuModules);
    if (detectedTemplate) {
      setSelectedTemplate(detectedTemplate);
      setHasUserCustomized(false);
    } else if (selectedPermissions.length > 0) {
      setSelectedTemplate('');
      setHasUserCustomized(true);
    }
  }, [selectedPermissions, menuModules]);

  // Manejar cambio de template de rol
  const handleTemplateChange = (event: SelectChangeEvent<string>) => {
    const template = event.target.value as RoleTemplate;

    // Si ya hay permisos personalizados, mostrar advertencia
    if (hasUserCustomized && selectedPermissions.length > 0) {
      setShowTemplateWarning(true);
      setTimeout(() => setShowTemplateWarning(false), 5000);
    }

    setSelectedTemplate(template);
    const permissions = getRoleTemplatePermissions(template, menuModules);
    onPermissionsChange(permissions);
    setHasUserCustomized(false);
  };

  // Manejar cambio de checkbox individual
  const handleMenuOptionToggle = (menuId: number) => {
    const newPermissions = selectedPermissions.includes(menuId)
      ? selectedPermissions.filter(id => id !== menuId)
      : [...selectedPermissions, menuId];

    onPermissionsChange(newPermissions);
    setHasUserCustomized(true);
  };

  // Manejar selección de todo un módulo
  const handleModuleToggle = (moduleGroup: ModuleGroup) => {
    const moduleOptionIds = moduleGroup.menuOptions.map(opt => opt.id);
    const allSelected = moduleOptionIds.every(id => selectedPermissions.includes(id));

    let newPermissions: number[];
    if (allSelected) {
      // Deseleccionar todo el módulo
      newPermissions = selectedPermissions.filter(id => !moduleOptionIds.includes(id));
    } else {
      // Seleccionar todo el módulo
      newPermissions = [...new Set([...selectedPermissions, ...moduleOptionIds])];
    }

    onPermissionsChange(newPermissions);
    setHasUserCustomized(true);
  };

  // Verificar si un módulo está completamente seleccionado
  const isModuleFullySelected = (moduleGroup: ModuleGroup): boolean => {
    return moduleGroup.menuOptions.every(opt => selectedPermissions.includes(opt.id));
  };

  // Verificar si un módulo está parcialmente seleccionado
  const isModulePartiallySelected = (moduleGroup: ModuleGroup): boolean => {
    const selectedCount = moduleGroup.menuOptions.filter(opt =>
      selectedPermissions.includes(opt.id)
    ).length;
    return selectedCount > 0 && selectedCount < moduleGroup.menuOptions.length;
  };

  return (
    <Box>
      {/* Alerta informativa */}
      <Alert severity="info" sx={{ mb: 3 }} icon={<InfoIcon />}>
        <AlertTitle>Asignación de permisos</AlertTitle>
        Puedes seleccionar un <strong>rol predefinido</strong> para asignar permisos automáticamente,
        o personalizar manualmente los módulos a los que tendrá acceso el usuario.
      </Alert>

      {/* Advertencia al cambiar template con permisos personalizados */}
      {showTemplateWarning && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Los permisos personalizados anteriores serán reemplazados por el rol predefinido seleccionado.
        </Alert>
      )}

      {/* Select de roles predefinidos */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Roles Predefinidos</InputLabel>
        <Select
          value={selectedTemplate}
          label="Roles Predefinidos"
          onChange={handleTemplateChange}
          disabled={disabled || isLoading}
        >
          <MenuItem value="">
            <em>Personalizado</em>
          </MenuItem>
          {Object.entries(ROLE_TEMPLATE_INFO).map(([key, info]) => (
            <MenuItem key={key} value={key}>
              {info.label}
            </MenuItem>
          ))}
        </Select>
        {selectedTemplate && ROLE_TEMPLATE_INFO[selectedTemplate as RoleTemplate] && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, ml: 1 }}>
            {ROLE_TEMPLATE_INFO[selectedTemplate as RoleTemplate].description}
          </Typography>
        )}
      </FormControl>

      <Divider sx={{ mb: 2 }}>
        <Chip
          label={`${selectedPermissions.length} permiso${selectedPermissions.length !== 1 ? 's' : ''} seleccionado${selectedPermissions.length !== 1 ? 's' : ''}`}
          size="small"
          color={selectedPermissions.length > 0 ? 'primary' : 'default'}
        />
      </Divider>

      {/* Árbol de módulos */}
      <Box sx={{ mt: 2 }}>
        {groupedModules.map((moduleGroup) => {
          const isFullySelected = isModuleFullySelected(moduleGroup);
          const isPartiallySelected = isModulePartiallySelected(moduleGroup);

          return (
            <Accordion key={moduleGroup.module._id} defaultExpanded={false} disabled={disabled || isLoading}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isFullySelected}
                      indeterminate={isPartiallySelected}
                      onChange={() => handleModuleToggle(moduleGroup)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={disabled || isLoading}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FolderIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle1" fontWeight={500}>
                        {moduleGroup.module.moduleNameEs}
                      </Typography>
                      <Chip
                        label={moduleGroup.menuOptions.filter(opt =>
                          selectedPermissions.includes(opt.id)
                        ).length + '/' + moduleGroup.menuOptions.length}
                        size="small"
                        color={isFullySelected ? 'success' : isPartiallySelected ? 'warning' : 'default'}
                      />
                    </Box>
                  }
                  onClick={(e) => e.stopPropagation()}
                />
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup sx={{ pl: 4 }}>
                  {moduleGroup.menuOptions
                    .sort((a, b) => Number(a.order) - Number(b.order))
                    .map((menuOption) => (
                      <FormControlLabel
                        key={menuOption.id}
                        control={
                          <Checkbox
                            checked={selectedPermissions.includes(menuOption.id)}
                            onChange={() => handleMenuOptionToggle(menuOption.id)}
                            disabled={disabled || isLoading}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {menuOption.menuOption}
                            </Typography>
                            {menuOption.systemType && (
                              <Chip
                                label={menuOption.systemType}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        }
                      />
                    ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      {/* Mensaje si no hay módulos */}
      {groupedModules.length === 0 && !isLoading && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          No hay módulos disponibles para asignar.
        </Alert>
      )}
    </Box>
  );
};
