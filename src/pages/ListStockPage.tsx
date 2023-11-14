import React, { useEffect, useState } from "react";
import { Loading, DataTable, ItemRow, TableCellStyled } from "../components";
import { ColumnProps, DisplayModals, Supply } from "../types";
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
// import second from "@mui/material";
import {
  QueryStats as QueryStatsIcon,
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
} from "@mui/icons-material";
import { useAppDispatch, useSupply } from "../hooks";
import { uiOpenModal } from "../redux/ui";
import { DetailDepositsModal } from "../components/DetailDepositsModal/index";

const columns: ColumnProps[] = [
  //   { text: "", align: "left" },
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
  //   const navigate = useNavigate();
  const { isLoading, supplies, getSupplies } = useSupply();
  const [supplySelected, setSupplySelected] = useState<Supply[]>([]);
  const [value, setValue] = React.useState(0);

  const onChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const onClickOpenDetail = (rowSelected: Supply) => {
    console.log("rowSelected", rowSelected);
    setSupplySelected([rowSelected]);
    dispatch(uiOpenModal(DisplayModals.DetailDeposits));
  };

  useEffect(() => {
    getSupplies();
  }, []);

  return (
    <Container sx={{ marginLeft: { xs: 0, sm: 3 } }} maxWidth="md">
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
            <Tabs value={value} onChange={onChangeTab} aria-label="tabs-stock">
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
                  checked={false}
                  onChange={(e) => console.log(e)}
                />
              }
              label="Mostrar Stock en 0"
              labelPlacement="start"
            />
          </Box>
          <CustomTabPanel value={value} index={0}>
            <Box component="div">
              <DataTable
                key="datatable-supply"
                columns={columns}
                isLoading={isLoading}
              >
                {supplies.map((row) => (
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
                        onClick={() => onClickOpenDetail(row)}
                      />
                    </TableCellStyled>
                    <TableCellStyled align="center">
                      <Chip label={row.reservedStock} variant="outlined" />
                    </TableCellStyled>
                    <TableCellStyled align="center">
                      <Chip
                        label={row.currentStock - row.reservedStock}
                        color="warning"
                      />
                    </TableCellStyled>
                  </ItemRow>
                ))}
              </DataTable>
            </Box>
            <DetailDepositsModal key="detail-deposits-modal" movements={[]} />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            Item Two
          </CustomTabPanel>
        </Box>
      </Paper>
    </Container>
  );
};
