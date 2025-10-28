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
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { IconsViewer, Loading } from '../../components';
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
                        const to =
                          (m as any).route ||
                          (m as any).full ||
                          (m as any).light ||
                          (m as any).details ||
                          '#';
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
