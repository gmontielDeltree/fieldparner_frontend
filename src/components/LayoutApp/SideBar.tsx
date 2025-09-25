import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { IconsViewer, Loading } from '../../components';
import { useTranslation } from 'react-i18next';
import { getEnvVariables } from '../../helpers/getEnvVariables';
import { useModules, useMenuModules, useAppSelector } from '../../hooks';

import { SideBarProps } from '../../types';
import { MenuModules } from '../../interfaces/menuModules';
import { Modules } from '../../interfaces/modules';

const parseOrder = (s?: string) => {
  if (!s) return Number.MAX_SAFE_INTEGER;
  const n = Number(s);
  if (!Number.isNaN(n)) return n;
  const m = String(s).match(/^(\d+)(?:\.(\d+))?$/);
  if (!m) return Number.MAX_SAFE_INTEGER;
  const major = Number(m[1]);
  const minor = Number(m[2] || '0') / 100;
  return major + minor;
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

export const SideBar: React.FC<SideBarProps> = ({ drawerWidth, open, handleSideBarClose }) => {
  const [openCollapse, setOpenCollapse] = useState<string>('');
  const { pathname } = useLocation();
  const version = getEnvVariables().VITE_VERSION;
  const { t, i18n } = useTranslation();
  const { user } = useAppSelector((s: any) => s.auth || {});

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => console.debug('[SideBar] modules count', modules?.length), [modules]);
  useEffect(() => console.debug('[SideBar] menuModules count', menuModules?.length), [menuModules]);

  const onClickMenu = (collapse: string) =>
    setOpenCollapse(collapse === openCollapse ? '' : collapse);

  // only sidebar menu items and with a defined route
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
        .sort((a, b) => parseOrder(a.order) - parseOrder(b.order)),
    [menuModules],
  );

  // group by module: prefer module meta (object) or match with modules list, else prefix of order
  const grouped = useMemo(() => {
    const modulesById = new Map<string, any>();
    const modulesByName = new Map<string, any>();

    (modules || []).forEach((m: any) => {
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
    }

    const g: Record<string, GroupedEntry> = {};

    sidebarMenus.forEach((item: MenuModules) => {
      let key: string = '';
      let moduleMeta: Modules | any | undefined = undefined;

      // if menu.module is an object (embedded module meta)
      if (item && typeof (item as any).module === 'object' && (item as any).module?._id) {
        moduleMeta = (item as any).module;
        key = String(moduleMeta._id);
      } else {
        // menu.module might be id or moduleName string
        const rawModule: string = String(item.module ?? '').trim();
        if (rawModule) {
          // direct id
          if (modulesById.has(rawModule)) {
            moduleMeta = modulesById.get(rawModule);
            key = String(moduleMeta._id ?? moduleMeta.id);
          } else {
            // name match
            const nameKey: string = rawModule.toLowerCase();
            if (modulesByName.has(nameKey)) {
              moduleMeta = modulesByName.get(nameKey);
              key = String(moduleMeta._id ?? moduleMeta.id);
            } else {
              // fallback: if menu.order has numeric prefix
              const match = String(item.order || '').match(/^(\d+)(?:\.\d+)?/);
              if (match) {
                const grp: number = Number(match[1]);
                key = `group-${grp}`;
                if (!g[key]) g[key] = { items: [], numericGroup: grp };
              } else {
                // generic grouping by module string
                key = `group-${rawModule || '0'}`;
                if (!g[key]) g[key] = { items: [] };
              }
            }
          }
        } else {
          // no module info: try order prefix
          const match = String(item.order || '').match(/^(\d+)(?:\.\d+)?/);
          if (match) {
            const grp: number = Number(match[1]);
            key = `group-${grp}`;
            if (!g[key]) g[key] = { items: [], numericGroup: grp };
          } else {
            key = 'group-0';
            if (!g[key]) g[key] = { items: [] };
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
        if (!g[key]) g[key] = { moduleMeta, items: [] };
        else g[key].moduleMeta = moduleMeta;
      }

      if (!g[key]) g[key] = { items: [] };
      g[key].items.push(item);
    });

    // sort items in each group
    Object.keys(g).forEach(k => {
      g[k].items.sort((a, b) => parseOrder(a.order) - parseOrder(b.order));
    });

    console.debug('[SideBar] grouped keys', Object.keys(g));
    return g;
  }, [sidebarMenus, modules]);

  const groupKeysSorted = useMemo(() => {
    const keys = Object.keys(grouped);
    keys.sort((a, b) => {
      const na =
        grouped[a].numericGroup ??
        (a.startsWith('group-') ? Number(a.split('-')[1] || 9999) : 9999);
      const nb =
        grouped[b].numericGroup ??
        (b.startsWith('group-') ? Number(b.split('-')[1] || 9999) : 9999);
      if (na !== nb) return na - nb;
      return a.localeCompare(b);
    });
    return keys;
  }, [grouped]);

  // CORRECCIÓN DEFINITIVA: Solo mostrar grupos con módulos reales del backend
  const visibleGroupKeys = useMemo(() => {
    // Crear mapa completo de módulos válidos del backend
    const validModulesMap = new Map<string, Modules>();
    (modules || []).forEach((m: any) => {
      if (m._id) validModulesMap.set(String(m._id).toLowerCase(), m);
      if ((m as any).id) validModulesMap.set(String((m as any).id).toLowerCase(), m);

      const names = [
        m.moduleNameEs,
        m.moduleNameEn,
        m.moduleNamePt,
        (m as any).moduleName, // por si acaso
      ].filter(Boolean);

      names.forEach((name: string) => {
        validModulesMap.set(String(name).trim().toLowerCase(), m);
      });
    });

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[SideBar] valid modules keys:', Array.from(validModulesMap.keys()));
    }

    return groupKeysSorted.filter(k => {
      const entry = grouped[k];
      if (!entry || !entry.items.length) {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.debug(`[SideBar] drop group ${k}: no items`);
        }
        return false;
      }

      // Caso 1: si ya tiene moduleMeta, verificar que exista en validModulesMap
      if (entry.moduleMeta) {
        const moduleId = entry.moduleMeta._id || entry.moduleMeta.id;
        if (moduleId && validModulesMap.has(String(moduleId).toLowerCase())) {
          return true;
        }
        // verificar por nombre en moduleMeta
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
          // eslint-disable-next-line no-console
          console.debug(`[SideBar] drop group ${k}: moduleMeta not in backend list`);
        }
        return false;
      }

      // Caso 2: intentar resolver desde item.module (string id o nombre) y, si se resuelve,
      // asociar el moduleMeta al grupo para render (mutación controlada).
      const candidate = entry.items[0]?.module;
      if (candidate) {
        const candidateKey = String(candidate).trim().toLowerCase();
        const resolved = validModulesMap.get(candidateKey);
        if (resolved) {
          // asociar moduleMeta para usar label/icon luego
          entry.moduleMeta = resolved;
          return true;
        }
      }

      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug(`[SideBar] drop group ${k}: cannot resolve to backend module`);
      }
      return false;
    });
  }, [groupKeysSorted, grouped, modules]);

  // permission check: first menu.permission, then try app slice, then admin fallback
  const hasPermission = (m: MenuModules) => {
    if (typeof (m as any).permission === 'boolean') return !!(m as any).permission;
    try {
      const mid = String((m as any).id ?? (m as any)._id ?? '');
      if (modulesPermissionsSlice && typeof modulesPermissionsSlice === 'object') {
        if (mid && modulesPermissionsSlice[mid] != null) return !!modulesPermissionsSlice[mid];
        if (Array.isArray(modulesPermissionsSlice))
          return modulesPermissionsSlice.includes ? modulesPermissionsSlice.includes(mid) : true;
      }
    } catch (e) {
      // ignore
    }
    if (user && user.isAdmin) return true;
    return true; // permissive fallback
  };

  const lang = i18n.language || 'es';

  return (
    <Box component='nav' sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      <Drawer
        sx={{
          width: drawerWidth,
          display: { xs: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
        variant='persistent'
        anchor='left'
        open={open}
      >
        <Box
          component='div'
          display='flex'
          justifyContent='flex-end'
          alignItems='center'
          sx={{ px: 0, py: 1.5 }}
        >
          <IconButton onClick={handleSideBarClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>

        <Divider />

        <List>
          {isLoading && (
            <ListItem>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', p: 2 }}>
                <Loading loading={true} />
              </Box>
            </ListItem>
          )}

          {!isLoading &&
            visibleGroupKeys.map(groupKey => {
              const entry = grouped[groupKey];
              if (!entry || !entry.items.length) return null;

              const moduleMeta = entry.moduleMeta;
              const numericGroup = entry.numericGroup;
              const displayLabel = moduleMeta
                ? getModuleLabel(moduleMeta, lang)
                : t('_general') || `Grupo ${numericGroup ?? groupKey}`;

              const parentIconName = moduleMeta?.icon || entry.items[0]?.icon || undefined;
              const isOpen = openCollapse === groupKey;

              const children = entry.items.filter(it => hasPermission(it));

              if (!children.length) return null;

              return (
                <Box key={groupKey}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => onClickMenu(groupKey)}>
                      <ListItemIcon>
                        <IconsViewer iconName={parentIconName || undefined} size={22} />
                      </ListItemIcon>
                      <ListItemText primary={displayLabel} />
                      {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ListItemButton>
                  </ListItem>

                  <Collapse in={isOpen} timeout='auto' unmountOnExit>
                    <List component='div' disablePadding>
                      {children.map((m: MenuModules) => {
                        const to = m.route || m.full || m.light || m.details || '#';
                        const label = getMenuLabel(m, lang) || m.menuOption || '';
                        const selected = to !== '#' && pathname.startsWith(to);
                        return (
                          <ListItemButton
                            key={`${groupKey}-${m.id ?? (m as any)._id ?? label}`}
                            sx={{ pl: 4 }}
                            component={to !== '#' ? RouterLink : 'button'}
                            to={to !== '#' ? to : undefined}
                            selected={selected}
                          >
                            <ListItemIcon>
                              <IconsViewer iconName={(m as any).icon || undefined} size={20} />
                            </ListItemIcon>
                            <ListItemText primary={label} />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </Box>
              );
            })}
        </List>

        <Box sx={{ position: 'absolute', bottom: 0, right: 0, p: 2, textAlign: 'right' }}>
          <Typography variant='body1' color='gray'>
            v{version}
          </Typography>
        </Box>
      </Drawer>
    </Box>
  );
};
