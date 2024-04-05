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
import { ColumnProps, DisplayModals, SupplyByDeposits } from "../../../types";
import { uiCloseModal } from "../../../redux/ui";
import { DataTable, ItemRow, TableCellStyled } from "../..";
import { removeSupplyActive } from "../../../redux/supply";
import {
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";

const columns: ColumnProps[] = [
  { text: "", align: "center" },
  { text: "Deposito", align: "center" },
  { text: "Ubicacion", align: "center" },
  { text: "Nro Lote", align: "center" },
  { text: "Vencimiento", align: "center" },
  { text: "UM", align: "center" },
  { text: "Stock Actual", align: "center" },
  { text: "Stock Reservado", align: "center" },
  { text: "Stock Disponible", align: "center" },
];

interface RowProps {
  row: SupplyByDeposits;
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
          {row.deposit?.description}
        </TableCellStyled>
        <TableCellStyled align="center">{row.location}</TableCellStyled>
        <TableCellStyled align="center">{row.nroLot}</TableCellStyled>
        <TableCellStyled align="center">{row.dueDate}</TableCellStyled>
        <TableCellStyled align="center">{row.supply?.unitMeasurement}</TableCellStyled>
        <TableCellStyled align="center">{row.currentStock}</TableCellStyled>
        <TableCellStyled align="center">{row.reservedStock}</TableCellStyled>
        <TableCellStyled align="center">
          {row.currentStock - row.reservedStock}
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
                    <TableCellStyled>Tipo</TableCellStyled>
                    <TableCellStyled>Movimiento</TableCellStyled>
                    <TableCellStyled align="left" sx={{ width: "220px" }}>
                      Detalle
                    </TableCellStyled>
                    <TableCellStyled align="left">Fecha</TableCellStyled>
                    <TableCellStyled align="right">Cantidad</TableCellStyled>
                    <TableCellStyled align="center">
                      Comprobante
                    </TableCellStyled>
                  </ItemRow>
                </TableHead>
                <TableBody>
                  {row.movements?.map((movement) => (
                    <TableRow key={movement._id}>
                      <TableCell>
                        {movement.isIncome ? "Ingreso" : "Egreso"}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {movement.typeMovement}
                      </TableCell>
                      <TableCell>{movement.detail}</TableCell>
                      <TableCell>{movement.operationDate}</TableCell>
                      <TableCell>{movement.amount}</TableCell>
                      <TableCell>{movement.voucher}</TableCell>
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
  const { isLoading, supplyByDeposits, getStockBySupplyAndDeposits } = useSupply();

  const onCloseModal = () => {
    dispatch(removeSupplyActive());
    dispatch(uiCloseModal());
  };

  useEffect(() => {
    if (supplyActive) getStockBySupplyAndDeposits();
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
          {supplyByDeposits
            .filter((s) => s.movements?.length)
            .map((supplyByDeposit) => (
              <Row
                key={`${supplyActive?._id}-${supplyByDeposit.deposit._id}`}
                row={supplyByDeposit}
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
