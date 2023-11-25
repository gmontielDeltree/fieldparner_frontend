import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
} from "@mui/x-data-grid";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  SyncAlt as SyncAltIcon,
} from "@mui/icons-material";
import {
  Loading,
  SearchButton,
  SearchInput,
} from "../components";
import { useForm, useStockMovement } from "../hooks";

// const columns: ColumnProps[] = [
//   { text: "", align: "left" },
//   { text: "Fecha", align: "left" },
//   { text: "Mov.", align: "left" },
//   { text: "Tipo/Insumo", align: "center" },
//   { text: "Deposito", align: "center" },
//   { text: "Tipo Movimiento", align: "center" },
//   { text: "Ing/Egre", align: "center" },
//   { text: "UM", align: "center" },
//   { text: "Cantidad", align: "center" },
// ];

const columns: GridColDef[] = [
  // { field: "id", hide: true },
  { field: "date", headerName: "Fecha", width: 200 },
  { field: "movement", headerName: "Movimiento", width: 150 },
  { field: "supply", headerName: "Tipo/Insumo", width: 200 },
  { field: "deposit", headerName: "Deposito", width: 200 },
  { field: "movementType", headerName: "Tipo movimiento", width: 150 },
  { field: "isIncome", headerName: "Ingreso/Egreso", width: 150 },
  { field: "um", headerName: "UM", width: 100 },
  { field: "amount", headerName: "Cantidad", width: 150 },
];

interface RowStockMovementItem {
  id: string;
  date: string;
  movement: string;
  supply: string;
  deposit: string;
  movementType: string;
  isIncome: string;
  um: string;
  amount: number;
}

export const StockMovementPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, stockMovements, getStockMovements } = useStockMovement();
  const { filterText, handleInputChange } = useForm({ filterText: "" });

  const rows = useMemo(() => {
    return stockMovements.map((sm) => {
      return {
        id: sm._id,
        date: sm.creationDate,
        movement: sm.movement,
        supply: `${sm.supply?.type}/${sm.supply?.name}`,
        deposit: sm.deposit?.description,
        movementType: sm.typeMovement,
        isIncome: sm.isIncome ? "Ingreso" : "Egreso",
        um: sm.supply?.unitMeasurement,
        amount: sm.amount,
      } as RowStockMovementItem;
    });
  }, [stockMovements]);

  const onClickSearch = (): void => {
    if (filterText === "") {
      getStockMovements();
      return;
    }
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
          <DataGrid
            autoHeight
            rowSelection={false}
            loading={isLoading}
            slots={{ toolbar: GridToolbar }}
            rows={rows}
            columns={columns}
          />
        </Box>
      </Box>
    </Container>
  );
};

/*
const Row: React.FC<RowProps> = ({ row }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <ItemRow sx={{ backgroundColor: row.isIncome ? "#81c784" : "#e57373" }}>
        <TableCellStyled>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCellStyled>
        <TableCellStyled align="left">{row.operationDate}</TableCellStyled>
        <TableCellStyled align="left">{row.movement}</TableCellStyled>
        <TableCellStyled align="center">{`${row.supply?.type}/${row.supply?.name}`}</TableCellStyled>
        <TableCellStyled align="center">
          {row.deposit?.description}
        </TableCellStyled>
        <TableCellStyled align="center">{row.typeMovement}</TableCellStyled>
        <TableCellStyled align="center">
          {row.isIncome ? "Ingreso" : "Egreso"}
        </TableCellStyled>
        <TableCellStyled align="left">
          {row.supply?.unitMeasurement}
        </TableCellStyled>
        <TableCellStyled align="left">{row.amount}</TableCellStyled>
      </ItemRow>
      <ItemRow
        key={`detail-${row.operationDate}`}
        // sx={{ backgroundColor: row.isIncome ? "#beeac0" : "#e57373" }}
      >
        <TableCellStyled
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={12}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Detalles
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <ItemRow>
                    <TableCellStyled>Comprobante</TableCellStyled>
                    <TableCellStyled>Moneda</TableCellStyled>
                    <TableCellStyled align="center">Valor</TableCellStyled>
                    <TableCellStyled align="left" sx={{ width: "60px" }}>
                      Lote
                    </TableCellStyled>
                    <TableCellStyled align="center" sx={{ width: "220px" }}>
                      Ubicacion
                    </TableCellStyled>
                    <TableCellStyled align="right" sx={{ width: "60px" }}>
                      Horas
                    </TableCellStyled>
                    <TableCellStyled align="center" sx={{ width: "80px" }}>
                      Vencimiento
                    </TableCellStyled>
                    <TableCellStyled align="center" sx={{ width: "320px" }}>
                      Detalle
                    </TableCellStyled>
                    <TableCellStyled align="center">Campaña</TableCellStyled>
                  </ItemRow>
                </TableHead>
                <TableBody>
                  <TableRow key={row.operationDate}>
                    <TableCellStyled align="center">
                      {row.voucher}
                    </TableCellStyled>
                    <TableCellStyled align="center">
                      {row.currency}
                    </TableCellStyled>
                    <TableCellStyled align="center">
                      {row.totalValue}
                    </TableCellStyled>
                    <TableCell align="center">{row.nroLot}</TableCell>
                    <TableCell align="center">
                      {
                        row.deposit?.lots.find(
                          (lot) =>
                            lot.nro.toLowerCase() === row.nroLot.toLowerCase()
                        )?.location
                      }
                    </TableCell>
                    <TableCell align="right">{row.hours}</TableCell>
                    <TableCell align="center">{row.dueDate}</TableCell>
                    <TableCell align="center">{row.detail}</TableCell>
                    <TableCell align="center">{row.campaign}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCellStyled>
      </ItemRow>
    </>
  );
};

*/