import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Modules } from '../interfaces/modules';
import { dbContext } from '../services/pouchdbService';
import { NotificationService } from '../services/notificationService';

export const useModules = () => {
  const { t } = useTranslation();
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [modules, setModules] = useState<Modules[]>([]);

  const getModules = async () => {
    setIsLoading(true);
    try {
      const response = await dbContext.modules.allDocs({ include_docs: true });

      setIsLoading(false);

      if (response.rows.length) {
        const documents: Modules[] = response.rows.map(row => row.doc as Modules);
        setModules(documents);
      } else {
        setModules([]);
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
    modules,
    getModules,
  };
};
