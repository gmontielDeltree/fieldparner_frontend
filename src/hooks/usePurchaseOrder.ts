import { Numerator, NumeratorType, PurchaseOrder } from "../types";
import { useState } from "react"
import Swal from "sweetalert2";
import { useAppSelector } from "./useRedux";
import { dbContext } from "../services";
import { useNumerator } from "./useNumerator";


export const userPurchaseOrder = () => {

    const { user } = useAppSelector(state => state.auth);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    // const [purchaseOrderActive, setPurchaseOrderActive] = useState<PurchaseOrder | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { getLastNumerator, putLastNumerator } = useNumerator();

    const getPurchaseOrders = async () => {
        setIsLoading(true);
        try {
            if (!user) throw new Error("User not found.");

            const response = await dbContext.purchaseOrder.find({
                selector: { "accountId": user.accountId }
            });

            if (response.docs) {
                const docs: PurchaseOrder[] = response.docs.map(doc => doc as PurchaseOrder);
                setPurchaseOrders(docs);
            }
            else
                setPurchaseOrders([]);

            setIsLoading(false)
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            Swal.fire("Error", "Error al cargar las ordenes de compra.", "error");
            setIsLoading(false);
        }
    }
    const createPurchaseOrder = async (order: PurchaseOrder) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error("User not found.");
            //Instanciar numerador
            let lastNumerator: Numerator = {
                accountId: user.accountId,
                numeratorType: NumeratorType.PurchaseOrder,
                lastNumerator: 1
            };
            //Chequear si existe
            const lastNumeratorFound = await getLastNumerator(user.accountId, NumeratorType.Client);
            //Si no existe, lo creamos y buscamos el doc creado, para luego actualizarlo
            if (!lastNumeratorFound) {
                await putLastNumerator(lastNumerator, true);
                const numeratorFound = await getLastNumerator(user.accountId, NumeratorType.Client);
                lastNumerator._id = numeratorFound?._id;
                lastNumerator._rev = numeratorFound?._rev;
            }
            else {
                //Si no existe, seteamos el doc encontrado y le sumamos +1 al numerador
                lastNumerator = { ...lastNumeratorFound };
                lastNumerator.lastNumerator = (lastNumeratorFound.lastNumerator + 1);
            }
            let newNroOrder = lastNumerator.lastNumerator;
            const newPurchaseOrder: PurchaseOrder =
            {
                ...order,
                accountId: user.accountId,
                nroOrder: newNroOrder.toString()
            }

            const response = await Promise.all([
                dbContext.purchaseOrder.post(newPurchaseOrder),
                putLastNumerator(lastNumerator)
            ]);
            if (response) {
                Swal.fire("Orden de Compra", `Orden de Compra generada con el Nro ${newNroOrder}`, "success");
            }

            setIsLoading(false);
        } catch (error) {
            console.log("Error al crear el documento: ", error, order);
            Swal.fire("Ups", "Ocurrio un error inesperado ", "error");
            setIsLoading(false);
        }
    }


    const updatePurchaseOrder = async (updatePurchadeOrder: PurchaseOrder) => {
        setIsLoading(true);
        try {
            const response = await dbContext.purchaseOrder.put(updatePurchadeOrder);

            if (response.ok)
                Swal.fire("Orden de Compra", "Actualizado con exito.", "success");

            setIsLoading(false);
        } catch (error) {
            console.log("Error al actualizar el documento: ", error, updatePurchadeOrder);
            Swal.fire("Ups", "Ocurrio un error inesperado ", "error");
            setIsLoading(false);
        }
    }

    return {
        purchaseOrders,
        isLoading,

        getPurchaseOrders,
        createPurchaseOrder,
        updatePurchaseOrder
    }
}