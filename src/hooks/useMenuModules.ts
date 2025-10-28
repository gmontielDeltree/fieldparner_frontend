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
        // Seed: add Crop Stock menus if missing
        try {
          const sibling = documents.find(m => m.route === '/init/overview/stock-movements')
            || documents.find(m => m.route === '/init/overview/business')
            || documents.find(m => m.route === '/init/overview/vehicle')
            || documents[0];

          // Add Crop Stock Adjustments menu
          const existsAdjust = documents.some(m => (m.route === '/init/overview/crop-stock-adjustments'));
          if (!existsAdjust) {
            const newMenu: MenuModules = {
              id: `menu:crops-adjust-${Date.now()}`,
              module: String(sibling?.module || 'management'),
              order: String(parseFloat(String(sibling?.order || '3')) + 0.05),
              menuOption: 'Movimientos Stock Cultivos',
              menuOptionEn: 'Crop Stock Movements',
              menuOptionPt: 'Movimentos Estoque Cultivos',
              systemType: 'App',
              details: '',
              menuType: 'sidebar',
              route: '/init/overview/crop-stock-adjustments',
              icon: 'inventory_2',
            } as unknown as MenuModules;
            await dbContext.menuModules.post(newMenu as any);
            documents.push(newMenu);
          }

          // Add Stock Query menu
          const existsQuery = documents.some(m => (m.route === '/init/overview/list-stock'));
          if (!existsQuery) {
            const newMenuQuery: MenuModules = {
              id: `menu:stock-query-${Date.now()}`,
              module: String(sibling?.module || 'management'),
              order: String(parseFloat(String(sibling?.order || '3')) + 0.03),
              menuOption: 'Consulta de Stock',
              menuOptionEn: 'Stock Query',
              menuOptionPt: 'Consulta de Estoque',
              systemType: 'App',
              details: '',
              menuType: 'sidebar',
              route: '/init/overview/list-stock',
              icon: 'query_stats',
            } as unknown as MenuModules;
            await dbContext.menuModules.post(newMenuQuery as any);
            documents.push(newMenuQuery);
          }
        } catch (_) { /* ignore seed errors */ }
        setMenuModules(documents);
      } else {
        setMenuModules([]);
      }
    } catch (error) {
      console.log(error);
      NotificationService.showError(t('no_categories_found'), {}, t('category_label'));
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  return {
    error,
    isLoading,
    menuModules,
    getMenuModules,
  };
};
