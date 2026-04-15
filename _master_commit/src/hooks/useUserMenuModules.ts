import { useMemo, useEffect } from 'react';
import { useAppSelector } from './useRedux';
import { useMenuModules } from './useMenuModules';
import { MenuModules, Modules } from '../interfaces/menuModules';

interface ModuleGroup {
  module: Modules;
  items: MenuModules[];
}

export interface GroupedMenuModules {
  [moduleName: string]: ModuleGroup;
}

export const useUserMenuModules = () => {
  const { modules: userModules } = useAppSelector((state) => state.auth);
  const { menuModules, getMenuModules, isLoading } = useMenuModules();

  useEffect(() => {
    getMenuModules();
  }, []);

  // Filtrar módulos permitidos para el usuario
  const allowedMenuModules = useMemo(() => {
    if (!userModules || !menuModules.length) return [];

    // Convertir IDs de permisos del usuario a números
    const userModuleIds = userModules.map(m => Number(m.moduleId));

    // Filtrar menuModules que el usuario tiene permiso de ver
    return menuModules.filter(menu => userModuleIds.includes(Number(menu.id)));
  }, [userModules, menuModules]);

  // Agrupar por módulo padre
  const groupedModules = useMemo<GroupedMenuModules>(() => {
    const groups: GroupedMenuModules = {};

    allowedMenuModules.forEach(menuModule => {
      const parentKey = menuModule.module.moduleNameEs; // "General", "Agricultura", etc.

      if (!groups[parentKey]) {
        groups[parentKey] = {
          module: menuModule.module,
          items: []
        };
      }

      groups[parentKey].items.push(menuModule);
    });

    // Ordenar items dentro de cada grupo por orden
    Object.values(groups).forEach(group => {
      group.items.sort((a, b) => Number(a.order) - Number(b.order));
    });

    return groups;
  }, [allowedMenuModules]);

  // Convertir a array y ordenar por orden del módulo padre
  const sortedGroups = useMemo(() => {
    return Object.entries(groupedModules)
      .sort(([, a], [, b]) => a.module.orden - b.module.orden);
  }, [groupedModules]);

  return {
    allowedMenuModules,
    groupedModules,
    sortedGroups,
    isLoading
  };
};
