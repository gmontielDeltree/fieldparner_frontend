import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from ".";
import { dbContext } from "../services";
import {
    Campaign,
    DepositSupplyOrder,
    DepositSupplyOrderItem,
    Numerator,
    NumeratorType,
    OrderStatus,
    Supply,
    WithdrawalOrder,
    WithdrawalOrderItem,
    WithdrawalOrderType,
    WithdrawalsByDepositSupply,
    Deposit
} from "../types";
import { useState } from "react";
import { setWithdrawalOrderActive } from "../redux/withdrawalOrder";
import { onLogout } from '../redux/auth';

import { useTranslation } from "react-i18next";
import { NotificationService } from "../services/notificationService";
import { Business } from "../interfaces/socialEntity";

export const useOrder = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { withdrawalOrderActive } = useAppSelector(state => state.order);
    const [orders, setOrders] = useState<WithdrawalOrderItem[]>([]);
    const [depositsSuppliesOrder, setDepositsSuppliesOrder] = useState<DepositSupplyOrderItem[]>([]);
    const [historyWithdrawOrder, setHistoryWithdrawOrder] = useState<WithdrawalsByDepositSupply[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({});
    const { t } = useTranslation();

    const findStockDocsForOrderItem = async (item: {
        supplyId: string;
        depositId: string;
        nroLot?: string;
        location?: string;
    }) => {
        if (!user) return [];

        const selector: any = {
            accountId: user.accountId,
            id: item.supplyId,
            depositId: item.depositId,
            ...(item.nroLot ? { nroLot: item.nroLot } : {}),
        };

        const stockResult = await dbContext.stock.find({ selector });
        return stockResult.docs.filter((stock: any) =>
            !item.location || (stock.location || '') === item.location
        );
    }

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

            // const response = await dbContext.withdrawalOrders.find({ selector: { "accountId": user?.accountId } });
            const responseAll = await Promise.all([
                dbContext.withdrawalOrders.find({ selector: { "accountId": user?.accountId } }),
                dbContext.socialEntities.find({
                    selector: { accountId: user?.accountId }
                }),
                dbContext.campaigns.find({
                    selector: {
                        accountId: user?.accountId
                    }
                })
            ]);

            if (responseAll) {
                const orders = responseAll[0].docs.map(doc => doc as WithdrawalOrder);
                const withdraws = responseAll[1].docs.map(doc => doc as Business);
                const campaigns = responseAll[2].docs.map(doc => doc as Campaign);
                const orderItems: WithdrawalOrderItem[] = orders.map(o => {
                    const withdraw = withdraws.find(w => w._id === o.withdrawId);
                    const campaign = campaigns.find(c => c.campaignId === o.campaignId);

                    console.log(`Processing order ${o.order}:`, {
                        orderId: o._id,
                        orderNumber: o.order,
                        campaignId: o.campaignId,
                        foundCampaign: campaign,
                        availableCampaigns: campaigns.map(c => ({ id: c._id, name: c.name }))
                    });

                    // For automatic orders, create a default withdraw if not found
                    const defaultWithdraw = withdraw || {
                        _id: o.withdrawId || 'auto',
                        nombreCompleto: 'Sistema Automático',
                        razonSocial: 'Sistema Automático',
                        cuit: '',
                        accountId: o.accountId
                    };

                    // For automatic orders without campaign, create a default campaign
                    const defaultCampaign = campaign || {
                        _id: o.campaignId || 'auto',
                        name: 'Sistema Automático',
                        accountId: o.accountId
                    };

                    // Only skip if it's a manual order without campaign (automatic orders can work without campaign)
                    if (!campaign && o.type !== 'Automatica') {
                        console.warn(`Manual order ${o.order} skipped: Campaign not found for campaignId: ${o.campaignId}`);
                        return null;
                    }

                    return {
                        ...o,
                        withdraw: defaultWithdraw,
                        campaign: defaultCampaign,
                    } as WithdrawalOrderItem;
                }).filter(Boolean).sort((a, b) => b.order - a.order);
                setOrders(orderItems);
            }

            setIsLoading(false);
        } catch (error) {
            console.log(error);
            error && setError(error);
        }
    }

    const createWithdrawalOrder = async (
        newWithdrawalOrder: WithdrawalOrder,
        inputsToBeWithdrawan: DepositSupplyOrder[],
        movement = WithdrawalOrderType.Manual) => {
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
            const nroOrder = lastNumerator.lastNumerator;
            let newOrder: WithdrawalOrder = {
                ...newWithdrawalOrder,
                order: nroOrder,
                accountId: user.accountId
            };

            let depositSuppliesOrder =
                inputsToBeWithdrawan.map(s => ({
                    ...s,
                    order: nroOrder,
                    // withdrawalAmount: 0 //TODO: DEJAMOS CON EL VALOR ORIGINAL A RETIRAR O 0 
                }));

            const response = await Promise.all([
                dbContext.withdrawalOrders.post(newOrder),
                dbContext.depositSupplyOrder.bulkDocs(depositSuppliesOrder),
                putLastNumerator(lastNumerator),
            ]);

            // Update stock.reservedStock for each supply in the order
            for (const item of inputsToBeWithdrawan) {
                try {
                    const stockDocs = await findStockDocsForOrderItem(item);
                    if (stockDocs.length > 0) {
                        const stockDoc = stockDocs[0];
                        stockDoc.reservedStock = (stockDoc.reservedStock || 0) + Number(item.originalAmount || 0);
                        stockDoc.lastUpdate = new Date().toISOString();
                        await dbContext.stock.put(stockDoc);
                    }
                } catch (stockError) {
                    console.error('Error updating reserved stock:', stockError);
                }
            }

            setIsLoading(false);

            if (response) {
                NotificationService.showSuccess(
                    t("withdrawal_order_created_successfully", { number: lastNumerator.lastNumerator }),
                    { order: lastNumerator.lastNumerator.toString() },
                    t("withdrawal_order_label")
                );
                // Return the created order with the assigned ID and order number
                return {
                    ...newOrder,
                    _id: response[0].id,
                    _rev: response[0].rev
                };
            }
            return null;
        } catch (error) {
            console.log(t('document_creation_error'), error);
            NotificationService.showError(t("unexpected_error"), {}, t("oops_label"));
            setIsLoading(false);
            return null;
        }
    }

    const getOrderDetailByNumber = async (order: number) => {
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
                }),
                dbContext.socialEntities.find({
                    selector: { accountId: user?.accountId }
                }),
                dbContext.campaigns.find({
                    selector: {
                        accountId: user?.accountId
                    }
                }),
                dbContext.deposits.find({
                    selector: { accountId: user?.accountId }
                }),
                dbContext.supplies.find({
                    selector: {
                        $or: [
                            { accountId: user?.accountId },
                            { isDefault: true }
                        ]
                    },
                })
            ]);

            //Campaign y Business
            if (responseAll) {
                const withdrawalOrder = responseAll[0].docs[0] as WithdrawalOrder;
                const depositAndSuppliesOrder = responseAll[1].docs.map(doc => doc as DepositSupplyOrder);
                const campaign = responseAll[3].docs.find(c => c.campaignId === withdrawalOrder.campaignId);
                const withdraw = responseAll[2].docs.find(b => b._id === withdrawalOrder.withdrawId);
                const deposits = responseAll[4].docs.map(d => d as Deposit);
                const supplies = responseAll[5].docs.map(s => s as Supply);

                if (!withdraw || !campaign) throw new Error("Business or Campaign not found");
                if (!withdrawalOrderActive) {
                    dispatch(setWithdrawalOrderActive({
                        ...withdrawalOrder, campaign, withdraw
                    }));
                }
                const suppliesOfTheOrder = depositAndSuppliesOrder.map(d => {
                    const deposit = deposits.find(de => de._id === d.depositId);
                    const supply = supplies.find(s => s._id === d.supplyId);
                    if (!deposit || !supply) throw new Error("Deposit or Supply not found");
                    return {
                        ...d,
                        deposit,
                        supply,
                        amount: Number(d.originalAmount || 0) - Number(d.withdrawalAmount || 0),
                    } as DepositSupplyOrderItem;
                });
                setDepositsSuppliesOrder(suppliesOfTheOrder);
                return {
                    withdrawalOrder,
                    suppliesOfTheOrder
                }
            }
            return {
                withdrawalOrder: null,
                suppliesOfTheOrder: []
            }

        } catch (error) {
            console.log(`Error al obtener los detalle de la orden de retiro: ${error}`);
            error && setError(error);
        }
        finally {
            setIsLoading(false);
        }
    }
    //todo: CONSULTAR SI CADA VEZ Q CONFIRMO UN RETIRO DE UNA ORDEN AUTOMATICA , DEBO INCREMENTAR LA RESERVA DEL STOCK O SOLO CUANDO SE CREA LA ORDEN
    //todo: QUE PASA SI AL EJECUTAR UNA ACTIVADAD LABORAL QUE SOLO FUE GUARDADA (RESERVO STOCK CON)
    const confirmWithdrawalOrder = async (inputsToBeWithdrawan: DepositSupplyOrderItem[], withdrawalDate: string) => {
        setIsLoading(true);

        try {
            if (!user) throw new Error(t("user_not_found"));
            if (!withdrawalOrderActive) throw new Error(t("withdrawal_order_not_found"));
            let isComplete = true;

            const newWithdrawals: WithdrawalsByDepositSupply[] = inputsToBeWithdrawan.map(w => ({
                accountId: w.accountId,
                amount: Number(w.amount || 0),
                depositSupplyOrderId: w._id,
                order: w.order,
                withdrawalDate,
            } as WithdrawalsByDepositSupply));

            //Actualizamos los insumos que ya se habian cargado para la orden de retiro,
            //Sumamos a la cantidad retirada, el monto q va a retirar
            let updateDepositSupplies: DepositSupplyOrder[] = inputsToBeWithdrawan.map(w => {
                const { amount, ...newObject } = w;
                let withdrawalAmount = Number(w.withdrawalAmount || 0) + Number(amount || 0);
                delete newObject.supply;
                delete newObject.deposit;
                return {
                    ...newObject,
                    withdrawalAmount
                };
            });

            updateDepositSupplies.forEach(u => {
                if (Number(u.originalAmount) > Number(u.withdrawalAmount)) {
                    isComplete = false;
                    return;
                }
            });

            let responseAll = await Promise.all([
                dbContext.withdrawalsByDepositSupply.bulkDocs(newWithdrawals),
                dbContext.depositSupplyOrder.bulkDocs(updateDepositSupplies),
            ]);

            if (isComplete) {
                let updateOrder = { ...withdrawalOrderActive, state: OrderStatus.Completed };
                delete updateOrder.withdraw;
                delete updateOrder.campaign;
                delete updateOrder.contractor;
                await dbContext.withdrawalOrders.put(updateOrder);
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
            console.log("Error en la confirmacion de Retiro", error);
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
                type: WithdrawalOrderType.Automatica,
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


    // AGREGAR UN BOOLEANO PARA SABER CUANDO EJECUTA LA ORDEN 
    // SI EJECUTA , HAY Q BUSCAR TODOS LOS RETIROS Q HIZO Y SUMAR ESOS MONTOS , LUEGO DESCONTAR DEL STOCK Y REMOVER LO RESERVADO
    // SI NO EJECUTA , SOLO INCREMENTA EL STOCK RESERVADO Y NO TOCA EL STOCK ACTUAL

    const confirmAutomaticWithdrawalOrder = async (withdrawalOrder: WithdrawalOrder, listWithdrawals: DepositSupplyOrderItem[], withdrawalDate: string) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error(t("user_not_found"));
            if (!withdrawalOrder) throw new Error(t("withdrawal_order_not_found"));

            const newWithdrawals: WithdrawalsByDepositSupply[] = listWithdrawals.map(w => ({
                accountId: w.accountId,
                amount: Number(w.amount || 0),
                depositSupplyOrderId: w._id,
                order: w.order,
                withdrawalDate,
            } as WithdrawalsByDepositSupply));

            let updateDepositSupplies: DepositSupplyOrder[] = listWithdrawals.map(w => {
                const { amount, ...newObject } = w;
                let withdrawalAmount = Number(w.withdrawalAmount || 0) + Number(amount || 0);
                delete newObject.supply;
                delete newObject.deposit;
                return {
                    ...newObject,
                    withdrawalAmount
                };
            });

            let responseAll = await Promise.all([
                dbContext.withdrawalsByDepositSupply.bulkDocs(newWithdrawals),
                dbContext.depositSupplyOrder.bulkDocs(updateDepositSupplies),
            ]);

            // Update stock: decrement reservedStock and currentStock
            for (const w of listWithdrawals) {
                try {
                    const withdrawnAmount = Number(w.amount || 0);
                    if (withdrawnAmount <= 0) continue;

                    const stockDocs = await findStockDocsForOrderItem(w);
                    if (stockDocs.length > 0) {
                        const stockDoc = stockDocs[0];
                        stockDoc.reservedStock = Math.max(0, (stockDoc.reservedStock || 0) - withdrawnAmount);
                        stockDoc.currentStock = (stockDoc.currentStock || 0) - withdrawnAmount;
                        stockDoc.lastUpdate = new Date().toISOString();
                        await dbContext.stock.put(stockDoc);
                    }
                } catch (stockError) {
                    console.error('Error updating stock on withdrawal confirmation:', stockError);
                }
            }

            //Una vez q se confirma la orden automatica, se marca como completada
            let updateOrder = { ...withdrawalOrder, state: OrderStatus.Completed };
            await dbContext.withdrawalOrders.put(updateOrder);

            setIsLoading(false);

            if (responseAll) {
                return true;
            }
            return false;
        } catch (error) {
            console.log("Error en la confirmacion de Retiro Automatico", error);
            setIsLoading(false);
            return false;
        }
    };

    const getLaborOrder = async (field: string, campaignId: string, contractorId: string) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error(t("user_not_found"));

            const response = await dbContext.withdrawalOrders.find({
                selector: {
                    "$and": [
                        { "accountId": user.accountId },
                        { "field": field },
                        { "campaignId": campaignId },
                        { "contractorId": contractorId }
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

    const getHistoryWithdrawOrder = async (order: number) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error(t("user_not_found"));

            const response = await dbContext.withdrawalsByDepositSupply.find({
                selector: {
                    "$and": [
                        { "accountId": user.accountId },
                        { "order": order }
                    ],
                },
            });

            setIsLoading(false);

            if (response) {
                setHistoryWithdrawOrder(response.docs as WithdrawalsByDepositSupply[]);
            }

        } catch (error) {
            console.log('Error al obtener el historial de la orden de retiro: ', error);
            setIsLoading(false);
            error && setError(error);
        }
    }

    const deleteWithdrawalOrder = async (withdrawalOrder: WithdrawalOrder) => {
        try {
            if (!user) throw new Error(t("user_not_found"));

            // Get deposit supply orders for this order
            const depositSupplyResult = await dbContext.depositSupplyOrder.find({
                selector: {
                    accountId: user.accountId,
                    order: withdrawalOrder.order,
                }
            });

            // Release reserved stock for each supply
            for (const dso of depositSupplyResult.docs) {
                const reservedAmount = Number(dso.originalAmount || 0) - Number(dso.withdrawalAmount || 0);
                if (reservedAmount <= 0) continue;

                try {
                    const stockDocs = await findStockDocsForOrderItem(dso);
                    if (stockDocs.length > 0) {
                        const stockDoc = stockDocs[0];
                        stockDoc.reservedStock = Math.max(0, (stockDoc.reservedStock || 0) - reservedAmount);
                        stockDoc.lastUpdate = new Date().toISOString();
                        await dbContext.stock.put(stockDoc);
                    }
                } catch (stockError) {
                    console.error('Error releasing reserved stock:', stockError);
                }
            }

            // Delete deposit supply orders
            const docsToDelete = depositSupplyResult.docs.map(d => ({ ...d, _deleted: true }));
            if (docsToDelete.length > 0) {
                await dbContext.depositSupplyOrder.bulkDocs(docsToDelete);
            }

            // Delete the withdrawal order itself
            await dbContext.withdrawalOrders.remove(withdrawalOrder._id, withdrawalOrder._rev);

            NotificationService.showSuccess(
                t("withdrawal_order_deleted_successfully"),
                {},
                t("withdrawal_order_label")
            );
        } catch (error) {
            console.error('Error deleting withdrawal order:', error);
            NotificationService.showError(t("unexpected_error"), {}, t("oops_label"));
        }
    }

    return {
        orders,
        depositsSuppliesOrder,
        isLoading,
        error,
        historyWithdrawOrder,
        getWithdrawalOrders,
        createWithdrawalOrder,
        confirmWithdrawalOrder,
        confirmAutomaticWithdrawalOrder,
        deleteWithdrawalOrder,
        getOrderDetailByNumber,
        createLaborOrder,
        getLaborOrder,
        getHistoryWithdrawOrder
    }
}
