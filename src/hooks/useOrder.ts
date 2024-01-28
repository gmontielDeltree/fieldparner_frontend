import { useNavigate } from "react-router-dom";
import { useAppSelector } from ".";
import { dbContext } from "../services";
import { OrderStatus, WithdrawalOrder } from "../types";
import { useState } from "react";
import Swal from 'sweetalert2';



export const useOrder = () => {

    const navigate = useNavigate();
    const [orders, setOrders] = useState<WithdrawalOrder[]>([]);
    const { user } = useAppSelector(state => state.auth);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({});

    const getWithdrawalOrders = async () => {
        setIsLoading(true);
        try {

            if (!user) throw new Error("User not found.");

            const response = await dbContext.withdrawalOrders.find({
                selector: { "accountId": user?.accountId },
            });
            const orders: WithdrawalOrder[] =  response.docs.map(row => row as WithdrawalOrder);

            // const data: WithdrawalOrder[] = [
            //     { _id: "id-1", campaignId: "1", creationDate: "20/01/2024", order: "001", reason: "Falta Gasoil", state: OrderStatus.Parcial, type: "Indiv", withdrawId: "123", suppliesToBeWithdrawn: [], accountId: "" },
            //     { _id: "id-2", campaignId: "2", creationDate: "20/01/2020", order: "0080", reason: "Venta Soja", state: OrderStatus.Parcial, type: "Labor", withdrawId: "123", suppliesToBeWithdrawn: [], accountId: "" },
            //     { _id: "id-3", campaignId: "3", creationDate: "20/01/2023", order: "00100", reason: "Demo siembra", state: OrderStatus.Completed, type: "Indiv", withdrawId: "123", suppliesToBeWithdrawn: [], accountId: "" },
            //     { _id: "id-4", campaignId: "4", creationDate: "20/01/2021", order: "0011", reason: "Prestamo", state: OrderStatus.Pending, type: "Indiv", withdrawId: "123", suppliesToBeWithdrawn: [], accountId: "" },
            // ];
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

            let newOrder: WithdrawalOrder = { ...newWithdrawalOrder, accountId: user.accountId };

            const response = await dbContext.withdrawalOrders.post(newOrder);
            setIsLoading(false);

            if (response.ok) {
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