import React, { useEffect, useState } from "react";
import {
  Loading,
  DataTable,
  ItemRow,
  TableCellStyled,
  SupplyByLotsModal,
} from "../components";
import { ColumnProps, DisplayModals, Supply, SupplyByDeposits } from "../types";
import {
  Box,
  Chip,
  Container,
  FormControlLabel,
  Paper,
  Switch,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  QueryStats as QueryStatsIcon,
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
} from "@mui/icons-material";
import { useAppDispatch, useSupply } from "../hooks";
import { uiOpenModal } from "../redux/ui";
import { SupplyByDepositsModal } from "../components/Modals/SupplyByDeposits/index";
import { setSupplyActive } from "../redux/supply";

const columnsBySupply: ColumnProps[] = [
  //   { text: "", align: "left" },
  { text: "Tipo", align: "left" },
  { text: "Insumo/Descripcion", align: "center" },
  { text: "UM", align: "center" },
  { text: "Stock Actual", align: "center" },
  { text: "Stock Reservado", align: "center" },
  { text: "Stock Disponible", align: "center" },
];

const columnsByDeposit: ColumnProps[] = [
  { text: "Deposito", align: "left" },
  { text: "Tipo", align: "left" },
  { text: "Insumo/Descripcion", align: "center" },
  { text: "UM", align: "center" },
  { text: "Stock Actual", align: "center" },
  { text: "Stock Reservado", align: "center" },
  { text: "Stock Disponible", align: "center" },
];

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
    supplies,
    supplyByDeposits,
    getSupplies,
    getStockByDeposits,
  } = useSupply();
  const [tabValue, setTabValue] = React.useState(0);
  const [showStockValueZero, setShowStockValueZero] = React.useState(false);

  const [selectedSupplyDeposit, setSelectedSupplyDeposit] =
    useState<SupplyByDeposits | null>(null);

  const onChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const onClickSupply = (supplySelected: Supply) => {
    dispatch(setSupplyActive(supplySelected));
    dispatch(uiOpenModal(DisplayModals.SupplyByDeposits));
  };

  const onClickDeposit = (item: SupplyByDeposits) => {
    setSelectedSupplyDeposit(item);
    dispatch(uiOpenModal(DisplayModals.SupplyByLots));
  };

  useEffect(() => {
    if (tabValue === 0) getSupplies();
    else getStockByDeposits();
  }, [tabValue]);

  return (
    <Container sx={{ marginLeft: { xs: 0, sm: 3 } }} maxWidth="lg">
      {isLoading && <Loading loading={true} />}
      <Box
        component="div"
        display="flex"
        alignItems="center"
        sx={{ ml: { sm: 2 }, mt: 5 }}
      >
        <QueryStatsIcon />
        <Typography variant="h5" sx={{ ml: { sm: 2 } }}>
          Consulta de Stock
        </Typography>
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
                    Por Insumo <InventoryIcon sx={{ ml: 1 }} />
                  </Box>
                }
                {...a11yProps(0)}
              />
              <Tab
                label={
                  <Box>
                    Por Deposito <WarehouseIcon sx={{ ml: 1 }} />
                  </Box>
                }
                {...a11yProps(1)}
              />
            </Tabs>
            <FormControlLabel
              control={
                <Switch
                  name="stockWithZero"
                  checked={showStockValueZero}
                  onChange={(_e, checked: boolean) =>
                    setShowStockValueZero(checked)
                  }
                />
              }
              label="Mostrar Stock en 0"
              labelPlacement="start"
            />
          </Box>
          <CustomTabPanel value={tabValue} index={0}>
            <Box component="div">
              <DataTable
                key="bySupply"
                columns={columnsBySupply}
                isLoading={isLoading}
              >
                {supplies
                  .filter((s) => (showStockValueZero ? s : s.currentStock > 0))
                  .map((row) => (
                    <ItemRow key={row._id} hover>
                      <TableCellStyled align="left">{row.type}</TableCellStyled>
                      <TableCellStyled align="center">{`${row.name}/${row.description}`}</TableCellStyled>
                      <TableCellStyled align="center">
                        {row.unitMeasurement}
                      </TableCellStyled>
                      <TableCellStyled align="center">
                        <Chip
                          label={row.currentStock}
                          variant="filled"
                          color="primary"
                          onClick={() => onClickSupply(row)}
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
            <SupplyByDepositsModal key="supply-deposits-modal" />
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={1}>
            <Box component="div">
              {selectedSupplyDeposit && (
                <SupplyByLotsModal
                  key="supply-lot-modal"
                  supplyByDeposit={selectedSupplyDeposit}
                />
              )}
              <DataTable
                key="byDeposit"
                columns={columnsByDeposit}
                isLoading={isLoading}
              >
                {supplyByDeposits
                  .filter((s) => {
                    if (showStockValueZero) return s;
                    else return s.currentStock > 0;
                  })
                  .map((row) => (
                    <ItemRow
                      key={`${row.deposit._id}-${row.supply?._id}`}
                      hover
                    >
                      <TableCellStyled align="left">
                        {row.deposit.description.trim()}
                      </TableCellStyled>
                      <TableCellStyled>{row.supply?.type}</TableCellStyled>
                      <TableCellStyled align="center">{`${row.supply?.name}/${row.supply?.description}`}</TableCellStyled>
                      <TableCellStyled align="center">
                        {row.unitMeasurement}
                      </TableCellStyled>
                      <TableCellStyled align="center">
                        <Chip
                          label={row.currentStock}
                          variant="filled"
                          color="primary"
                          onClick={() => onClickDeposit(row)}
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
