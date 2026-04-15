import { MenuModules } from '../interfaces/menuModules';

/**
 * Tipos de roles predefinidos disponibles
 */
export enum RoleTemplate {
  BLANK = 'blank',
  ADMIN = 'admin',
  USER_FULL = 'userFull',
  USER_AGRICOLA = 'userAgricola',
  USER_GESTION = 'userGestion',
}

/**
 * Información descriptiva de cada rol predefinido
 */
export const ROLE_TEMPLATE_INFO = {
  [RoleTemplate.BLANK]: {
    label: 'Sin permisos (En blanco)',
    description: 'El usuario no tendrá acceso a ningún módulo. Deberás asignar permisos manualmente.',
  },
  [RoleTemplate.ADMIN]: {
    label: 'Admin',
    description: 'Acceso completo a todos los módulos del sistema.',
  },
  [RoleTemplate.USER_FULL]: {
    label: 'User Full',
    description: 'Acceso a todos los módulos excepto el módulo de Seguridad.',
  },
  [RoleTemplate.USER_AGRICOLA]: {
    label: 'User Agrícola',
    description: 'Acceso a los módulos: Inicial, Agricultura y Stock.',
  },
  [RoleTemplate.USER_GESTION]: {
    label: 'User Gestión',
    description: 'Acceso al módulo: Inicial y Gestión.',
  },
};

/**
 * Obtiene los IDs de MenuModules según el template de rol seleccionado
 * @param template - El tipo de rol predefinido
 * @param menuModules - Lista completa de módulos disponibles
 * @returns Array de IDs de MenuModules que corresponden al template
 */
export const getRoleTemplatePermissions = (
  template: RoleTemplate,
  menuModules: MenuModules[]
): number[] => {
  switch (template) {
    case RoleTemplate.BLANK:
      return [];

    case RoleTemplate.ADMIN:
      // Admin tiene acceso a TODOS los módulos
      return menuModules.map(m => Number(m.id));

    case RoleTemplate.USER_FULL:
      // User Full: Todos los módulos EXCEPTO "Seguridad"
      return menuModules
        .filter(m => m.module.moduleNameEs !== 'Seguridad')
        .map(m => Number(m.id));

    case RoleTemplate.USER_AGRICOLA:
      // User Agrícola: Solo módulos Inicial, Agricultura, Stock
      return menuModules
        .filter(m =>
          m.module.moduleNameEs === 'Inicial' ||
          m.module.moduleNameEs === 'Agricultura' ||
          m.module.moduleNameEs === 'Stock'
        )
        .map(m => Number(m.id));

    case RoleTemplate.USER_GESTION:
      // User Gestión: Solo módulos Inicial y Gestión
      return menuModules
        .filter(m =>
          m.module.moduleNameEs === 'Inicial' ||
          m.module.moduleNameEs === 'Gestión'
        )
        .map(m => Number(m.id));

    default:
      return [];
  }
};

/**
 * Verifica si los permisos actuales coinciden con algún template
 * @param selectedPermissions - Array de IDs seleccionados
 * @param menuModules - Lista completa de módulos
 * @returns El template que coincide o null
 */
export const detectRoleTemplate = (
  selectedPermissions: number[],
  menuModules: MenuModules[]
): RoleTemplate | null => {
  if (selectedPermissions.length === 0) {
    return RoleTemplate.BLANK;
  }

  const sortedSelected = [...selectedPermissions].sort((a, b) => a - b);

  // Verificar cada template
  for (const template of Object.values(RoleTemplate)) {
    const templatePermissions = getRoleTemplatePermissions(template as RoleTemplate, menuModules);
    const sortedTemplate = [...templatePermissions].sort((a, b) => a - b);

    if (JSON.stringify(sortedSelected) === JSON.stringify(sortedTemplate)) {
      return template as RoleTemplate;
    }
  }

  return null; // Permisos personalizados
};
