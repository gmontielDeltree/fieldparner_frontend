import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector, useSupply } from "../../../hooks";
import { ColumnProps, DisplayModals } from "../../../types";
import { uiCloseModal } from "../../../redux/ui";
import { DataTable, ItemRow, TableCellStyled } from "../..";
import { StockItem } from "../../../interfaces/stock";
import { formatNumber } from "../../../helpers/helper";

const columns: ColumnProps[] = [
  { text: "Ubicacion", align: "center" },
  { text: "Nro Lote", align: "center" },
  // { text: "Vencimiento", align: "center" },
  { text: "UM", align: "center" },
  { text: "Stock Actual", align: "center" },
  { text: "Stock Reservado", align: "center" },
  { text: "Stock Disponible", align: "center" },
];

interface StockSupplyModalProps {
  selectedRow: StockItem;
}

export const StockSupplyModal: React.FC<StockSupplyModalProps> = ({
  selectedRow,
}) => {
  const dispatch = useAppDispatch();
  const { showModal } = useAppSelector((state) => state.ui);
  const { isLoading, stockSupplyAndDeposit, getStockBySupplyAndDeposit } = useSupply();

  const onCloseModal = () => {
    dispatch(uiCloseModal());
  };

  useEffect(() => {
    if (selectedRow) {
      const supplyId = selectedRow.id;
      const depositId = selectedRow.depositId;
      getStockBySupplyAndDeposit(supplyId, depositId);
    }
  }, [selectedRow])


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
          isLoading={isLoading}
        >
          {stockSupplyAndDeposit.map((lotStock) => (
            <ItemRow key={lotStock.nroLot} hover>
              <TableCellStyled align="left">
                {lotStock.location}
              </TableCellStyled>
              <TableCellStyled align="center">
                {lotStock.nroLot}
              </TableCellStyled>
              {/* <TableCellStyled align="center">
                {supplyByDeposit.dueDate || "-"}
              </TableCellStyled> */}
              <TableCellStyled align="center">
                {selectedRow?.dataSupply?.unitMeasurement || "-"}
              </TableCellStyled>
              <TableCellStyled align="center">
                {formatNumber(lotStock.currentStock)}
              </TableCellStyled>
              <TableCellStyled align="center">
                {formatNumber(lotStock.reservedStock)}
              </TableCellStyled>
              <TableCellStyled align="center">
                {formatNumber(Number(lotStock.currentStock || 0) - Number(lotStock.reservedStock || 0))}
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
