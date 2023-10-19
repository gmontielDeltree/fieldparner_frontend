import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Cabin as CabinIcon,
  ChevronLeft as ChevronLeftIcon,
  LocalShipping as LocalShippingIcon,
  AttachMoney as AttachMoneyIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  Cached as CachedIcon,
  List as ListIcon,
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
} from "@mui/icons-material";
import { SideBarProps } from "../../types";

export const SideBar: React.FC<SideBarProps> = ({
  drawerWidth,
  open,
  handleSideBarClose,
}) => {
  const { pathname } = useLocation();

  const navigateTo = (path: string) => {
    window.location.replace(path);
  };

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        sx={{
          width: drawerWidth,
          display: { xs: "block" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
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
          sx={{ px: 0, py: 1.5 }}
        >
          <IconButton onClick={handleSideBarClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          <ListItem key="campos" disablePadding>
            <ListItemButton onClick={() => navigateTo("/campos")}>
              <ListItemIcon>
                <CabinIcon />
              </ListItemIcon>
              <ListItemText primary="Campos" />
            </ListItemButton>
          </ListItem>
          <ListItem key="recargar" disablePadding>
            <ListItemButton onClick={() => navigateTo("/")}>
              <ListItemIcon>
                <CachedIcon />
              </ListItemIcon>
              <ListItemText primary="Recargar" />
            </ListItemButton>
          </ListItem>
          <ListItem key="dispositivos" disablePadding>
            <ListItemButton onClick={() => navigateTo("/device")}>
              <ListItemIcon>
                <ListIcon />
              </ListItemIcon>
              <ListItemText primary="Lista de Dispositivos" />
            </ListItemButton>
          </ListItem>
          <ListItem key="personal" disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/init/overview/business"
              selected={pathname.includes("/init/overview/business")}
            >
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Entidades Sociales" />
            </ListItemButton>
          </ListItem>
          <ListItem key="supplies" disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/init/overview/supply"
              selected={pathname.includes("/init/overview/supply")}
            >
              <ListItemIcon>
                <InventoryIcon />
              </ListItemIcon>
              <ListItemText primary="Insumos" />
            </ListItemButton>
          </ListItem>
          <ListItem key="deposits" disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/init/overview/deposit"
              selected={pathname.includes("/init/overview/deposit")}
            >
              <ListItemIcon>
                <WarehouseIcon />
              </ListItemIcon>
              <ListItemText primary="Depositos" />
            </ListItemButton>
          </ListItem>
          <ListItem key="vehiculos" disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/init/overview/vehiculo"
              selected={pathname.includes("/init/overview/vehiculo")}
            >
              <ListItemIcon>
                <LocalShippingIcon />
              </ListItemIcon>
              <ListItemText primary="Vehiculos" />
            </ListItemButton>
          </ListItem>
          <ListItem key="precios" disablePadding>
            <ListItemButton onClick={() => navigateTo("/prices")}>
              <ListItemIcon>
                <AttachMoneyIcon />
              </ListItemIcon>
              <ListItemText primary="Precios" />
            </ListItemButton>
          </ListItem>
          <ListItem key="ajustes" disablePadding>
            <ListItemButton onClick={() => navigateTo("/settings")}>
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
    </Box>
  );
};
