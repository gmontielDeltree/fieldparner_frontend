import { useNavigate } from "react-router-dom";
import { useAppSelector } from ".";
import { dbContext } from "../services";
import { Numerator, WithdrawalOrder, WithdrawalOrderItem } from "../types";
import { useState } from "react";
import Swal from 'sweetalert2';



export const useOrder = () => {

    const navigate = useNavigate();
    const [orders, setOrders] = useState<WithdrawalOrderItem[]>([]);
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

            const responseAll = await Promise.all([
                dbContext.withdrawalOrders.find({ selector: { "accountId": user?.accountId } }),
                dbContext.socialEntities.allDocs({ include_docs: true }),
                dbContext.campaigns.find({ selector: { "accountId": user?.accountId } })
            ]);
            const responseOrder = responseAll[0].docs;
            const responseSocialEntities = responseAll[1].rows.map(row => row.doc);
            const responseCampaign = responseAll[2].docs;

            const orders: WithdrawalOrderItem[] = responseOrder.map(row => {

                return {
                    ...row,
                    campaing: responseCampaign.find(c => c._id === row.campaignId),
                    withdraw: responseSocialEntities.find(s => s?._id === row.withdrawId),
                } as WithdrawalOrderItem;
            });

            setOrders(orders);
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            error && setError(error);
        }
    }

    const createWithdrawalOrder = async (newWithdrawalOrder: WithdrawalOrder) => {
        setIsLoading(true);
        try {

            if (!user) throw new Error("There is no user!!!!");
            let lastNumerator = await getLastNumerator();


            if (!lastNumerator) throw new Error("Error: create numerator");

            lastNumerator.lastNumerator += 1;
            let newOrder: WithdrawalOrder = { ...newWithdrawalOrder, order: lastNumerator.lastNumerator };

            const response = await Promise.all([
                dbContext.withdrawalOrders.post(newOrder),
                updateLastNumerator(lastNumerator)
            ]);

            setIsLoading(false);

            if (response[0].ok) {
                Swal.fire('Orden de Retiro', 'Agregado con exito.', 'success');
            }
            navigate("/init/overview/list-orders");

        } catch (error) {
            console.log('Error al crear el documento: ', error);
            Swal.fire('Ups', 'Ocurrio un error inesperado ', 'error');
            setIsLoading(false);
        }
    }

    const confirmWithdrawalOrder = () => { }

    const deleteWithdrawalOrder = () => { }

    return {
        orders,
        isLoading,
        error,

        getWithdrawalOrders,
        createWithdrawalOrder,
        confirmWithdrawalOrder,
        deleteWithdrawalOrder,
    }
}