import { OrderStatus, WithdrawalOrder } from "../types";
import { useState } from "react";


export const useOrder = () => {

    const [orders, setOrders] = useState<WithdrawalOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({});

    const getWithdrawalOrders = () => {

        try {
            setIsLoading(true);

            const data: WithdrawalOrder[] = [
                { _id: "id-1", campaignId: "1", creationDate: "20/01/2024", order: "001", reason: "Falta Gasoil", state: OrderStatus.Parcial, type: "Indiv", withdrawId: "123" },
                { _id: "id-2", campaignId: "2", creationDate: "20/01/2020", order: "0080", reason: "Venta Soja", state: OrderStatus.Parcial, type: "Labor", withdrawId: "123" },
                { _id: "id-3", campaignId: "3", creationDate: "20/01/2023", order: "00100", reason: "Demo siembra", state: OrderStatus.Completed, type: "Indiv", withdrawId: "123" },
                { _id: "id-4", campaignId: "4", creationDate: "20/01/2021", order: "0011", reason: "Prestamo", state: OrderStatus.Pending, type: "Indiv", withdrawId: "123" },
            ];
            setOrders(data);
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            error && setError(error);
        }
    }

    const createWithdrawalOrder = () => { }

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