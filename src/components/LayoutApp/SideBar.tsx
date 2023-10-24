// import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Cabin as CabinIcon,
  ChevronLeft as ChevronLeftIcon,
  LocalShipping as LocalShippingIcon,
  AttachMoney as AttachMoneyIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  Cached as CachedIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { SideBarProps } from '../../types';


// const sideBarMenu: MenuOptions[] = [
//   { text: 'Campos', icon: <CabinIcon /> },
//   { text: 'Recargar', icon: <CachedIcon /> },
//   { text: 'Lista de Dispositivos', icon: <ListIcon /> },
//   { text: 'Personal', icon: <GroupIcon /> },
//   { text: 'Vehiculos', icon: <LocalShippingIcon /> },
//   { text: 'Precios', icon: <AttachMoneyIcon /> },
//   { text: 'Ajustes', icon: <SettingsIcon /> }];

export const SideBar: React.FC<SideBarProps> = ({ drawerWidth, open, handleSideBarClose }) => {

  const navigateTo = (path: string) => {
    window.location.replace(path);
  }

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      <Drawer
        sx={{
          width: drawerWidth,
          display: { xs: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Box
          component="div"
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          sx={{ px: 0, py: 1.5 }}>
          <IconButton onClick={handleSideBarClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          <ListItem key='campos' disablePadding>
            <ListItemButton onClick={() => navigateTo('/campos')}>
              <ListItemIcon>
                <CabinIcon />
              </ListItemIcon>
              <ListItemText primary="Campos" />
            </ListItemButton>
          </ListItem>
          <ListItem key='recargar' disablePadding>
            <ListItemButton onClick={() => navigateTo('/')}>
              <ListItemIcon>
                <CachedIcon />
              </ListItemIcon>
              <ListItemText primary="Recargar" />
            </ListItemButton>
          </ListItem>
          <ListItem key='dispositivos' disablePadding>
            <ListItemButton onClick={() => navigateTo('/device')}>
              <ListItemIcon>
                <ListIcon />
              </ListItemIcon>
              <ListItemText primary="Lista de Dispositivos" />
            </ListItemButton>
          </ListItem>
          <ListItem key='personal' disablePadding>
            <ListItemButton onClick={() => navigateTo('/personal')}>
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Personal" />
            </ListItemButton>
          </ListItem>
          <ListItem key='vehiculos' disablePadding>
            <ListItemButton selected >
              <ListItemIcon>
                <LocalShippingIcon />
              </ListItemIcon>
              <ListItemText primary="Vehiculos" />
            </ListItemButton>
          </ListItem>
          <ListItem key='precios' disablePadding>
            <ListItemButton onClick={() => navigateTo('/prices')}>
              <ListItemIcon>
                <AttachMoneyIcon />
              </ListItemIcon>
              <ListItemText primary="Precios" />
            </ListItemButton>
          </ListItem>
          <ListItem key='ajustes' disablePadding>
            <ListItemButton onClick={() => navigateTo('/settings')}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Ajustes" />
            </ListItemButton>
          </ListItem>
          {/* {sideBarMenu.map(({ text, icon }) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {icon}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))} */}
        </List>
      </Drawer>
    </Box >

  )
}
