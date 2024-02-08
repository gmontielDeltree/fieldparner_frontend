import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from ".";
import { dbContext } from "../services";
import { DepositSupplyOrder, DepositSupplyOrderItem, Numerator, OrderStatus, StockByLot, StockMovement, Supply, TypeMovement, WithdrawalOrder, WithdrawalsByDepositSupply } from "../types";
import { useState } from "react";
import { setWithdrawalOrderActive } from "../redux/withdrawalOrder";



export const useOrder = () => {

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { withdrawalOrderActive } = useAppSelector(state => state.order);
    const [orders, setOrders] = useState<WithdrawalOrder[]>([]);
    const [depositsSuppliesOrder, setDepositsSuppliesOrder] = useState<DepositSupplyOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({});

    const getLastNumerator = async () => {
        try {
            const response = await dbContext.numerators.allDocs({
                include_docs: true,
                descending: true,
                limit: 1,
            });
            if (response.rows.length)
                return response.rows[0].doc as Numerator;

        } catch (error) {
            console.log('error', error);
            throw new Error("Numerator not found.");
        }
    }

    const updateLastNumerator = async (updateNumerator: Numerator) => {
        try {
            await dbContext.numerators.put(updateNumerator);
        } catch (error) {
            console.log('error', error);
        }
    }

    const getWithdrawalOrders = async () => {
        setIsLoading(true);
        try {
            if (!user) throw new Error("User not found.");

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

            if (!user) throw new Error("There is no user!!!!");
            const lastNumerator = await getLastNumerator();

            if (!lastNumerator) throw new Error("Error: order number");

            lastNumerator.lastNumerator += 1;
            let newOrder: WithdrawalOrder = {
                ...newWithdrawalOrder,
                order: lastNumerator.lastNumerator,
                accountId: user.accountId
            };
            let depositSuppliesOrder = newDepositSupplies.map(s => ({ ...s, order: lastNumerator.lastNumerator }));

            const response = await Promise.all([
                dbContext.withdrawalOrders.post(newOrder),
                dbContext.depositSupplyOrder.bulkDocs(depositSuppliesOrder),
                updateLastNumerator(lastNumerator)
            ]);

            setIsLoading(false);

            if (response) {
                Swal.fire('Orden de Retiro', 'Agregado con exito.', 'success');
            }
            navigate("/init/overview/list-orders");

        } catch (error) {
            console.log('Error al crear el documento: ', error);
            Swal.fire('Ups', 'Ocurrio un error inesperado ', 'error');
            setIsLoading(false);
        }
    }

    const getOrderWithDepositsAndSuppliesByOrder = async (order: number) => {
        setIsLoading(true);
        try {

            if (!user) throw new Error("User not found.");

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
            if (!user) throw new Error("User not found.");
            if (!withdrawalOrderActive) throw new Error("Withdrawal Order not found");
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
                dbContext.stockByLots.find({ selector: { "accountId": user.accountId } }),
                dbContext.supplies.find({ selector: { "accountId": user.accountId } }),
            ]);

            if (!response) throw new Error("Supplies not found.");

            const reponseStockFromSupplies = response[0].docs;
            const responseSupplies = response[1].docs;
            let updateStockSupplies: StockByLot[] = [];
            let updateSupplies: Supply[] = [];

            reponseStockFromSupplies.forEach(s => {
                listWithdrawals.forEach(w => {
                    if (w.deposit._id === s.depositId &&
                        w.supply._id === s.depositId &&
                        w.location === s.location &&
                        w.nroLot === s.nroLot) {
                        updateStockSupplies.push({
                            ...s,
                            currentStock: Number(s.currentStock - Number(w.amount))
                        });
                    }
                });
            });

            responseSupplies.forEach(s => {
                listWithdrawals.forEach(w => {
                    if (s._id === w.supply._id)
                        updateSupplies.push({ ...s, currentStock: Number(s.currentStock - Number(w.amount)) });
                });
            });

            let newMovements = listWithdrawals.map(w => ({
                accountId: user.accountId,
                amount: w.amount,
                campaignId: withdrawalOrderActive.campaign._id,
                creationDate: withdrawalDate,
                depositId: w.deposit._id,
                supplyId: w.supply._id,
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
                dbContext.stockByLots.bulkDocs(updateStockSupplies),
                dbContext.supplies.bulkDocs(updateSupplies),
                dbContext.stockMovements.bulkDocs(newMovements),
            ]);

            if (isComplete) {
                await dbContext.withdrawalOrders.put({ ...withdrawalOrderActive, state: OrderStatus.Completed });
            }

            if (responseAll) {
                Swal.fire('Orden de Retiro', 'Confirmacion exitosa.', 'success');
            }
            navigate("/init/overview/list-orders");
            setIsLoading(false);

        } catch (error) {
            console.log('error', error);
            setIsLoading(false);
            Swal.fire('Ups', 'Ocurrio un error inesperado ', 'error');
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
        getOrderWithDepositsAndSuppliesByOrder
    }
}