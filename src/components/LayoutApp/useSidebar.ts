import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useModules, useMenuModules, useAppSelector, useSystem } from '../../hooks';
import { MenuModules } from '../../interfaces/menuModules';
import { Modules } from '../../interfaces/modules';

const parseMenuOrder = (s?: string) => {
  if (!s) return Number.MAX_SAFE_INTEGER;
  const n = Number(s);
  if (!Number.isNaN(n)) return n;
  const m = String(s).match(/^(\d+)(?:\.(\d+))?$/);
  if (!m) return Number.MAX_SAFE_INTEGER;
  const major = Number(m[1]);
  const minor = Number(m[2] || '0') / 100;
  return major + minor;
};

const getModuleOrder = (mod: Modules | any): number => {
  const order = Number((mod as any).orden);
  return Number.isFinite(order) ? order : Infinity;
};

const getMenuLabel = (m: MenuModules, lang: string) => {
  const l = (lang || 'es').toLowerCase();
  if (l.startsWith('en') && (m.menuOptionEn || '').trim()) return m.menuOptionEn!;
  if (l.startsWith('pt') && (m.menuOptionPt || '').trim()) return m.menuOptionPt!;
  return m.menuOption || m.menuOption || '';
};

const getModuleLabel = (mod: Modules | any, lang: string) => {
  if (!mod) return '';
  const l = (lang || 'es').toLowerCase();
  if (l.startsWith('en') && (mod.moduleNameEn || '').trim()) return mod.moduleNameEn;
  if (l.startsWith('pt') && (mod.moduleNamePt || '').trim()) return mod.moduleNamePt;
  return mod.moduleNameEs || '';
};

export interface UseSidebarReturn {
  openCollapse: string;
  setOpenCollapse: (collapse: string) => void;
  onClickMenu: (collapse: string) => void;
  sidebarMenus: MenuModules[];
  grouped: Record<string, any>;
  groupKeysSorted: string[];
  visibleGroupKeys: string[];
  hasPermission: (m: MenuModules) => boolean;
  isLoading: boolean;
  version: string;
  pathname: string;
  lang: string;
  t: any;
  getModuleLabel: (mod: Modules | any, lang: string) => string;
  getMenuLabel: (m: MenuModules, lang: string) => string;
  sortedModules: Modules[];
}

export const useSidebar = (): UseSidebarReturn => {
  const [openCollapse, setOpenCollapse] = useState<string>('');
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const { user, modules: userModules } = useAppSelector((s: any) => s.auth || {});
  const { getSystem, system } = useSystem();
  const version = system.length ? system[0].version : '';

  // backend hooks
  const { modules, getModules } = useModules();
  const { menuModules, getMenuModules, isLoading } = useMenuModules();

  // permissions slice (app-specific)
  const modulesPermissionsSlice = useAppSelector(
    (s: any) => s.modulesPermissions || s.modulesUsers || s.permissions || null,
  );

  useEffect(() => {
    getModules();
    getMenuModules();
    getSystem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => console.debug('[useSidebar] modules count', modules?.length), [modules]);
  useEffect(
    () => console.debug('[useSidebar] menuModules count', menuModules?.length),
    [menuModules],
  );

  const onClickMenu = (collapse: string) =>
    setOpenCollapse(collapse === openCollapse ? '' : collapse);

  const sortedModules = useMemo(() => {
    return (modules || []).slice().sort((a, b) => {
      const aOrder = getModuleOrder(a);
      const bOrder = getModuleOrder(b);
      return aOrder - bOrder;
    });
  }, [modules]);

  // only sidebar menu items and with a defined route - RESPETAR ORDEN ORIGINAL
  const sidebarMenus = useMemo(
    () =>
      (menuModules || [])
        .filter(m => {
          const mt = String((m as any).menuType || '').toLowerCase();
          const hasRoute = !!(m.route || m.full || m.light || m.details);
          return (
            (mt === 'sidebar' || mt === 'sideBar'.toLowerCase() || mt === 'sidebar') && hasRoute
          );
        })
        .slice()
        .sort((a, b) => parseMenuOrder(a.order) - parseMenuOrder(b.order)),
    [menuModules],
  );

  // group by module: prefer module meta (object) or match with modules list, else prefix of order
  const grouped = useMemo(() => {
    const modulesById = new Map<string, any>();
    const modulesByName = new Map<string, any>();

    // Usar sortedModules para consistencia, pero no afecta la lógica de agrupación
    (sortedModules || []).forEach((m: any) => {
      if (m._id) modulesById.set(String(m._id), m);
      if ((m as any).id) modulesById.set(String((m as any).id), m);
      const nm = String(m.moduleNameEs || '')
        .trim()
        .toLowerCase();
      if (nm) modulesByName.set(nm, m);
      const nmEn = String(m.moduleNameEn || '')
        .trim()
        .toLowerCase();
      if (nmEn) modulesByName.set(nmEn, m);
    });

    interface GroupedEntry {
      moduleMeta?: Modules | any;
      items: MenuModules[];
      numericGroup?: number;
      moduleOrder?: number;
    }

    const g: Record<string, GroupedEntry> = {};

    sidebarMenus.forEach((item: MenuModules) => {
      let key: string = '';
      let moduleMeta: Modules | any | undefined = undefined;
      let moduleOrder: number = Infinity;

      // if menu.module is an object (embedded module meta)
      if (item && typeof (item as any).module === 'object' && (item as any).module?._id) {
        moduleMeta = (item as any).module;
        key = String(moduleMeta._id);
        moduleOrder = getModuleOrder(moduleMeta);
      } else {
        // menu.module might be id or moduleName string
        const rawModule: string = String(item.module ?? '').trim();
        if (rawModule) {
          // direct id
          if (modulesById.has(rawModule)) {
            moduleMeta = modulesById.get(rawModule);
            key = String(moduleMeta._id ?? moduleMeta.id);
            moduleOrder = getModuleOrder(moduleMeta);
          } else {
            // name match
            const nameKey: string = rawModule.toLowerCase();
            if (modulesByName.has(nameKey)) {
              moduleMeta = modulesByName.get(nameKey);
              key = String(moduleMeta._id ?? moduleMeta.id);
              moduleOrder = getModuleOrder(moduleMeta);
            } else {
              // fallback: if menu.order has numeric prefix
              const match = String(item.order || '').match(/^(\d+)(?:\.\d+)?/);
              if (match) {
                const grp: number = Number(match[1]);
                key = `group-${grp}`;
                if (!g[key]) g[key] = { items: [], numericGroup: grp, moduleOrder: Infinity };
              } else {
                // generic grouping by module string
                key = `group-${rawModule || '0'}`;
                if (!g[key]) g[key] = { items: [], moduleOrder: Infinity };
              }
            }
          }
        } else {
          // no module info: try order prefix
          const match = String(item.order || '').match(/^(\d+)(?:\.\d+)?/);
          if (match) {
            const grp: number = Number(match[1]);
            key = `group-${grp}`;
            if (!g[key]) g[key] = { items: [], numericGroup: grp, moduleOrder: Infinity };
          } else {
            key = 'group-0';
            if (!g[key]) g[key] = { items: [], moduleOrder: Infinity };
          }
        }
      }

      if (moduleMeta) {
        if (!key)
          key = String(
            moduleMeta._id ??
              moduleMeta.id ??
              moduleMeta.moduleNameEs ??
              moduleMeta.moduleNameEn ??
              moduleMeta.moduleNamePt,
          );
        if (!g[key]) {
          g[key] = { moduleMeta, items: [], moduleOrder };
        } else {
          g[key].moduleMeta = moduleMeta;
          g[key].moduleOrder = moduleOrder;
        }
      }

      if (!g[key]) g[key] = { items: [], moduleOrder: Infinity };
      g[key].items.push(item);
    });

    Object.keys(g).forEach(k => {
      g[k].items.sort((a, b) => parseMenuOrder(a.order) - parseMenuOrder(b.order));
    });

    console.debug('[useSidebar] grouped keys', Object.keys(g));
    return g;
  }, [sidebarMenus, sortedModules]);

  const groupKeysSorted = useMemo(() => {
    const keys = Object.keys(grouped);

    keys.sort((a, b) => {
      const groupA = grouped[a];
      const groupB = grouped[b];

      // ✅ PRIMERO: Orden por el campo 'orden' del módulo (si existe)
      const orderA = groupA.moduleMeta ? getModuleOrder(groupA.moduleMeta) : Infinity;
      const orderB = groupB.moduleMeta ? getModuleOrder(groupB.moduleMeta) : Infinity;

      if (orderA !== orderB) {
        return orderA - orderB; // Orden ascendente por campo 'orden'
      }

      // ✅ SEGUNDO: Si no tienen orden de módulo, usar el numericGroup del menú
      const numericA = groupA.numericGroup ?? Infinity;
      const numericB = groupB.numericGroup ?? Infinity;

      if (numericA !== numericB) {
        return numericA - numericB;
      }

      // Si ambos son iguales, mantener el orden original (estable)
      return 0;
    });

    console.debug(
      '[useSidebar] groupKeysSorted with module order:',
      keys.map(k => ({
        key: k,
        moduleOrder: grouped[k].moduleMeta ? getModuleOrder(grouped[k].moduleMeta) : 'none',
        moduleName: grouped[k].moduleMeta ? getModuleLabel(grouped[k].moduleMeta, 'es') : k,
      })),
    );

    return keys;
  }, [grouped]);

  const visibleGroupKeys = useMemo(() => {
    const validModulesMap = new Map<string, Modules>();
    (sortedModules || []).forEach((m: any) => {
      if (m._id) validModulesMap.set(String(m._id).toLowerCase(), m);
      if ((m as any).id) validModulesMap.set(String((m as any).id).toLowerCase(), m);

      const names = [m.moduleNameEs, m.moduleNameEn, m.moduleNamePt, (m as any).moduleName].filter(
        Boolean,
      );

      names.forEach((name: string) => {
        validModulesMap.set(String(name).trim().toLowerCase(), m);
      });
    });

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[useSidebar] valid modules keys:', Array.from(validModulesMap.keys()));
    }

    return groupKeysSorted.filter(k => {
      const entry = grouped[k];
      if (!entry || !entry.items.length) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug(`[useSidebar] drop group ${k}: no items`);
        }
        return false;
      }

      if (entry.moduleMeta) {
        const moduleId = entry.moduleMeta._id || entry.moduleMeta.id;
        if (moduleId && validModulesMap.has(String(moduleId).toLowerCase())) {
          return true;
        }

        const moduleNames = [
          entry.moduleMeta.moduleNameEs,
          entry.moduleMeta.moduleNameEn,
          entry.moduleMeta.moduleNamePt,
        ].filter(Boolean);
        const okByName = moduleNames.some(name =>
          validModulesMap.has(String(name).trim().toLowerCase()),
        );
        if (okByName) return true;

        if (process.env.NODE_ENV !== 'production') {
          console.debug(`[useSidebar] drop group ${k}: moduleMeta not in backend list`);
        }
        return false;
      }

      const candidate = entry.items[0]?.module;
      if (candidate) {
        const candidateKey = String(candidate).trim().toLowerCase();
        const resolved = validModulesMap.get(candidateKey);
        if (resolved) {
          entry.moduleMeta = resolved;
          entry.moduleOrder = getModuleOrder(resolved);
          return true;
        }
      }

      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[useSidebar] drop group ${k}: cannot resolve to backend module`);
      }
      return false;
    });
  }, [groupKeysSorted, grouped, sortedModules]);

  // permission check: usar módulos del usuario desde auth.modules
  const hasPermission = (m: MenuModules) => {
    // Si es admin, tiene acceso a todo
    if (user && user.isAdmin) return true;

    // Si hay propiedad permission explícita en el menu, respetarla
    if (typeof (m as any).permission === 'boolean') return !!(m as any).permission;

    // Verificar si el usuario tiene permiso para este módulo
    try {
      const menuId = Number((m as any).id ?? (m as any)._id);

      // Si hay módulos cargados desde el login
      if (userModules && Array.isArray(userModules) && userModules.length > 0) {
        // Verificar si el ID del menú está en los permisos del usuario
        const hasModulePermission = userModules.some(
          (um: any) => Number(um.moduleId) === menuId
        );
        return hasModulePermission;
      }

      // Fallback al slice anterior si existe
      const mid = String(menuId);
      if (modulesPermissionsSlice && typeof modulesPermissionsSlice === 'object') {
        if (mid && modulesPermissionsSlice[mid] != null) return !!modulesPermissionsSlice[mid];
        if (Array.isArray(modulesPermissionsSlice))
          return modulesPermissionsSlice.includes ? modulesPermissionsSlice.includes(mid) : true;
      }
    } catch (e) {
      console.error('[useSidebar] Error checking permission:', e);
    }

    // Si no hay módulos del usuario cargados, denegar acceso por defecto (más seguro)
    return false;
  };

  const lang = i18n.language || 'es';

  return {
    openCollapse,
    setOpenCollapse,
    onClickMenu,
    sidebarMenus,
    grouped,
    groupKeysSorted,
    visibleGroupKeys,
    hasPermission,
    isLoading,
    version,
    pathname,
    lang,
    t,
    getModuleLabel,
    getMenuLabel,
    sortedModules,
  };
};
