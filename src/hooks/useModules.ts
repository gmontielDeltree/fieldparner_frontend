import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Modules } from '../interfaces/modules';
import { dbContext } from '../services/pouchdbService';
import { NotificationService } from '../services/notificationService';

export const useModules = () => {
  const { t } = useTranslation();
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [modules, setModules] = useState<Modules[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getModules = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await dbContext.modules.allDocs({ include_docs: true });

      if (response.rows.length) {
        const documents: Modules[] = response.rows.map(row => row.doc as Modules);
        setModules(documents);
      } else {
        setModules([]);
      }
    } catch (error) {
      console.log(error);
      NotificationService.showError(t('no_categories_found'), {}, t('category_label'));
      if (error) setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Re-read cuando la sync trae datos al DB local (evita sidebar vacío en primer login).
  useEffect(() => {
    const feed = dbContext.modules
      .changes({ live: true, since: 0 })
      .on('change', () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(getModules, 400);
      });

    return () => {
      feed.cancel();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [getModules]);

  return {
    error,
    isLoading,
    modules,
    getModules,
  };
};
