import { DetailPurchaseOrder, DetailPurchaseOrderItem, Numerator, NumeratorType, PurchaseOrder, Supply } from "../types";
import { useState } from "react"
import Swal from "sweetalert2";
import { useAppSelector } from "./useRedux";
import { dbContext } from "../services";
import { useNumerator } from "./useNumerator";

interface OrderWithDetail {
    order: PurchaseOrder,
    details: DetailPurchaseOrderItem[]
}

export const userPurchaseOrder = () => {

    const { user } = useAppSelector(state => state.auth);
    const [purchaseOrders, setPurchaseOrders] = useState<OrderWithDetail[]>([]);
    // const [purchaseOrderActive, setPurchaseOrderActive] = useState<PurchaseOrder | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { getLastNumerator, putLastNumerator } = useNumerator();

    const getPurchaseOrders = async () => {
        setIsLoading(true);
        try {
            if (!user) throw new Error("User not found.");

            const response = await Promise.all([
                dbContext.purchaseOrder.find({
                    selector: { "accountId": user.accountId }
                }),
                dbContext.detailPurchaseOrder.allDocs({ include_docs: true }),
                dbContext.supplies.find({
                    selector: {
                        $or: [
                            { "accountId": user?.accountId },
                            { "generico": true }
                        ]
                    },
                })
            ]);

            let orders: OrderWithDetail[] = [];
            if (response) {
                const docs: PurchaseOrder[] = response[0].docs.map(doc => doc as PurchaseOrder);
                const detailDocs = response[1].rows.map(row => row.doc as DetailPurchaseOrder);
                const supplies = response[2].docs.map(doc => doc as Supply);
                const detailsWithSupply = detailDocs.map(doc => ({ ...doc, supply: supplies.find(x => x._id === doc.supplyId) } as DetailPurchaseOrderItem));

                docs.forEach(x => {
                    orders.push({ order: x, details: detailsWithSupply.filter(d => d.nroOrder === x.nroOrder) })
                });
                setPurchaseOrders(orders);
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

    const getPurchaseOrderByOrder = async (order: string) => {
        setIsLoading(true);
        try {

            if (!user) throw new Error("User not found.");

            const responseAll = await Promise.all([
                dbContext.purchaseOrder.find({
                    selector: {
                        "$and": [{ "accountId": user.accountId }, { "nroOrder": order }],
                    }
                }),
                dbContext.detailPurchaseOrder.find({
                    selector: { "nroOrder": order }
                }),
                dbContext.supplies.find({
                    selector: {
                        $or: [
                            { "accountId": user?.accountId },
                            { "generico": true }
                        ]
                    },
                })
            ]);
            setIsLoading(false);

            if (responseAll) {
                const purchaseOrder = responseAll[0].docs[0] as PurchaseOrder;
                const supplies = responseAll[2].docs.map(doc => doc as Supply);
                const details = responseAll[1].docs.map(doc => ({ ...doc, supply: supplies.find(x => x._id === doc.supplyId) } as DetailPurchaseOrderItem));

                return { purchaseOrder, details }
            }

        } catch (error) {
            setIsLoading(false);
            console.log('error', error);
        }
    }

    const createPurchaseOrder = async (order: PurchaseOrder, details: DetailPurchaseOrder[]) => {
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
            let detailsWithNro = details.map(d => ({ ...d, nroOrder: newNroOrder.toString() }));
            const response = await Promise.all([
                dbContext.purchaseOrder.post(newPurchaseOrder),
                dbContext.detailPurchaseOrder.bulkDocs(detailsWithNro),
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


    const updatePurchaseOrder = async (updatePurchadeOrder: PurchaseOrder, details: DetailPurchaseOrder[]) => {
        setIsLoading(true);
        try {
            let detailsWithNro = details.map(d => ({ ...d, nroOrder: updatePurchadeOrder.nroOrder }));
            const response = await Promise.all([
                dbContext.purchaseOrder.put(updatePurchadeOrder),
                dbContext.detailPurchaseOrder.bulkDocs(detailsWithNro),
            ]);
            if (response) {
                Swal.fire("Orden de Compra", `Orden de Compran  ${updatePurchadeOrder.nroOrder} actualizada`, "success");
            }

            setIsLoading(false);
        } catch (error) {
            console.log("Error al crear el documento: ", error);
            Swal.fire("Ups", "Ocurrio un error inesperado ", "error");
            setIsLoading(false);
        }
    }

    return {
        purchaseOrders,
        isLoading,

        getPurchaseOrders,
        getPurchaseOrderByOrder,
        createPurchaseOrder,
        updatePurchaseOrder
    }
}