import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { System } from '../interfaces/system';
import { dbContext } from '../services/pouchdbService';
import { NotificationService } from '../services/notificationService';

export const useSystem = () => {
  const { t } = useTranslation();
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [system, setSystem] = useState<System[]>([]);

  const getSystem = async () => {
    setIsLoading(true);
    try {
      const response = await dbContext.system.allDocs({ include_docs: true });

      setIsLoading(false);

      if (response.rows.length) {
        const documents: System[] = response.rows.map(row => row.doc as System);
        setSystem(documents);
      } else {
        setSystem([]);
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
    system,
    getSystem,
  };
};
