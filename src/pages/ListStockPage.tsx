import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Box, Paper, FormControlLabel, Switch, Tabs, Tab, Chip, Container, Typography } from "@mui/material";
import { QueryStats as QueryStatsIcon, Inventory as InventoryIcon, Warehouse as WarehouseIcon } from "@mui/icons-material";
import { useAppDispatch, useSupply } from "../hooks";
import { uiOpenModal } from "../redux/ui";
import { setSupplyActive } from "../redux/supply";
import { useTranslation } from "react-i18next";
import { GenericListPage } from "./GenericListPage";
import { SupplyByDepositsModal } from "../components/Modals/SupplyByDeposits/index";
import { SupplyByLotsModal } from "../components/Modals/SupplyByLots/index";
import { Supply, SupplyByDeposits } from "../types";

export const ListStockPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, stockBySupplies, supplyByDeposits, getStockByDepositAndLocation, getStockBySupplies } = useSupply();
  const [tabValue, setTabValue] = useState(0);
  const [showStockValueZero, setShowStockValueZero] = useState(false);
  const { t } = useTranslation();
  const [selectedSupplyDeposit, setSelectedSupplyDeposit] = useState<SupplyByDeposits | null>(null);

  const columnsBySupply = useMemo(() => [
    { field: "type", headerName: t("_type"), width: 150 },
    { field: "description", headerName: t("supply_description"), width: 200 },
    { field: "unitMeasurement", headerName: "UM", width: 100 },
    { field: "currentStock", headerName: t("current_stock"), width: 150, renderCell: (params) => (
      <Chip label={params.value} variant="filled" color="primary" onClick={() => onClickSupply(params.row)} />
    )},
    { field: "reservedStock", headerName: t("reserved_stock"), width: 150, renderCell: (params) => (
      <Chip label={params.value} variant="outlined" />
    )},
    { field: "availableStock", headerName: t("available_stock"), width: 150, renderCell: (params) => (
      <Chip label={params.value} color="success" />
    )},
  ], [t]);

  const columnsByDeposit = useMemo(() => [
    { field: "deposit", headerName: t("_warehouse"), width: 150 },
    { field: "type", headerName: t("_type"), width: 150 },
    { field: "description", headerName: t("supply_description"), width: 200 },
    { field: "unitMeasurement", headerName: "UM", width: 100 },
    { field: "currentStock", headerName: t("current_stock"), width: 150, renderCell: (params) => (
      <Chip label={params.value} variant="filled" color="primary" onClick={() => onClickDeposit(params.row)} />
    )},
    { field: "reservedStock", headerName: t("reserved_stock"), width: 150, renderCell: (params) => (
      <Chip label={params.value} variant="outlined" />
    )},
    { field: "availableStock", headerName: t("available_stock"), width: 150, renderCell: (params) => (
      <Chip label={params.value} color="success" />
    )},
  ], [t]);

  const onClickSupply = useCallback((supplySelected: Supply) => {
    dispatch(setSupplyActive(supplySelected));
    dispatch(uiOpenModal("SupplyByDeposits"));
  }, [dispatch]);

  const onClickDeposit = useCallback((item: SupplyByDeposits) => {
    setSelectedSupplyDeposit(item);
    dispatch(uiOpenModal("SupplyByLots"));
  }, [dispatch]);

  const getData = useCallback(() => {
    if (tabValue === 0) {
      getStockBySupplies();
    } else {
      getStockByDepositAndLocation();
    }
  }, []);

  // useEffect(() => {
  //   getData();
  // }, [getData]);

  const filteredData = useMemo(() => {
    const data = tabValue === 0 ? stockBySupplies : supplyByDeposits;
    return data.filter(item => showStockValueZero || item.currentStock > 0);
  }, [tabValue, stockBySupplies, supplyByDeposits, showStockValueZero]);

  return (
    <Container maxWidth="lg">
      <Box
        component="div"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ ml: { sm: 2 }, pt: 2, pr: 2 }}
      >
        <Box display="flex" alignItems="center">
          <QueryStatsIcon sx={{ marginRight: '8px' }} />
          <Typography component="h4" variant="h5" sx={{ ml: { sm: 2 } }}>
            {t("stock_query")}
          </Typography>
        </Box>
      </Box>
      <Paper variant="outlined" sx={{ mt: 7, p: { xs: 2, md: 3 } }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", display: "flex", justifyContent: "space-between" }}>
          <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
            <Tab label={<Box>{t("by_supply")} <InventoryIcon sx={{ ml: 1 }} /></Box>} />
            <Tab label={<Box>{t("by_warehouse")} <WarehouseIcon sx={{ ml: 1 }} /></Box>} />
          </Tabs>
          <FormControlLabel
            control={<Switch checked={showStockValueZero} onChange={(_e, checked) => setShowStockValueZero(checked)} />}
            label={t("show_zero_stock")}
            labelPlacement="start"
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <GenericListPage
            title=""
            icon={null}
            data={filteredData}
            columns={tabValue === 0 ? columnsBySupply : columnsByDeposit}
            getData={getData}
            deleteData={() => {}}
            setActiveItem={() => {}}
            showAddButton={false} 
            isLoading={isLoading}
            newItemPath=""
            editItemPath={() => ""}
          />
        </Box>
      </Paper>
      {tabValue === 0 && <SupplyByDepositsModal key="supply-deposits-modal" />}
      {tabValue === 1 && selectedSupplyDeposit && <SupplyByLotsModal key="supply-lot-modal" supplyByDeposit={selectedSupplyDeposit} />}
    </Container>
  );
};