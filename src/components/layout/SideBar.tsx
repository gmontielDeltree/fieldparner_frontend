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
import { MenuOptions, SideBarProps } from '../../types';


const sideBarMenu: MenuOptions[] = [
  { text: 'Campos', icon: <CabinIcon /> },
  { text: 'Recargar', icon: <CachedIcon /> },
  { text: 'Lista de Dispositivos', icon: <ListIcon /> },
  { text: 'Personal', icon: <GroupIcon /> },
  { text: 'Equipos', icon: <LocalShippingIcon /> },
  { text: 'Precios', icon: <AttachMoneyIcon /> },
  { text: 'Ajustes', icon: <SettingsIcon /> }];

export const SideBar: React.FC<SideBarProps> = ({ drawerWidth, open, handleSideBarClose }) => {
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
          {sideBarMenu.map(({ text, icon }) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {icon}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>

  )
}
