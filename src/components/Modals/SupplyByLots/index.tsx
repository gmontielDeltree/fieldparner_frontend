import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { ColumnProps, DisplayModals, SupplyByDeposits } from "../../../types";
import { uiCloseModal } from "../../../redux/ui";
import { DataTable, ItemRow, TableCellStyled } from "../..";

const columns: ColumnProps[] = [
  { text: "Ubicacion", align: "center" },
  { text: "Nro Lote", align: "center" },
  { text: "Vencimiento", align: "center" },
  { text: "UM", align: "center" },
  { text: "Stock Actual", align: "center" },
  { text: "Stock Reservado", align: "center" },
  { text: "Stock Disponible", align: "center" },
];

interface SupplyByLotsModalProps {
  supplyByDeposit: SupplyByDeposits;
}

export const SupplyByLotsModal: React.FC<SupplyByLotsModalProps> = ({
  supplyByDeposit,
}) => {
  const dispatch = useAppDispatch();
  const { showModal } = useAppSelector((state) => state.ui);

  const onCloseModal = () => {
    dispatch(uiCloseModal());
  };

  return (
    <Dialog
      open={showModal === DisplayModals.SupplyByLots}
      maxWidth="lg"
      scroll="paper"
      onClose={onCloseModal}
    >
      <DialogTitle variant="h5">Lotes</DialogTitle>
      <DialogContent>
        <DataTable
          key="detail-deposits-datable"
          columns={columns}
          isLoading={false}
        >
          {supplyByDeposit.nroLotsStock?.map((lotStock) => (
            <ItemRow key={lotStock.nroLot} hover>
              <TableCellStyled align="left">
                {lotStock.location}
              </TableCellStyled>
              <TableCellStyled align="center">
                {lotStock.nroLot}
              </TableCellStyled>
              <TableCellStyled align="center">
                {supplyByDeposit.dueDate || "-"}
              </TableCellStyled>
              <TableCellStyled align="center">
                {supplyByDeposit.supply?.unitMeasurement || "-"}
              </TableCellStyled>
              <TableCellStyled align="center">
                {lotStock.currentStock}
              </TableCellStyled>
              <TableCellStyled align="center">
                {lotStock.reservedStock}
              </TableCellStyled>
              <TableCellStyled align="center">
                {lotStock.currentStock - lotStock.reservedStock}
              </TableCellStyled>
            </ItemRow>
          ))}
        </DataTable>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={onCloseModal}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
