import { Link as RouterLink, useLocation } from "react-router-dom";
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
  ListItemText
} from "@mui/material";
import {
  Cabin as CabinIcon,
  ChevronLeft as ChevronLeftIcon,
  LocalShipping as LocalShippingIcon,
  // AttachMoney as AttachMoneyIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  Cached as CachedIcon,
  List as ListIcon,
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
  SyncAlt as SyncAltIcon,
  QueryStats as QueryStatsIcon,
  Transform as TransformIcon,
  Agriculture as AgricultureIcon,
  AddLocationAlt as AddLocationAltIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { SideBarProps } from "../../types";
import { Typography } from "@mui/material";
import { useState } from "react";

const keysCollapse = ["seguridad", "configuracion", "maestros", "agricultura", "stock", "cosecha", "gestion", "reporting", "wiki", "erp"];

//TODO: crear objeto de menu y submenus

export const SideBar: React.FC<SideBarProps> = ({
  drawerWidth,
  open,
  handleSideBarClose
}) => {
  const [openCollapse, setOpenCollapse] = useState('');

  const { pathname } = useLocation();
  const version = "2.23.1";
  const navigateTo = (path: string) => {
    window.location.replace(path);
  };

  const onClickMenu = (collapse: string) => setOpenCollapse(collapse === openCollapse ? "" : collapse);

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        sx={{
          width: drawerWidth,
          display: { xs: "block" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" }
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
          <ListItem key="Seguridad" disablePadding>
            <ListItemButton
              // component={RouterLink}
              // to="/init/overview/fields"
              onClick={() => onClickMenu(keysCollapse[0])}
            // selected={pathname.includes("/init/overview/fields")}
            >
              <ListItemIcon>
                <CabinIcon />
              </ListItemIcon>
              <ListItemText primary="Seguridad" />
              {openCollapse === keysCollapse[0] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          <Collapse key={keysCollapse[0]}
            in={openCollapse === keysCollapse[0]}
            timeout="auto"
            unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  <CabinIcon />
                </ListItemIcon>
                <ListItemText primary="Usuarios y permisos" />
              </ListItemButton>
            </List>
          </Collapse>
          <ListItem key="Configuracion" disablePadding>
            <ListItemButton
              // component={RouterLink}
              // to="/init/overview/fields"
              onClick={() => onClickMenu(keysCollapse[1])}
            // selected={pathname.includes("/init/overview/fields")}
            >
              <ListItemIcon>
                <CabinIcon />
              </ListItemIcon>
              <ListItemText primary="Configuracion" />
              {openCollapse === keysCollapse[1] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          <Collapse key={keysCollapse[1]}
            in={openCollapse === keysCollapse[1]}
            timeout="auto"
            unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  <CabinIcon />
                </ListItemIcon>
                <ListItemText primary="Definicion Campaña" />
              </ListItemButton>
            </List>
          </Collapse>
          <ListItem key="campos" disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/init/overview/fields"
              selected={pathname.includes("/init/overview/fields")}
            >
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
          <ListItem key="business" disablePadding>
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
          <ListItem key="out-field" disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/init/overview/exit-field"
              selected={pathname.includes("/init/overview/exit-field")}
            >
              <ListItemIcon>
                <AgricultureIcon />
              </ListItemIcon>
              <ListItemText primary="Salida de Campo" />
            </ListItemButton>
          </ListItem>
          <ListItem key="origins-destinations" disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/init/overview/origins-destinations"
              selected={pathname.includes("/init/overview/origins-destinations")}
            >
              <ListItemIcon>
                <AddLocationAltIcon />
              </ListItemIcon>
              <ListItemText primary="Procedencias/destinos" />
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
          <ListItem key="vehicles" disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/init/overview/vehicle"
              selected={pathname.includes("/init/overview/vehicle")}
            >
              <ListItemIcon>
                <LocalShippingIcon />
              </ListItemIcon>
              <ListItemText primary="Vehiculos" />
            </ListItemButton>
          </ListItem>
          <ListItem key="stock-movement" disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/init/overview/stock-movements"
              selected={pathname.includes("/init/overview/stock-movements")}
            >
              <ListItemIcon>
                <SyncAltIcon />
              </ListItemIcon>
              <ListItemText primary="Movimiento de Stock" />
            </ListItemButton>
          </ListItem>
          <ListItem key="list-stock" disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/init/overview/list-stock"
              selected={pathname.includes("/init/overview/list-stock")}
            >
              <ListItemIcon>
                <QueryStatsIcon />
              </ListItemIcon>
              <ListItemText primary="Consulta De Stock" />
            </ListItemButton>
          </ListItem>
          <ListItem key="transform" disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/init/overview/transform"
              selected={pathname.includes("/init/overview/transform")}>
              <ListItemIcon>
                <TransformIcon />
              </ListItemIcon>
              <ListItemText primary="Transformacion" />
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
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            p: 2,
            textAlign: "right"
          }}
        >
          <Typography variant="body1" color="gray">
            v{version}
          </Typography>
        </Box>
      </Drawer>
    </Box>
  );
};
