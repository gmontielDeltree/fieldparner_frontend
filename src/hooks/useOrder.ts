import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from ".";
import { dbContext } from "../services";
import { DepositSupplyOrder, DepositSupplyOrderItem, Numerator, NumeratorType, OrderStatus, StockMovement, TypeMovement, WithdrawalOrder, WithdrawalOrderType, WithdrawalsByDepositSupply } from "../types";
import { useState } from "react";
import { setWithdrawalOrderActive } from "../redux/withdrawalOrder";
import { onLogout } from '../redux/auth';
import { Stock } from '../interfaces/stock';
import { useTranslation } from "react-i18next";
import { NotificationService } from "../services/notificationService";

export const useOrder = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { withdrawalOrderActive } = useAppSelector(state => state.order);
    const [orders, setOrders] = useState<WithdrawalOrder[]>([]);
    const [depositsSuppliesOrder, setDepositsSuppliesOrder] = useState<DepositSupplyOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({});
    const { t } = useTranslation();

    const getLastNumerator = async (accountId: string, type: NumeratorType) => {
        try {
            const response = await dbContext.numerators.find({
                selector: {
                    "$and": [{ "accountId": accountId }, { "numeratorType": type }],
                }
            });
            if (response.docs.length)
                return response.docs[0] as Numerator;

        } catch (error) {
            console.log(t('error_log'), error);
            throw new Error(t("numerator_not_found"));
        }
    }

    const putLastNumerator = async (doc: Numerator, create = false) => {
        try {
            if (create)
                await dbContext.numerators.post(doc);
            else
                await dbContext.numerators.put(doc);
        } catch (error) {
            console.log(t('error_log'), error);
        }
    }

    const getWithdrawalOrders = async () => {
        setIsLoading(true);
        try {
            if (!user) throw new Error(t("user_not_found"));

            const response = await dbContext.withdrawalOrders.find({ selector: { "accountId": user?.accountId } });

            if (response) {
                const orders = response.docs.map(doc => doc as WithdrawalOrder);
                setOrders(orders);
            }

            setIsLoading(false);
        } catch (error) {
            console.log(error);
            error && setError(error);
        }
    }

    const createWithdrawalOrder = async (newWithdrawalOrder: WithdrawalOrder, newDepositSupplies: DepositSupplyOrder[]) => {
        setIsLoading(true);
        try {
            if (!user) { dispatch(onLogout(t("session_expired"))); return; }

            let lastNumerator: Numerator = {
                accountId: user.accountId,
                numeratorType: NumeratorType.Client,
                lastNumerator: 1
            };
            const lastNumeratorFound = await getLastNumerator(user.accountId, NumeratorType.Client);

            if (!lastNumeratorFound) {
                await putLastNumerator(lastNumerator, true);
                const numeratorFound = await getLastNumerator(user.accountId, NumeratorType.Client);
                lastNumerator._id = numeratorFound?._id;
                lastNumerator._rev = numeratorFound?._rev;
            } else {
                lastNumerator = { ...lastNumeratorFound };
                lastNumerator.lastNumerator = (lastNumeratorFound.lastNumerator + 1);
            }

            let newOrder: WithdrawalOrder = {
                ...newWithdrawalOrder,
                order: lastNumerator.lastNumerator,
                accountId: user.accountId
            };
            let depositSuppliesOrder = newDepositSupplies.map(s => ({ ...s, order: lastNumerator.lastNumerator }));

            // Fetch supplies to update reservedStock
            // const responseSupplies = await dbContext.supplies.find({
            //     selector: {
            //         $or: [
            //             { accountId: user.accountId },
            //             { isDefault: true }
            //         ]
            //     },
            // });
            // const suppliesToUpdate = responseSupplies.docs;
            // newDepositSupplies.forEach(newSupplyOrder => {
            //     const supply = suppliesToUpdate.find(s => s._id === newSupplyOrder.supply._id);
            //     if (supply) {
            //         supply.reservedStock += newSupplyOrder.amount;
            //     }
            // });

            const response = await Promise.all([
                dbContext.withdrawalOrders.post(newOrder),
                dbContext.depositSupplyOrder.bulkDocs(depositSuppliesOrder),
                putLastNumerator(lastNumerator),
                // dbContext.supplies.bulkDocs(suppliesToUpdate)
            ]);

            setIsLoading(false);

            if (response) {
                NotificationService.showSuccess(
                    t("withdrawal_order_created_successfully", { number: lastNumerator.lastNumerator }),
                    { order: lastNumerator.lastNumerator.toString() },
                    t("withdrawal_order_label")
                );
                return true;
            }
            return false;
        } catch (error) {
            console.log(t('document_creation_error'), error);
            NotificationService.showError(t("unexpected_error"), {}, t("oops_label"));
            setIsLoading(false);
            return false;
        }
    }

    const getOrderWithDepositsAndSuppliesByOrder = async (order: number) => {
        setIsLoading(true);
        try {

            if (!user) throw new Error(t("user_not_found"));

            const responseAll = await Promise.all([
                dbContext.withdrawalOrders.find({
                    selector: {
                        "$and": [{ "accountId": user.accountId }, { "order": order }],
                    }
                }),
                dbContext.depositSupplyOrder.find({
                    selector: {
                        "$and": [{ "accountId": user.accountId }, { "order": order }],
                    }
                })
            ]);

            if (responseAll) {
                const withdrawalOrder = responseAll[0].docs[0] as WithdrawalOrder;
                const depositAndSuppliesOrder = responseAll[1].docs.map(doc => doc as DepositSupplyOrder);
                dispatch(setWithdrawalOrderActive(withdrawalOrder));
                setDepositsSuppliesOrder(depositAndSuppliesOrder);
            }

            setIsLoading(false);
        } catch (error) {
            console.log(error);
            error && setError(error);
        }
    }

    const confirmWithdrawalOrder = async (listWithdrawals: DepositSupplyOrderItem[], withdrawalDate: string) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error(t("user_not_found"));
            if (!withdrawalOrderActive) throw new Error(t("withdrawal_order_not_found"));
            let isComplete = true;

            const newWithdrawals: WithdrawalsByDepositSupply[] = listWithdrawals.map(w => ({
                accountId: w.accountId,
                amount: Number(w.amount),
                depositSupplyOrderId: w._id,
                order: w.order,
                withdrawalDate,
            } as WithdrawalsByDepositSupply));

            const updateDepositSupplies: DepositSupplyOrder[] = listWithdrawals.map(w => {
                const { amount, ...newObject } = w;
                let withdrawalAmount = Number(w.withdrawalAmount + amount);
                return {
                    ...newObject,
                    withdrawalAmount
                };
            });
            updateDepositSupplies.forEach(u => {
                if (u.originalAmount > u.withdrawalAmount) {
                    isComplete = false;
                    return;
                }
            });

            const response = await Promise.all([
                dbContext.stock.find({ selector: { "accountId": user.accountId } }),
            ]);

            if (!response) throw new Error(t("supplies_not_found"));

            const responseStockSupplies = response[0].docs;
            let updateStockSupplies: Stock[] = []; // Insumos actualizados con nuevo stock

            listWithdrawals.forEach(w => {
                //Si existe el insumo, se actualiza el stock dependiendo de la tabla stockByLots
                if (w.supply) {
                    responseStockSupplies.forEach(s => {
                        if (w.deposit?._id === s.depositId && w.supply?._id === s.id &&
                            w.location === s.location && w.nroLot === s.nroLot) {
                            updateStockSupplies.push({
                                ...s, currentStock: Number(s.currentStock - Number(w.amount))
                            });
                        }
                    });
                }
            });

            let newMovements = listWithdrawals.map(w => ({
                accountId: user.accountId,
                amount: w.amount,
                campaignId: withdrawalOrderActive.campaign._id,
                creationDate: withdrawalDate,
                depositId: w.deposit?._id,
                supplyId: w.supply?._id,
                isCrop: false,
                cropId: "",
                location: w.location,
                nroLot: w.nroLot,
                detail: withdrawalOrderActive.reason,
                voucher: withdrawalOrderActive.order.toString(),
                isIncome: false,
                movement: "Automatico",
                operationDate: withdrawalDate,
                typeMovement: TypeMovement.OrdenRetiro,
            } as StockMovement));

            let responseAll = await Promise.all([
                dbContext.withdrawalsByDepositSupply.bulkDocs(newWithdrawals),
                dbContext.depositSupplyOrder.bulkDocs(updateDepositSupplies),
                dbContext.stock.bulkDocs(updateStockSupplies),
                dbContext.stockMovements.bulkDocs(newMovements),
            ]);

            if (isComplete) {
                await dbContext.withdrawalOrders.put({ ...withdrawalOrderActive, state: OrderStatus.Completed });
            }

            if (responseAll) {
                NotificationService.showSuccess(
                    t("successful_confirmation"),
                    { order: withdrawalOrderActive.order.toString() },
                    t("withdrawal_order_label")
                );
            }
            navigate("/init/overview/list-orders");
            setIsLoading(false);

        } catch (error) {
            console.log(t('error_in_confirm_withdrawal_order'), error);
            setIsLoading(false);
            NotificationService.showError(t("unexpected_error"), {}, t("oops_label"));
        }
    };

    const createLaborOrder = async (newLaborOrder: WithdrawalOrder, newDepositSupplies: DepositSupplyOrder[]) => {
        setIsLoading(true);
        try {

            if (!user) throw new Error(t("user_not_found"));
            let lastNumerator: Numerator = {
                accountId: user.accountId,
                numeratorType: NumeratorType.LaborOrder,
                lastNumerator: 1
            };

            const lastNumeratorFound = await getLastNumerator(user.accountId, NumeratorType.LaborOrder);

            if (!lastNumeratorFound) {
                await putLastNumerator(lastNumerator);
                const numeratorFound = await getLastNumerator(user.accountId, NumeratorType.LaborOrder);
                lastNumerator._id = numeratorFound?._id;
                lastNumerator._rev = numeratorFound?._rev;
            }
            else {
                lastNumerator = { ...lastNumeratorFound };
                lastNumerator.lastNumerator = (lastNumeratorFound.lastNumerator + 1);
            }

            let newOrder: WithdrawalOrder = {
                ...newLaborOrder,
                type: WithdrawalOrderType.Labor,
                order: lastNumerator.lastNumerator,
                accountId: user.accountId
            };
            let depositSuppliesOrder = newDepositSupplies.map(s => ({ ...s, order: lastNumerator.lastNumerator }));

            const response = await Promise.all([
                dbContext.withdrawalOrders.post(newOrder),
                dbContext.depositSupplyOrder.bulkDocs(depositSuppliesOrder),
                putLastNumerator(lastNumerator)
            ]);

            setIsLoading(false);

            if (response) {
                return lastNumerator.lastNumerator;
            }
            return -1;
        } catch (error) {
            console.log(t('document_creation_error'), error);
            NotificationService.showError(t("unexpected_error"), {}, t("oops_label"));
            setIsLoading(false);
            return -1;
        }
    }

    const confirmLaborOrder = async (listWithdrawals: DepositSupplyOrderItem[], withdrawalDate: string) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error(t("user_not_found"));
            // if (!withdrawalOrderActive) throw new Error("Withdrawal Order not found");

            //Registro de los retiros 
            const newWithdrawals: WithdrawalsByDepositSupply[] = listWithdrawals.map(w => ({
                accountId: w.accountId,
                amount: Number(w.amount),
                depositSupplyOrderId: w._id,
                order: w.order,
                withdrawalDate,
            } as WithdrawalsByDepositSupply));

            //Actualizamos la cantidad retirada
            const updateDepositSupplies: DepositSupplyOrder[] = listWithdrawals.map(w => {
                const { amount, ...newObject } = w;
                let withdrawalAmount = Number(w.withdrawalAmount + amount);
                return {
                    ...newObject,
                    withdrawalAmount
                };
            });

            let responseAll = await Promise.all([
                dbContext.withdrawalsByDepositSupply.bulkDocs(newWithdrawals),
                dbContext.depositSupplyOrder.bulkDocs(updateDepositSupplies),
            ]);

            setIsLoading(false);

            if (responseAll) {
                NotificationService.showSuccess(
                    t("successful_confirmation"),
                    {},
                    t("withdrawal_order_label")
                );
                return true;
            }

            return false;
        } catch (error) {
            console.log(t('error_log'), error);
            setIsLoading(false);
            NotificationService.showError(t("unexpected_error"), {}, t("oops_label"));
            return false;
        }
    }

    const getLaborOrder = async (field: string, campaignId: string, contractorId: string) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error(t("user_not_found"));

            const response = await dbContext.withdrawalOrders.find({
                selector: {
                    "$and": [
                        { "accountId": user.accountId },
                        { "field": field },
                        { "campaign.campaignId": campaignId },
                        { "contractor._id": contractorId }
                    ],
                },
            });

            setIsLoading(false);

            if (response) {
                return response.docs[0] as WithdrawalOrder;
            }
            return null;
        } catch (error) {
            setIsLoading(false);
            error && setError(error);
            return null;
        }
    }


    const deleteWithdrawalOrder = () => { }

    return {
        orders,
        depositsSuppliesOrder,
        isLoading,
        error,

        getWithdrawalOrders,
        createWithdrawalOrder,
        confirmWithdrawalOrder,
        deleteWithdrawalOrder,
        getOrderWithDepositsAndSuppliesByOrder,
        createLaborOrder,
        confirmLaborOrder,
        getLaborOrder
    }
}