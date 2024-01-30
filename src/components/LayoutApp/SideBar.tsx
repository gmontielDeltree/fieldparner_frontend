import { Navigate, Link as RouterLink, useLocation } from "react-router-dom";
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
  // Cabin as CabinIcon,
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
  Security as SecurityIcon,
  ListAlt as ListAltIcon,
  Gite as GiteIcon,
  Work as WorkIcon,
  // Flag as FlagIcon,
} from "@mui/icons-material";
import { SideBarProps } from "../../types";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import React, { useState } from 'react';

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
  const {t} = useTranslation();

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
            <ListItemButton
              component={RouterLink}
              to="/init/overview/fields"
              selected={pathname.includes("/init/overview/fields")}
            >
              <ListItemIcon>
                <CabinIcon />
              </ListItemIcon>
              <ListItemText primary={t("_fields")} />
            </ListItemButton>
          </ListItem>
          <ListItem key="recargar" disablePadding>
            <ListItemButton onClick={() => navigateTo("/")}>
              <ListItemIcon>
                <CachedIcon />
              </ListItemIcon>
              <ListItemText primary={t("_reload")} />
            </ListItemButton>
          </ListItem>
          <ListItem key="dispositivos" disablePadding>
            <ListItemButton onClick={() => navigateTo("/device")}>
              <ListItemIcon>
                <ListIcon />
              </ListItemIcon>
              <ListItemText primary={t("device_list")} />
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
              <ListItemText primary={t("social_entities")} />
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
              <ListItemText primary={t("field_output")} />
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
              <ListItemText primary={t("origins_destinations")} />
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
              <ListItemText primary={t("_supplies")} />
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
              <ListItemText primary={t("_warehouses")} />
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
              <ListItemText primary={t("_vehicles")} />
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
              <ListItemText primary={t("stock_movements")}/>
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
              <ListItemText primary={t("stock_inquiry")} />
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
              <ListItemText primary={t("_transformation")} />
            </ListItemButton>
          </ListItem>
          <ListItem key="ajustes" disablePadding>
            <ListItemButton onClick={() => navigateTo("/settings")}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary={t("_adjustments")} />
            </ListItemButton>
          </ListItem>
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