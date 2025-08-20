import React, { useEffect, useState } from "react";
import {
  Loading,
  DataTable,
  ItemRow,
  TableCellStyled,
  CloseButtonPage,
  StockSupplyModal,
  SupplyByDepositsModal
} from "../../components";
import { ColumnProps, DisplayModals, Supply } from "../../types";
import {
  Box,
  Chip,
  Container,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  QueryStats as QueryStatsIcon,
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
} from "@mui/icons-material";
import { useAppDispatch, useSupply } from "../../hooks";
import { uiOpenModal } from "../../redux/ui";
import { setSupplyActive } from "../../redux/supply";
import { useTranslation } from "react-i18next";
import { StockItem } from "../../interfaces/stock";




interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export const ListStockPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    isLoading,
    stockBySupplies,
    stockByDeposits,
    getSupplyStockByDeposits,
    getStockBySupplies,
  } = useSupply();
  const [tabValue, setTabValue] = React.useState(0);
  // const [showStockValueZero, setShowStockValueZero] = React.useState(false);
  const { t } = useTranslation();

  const columnsBySupply: ColumnProps[] = [
    { text: t("_type"), align: "left" },
    { text: t("_supply"), align: "center" },
    { text: "UM", align: "center" },
    { text: t("current_stock"), align: "center" },
    { text: t("reserved_stock"), align: "center" },
    { text: t("available_stock"), align: "center" },
  ];

  const columnsByDeposit: ColumnProps[] = [
    { text: t("_warehouse"), align: "left" },
    { text: t("_location"), align: "left" },
    { text: t("_type_suppy"), align: "left" },
    { text: t("_supply"), align: "center" },
    { text: "UM", align: "center" },
    { text: t("current_stock"), align: "center" },
    { text: t("reserved_stock"), align: "center" },
    { text: t("available_stock"), align: "center" },
  ];

  const [selectedSupplyDeposit, setSelectedSupplyDeposit] =
    useState<StockItem | null>(null);

  const onChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const onClickSupply = (supplySelected: Supply) => {
    dispatch(setSupplyActive(supplySelected));
    dispatch(uiOpenModal(DisplayModals.SupplyByDeposits));
  };

  const onClickDeposit = (item: StockItem) => {
    console.log('item', item)
    setSelectedSupplyDeposit(item);
    dispatch(uiOpenModal(DisplayModals.SupplyByLots));
  };

  useEffect(() => {
    if (tabValue === 0) getStockBySupplies();
    else getSupplyStockByDeposits();
  }, [tabValue]);

  console.log('stockBySupplies', stockBySupplies)
  return (
    <Container sx={{ marginLeft: { xs: 0, sm: 3 } }} maxWidth="lg">
      {isLoading && <Loading loading={true} />}
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
        <CloseButtonPage />
      </Box>
      <Paper variant="outlined" sx={{ mt: 7, p: { xs: 2, md: 3 } }}>
        <Box sx={{ width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Tabs
              value={tabValue}
              onChange={onChangeTab}
              aria-label="tabs-stock"
            >
              <Tab
                label={
                  <Box>
                    {t("by_supply")} <InventoryIcon sx={{ ml: 1 }} />
                  </Box>
                }
                {...a11yProps(0)}
              />
              <Tab
                label={
                  <Box>
                    {t("by_warehouse")} <WarehouseIcon sx={{ ml: 1 }} />
                  </Box>
                }
                {...a11yProps(1)}
              />
            </Tabs>
            {/* <FormControlLabel
              control={
                <Switch
                  name="stockWithZero"
                  checked={showStockValueZero}
                  onChange={(_e, checked: boolean) =>
                    setShowStockValueZero(checked)
                  }
                />
              }
              label={t("show_zero_stock")}
              labelPlacement="start"
            /> */}
          </Box>
          <CustomTabPanel value={tabValue} index={0}>
            <Box component="div">
              <DataTable
                key="bySupply"
                columns={columnsBySupply}
                isLoading={isLoading}
              >
                {stockBySupplies
                  // .filter((s) => (showStockValueZero ? s : s.currentStock > 0))
                  .map((stock) => (
                    <ItemRow key={stock._id} hover>
                      <TableCellStyled align="left">{stock?.dataSupply?.type}</TableCellStyled>
                      <TableCellStyled align="center">{stock?.dataSupply?.name}</TableCellStyled>
                      <TableCellStyled align="center">
                        {stock?.dataSupply?.unitMeasurement}
                      </TableCellStyled>
                      <TableCellStyled align="center">
                        <Chip
                          label={stock?.currentStock}
                          variant="filled"
                          color="primary"
                          onClick={() => stock.dataSupply && onClickSupply(stock.dataSupply)}
                        />
                      </TableCellStyled>
                      <TableCellStyled align="center">
                        <Chip label={stock.reservedStock} variant="outlined" />
                      </TableCellStyled>
                      <TableCellStyled align="center">
                        <Chip
                          label={stock?.currentStock - stock?.reservedStock}
                          color="success"
                        />
                      </TableCellStyled>
                    </ItemRow>
                  ))}
              </DataTable>
            </Box>
            <SupplyByDepositsModal key="supply-deposits-modal" />
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={1}>
            <Box component="div">
              {selectedSupplyDeposit && (
                <StockSupplyModal
                  key="supply-lot-modal"
                  selectedRow={selectedSupplyDeposit}
                />
              )}
              <DataTable
                key="byDeposit"
                columns={columnsByDeposit}
                isLoading={isLoading}
              >
                {stockByDeposits
                  // .filter((s) => (showStockValueZero ? s : s.currentStock > 0))
                  .map((row) => (
                    <ItemRow
                      key={`${row?.dataDeposit?._id}-${row?.dataSupply?._id}`}
                      hover
                    >
                      <TableCellStyled align="left">
                        {row?.dataDeposit?.description.trim()}
                      </TableCellStyled>
                      <TableCellStyled align="left">
                        {row?.location.trim()}
                      </TableCellStyled>
                      <TableCellStyled>{row?.dataSupply?.type}</TableCellStyled>
                      <TableCellStyled align="center">{row?.dataSupply?.name}</TableCellStyled>
                      <TableCellStyled align="center">
                        {row?.dataSupply?.unitMeasurement}
                      </TableCellStyled>
                      <TableCellStyled align="center">
                        <Chip
                          label={row.currentStock}
                          variant="filled"
                          color="primary"
                          onClick={() => row && onClickDeposit(row)}
                        />
                      </TableCellStyled>
                      <TableCellStyled align="center">
                        <Chip label={row.reservedStock} variant="outlined" />
                      </TableCellStyled>
                      <TableCellStyled align="center">
                        <Chip
                          label={row.currentStock - row.reservedStock}
                          color="success"
                        />
                      </TableCellStyled>
                    </ItemRow>
                  ))}
              </DataTable>
            </Box>
          </CustomTabPanel>
        </Box>
      </Paper>
    </Container>
  );
};