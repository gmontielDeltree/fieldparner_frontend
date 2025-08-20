import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector, useOrder } from "../../../hooks";
import { ColumnProps, DisplayModals } from "../../../types";
import { uiCloseModal } from "../../../redux/ui";
import { DataTable, ItemRow, TableCellStyled } from "../..";
import { removeWithdrawalOrderActive } from "../../../redux/withdrawalOrder";
import { useTranslation } from "react-i18next";


export const HistoryWithdrawOrderModal: React.FC = () => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const { showModal } = useAppSelector((state) => state.ui);
    const { withdrawalOrderActive } = useAppSelector((state) => state.order);
    const { isLoading,
        historyWithdrawOrder,
        depositsSuppliesOrder,
        getHistoryWithdrawOrder,
        getOrderDetailByNumber } = useOrder();

    const columns: ColumnProps[] = [
        { text: t("_date"), align: "left" },
        { text: t("_supply"), align: "left" },
        { text: t("warehouse"), align: "left" },
        { text: t("id_location"), align: "left" },
        { text: t("batchNumber"), align: "center" },
        { text: "UM", align: "left" },
        { text: t("amountWithdrawn"), align: "right" },
    ];


    const onCloseModal = () => {
        dispatch(removeWithdrawalOrderActive());
        dispatch(uiCloseModal());
    };

    useEffect(() => {
        const initiGetHistoryWithdrawOrder = async (order: number) => {
            await Promise.all([
                getOrderDetailByNumber(order),
                getHistoryWithdrawOrder(order)
            ])
        };
        if (withdrawalOrderActive) {
            initiGetHistoryWithdrawOrder(withdrawalOrderActive.order);
        }
    }, [withdrawalOrderActive])


    return (
        <Dialog
            open={showModal === DisplayModals.HistoryWithdrawOrder}
            maxWidth="lg"
            scroll="paper"
            onClose={onCloseModal}
        >
            <DialogTitle variant="h5">{t("withdrawalFromOrder")}: {withdrawalOrderActive?.order}</DialogTitle>
            <DialogContent>
                <DataTable
                    key="history-withdraw-order"
                    columns={columns}
                    isLoading={isLoading}
                >
                    {historyWithdrawOrder.map((order) => (
                        <ItemRow key={order._id} hover>
                            <TableCellStyled align="left">
                                {order.withdrawalDate}
                            </TableCellStyled>
                            <TableCellStyled align="center">
                                {depositsSuppliesOrder.find(x => x._id === order.depositSupplyOrderId)?.deposit?.description || "-"}
                            </TableCellStyled>
                            <TableCellStyled align="center">
                                {depositsSuppliesOrder.find(x => x._id === order.depositSupplyOrderId)?.supply?.name || "-"}
                            </TableCellStyled>
                            <TableCellStyled align="center">
                                {depositsSuppliesOrder.find(x => x._id === order.depositSupplyOrderId)?.location || "-"}
                            </TableCellStyled>
                            <TableCellStyled align="center">
                                {depositsSuppliesOrder.find(x => x._id === order.depositSupplyOrderId)?.nroLot || "-"}
                            </TableCellStyled>
                            <TableCellStyled align="center">
                                {depositsSuppliesOrder.find(x => x._id === order.depositSupplyOrderId)?.supply?.unitMeasurement || "-"}
                            </TableCellStyled>
                            <TableCellStyled align="right">
                                {order.amount}
                            </TableCellStyled>
                        </ItemRow>
                    ))}
                </DataTable>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" onClick={onCloseModal}>
                    {t("close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
