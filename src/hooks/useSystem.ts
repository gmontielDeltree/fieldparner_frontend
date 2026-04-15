import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { System } from '../interfaces/system';
import { dbContext } from '../services/pouchdbService';
import { NotificationService } from '../services/notificationService';

export const useSystem = () => {
  const { t } = useTranslation();
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [system, setSystem] = useState<System[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getSystem = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await dbContext.system.allDocs({ include_docs: true });

      if (response.rows.length) {
        const documents: System[] = response.rows.map(row => row.doc as System);
        setSystem(documents);
      } else {
        setSystem([]);
      }
    } catch (error) {
      console.log(error);
      NotificationService.showError(t('no_categories_found'), {}, t('category_label'));
      if (error) setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Re-read cuando la sync trae datos al DB local.
  useEffect(() => {
    const feed = dbContext.system
      .changes({ live: true, since: 0 })
      .on('change', () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(getSystem, 400);
      });

    return () => {
      feed.cancel();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [getSystem]);

  return {
    error,
    isLoading,
    system,
    getSystem,
  };
};
