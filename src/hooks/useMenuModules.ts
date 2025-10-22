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

        setMenuModules(documents);
      } else {
        setMenuModules([]);
      }
    } catch (error) {
      console.log(error);
      NotificationService.showError(t('no_categories_found'), {}, t('category_label'));
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
    getMenuModules,
  };
};
