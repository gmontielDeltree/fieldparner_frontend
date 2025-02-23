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
  ListItemText,
  Typography
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  LocalShipping as LocalShippingIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
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
  Person as PersonAddIcon,
  Assignment as AssignmentIcon,
  Map as MapIcon,
  BusinessCenter as BusinessCenterIcon,
  FireTruck as FireTruckIcon,
  CorporateFare as CorporateFareIcon,
  Description as DescriptionIcon,
  ForwardToInbox as ForwardToInboxIcon,
  LocationOn as LocationOnIcon,
  Handshake as HandshakeIcon,
  MonetizationOn as MonetizationOnIcon,
} from "@mui/icons-material";
import { Icon } from "semantic-ui-react";
import { SideBarProps } from "../../types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../hooks";
import { getEnvVariables } from "../../helpers/getEnvVariables";


const keysCollapse = ["seguridad", "configuracion", "general", "agricultura", "stock", "cosecha", "gestion", "reporting", "wiki", "erp"];

//TODO: crear objeto de menu y submenus

export const SideBar: React.FC<SideBarProps> = ({
  drawerWidth,
  open,
  handleSideBarClose
}) => {
  const [openCollapse, setOpenCollapse] = useState('');

  const { pathname } = useLocation();
  const version = getEnvVariables().VITE_VERSION;
  const { t } = useTranslation();

  const onClickMenu = (collapse: string) => setOpenCollapse(collapse === openCollapse ? "" : collapse);

  const { user } = useAppSelector((state) => state.auth);


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
                to="/init/overview/campaign-results" 
                selected={pathname.includes("/init/overview/campaign-results")}
              >
                <ListItemIcon>
                  <QueryStatsIcon />
                </ListItemIcon>
                <ListItemText primary={t("campaign_results")} />
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
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/zones"
                selected={pathname.includes("/init/overview/zones")}
              >
                <ListItemIcon>
                  < MapIcon />
                </ListItemIcon>
                <ListItemText primary={t("zones_groups")} />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/Labors-services"
                selected={pathname.includes("/init/overview/Labors-services")}
              >
                <ListItemIcon>
                  <BusinessCenterIcon />
                </ListItemIcon>
                <ListItemText primary={t("service_labors")} />
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
                to="/init/overview/certificate-deposits"
                selected={pathname.includes("/init/overview/certificate-deposits")}
              >
                <ListItemIcon>
                  <ForwardToInboxIcon />
                </ListItemIcon>
                <ListItemText primary={"Certificado Deposito"} />
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
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/transport-documents"
                selected={pathname.includes("/init/overview/transport-documents")}
              >
                <ListItemIcon>
                  <FireTruckIcon />
                </ListItemIcon>
                <ListItemText primary="Carta de Porte" />
              </ListItemButton>
              <ListItemButton >
                <ListItemIcon>
                </ListItemIcon>
                <ListItemText primary={t("_romaneos")} />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/sales-cereals"
                selected={pathname.includes("/init/overview/sales-cereals")}
              >
                <ListItemIcon>
                  <HandshakeIcon />
                </ListItemIcon>
                <ListItemText primary={t("title_sale_cereal")} />
              </ListItemButton>
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
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/list-orders"
                selected={pathname.includes("/init/overview/list-orders")}>
                <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>
                <ListItemText primary={t("withdrawal_orders")} />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/value-transform"
                selected={pathname.includes("/init/overview/value-transform")}>
                <ListItemIcon>
                  <TransformIcon />
                </ListItemIcon>
                <ListItemText primary={t("transformation_added_value")} />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/purchase-order"
                selected={pathname.includes("/init/overview/purchase-order")}>
                <ListItemIcon>
                  <Icon name="list alternate outline" size="large" />
                </ListItemIcon>
                <ListItemText primary={t("purchase_order")} />
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
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/corporate-companies"
                selected={pathname.includes("/init/overview/corporate-companies")}
              >
                <ListItemIcon>
                  <CorporateFareIcon />
                </ListItemIcon>
                <ListItemText primary={t("corporate_companies")} />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/corporate-contract"
                selected={pathname.includes("/init/overview/corporate-contract")}
              >
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText primary={t("corporate_contracts")} />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/productive-units"
                selected={pathname.includes("init/overview/productive-units")}
              >
                <ListItemIcon>
                  <MapIcon sx={{ marginRight: "-5px", }} />
                  <LocationOnIcon sx={{ marginRight: "28px", fontSize: "inherit", verticalAlign: "middle" }} />
                </ListItemIcon>
                <ListItemText primary={t("productive_units")} />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                component={RouterLink}
                to="/init/overview/costs-expenses"
                selected={pathname.includes("init/overview/costs-expenses")}
              >
                <ListItemIcon>
                   <MonetizationOnIcon />
                  {/* <LocationOnIcon sx={{ marginRight: "28px", fontSize: "inherit", verticalAlign: "middle" }} /> */}
                </ListItemIcon>
                <ListItemText primary={t("costs_expenses")} />
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
              {user && user.isAdmin && (
                <ListItemButton
                  sx={{ pl: 4 }}
                  component={RouterLink}
                  to="/init/overview/users"
                  selected={pathname.includes("/init/overview/users")}
                >
                  <ListItemIcon>
                    <PersonAddIcon />
                  </ListItemIcon>
                  <ListItemText primary={t("users_and_permissions")} />
                </ListItemButton>
              )}
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
