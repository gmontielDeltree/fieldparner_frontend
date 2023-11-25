import Swal from 'sweetalert2';
import { Supply, SupplyByDeposits, SupplyByLot } from "../types";
import { useState } from "react";
import { dbContext } from '../services';
import { useAppSelector } from '.';


export const useSupply = () => {

    const { user } = useAppSelector(state => state.auth);
    const { supplyActive } = useAppSelector((state) => state.supply);
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [supplyByDeposits, setSupplyByDeposits] = useState<SupplyByDeposits[]>([]);

    const getSupplies = async () => {
        setIsLoading(true);
        try {
            if (!user) throw new Error("Usuario no encontrado.");

            const result = await dbContext.supplies.find({
                selector: { "accountId": user.accountId, },
            },);

            setIsLoading(false);
            if (result.docs.length) {
                let documents: Supply[] = result.docs.map(row => row as Supply);
                setSupplies(documents);
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error al cargar documentos:', error);
        }
    }

    const getStockByDepositsAndLot = async () => {
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
            const [stockMovements, deposits] = promisesResult;
            let movementDepositsId = stockMovements.docs.map(m => m.depositId);
            //Agrupar los id de depositos 
            const groupDepositsId = Array.from(new Set(movementDepositsId));
            groupDepositsId.forEach(depositId => {
                //Obtener deposito
                const depositDto = deposits.docs.find(d => d._id === depositId);
                if (!depositDto) throw new Error("Deposito no encontrado.");
                //Movimientos del deposito 
                const depositMovements = stockMovements.docs.filter(m => m.depositId === depositId);
                //Calcular el stock por deposito y lote
                depositDto.lots.forEach(lot => {
                    let incomeTotal: number = 0, egressTotal: number = 0;
                    depositMovements.forEach(movement => {
                        let amountValue = Number(movement.amount);
                        if (movement.nroLot.toLowerCase() === lot.nro.toLowerCase())
                            (movement.isIncome) ? incomeTotal += amountValue : egressTotal += amountValue;
                    });
                    const currentStock = (incomeTotal - egressTotal);

                    supplyByDeposits.push({
                        unitMeasurement: supplyActive.unitMeasurement,
                        currentStock,
                        deposit: depositDto,
                        lot,
                        dueDate: depositMovements[0].dueDate, // TODO ?
                        reservedStock: 0,
                        movements: depositMovements.filter(mov => mov.nroLot.toLowerCase() === lot.nro.toLowerCase())
                    });
                });

            });
            setSupplyByDeposits(supplyByDeposits);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error('Error al cargar los documentos:', error);
        }
    }

    const getStockByDeposits = async () => {
        setIsLoading(true);
        let supplyByDeposits: SupplyByDeposits[] = [];
        try {
            if (!user) throw new Error("User not found.");
            const promisesResult = await Promise.all([
                dbContext.stockMovements.find({ selector: { "accountId": user.accountId } }),
                dbContext.deposits.find({ selector: { "accountId": user.accountId } }),
                dbContext.supplies.find({ selector: { "accountId": user.accountId } })
            ]);
            const [stockMovements, deposits, supplies] = promisesResult;
            let movementDepositsId = stockMovements.docs.map(m => m.depositId);
            let movementsSupplyId = stockMovements.docs.map(m => m.supplyId);
            //Agrupar los id de depositos y insumos 
            const groupSuppliesId = Array.from(new Set(movementsSupplyId));
            const groupDepositsId = Array.from(new Set(movementDepositsId));

            groupDepositsId.forEach(depositId => {
                //Obtener deposito y sus lotes
                const depositDto = deposits.docs.find(d => d._id === depositId);
                if (!depositDto) throw new Error("Deposito no encontrado.");
                groupSuppliesId.forEach(supplyId => {
                    //Obtener insumo
                    const supplyDto = supplies.docs.find(s => s._id === supplyId);
                    if (!supplyDto) throw new Error("Supply not found");
                    //Movimientos del deposito y insumo
                    const movementsByDepositAndSupply = stockMovements.docs.filter(m => (m.depositId === depositId && m.supplyId === supplyId));
                    //Calcular el stock del deposito por insumo
                    let incomeTotal: number = 0, egressTotal: number = 0;
                    movementsByDepositAndSupply.forEach(movement => {
                        let amountValue = Number(movement.amount);
                        (movement.isIncome) ? incomeTotal += amountValue : egressTotal += amountValue;
                    });
                    const currentStockOfDeposit = (incomeTotal - egressTotal);
                    //Calcular stock por cada lote del deposito 
                    let lotsStock: SupplyByLot[] = [];
                    depositDto.lots.forEach(lot => {
                        let incomeTotal: number = 0, egressTotal: number = 0;
                        movementsByDepositAndSupply.forEach(movement => {
                            let amountValue = Number(movement.amount);
                            if (movement.nroLot.toLowerCase() === lot.nro.toLowerCase())
                                (movement.isIncome) ? incomeTotal += amountValue : egressTotal += amountValue;
                        });
                        const currentStockOfLot = (incomeTotal - egressTotal);
                        lotsStock.push({
                            lot,
                            currentStock: currentStockOfLot,
                            reservedStock: 0 //TODO: stock reservado por lote
                        });
                    });
                    supplyByDeposits.push({
                        unitMeasurement: supplyDto.unitMeasurement,
                        currentStock: currentStockOfDeposit,
                        deposit: depositDto,
                        lotsStock,
                        dueDate: "",
                        reservedStock: 0, //TODO: chequear
                        supply: supplyDto
                    });
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
        // supplies = documents.filter(supply => supply.currentStock === 0);


        setSupplies,
        getSupplies,
        createSupply,
        updateSupply,
        removeSupply,
        getStockByDepositsAndLot,
        getStockByDeposits
    }

}