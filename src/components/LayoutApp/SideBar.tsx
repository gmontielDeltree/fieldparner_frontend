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
  ChevronLeft as ChevronLeftIcon,
  LocalShipping as LocalShippingIcon,
  // AttachMoney as AttachMoneyIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  // Cached as CachedIcon,
  // List as ListIcon,
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
import { useState } from "react";
import { useTranslation } from "react-i18next";

const keysCollapse = ["seguridad", "configuracion", "general", "agricultura", "stock", "cosecha", "gestion", "reporting", "wiki", "erp"];

//TODO: crear objeto de menu y submenus

export const SideBar: React.FC<SideBarProps> = ({
  drawerWidth,
  open,
  handleSideBarClose
}) => {
  const [openCollapse, setOpenCollapse] = useState('');

  const { pathname } = useLocation();
  const version = "2.23.1";
  const {t} = useTranslation();

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


          <ListItem key="General" disablePadding>
            <ListItemButton
              // component={RouterLink}
              // to="/init/overview/fields"
              onClick={() => onClickMenu(keysCollapse[2])}
            // selected={pathname.includes("/init/overview/fields")}
            >
              <ListItemIcon>
                <ListAltIcon />
              </ListItemIcon>
              <ListItemText primary={t("_general")} />
              {openCollapse === keysCollapse[2] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          <Collapse key={keysCollapse[2]}
            in={openCollapse === keysCollapse[2]}
            timeout="auto"
            unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/business"
                selected={pathname.includes("/init/overview/business")}
              >
                <ListItemIcon>
                  <GroupIcon />
                </ListItemIcon>
                <ListItemText primary={t("social_entities_census")} />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/vehicle"
                selected={pathname.includes("/init/overview/vehicle")}
              >
                <ListItemIcon>
                  <LocalShippingIcon />
                </ListItemIcon>
                <ListItemText primary={t("_vehicles")} />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/deposit"
                selected={pathname.includes("/init/overview/deposit")}
              >
                <ListItemIcon>
                  <WarehouseIcon />
                </ListItemIcon>
                <ListItemText primary={t("_warehouses")} />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/supply"
                selected={pathname.includes("/init/overview/supply")}
              >
                <ListItemIcon>
                  <InventoryIcon />
                </ListItemIcon>
                <ListItemText primary={t("supply_lots")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("currencies_quotes")} />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/origins-destinations"
                selected={pathname.includes("/init/overview/origins-destinations")}
              >
                <ListItemIcon>
                  <AddLocationAltIcon />
                </ListItemIcon>
                <ListItemText primary={t("origins_destinations")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("concepts_categories")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("zones_groups")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}
                              component={RouterLink}
                              to="/init/overview/prices"
                              selected={pathname.includes("/init/overview/prices")}
              >
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("market_prices")} />
              </ListItemButton>

            </List>
          </Collapse>
          <ListItem key="Agricultura" disablePadding>
            <ListItemButton
              // component={RouterLink}
              // to="/init/overview/fields"
              onClick={() => onClickMenu(keysCollapse[3])}
            // selected={pathname.includes("/init/overview/fields")}
            >
              <ListItemIcon>
                <GiteIcon />
              </ListItemIcon>
              <ListItemText primary={t("_agriculture")} />
              {openCollapse === keysCollapse[3] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          <Collapse key={keysCollapse[3]}
            in={openCollapse === keysCollapse[3]}
            timeout="auto"
            unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton >
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary={t("campaign_definition")} />
              </ListItemButton>
              <ListItemButton >
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary={t("fields_lots_hectares")} />
              </ListItemButton>
              <ListItemButton 
                component={RouterLink}
                to="/init/overview/fields/planification"
                selected={pathname.includes("/init/overview/fields/planification")}
                >
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary={t("annual_campaign_projection")} />
              </ListItemButton>
              <ListItemButton >
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary={t("_waybill")} />
              </ListItemButton>
              <ListItemButton >
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary={t("_freight")} />
              </ListItemButton>
              <ListItemButton >
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary={t("spoilage_table")} />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/exit-field"
                selected={pathname.includes("/init/overview/exit-field")}
              >
                <ListItemIcon>
                  <AgricultureIcon />
                </ListItemIcon>
                <ListItemText primary={t("field_exits")} />
              </ListItemButton>
              <ListItemButton >
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary={t("_romaneos")} />
              </ListItemButton>
              {/* <ListItemButton >
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary="Integracion con Maquinas" />
              </ListItemButton> */}
            </List>
          </Collapse>
          <ListItem key="Stock" disablePadding>
            <ListItemButton
              // component={RouterLink}
              // to="/init/overview/fields"
              onClick={() => onClickMenu(keysCollapse[4])}
            // selected={pathname.includes("/init/overview/fields")}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary={t("_stock")} />
              {openCollapse === keysCollapse[4] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          <Collapse key={keysCollapse[4]}
            in={openCollapse === keysCollapse[4]}
            timeout="auto"
            unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/stock-movements"
                selected={pathname.includes("/init/overview/stock-movements")}
              >
                <ListItemIcon>
                  <SyncAltIcon />
                </ListItemIcon>
                <ListItemText primary={t("stock_movements")} />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/list-stock"
                selected={pathname.includes("/init/overview/list-stock")}
              >
                <ListItemIcon>
                  <QueryStatsIcon />
                </ListItemIcon>
                <ListItemText primary={t("stock_query")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("withdrawal_orders")} />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/transform"
                selected={pathname.includes("/init/overview/transform")}>
                <ListItemIcon>
                  <TransformIcon />
                </ListItemIcon>
                <ListItemText primary={t("transformation_added_value")} />
              </ListItemButton>
            </List>
          </Collapse>
          <ListItem key="Gestion" disablePadding>
            <ListItemButton
              // component={RouterLink}
              // to="/init/overview/fields"
              onClick={() => onClickMenu(keysCollapse[6])}
            // selected={pathname.includes("/init/overview/fields")}
            >
              <ListItemIcon>
                <WorkIcon />
              </ListItemIcon>
              <ListItemText primary={t("_management")} />
              {openCollapse === keysCollapse[6] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          <Collapse key={keysCollapse[6]}
            in={openCollapse === keysCollapse[6]}
            timeout="auto"
            unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("_societies")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("_contracts")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("_expenses")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("_harvest")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("_costs")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("payment_orders")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("_settlements")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("hourly_settlement")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("deposit_certificates")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("_advances")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("grain_sales")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("_projections")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("final_results")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("web_simulator")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("_insurance")} />
              </ListItemButton>
            </List>
          </Collapse>
          {/* <ListItem key="Reporting" disablePadding>
            <ListItemButton
              // component={RouterLink}
              // to="/init/overview/fields"
              onClick={() => onClickMenu(keysCollapse[7])}
            // selected={pathname.includes("/init/overview/fields")}
            >
              <ListItemIcon>
                <FlagIcon />
              </ListItemIcon>
              <ListItemText primary="Reporting" />
              {openCollapse === keysCollapse[7] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          <Collapse key={keysCollapse[7]}
            in={openCollapse === keysCollapse[7]}
            timeout="auto"
            unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary="SmartView" />
              </ListItemButton>
            </List>
          </Collapse> */}
          <ListItem key="Seguridad" disablePadding>
            <ListItemButton
              // component={RouterLink}
              // to="/init/overview/fields"
              onClick={() => onClickMenu(keysCollapse[0])}
            // selected={pathname.includes("/init/overview/fields")}
            >
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText primary={t("_security")} />
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
                  {/* <CabinIcon /> */}
                </ListItemIcon>
                <ListItemText primary={t("users_and_permissions")} />
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
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary={t("_configuration")} />
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
                </ListItemIcon>
                <ListItemText primary={t("crop_colors")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary={t("user_profile")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary={t("app_general_config")} />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary={t("_numerators")} />
              </ListItemButton>
            </List>
          </Collapse>
          {/* <ListItem key="Wiki" disablePadding>
            <ListItemButton
              // component={RouterLink}
              // to="/init/overview/fields"
              onClick={() => onClickMenu(keysCollapse[8])}
            // selected={pathname.includes("/init/overview/fields")}
            >
              <ListItemIcon>
                <FlagIcon />
              </ListItemIcon>
              <ListItemText primary="Wiki" />
              {openCollapse === keysCollapse[8] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          <Collapse key={keysCollapse[8]}
            in={openCollapse === keysCollapse[8]}
            timeout="auto"
            unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary="Knoledge Base" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary="Tutorial" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary="Blog Interno" />
              </ListItemButton>
            </List>
          </Collapse> */}
          {/* <ListItem key="ERP" disablePadding>
            <ListItemButton
              // component={RouterLink}
              // to="/init/overview/fields"
              onClick={() => onClickMenu(keysCollapse[9])}
            // selected={pathname.includes("/init/overview/fields")}
            >
              <ListItemIcon>
                <FlagIcon />
              </ListItemIcon>
              <ListItemText primary="ERP" />
              {openCollapse === keysCollapse[9] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          <Collapse key={keysCollapse[9]}
            in={openCollapse === keysCollapse[9]}
            timeout="auto"
            unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary="Integracion AR" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary="Integracion BR" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary="Integracion PY" />
              </ListItemButton>
            </List>
          </Collapse> */}


          {/* <ListItem key="campos" disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/init/overview/fields"
              selected={pathname.includes("/init/overview/fields")}
            >
              <ListItemIcon>
                <CabinIcon />
              </ListItemIcon>
              <ListItemText primary= {t("_fields")} />
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
          </ListItem> */}
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
