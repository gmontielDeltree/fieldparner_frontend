import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loading,
  SearchButton,
  SearchInput,
  DataTable,
  ItemRow,
  TableCellStyled,
} from "../components";
import { ColumnProps } from "../types";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import {
  Add as AddIcon,
  // Edit as EditIcon,
  SyncAlt as SyncAltIcon,
} from "@mui/icons-material";
import { useForm, useStockMovement } from "../hooks";

const columns: ColumnProps[] = [
  { text: "Mov.", align: "left" },
  { text: "Tipo/Insumo", align: "center" },
  { text: "Deposito", align: "center" },
  { text: "Ubicacion", align: "left" },
  { text: "Lote", align: "center" },
  { text: "Vencimiento", align: "center" },
  { text: "Tipo Movimiento", align: "center" },
  { text: "Ing/Egre", align: "center" },
  { text: "Detalle", align: "center" },
  { text: "Fecha", align: "center" },
  { text: "UM", align: "center" },
  { text: "Cantidad", align: "center" },
  { text: "Comprobante", align: "center" },
  { text: "Moneda", align: "center" },
  { text: "Valor", align: "center" },
  { text: "Horas", align: "center" },
  { text: "Campaña", align: "center" },
];

export const StockMovementPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, stockMovements, getStockMovements } = useStockMovement();
  const { filterText, handleInputChange } = useForm({ filterText: "" });

  const onClickSearch = (): void => {
    if (filterText === "") {
      getStockMovements();
      return;
    }
    // const filteredBusinesses = businesses.filter(
    //   ({ razonSocial, nombreCompleto }) =>
    //     (razonSocial &&
    //       razonSocial.toLowerCase().includes(filterText.toLowerCase())) ||
    //     (nombreCompleto &&
    //       nombreCompleto.toLowerCase().includes(filterText.toLowerCase()))
    // );
    // setBusinesses(filteredBusinesses);
  };

  const onClickAddMovement = () =>
    navigate("/init/overview/stock-movements/new");

  useEffect(() => {
    getStockMovements();
  }, []);

  return (
    <Container sx={{ paddingLeft: "0px !important" }} maxWidth="lg">
      {isLoading && <Loading loading={true} />}
      <Box
        component="div"
        display="flex"
        alignItems="center"
        sx={{ ml: { sm: 2 }, pt: 2 }}
      >
        <SyncAltIcon />
        <Typography component="h4" variant="h5" sx={{ ml: { sm: 2 } }}>
          Movimiento de Stock
        </Typography>
      </Box>
      <Box component="div" sx={{ mt: 7 }}>
        <Grid
          container
          spacing={0}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: 2, mt: { sm: 2 } }}
        >
          <Grid item xs={6} sm={2}>
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={onClickAddMovement}
            >
              Nuevo
            </Button>
          </Grid>
          <Grid item xs={12} sm={10}>
            <Grid container justifyContent="flex-end">
              <Grid item xs={8} sm={5}>
                <SearchInput
                  value={filterText}
                  placeholder=""
                  handleInputChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={4} sm={2}>
                <SearchButton text="Buscar" onClick={() => onClickSearch()} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box component="div" sx={{ p: 1 }}>
          <DataTable
            key="datatable-stockMovements"
            columns={columns}
            isLoading={isLoading}
          >
            {stockMovements.map((row) => (
              <ItemRow key={row._id} hover>
                <TableCellStyled align="left">{row.movement}</TableCellStyled>
                <TableCellStyled align="center">{row.supply}</TableCellStyled>
                <TableCellStyled align="center">{row.deposit}</TableCellStyled>
                <TableCellStyled align="center">
                  {row.ubication}
                </TableCellStyled>
                <TableCellStyled align="center">{row.batch}</TableCellStyled>
                <TableCellStyled align="center">{row.dueDate}</TableCellStyled>
                <TableCellStyled align="center">
                  {row.typeMovement}
                </TableCellStyled>
                <TableCellStyled align="center">
                  {row.isIncome ? "Ingreso" : "Egreso"}
                </TableCellStyled>
                <TableCellStyled align="center">{row.detail}</TableCellStyled>
                <TableCellStyled align="center">
                  {row.operationDate}
                </TableCellStyled>
                <TableCellStyled align="center">
                  {row.unitMeasurement}
                </TableCellStyled>
                <TableCellStyled align="left">{row.amount}</TableCellStyled>
                <TableCellStyled align="left">{row.voucher}</TableCellStyled>
                <TableCellStyled align="left">{row.currency}</TableCellStyled>
                <TableCellStyled align="left">{row.totalValue}</TableCellStyled>
                <TableCellStyled align="left">{row.hours}</TableCellStyled>
                <TableCellStyled align="left">{row.campaign}</TableCellStyled>
                {/* <TableCellStyled align="center">
                  <Tooltip title="Editar">
                    <IconButton
                      aria-label="Editar"
                      onClick={() => onClickUpdateBusiness(row)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </TableCellStyled> */}
              </ItemRow>
            ))}
          </DataTable>
        </Box>
      </Box>
    </Container>
  );
};
