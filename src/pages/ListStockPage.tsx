import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loading,
  SearchButton,
  SearchInput,
  DataTable,
  ItemRow,
  TableCellStyled,
} from "../components";
import { ColumnProps, StockMovement } from "../types";
import {
  Box,
  Collapse,
  Container,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  Tab,
  Table,
  TableBody,
  TableHead,
  Tabs,
  Typography,
} from "@mui/material";
// import second from "@mui/material";
import {
  QueryStats as QueryStatsIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
} from "@mui/icons-material";
import { useStockMovement } from "../hooks";
import { className } from "../../owncomponents/navbar-element/workspace-menu";

const columns: ColumnProps[] = [
  { text: "", align: "left" },
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
  const navigate = useNavigate();
  const { isLoading, stockMovements, getStockMovements } = useStockMovement();
  const [movementSelected, setMovementSelected] =
    useState<StockMovement | null>(null);
  const [value, setValue] = React.useState(0);

  const onChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const onClickOpenDetail = (rowSelected: StockMovement) => {
    if (rowSelected === movementSelected) setMovementSelected(null);
    else setMovementSelected(rowSelected);
  };

  useEffect(() => {
    getStockMovements();
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
                key="datatable-stockMovements"
                columns={columns}
                isLoading={isLoading}
              >
                {stockMovements.map((row) => (
                  <>
                    <ItemRow key={row._id} hover>
                      <TableCellStyled>
                        <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={() => onClickOpenDetail(row)}
                        >
                          {movementSelected?._id === row._id ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </TableCellStyled>
                      <TableCellStyled align="left">
                        {row.typeSupply}
                      </TableCellStyled>
                      <TableCellStyled align="center">{`${row.supply}/${row.detail}`}</TableCellStyled>
                      <TableCellStyled align="center">
                        {row.unitMeasurement}
                      </TableCellStyled>
                      <TableCellStyled align="center">
                        {row.dueDate}
                      </TableCellStyled>
                      <TableCellStyled align="center">
                        {row.amount}
                      </TableCellStyled>
                      <TableCellStyled align="center">
                        {row.batch}
                      </TableCellStyled>
                    </ItemRow>
                    <ItemRow key={row._id + "-detail"}>
                      <TableCellStyled
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={12}
                      >
                        <Collapse
                          in={movementSelected?._id === row._id}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box sx={{ margin: 1 }}>
                            <Typography
                              variant="h6"
                              gutterBottom
                              component="div"
                            >
                              Detalles
                            </Typography>
                            <Table size="small" aria-label="purchases">
                              <TableHead>
                                <ItemRow>
                                  <TableCellStyled sx={{ width: "120px" }}>
                                    Fecha
                                  </TableCellStyled>
                                  <TableCellStyled
                                    align="center"
                                    sx={{ width: "220px" }}
                                  >
                                    Ubicacion
                                  </TableCellStyled>
                                  <TableCellStyled
                                    align="left"
                                    sx={{ width: "60px" }}
                                  >
                                    Lote
                                  </TableCellStyled>
                                  <TableCellStyled
                                    align="right"
                                    sx={{ width: "60px" }}
                                  >
                                    Horas
                                  </TableCellStyled>
                                  <TableCellStyled
                                    align="center"
                                    sx={{ width: "80px" }}
                                  >
                                    Vencimiento
                                  </TableCellStyled>
                                  <TableCellStyled
                                    align="center"
                                    sx={{ width: "320px" }}
                                  >
                                    Detalle
                                  </TableCellStyled>
                                  <TableCellStyled align="center">
                                    Campaña
                                  </TableCellStyled>
                                </ItemRow>
                              </TableHead>
                              <TableBody>
                                <TableCellStyled align="center">
                                  {row.operationDate}
                                </TableCellStyled>
                                <TableCellStyled align="center">
                                  {row.ubication}
                                </TableCellStyled>
                                <TableCellStyled align="center">
                                  {row.batch}
                                </TableCellStyled>
                                <TableCellStyled align="right">
                                  {row.hours}
                                </TableCellStyled>
                                <TableCellStyled align="center">
                                  {row.dueDate}
                                </TableCellStyled>
                                <TableCellStyled align="center">
                                  {row.detail}
                                </TableCellStyled>
                                <TableCellStyled align="center">
                                  {row.campaign}
                                </TableCellStyled>
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCellStyled>
                    </ItemRow>
                  </>
                ))}
              </DataTable>
            </Box>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            Item Two
          </CustomTabPanel>
        </Box>
      </Paper>
    </Container>
  );
};
