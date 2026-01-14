import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { MenuModules } from '../interfaces/menuModules';
import { dbContext } from '../services/pouchdbService';
import { NotificationService } from '../services/notificationService';

export const useMenuModules = () => {
  const { t } = useTranslation();
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [menuModules, setMenuModules] = useState<MenuModules[]>([]);

  const getMenuModules = async () => {
    setIsLoading(true);
    try {
      const response = await dbContext.menuModules.allDocs({ include_docs: true });

      setIsLoading(false);

      if (response.rows.length) {
        const documents: MenuModules[] = response.rows.map(row => row.doc as MenuModules);

        // Inyectar menú de debug si no existe ya - TODO: remover cuando esté en la DB
        const hasValorizacion = documents.some(m => 
          m.route === '/overview/annual-plan-valorization' || 
          m.route === '/init/overview/annual-plan-valorization'
        );
        if (!hasValorizacion) {
          // Buscar el módulo de Planificación Anual existente para usar su estructura
          const planificacionMenu = documents.find(m => 
            (m.module as any)?.moduleNameEs?.toLowerCase().includes('planificacion') ||
            (m.module as any)?.moduleNameEs?.toLowerCase().includes('planificación')
          );
          
          const moduleToUse = planificacionMenu?.module || {
            _id: 'module:planificacion',
            moduleNameEs: 'Planificacion Anual',
            moduleNameEn: 'Annual Planning',
            moduleNamePt: 'Planejamento Anual',
            icon: 'CalendarMonth',
            orden: 2,
          };

          // Extraer el order base del módulo de planificación
          const orderBase = planificacionMenu?.order?.split('.')[0] || '2';

          const debugValorizacionMenu: MenuModules = {
            _id: 'menu:annual-plan-valorization',
            id: 9999,
            module: moduleToUse as any,
            order: `${orderBase}.99`,
            menuOption: 'Valorización Plan Anual',
            menuOptionEn: 'Annual Plan Valorization',
            menuOptionPt: 'Valorização Plano Anual',
            systemType: 'web',
            menuType: 'sidebar',
            details: '',
            full: '/init/overview/annual-plan-valorization',
            light: '',
            icon: 'Calculate',
            route: '/init/overview/annual-plan-valorization',
            permission: true, // Forzar permiso para debug
          } as MenuModules;

          documents.push(debugValorizacionMenu);
          console.debug('[useMenuModules] DEBUG: Inyectado menú Valorización Plan Anual con módulo:', moduleToUse);
        }

        setMenuModules(documents);
      } else {
        setMenuModules([]);
      }
    } catch (error) {
      console.log(error);
      // Si la API (CouchDB) devuelve error (por ejemplo 429 Too Many Requests),
      // usamos un menú de navegación mínimo por defecto para que la app siga siendo usable.
      NotificationService.showError(t('no_categories_found'), {}, t('category_label'));

      const fallbackModule = {
        _id: 'module:core',
        moduleNameEs: 'General',
        moduleNameEn: 'General',
        moduleNamePt: 'Geral',
        icon: 'Home',
        orden: 1,
      };

      const fallbackMenu: MenuModules[] = [
        {
          _id: 'menu:fields',
          id: 1,
          module: fallbackModule as any,
          order: '1.1',
          menuOption: 'Campos',
          menuOptionEn: 'Fields',
          menuOptionPt: 'Campos',
          systemType: 'web',
          menuType: 'sidebar',
          details: '',
          full: '/overview/fields',
          light: '',
          icon: 'Map',
          route: '/overview/fields',
        },
        {
          _id: 'menu:deposits',
          id: 2,
          module: fallbackModule as any,
          order: '1.2',
          menuOption: 'Depósitos',
          menuOptionEn: 'Warehouses',
          menuOptionPt: 'Depósitos',
          systemType: 'web',
          menuType: 'sidebar',
          details: '',
          full: '/overview/deposit',
          light: '',
          icon: 'Warehouse',
          route: '/overview/deposit',
        },
        {
          _id: 'menu:supplies',
          id: 3,
          module: fallbackModule as any,
          order: '1.3',
          menuOption: 'Insumos',
          menuOptionEn: 'Supplies',
          menuOptionPt: 'Insumos',
          systemType: 'web',
          menuType: 'sidebar',
          details: '',
          full: '/overview/supply',
          light: '',
          icon: 'Inventory2',
          route: '/overview/supply',
        },
        {
          _id: 'menu:stock',
          id: 4,
          module: fallbackModule as any,
          order: '1.4',
          menuOption: 'Stock',
          menuOptionEn: 'Stock',
          menuOptionPt: 'Estoque',
          systemType: 'web',
          menuType: 'sidebar',
          details: '',
          full: '/overview/list-stock',
          light: '',
          icon: 'BarChart',
          route: '/overview/list-stock',
        },
        {
          _id: 'menu:annual-plan-valorization',
          id: 5,
          module: fallbackModule as any,
          order: '1.5',
          menuOption: 'Valorización Plan Anual',
          menuOptionEn: 'Annual Plan Valorization',
          menuOptionPt: 'Valorização Plano Anual',
          systemType: 'web',
          menuType: 'sidebar',
          details: '',
          full: '/init/overview/annual-plan-valorization',
          light: '',
          icon: 'Calculate',
          route: '/init/overview/annual-plan-valorization',
        },
      ];

      setMenuModules(fallbackMenu);
      if (error) setError(error);
    }
    finally {
      setIsLoading(false);
    }
  };


  return {
    error,
    isLoading,
    menuModules,
    getMenuModules
  };
};
