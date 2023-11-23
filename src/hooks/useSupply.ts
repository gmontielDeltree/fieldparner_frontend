import Swal from 'sweetalert2';
import { Supply, SupplyByDeposits } from "../types";
import { useState } from "react";
import { dbContext } from '../services';
import { useAppSelector } from '.';


export const useSupply = () => {

    const { user } = useAppSelector(state => state.auth);
    const { supplyActive } = useAppSelector((state) => state.supply);
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [supplyByDeposits, setSupplyByDeposits] = useState<SupplyByDeposits[]>([]);

    const getSupplies = async (showStockWithZeroValues: boolean = false) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error("Usuario no encontrado.");

            const result = await dbContext.supplies.find({
                selector: { "accountId": user.accountId, },
            },);

            setIsLoading(false);
            if (result.docs.length) {
                let documents: Supply[] = result.docs.map(row => row as Supply);
                if (showStockWithZeroValues) documents = documents.filter(supply => supply.currentStock === 0);
                setSupplies(documents);
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error al cargar documentos:', error);
        }
    }

    const getStockByDeposits = async () => {
        setIsLoading(true);
        let supplyByDeposits: SupplyByDeposits[] = [];
        try {
            if (!supplyActive) throw new Error("Insumo no encontrado.");
            const promisesResult = await Promise.all([
                dbContext.stockMovements.find({
                    selector: {
                        "$and": [
                            { "supplyId": supplyActive._id },
                            { "accountId": user?.accountId }
                        ],
                    }
                }),
                dbContext.deposits.find({ selector: { "accountId": user?.accountId } }),
            ]);
            const [movementsDeposits, deposits] = promisesResult;
            let movementDepositsId = movementsDeposits.docs.map(m => m.depositId);
            //Agrupar los id de depositos 
            const groupDepositsId = Array.from(new Set(movementDepositsId));
            groupDepositsId.forEach(depositId => {
                //Calcular el stock por deposito
                let incomeTotal: number = 0, egressTotal: number = 0;
                movementsDeposits.docs.forEach(movement => {
                    let amountValue = Number(movement.amount);
                    if (movement.depositId === depositId)
                        (movement.isIncome) ? incomeTotal += amountValue : egressTotal += amountValue;
                });
                const currentStock = (incomeTotal - egressTotal);
                //Obtener deposito
                const existingDeposit = deposits.docs.find(d => d._id === depositId);
                if (!existingDeposit) throw new Error("Deposito no encontrado.");
                //Movimientos del deposito
                const movements = movementsDeposits.docs.filter(m => m.depositId === depositId);
                supplyByDeposits.push({
                    unitMeasurement: supplyActive.unitMeasurement,
                    currentStock,
                    deposit: existingDeposit,
                    batch: movements[0].batch.trim(),
                    reservedStock: 0,
                    movements
                });
            });
            setSupplyByDeposits(supplyByDeposits);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error('Error al cargar los documentos:', error);
        }
    }

    const createSupply = async (newSupply: Supply) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error();
            const response = await dbContext.supplies.post({ ...newSupply, accountId: user.accountId });
            setIsLoading(false);

            if (response.ok) {
                Swal.fire('Insumo', 'Agregado con exito.', 'success');
            }

        } catch (error) {
            console.log('Error al crear el documento: ', error);
            Swal.fire('Ups', 'Ocurrio un error inesperado ', 'error');
            setIsLoading(false);
        }
    }

    const updateSupply = async (updateSupply: Supply) => {
        setIsLoading(true);
        try {
            const response = await dbContext.supplies.put(updateSupply);
            setIsLoading(false);

            if (response.ok) {
                Swal.fire('Insumo', 'Actualizado con exito.', 'success');
            }

        } catch (error) {
            console.log('Error al actualizar el documento: ', error);
            Swal.fire('Ups', 'Ocurrio un error inesperado ', 'error');
            setIsLoading(false);
        }
    }

    const removeSupply = async () => {

    }

    return {
        supplies,
        isLoading,
        supplyByDeposits,

        setSupplies,
        getSupplies,
        createSupply,
        updateSupply,
        removeSupply,
        getStockByDeposits,
    }

}