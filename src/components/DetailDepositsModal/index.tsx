import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { ColumnProps, DisplayModals, StockMovementItem } from "../../types";
import { uiCloseModal } from "../../redux/ui";
import { DataTable, ItemRow, TableCellStyled } from "..";

const columns: ColumnProps[] = [
  { text: "Deposito", align: "center" },
  { text: "Ubicacion", align: "center" },
  { text: "Nro Lote", align: "center" },
  { text: "Vencimiento", align: "center" },
  { text: "UM", align: "center" },
  { text: "Stock Actual", align: "center" },
  { text: "Stock Restante", align: "center" },
  { text: "Stock Disponible", align: "center" },
];

type DetailDepositsModalProps = {
  movements: StockMovementItem[];
};

export const DetailDepositsModal: React.FC<DetailDepositsModalProps> = ({
  movements,
}) => {
  const dispatch = useAppDispatch();
  const { showModal } = useAppSelector((state) => state.ui);

  const onCloseModal = () => dispatch(uiCloseModal());

  return (
    <Dialog
      open={showModal === DisplayModals.DetailDeposits}
      maxWidth="lg"
      onClose={onCloseModal}
    >
      <DialogTitle>Depositos</DialogTitle>
      <DialogContent>
        <DataTable
          key="detail-deposits-datable"
          columns={columns}
          isLoading={false}
        >
          {movements.map((row) => (
            <ItemRow key={row._id} hover>
              <TableCellStyled align="left">
                {row.deposit?.description}
              </TableCellStyled>
              <TableCellStyled align="center">
                {row.deposit?.address}
              </TableCellStyled>
              <TableCellStyled align="center">{row.batch}</TableCellStyled>
              <TableCellStyled align="center">{row.dueDate}</TableCellStyled>
              <TableCellStyled align="center">
                {row.unitMeasurement}
              </TableCellStyled>
              <TableCellStyled align="center">{row.amount} </TableCellStyled>
              <TableCellStyled align="center">{100} </TableCellStyled>
              <TableCellStyled align="center">{200} </TableCellStyled>
            </ItemRow>
          ))}
        </DataTable>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseModal}>Cancel</Button>
        <Button onClick={onCloseModal}>Subscribe</Button>
      </DialogActions>
    </Dialog>
  );
};
