import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector, useSupply } from "../../../hooks";
import { ColumnProps, DisplayModals } from "../../../types";
import { uiCloseModal } from "../../../redux/ui";
import { DataTable, ItemRow, TableCellStyled } from "../..";
import { removeSupplyActive } from "../../../redux/supply";
import {
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import { StockItem } from "../../../interfaces/stock";
import { formatNumber } from "../../../helpers/helper";

const columns: ColumnProps[] = [
  { text: "", align: "center" },
  { text: "Deposito", align: "center" },
  { text: "Ubicacion", align: "center" },
  { text: "Nro Lote", align: "center" },
  // { text: "Vencimiento", align: "center" },
  { text: "UM", align: "center" },
  { text: "Stock Actual", align: "center" },
  { text: "Stock Reservado", align: "center" },
  { text: "Stock Disponible", align: "center" },
];

interface RowProps {
  row: StockItem;
}

const Row: React.FC<RowProps> = ({ row }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <ItemRow hover>
        <TableCellStyled>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCellStyled>
        <TableCellStyled align="left">
          {row.dataDeposit?.description}
        </TableCellStyled>
        <TableCellStyled align="center">{row.location}</TableCellStyled>
        <TableCellStyled align="center">{row.nroLot}</TableCellStyled>
        {/* <TableCellStyled align="center">{row.}</TableCellStyled> */}
        <TableCellStyled align="center">{row.dataSupply?.unitMeasurement}</TableCellStyled>
        <TableCellStyled align="center">{formatNumber(row.currentStock)}</TableCellStyled>
        <TableCellStyled align="center">{formatNumber(row.reservedStock)}</TableCellStyled>
        <TableCellStyled align="center">
          {formatNumber(Number(row.currentStock || 0) - Number(row.reservedStock || 0))}
        </TableCellStyled>
      </ItemRow>
      <ItemRow>
        <TableCellStyled
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={12}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Movimientos
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <ItemRow>
                    <TableCellStyled sx={{ px: 2, py: 1 }}>Tipo</TableCellStyled>
                    <TableCellStyled sx={{ px: 2, py: 1 }}>Movimiento</TableCellStyled>
                    <TableCellStyled
                      sx={{ px: 2, py: 1, width: "220px" }}
                      align="left">
                      Detalle
                    </TableCellStyled>
                    <TableCellStyled sx={{ px: 2, py: 1 }} align="left">Fecha</TableCellStyled>
                    <TableCellStyled sx={{ px: 2, py: 1 }} align="right">Cantidad</TableCellStyled>
                    <TableCellStyled sx={{ px: 2, py: 1 }} align="center">
                      Comprobante
                    </TableCellStyled>
                  </ItemRow>
                </TableHead>
                <TableBody>
                  {row?.dataMovements?.map((movement) => (
                    <TableRow key={movement._id}>
                      <TableCell align="left">
                        {movement.isIncome ? "Ingreso" : "Egreso"}
                      </TableCell>
                      <TableCell align="left" component="th" scope="row">
                        {movement.typeMovement}
                      </TableCell>
                      <TableCell align="left">{movement.detail}</TableCell>
                      <TableCell align="left">{movement.operationDate}</TableCell>
                      <TableCell align="right">{formatNumber(movement.amount)}</TableCell>
                      <TableCell align="right">{movement.voucher}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCellStyled>
      </ItemRow>
    </>
  );
};

export const SupplyByDepositsModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showModal } = useAppSelector((state) => state.ui);
  const { supplyActive } = useAppSelector((state) => state.supply);
  const { isLoading, stockByDeposits, getStockBySupplyActive } = useSupply();

  const onCloseModal = () => {
    dispatch(removeSupplyActive());
    dispatch(uiCloseModal());
  };

  useEffect(() => {
    if (supplyActive) getStockBySupplyActive();
  }, [supplyActive]);

  return (
    <Dialog
      open={showModal === DisplayModals.SupplyByDeposits}
      maxWidth="lg"
      scroll="paper"
      onClose={onCloseModal}
    >
      <DialogTitle variant="h5">
        Depositos <hr />
        Insumo:  <Typography display="inline-block" variant="h6">{supplyActive?.name}</Typography> / Tipo: <Typography display="inline-block" variant="h6">{supplyActive?.type}</Typography>
      </DialogTitle>
      <DialogContent>
        <DataTable
          key="detail-deposits-datable"
          columns={columns}
          isLoading={isLoading}
        >
          {stockByDeposits.map((stock) => (
            <Row
              key={`${supplyActive?._id}-${stock?.dataDeposit?._id}`}
              row={stock}
            />
          ))}
        </DataTable>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={onCloseModal}>
          Cerrar
        </Button>
        {/* <Button onClick={onCloseModal}>Subscribe</Button> */}
      </DialogActions>
    </Dialog>
  );
};
