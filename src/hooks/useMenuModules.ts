import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MenuModules } from '../interfaces/menuModules';
import { dbContext } from '../services/pouchdbService';
import { NotificationService } from '../services/notificationService';

export const useMenuModules = () => {
  const { t } = useTranslation();
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [menuModules, setMenuModules] = useState<MenuModules[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getMenuModules = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await dbContext.menuModules.allDocs({ include_docs: true });

      if (response.rows.length) {
        const documents: MenuModules[] = response.rows.map(row => row.doc as MenuModules);
        setMenuModules(documents);
      } else {
        setMenuModules([]);
      }
    } catch (error) {
      console.log(error);
      // Si la API (CouchDB) devuelve error (por ejemplo 429 Too Many Requests),
      // usamos un menú de navegación mínimo por defecto para que la app siga siendo usable.
      NotificationService.showError(t('no_categories_found'), {}, t('category_label'));
      setMenuModules([]);
      if (error) setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Re-read cuando la sync trae datos al DB local (evita que el menú quede vacío
  // en primer login o con cache limpia). Debounce de 400ms para no releer por cada
  // doc individual durante una replicación masiva.
  useEffect(() => {
    const feed = dbContext.menuModules
      .changes({ live: true, since: 0 })
      .on('change', () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(getMenuModules, 400);
      });

    return () => {
      feed.cancel();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [getMenuModules]);

  return {
    error,
    isLoading,
    menuModules,
    getMenuModules,
  };
};
