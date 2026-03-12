import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  CircularProgress,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { IconsViewer } from '../../components';
import { SideBarProps } from '../../types';
import { MenuModules } from '../../interfaces/menuModules';
import { useSidebar } from './useSidebar';

export const SideBar: React.FC<SideBarProps> = ({ drawerWidth, open, handleSideBarClose }) => {
  // use the new hook (loads modules/menu/system and exposes prepared data)
  const {
    openCollapse,
    onClickMenu,
    getMenuLabel,
    getModuleLabel,
    grouped,
    //visibleGroupKeys,
    groupKeysSorted,
    hasPermission,
    isLoading,
    version,
    pathname,
    lang,
    t,
  } = useSidebar();

  return (
    <Box component='nav' sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      <Drawer
        sx={{
          width: drawerWidth,
          display: { xs: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: '#ffffff',
            color: '#0f172a',
            borderRight: '1px solid rgba(15,23,42,0.08)',
            boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
          },
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
          <IconButton
            onClick={handleSideBarClose}
            sx={{
              color: '#0f172a',
              '&:hover': { backgroundColor: 'rgba(15,23,42,0.06)' },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: 'rgba(15,23,42,0.06)' }} />

        <List sx={{ px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {isLoading && (
            <ListItem>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
              </Box>
            </ListItem>
          )}

          {!isLoading &&
            groupKeysSorted.map(groupKey => {
              const entry = grouped[groupKey];
              if (!entry || !entry.items.length) return null;

              const moduleMeta = entry.moduleMeta;
              const numericGroup = entry.numericGroup;
              const displayLabel = moduleMeta
                ? getModuleLabel(moduleMeta, lang)
                : t('_general') || `Grupo ${numericGroup ?? groupKey}`;

              const parentIconName = moduleMeta?.icon || entry.items[0]?.icon || undefined;
              const isOpen = openCollapse === groupKey;

              const children = entry.items.filter((it: MenuModules) => hasPermission(it));

              if (!children.length) return null;

              return (
                <Box key={groupKey}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => onClickMenu(groupKey)}
                      sx={{
                        borderRadius: 1.5,
                        mx: 0.5,
                        mb: 0.5,
                        color: 'inherit',
                        backgroundColor: isOpen ? 'rgba(59,130,246,0.08)' : 'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(15,23,42,0.05)',
                          transform: 'translateX(2px)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: '#3b82f6', minWidth: 40 }}>
                        <IconsViewer iconName={parentIconName || undefined} size={22} />
                      </ListItemIcon>
                      <ListItemText
                        primaryTypographyProps={{ sx: { fontWeight: 600, letterSpacing: 0.2 } }}
                        primary={displayLabel}
                      />
                      {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ListItemButton>
                  </ListItem>

                  <Collapse in={isOpen} timeout='auto' unmountOnExit>
                    <List component='div' disablePadding sx={{ pb: 0.75 }}>
                      {children.map((m: MenuModules) => {
                        const to =
                          (m as any).route ||
                          (m as any).full ||
                          (m as any).light ||
                          (m as any).details ||
                          '#';
                        const rawLabel = getMenuLabel(m, lang) || m.menuOption || '';
                        const menuKey = `menu_${rawLabel}`;
                        const translated = t(menuKey);
                        const label = translated !== menuKey ? translated : rawLabel;
                        const selected = to !== '#' && pathname.startsWith(to);
                        return (
                          <ListItemButton
                            key={`${groupKey}-${m.id ?? (m as any)._id ?? label}`}
                            sx={{
                              pl: 4,
                              pr: 2.5,
                              mx: 1,
                              mb: 0.4,
                              borderRadius: 1.5,
                              color: 'inherit',
                              transition: 'all 0.18s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(15,23,42,0.05)',
                                transform: 'translateX(3px)',
                              },
                              '&.Mui-selected': {
                                background:
                                  'linear-gradient(90deg, rgba(59,130,246,0.14) 0%, rgba(16,185,129,0.14) 100%)',
                                color: '#0f172a',
                                boxShadow: '0 8px 20px rgba(15,23,42,0.12)',
                                '& .MuiListItemIcon-root': { color: '#0ea5e9' },
                              },
                            }}
                            component={to !== '#' ? RouterLink : 'button'}
                            to={to !== '#' ? to : undefined}
                            selected={selected}
                          >
                            <ListItemIcon sx={{ color: selected ? '#0ea5e9' : '#94a3b8', minWidth: 36 }}>
                              <IconsViewer iconName={(m as any).icon || undefined} size={20} />
                            </ListItemIcon>
                            <ListItemText
                              primary={label}
                              primaryTypographyProps={{
                                sx: { fontWeight: selected ? 700 : 500, fontSize: 14, color: '#0f172a' },
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </Box>
              );
            })}
        </List>

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            p: 2,
            textAlign: 'right',
            color: '#6b7280',
            letterSpacing: 0.4,
            fontSize: 12,
          }}
        >
          <Typography variant='body1' color='inherit'>
            v{version}
          </Typography>
        </Box>
      </Drawer>
    </Box>
  );
};
