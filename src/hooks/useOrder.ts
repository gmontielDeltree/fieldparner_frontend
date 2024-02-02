import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from ".";
import { dbContext } from "../services";
import { Business, Campaign, Deposit, DepositSupplyOrder, DepositSupplyOrderItem, Numerator, Supply, WithdrawalOrder, WithdrawalOrderItem, WithdrawalsByDepositSupply } from "../types";
import { useState } from "react";
import Swal from 'sweetalert2';
import { setWithdrawalOrderActive } from "../redux/withdrawalOrder";



export const useOrder = () => {

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [orders, setOrders] = useState<WithdrawalOrder[]>([]);
    const [depositsSuppliesOrder, setDepositsSuppliesOrder] = useState<DepositSupplyOrderItem[]>([]);
    const { user } = useAppSelector(state => state.auth);
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
            // dbContext.socialEntities.allDocs({ include_docs: true }),
            // dbContext.campaigns.find({ selector: { "accountId": user?.accountId } })

            if (response) {
                const orders = response.docs.map(doc => doc as WithdrawalOrder);
                setOrders(orders);
            }

            // const responseSocialEntities = responseAll[1].rows.map(row => row.doc);
            // const responseCampaign = responseAll[2].docs;

            // const orders: WithdrawalOrderItem[] = responseOrder.map(row => {
            //     return {
            //         ...row,
            //         campaign: responseCampaign.find(c => c._id === row.campaign),
            //         withdraw: responseSocialEntities.find(s => s?._id === row.withdraw),
            //     } as WithdrawalOrderItem;
            // });

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
            // const lastNumerator = await getLastNumerator();

            // if (!lastNumerator) throw new Error("Error: order number");
            let lastNumerator = 1;
            // lastNumerator.lastNumerator += 1;
            let newOrder: WithdrawalOrder = {
                ...newWithdrawalOrder,
                order: lastNumerator,
                accountId: user.accountId
            };
            let depositSuppliesOrder = newDepositSupplies.map(s => ({ ...s, order: lastNumerator }));

            const response = await Promise.all([
                dbContext.withdrawalOrders.post(newOrder),
                dbContext.depositSupplyOrder.bulkDocs(depositSuppliesOrder),
                // updateLastNumerator(lastNumerator)
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

    //TODO: obtener orden de retiro, y sus deposito/insumos a retirar por nro orden.
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
    //TODO: Actualizar los stock correspondientes a la tabla
    const confirmWithdrawalOrder = async (newWithdrawals: WithdrawalsByDepositSupply[]) => {
        setIsLoading(true);
        try {
            const response = await dbContext.withdrawalsByDepositSupply.bulkDocs(newWithdrawals);
            if (response) {
                Swal.fire('Orden de Retiro', 'Confirmacion exitosa.', 'success');
            }
            navigate("/init/overview/list-orders");

        } catch (error) {
            console.log('error', error);
            Swal.fire('Ups', 'Ocurrio un error inesperado ', 'error');
            setIsLoading(false);
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