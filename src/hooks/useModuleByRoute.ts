import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMenuModules } from './useMenuModules';
import { MenuModules } from '../interfaces/menuModules';

export const useModuleByRoute = (route?: string | null) => {
  const { i18n } = useTranslation();
  const lang = i18n?.language || 'es';
  const { menuModules = [], isLoading } = useMenuModules();

  const getMenuLabel = (m?: MenuModules, l = 'es') => {
    if (!m) return '';
    const L = (l || 'es').toLowerCase();
    if (L.startsWith('en') && (m.menuOptionEn || '').trim()) return m.menuOptionEn!;
    if (L.startsWith('pt') && (m.menuOptionPt || '').trim()) return m.menuOptionPt!;
    return m.menuOption || '';
  };

  const normalizedRoute = useMemo(() => {
    if (!route) return '';
    return route.startsWith('/') ? route : `/${route}`;
  }, [route]);

  const module = useMemo(() => {
    if (!normalizedRoute) return null;
    const list = Array.isArray(menuModules) ? menuModules : [];
    // prefer exact route, then startsWith, then includes
    let found = list.find(m => m.route && String(m.route) === normalizedRoute);
    if (!found) found = list.find(m => m.route && normalizedRoute.startsWith(String(m.route)));
    if (!found)
      found = list.find(
        m => m.route && String(m.route) && normalizedRoute.includes(String(m.route)),
      );
    return found || null;
  }, [normalizedRoute, menuModules]);

  const moduleTitle = useMemo(() => (module ? getMenuLabel(module, lang) : ''), [module, lang]);
  const moduleIcon = module ? module.icon || null : null;

  return {
    module,
    isLoading,
    moduleTitle,
    moduleIcon,
  };
};
