import Swal from 'sweetalert2';
import { Supply, SupplyByDeposits, StockByNroLot, StockBySupply } from "../types";
import { useState } from "react";
import { dbContext } from '../services';
import { useAppSelector } from '.';
import { useNavigate } from 'react-router-dom';


export const useSupply = () => {

    const navigate = useNavigate();
    const { user } = useAppSelector(state => state.auth);
    const { supplyActive } = useAppSelector((state) => state.supply);
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [supplyByDeposits, setSupplyByDeposits] = useState<SupplyByDeposits[]>([]);
    const [supplyError, setSupplyError] = useState(false);
    const [stockBySupplies, setStockBySupplies] = useState<StockBySupply[]>([])


    const getSupplies = async () => {
        setIsLoading(true);
        try {
            // if (!user) throw new Error("Usuario no encontrado.");

            const result = await dbContext.supplies.find({
                selector: {
                    $or: [
                        { "accountId": user?.accountId },
                        { "generico": true }
                    ]
                },
            });

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

    const getStockBySupplyAndDeposits = async () => {
        setIsLoading(true);
        let supplyByDeposits: SupplyByDeposits[] = [];
        try {
            if (!supplyActive) throw new Error("Insumo no encontrado.");
            const promisesResult = await Promise.all([
                dbContext.stockByLots.find({
                    selector: {
                        "$and": [
                            { "supplyId": supplyActive._id },
                            { "accountId": user?.accountId }
                        ],
                    }
                }),
                dbContext.deposits.find({ selector: { "accountId": user?.accountId } }),
                dbContext.stockMovements.find({
                    selector: {
                        "$and": [
                            { "supplyId": supplyActive._id },
                            { "accountId": user?.accountId }
                        ],
                    }
                })
            ]);
            const [stockBySupplies, deposits, movements] = promisesResult;
            let depositIds = stockBySupplies.docs.map(m => m.depositId);
            //Agrupar los id de depositos 
            const groupDepositsId = Array.from(new Set(depositIds));
            groupDepositsId.forEach(depositId => {
                // Obtener deposito
                const depositDto = deposits.docs.find(d => d._id === depositId);
                if (!depositDto) throw new Error("Deposito no encontrado.");
                //Movimientos del deposito 
                const depositMovements = movements.docs.filter(m => m.depositId === depositId);

                //Calcular el stock por deposito, ubicacion y nroLote
                depositDto.locations.forEach(location => {
                    const stockByLots = stockBySupplies.docs.filter(stockBySupply =>
                        (stockBySupply.depositId === depositId && stockBySupply.location === location)
                    );
                    stockByLots.forEach(({ currentStock, nroLot }) => {
                        supplyByDeposits.push({
                            deposit: depositDto,
                            supply: supplyActive,
                            location,
                            nroLot,
                            currentStock,
                            dueDate: depositMovements[0].dueDate, // TODO ?
                            reservedStock: 0,
                            movements: depositMovements.filter(mov => mov.nroLot.toLowerCase() === nroLot.toLowerCase())
                        });
                    })
                });
            });
            setSupplyByDeposits(supplyByDeposits);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error('Error al cargar los documentos:', error);
        }
    }

    const getStockBySupplies = async () => {
        setIsLoading(true);
        let stockBySupplies: StockBySupply[] = [];
        try {
            if (!user) throw new Error("User not found.");
            const promisesResult = await Promise.all([
                // dbContext.stockMovements.find({ selector: { "accountId": user.accountId } }),
                dbContext.stockByLots.find({ selector: { "accountId": user.accountId } }),
                dbContext.supplies.find({
                    selector: {
                        $or: [
                            { "accountId": user?.accountId },
                            { "generico": true }
                        ]
                    }
                })
            ]);
            const [stockBySuppplies, supplies] = promisesResult;
            supplies.docs.forEach(supplyDto => {
                const stockBySupply = stockBySuppplies.docs.filter(m => (m.supplyId === supplyDto._id));
                //Calcular el stock por insumo
                let currentStockOfSupply = 0;
                stockBySupply.forEach(stock => { currentStockOfSupply += stock.currentStock; });
                stockBySupplies.push({
                    supply: supplyDto,
                    currentStock: currentStockOfSupply,
                    reservedStock: supplyDto.reservedStock
                });
            });
            setStockBySupplies(stockBySupplies);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error('Error al cargar los documentos:', error);
        }
    }

    const getStockByDepositAndLocation = async () => {
        setIsLoading(true);
        try {
            let supplyByDeposits: SupplyByDeposits[] = [];
            const promisesResult = await Promise.all([
                dbContext.stockByLots.find({ selector: { "accountId": user?.accountId } }),
                dbContext.deposits.find({ selector: { "accountId": user?.accountId } }),
                dbContext.supplies.find({ selector: { "accountId": user?.accountId } })
            ]);
            const [stockBySupplies, deposits, supplies] = promisesResult;
            //Agrupar los id de insumo 
            let supplyIds = stockBySupplies.docs.map(m => m.supplyId);
            const groupSupplyIds = Array.from(new Set(supplyIds));

            deposits.docs.forEach(depositDto => {
                //Movimientos del deposito 
                // const depositMovements = movements.docs.filter(m => m.depositId === depositDto._id);
                groupSupplyIds.forEach(supplyId => {
                    //Obtenemos el insumo
                    const supplyDto = supplies.docs.find(s => s._id === supplyId);
                    if (!supplyDto) throw new Error("Insumo no encontrado.");

                    //Calcular el stock total del deposito por insumo
                    let currentStockOfDeposit = 0;
                    stockBySupplies.docs.forEach(stockBySupply => {
                        if (stockBySupply.supplyId === supplyId && stockBySupply.depositId === depositDto._id) {
                            currentStockOfDeposit += stockBySupply.currentStock;
                        }
                    });
                    //Calcular el stock por deposito, ubicacion y nroLote
                    let nroLotsStock: StockByNroLot[] = [];
                    depositDto.locations.forEach(l => {
                        const stockByLots = stockBySupplies.docs.filter(({ supplyId: id, depositId, location }) =>
                            (supplyId === id && depositId === depositDto._id && location === l)
                        );
                        stockByLots.forEach(({ nroLot, currentStock, }) => {
                            nroLotsStock.push({
                                nroLot,
                                location: l,
                                currentStock,
                                reservedStock: supplyDto.reservedStock
                            })
                        });
                    });
                    supplyByDeposits.push({
                        deposit: depositDto,
                        supply: supplyDto,
                        location: "",
                        nroLot: "",
                        currentStock: currentStockOfDeposit,
                        dueDate: "-",
                        reservedStock: supplyDto.reservedStock,
                        nroLotsStock,
                    });
                })
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
            if (!newSupply.name.trim()) {
                throw new Error("Por favor, ingrese un nombre para el insumo.");
            }

            if (!user) {
                throw new Error("Usuario no encontrado.");
            }

            const response = await dbContext.supplies.post({
                ...newSupply,
                accountId: user.accountId,
                countryId: user.countryId,
            });

            setIsLoading(false);

            if (response.ok) {
                Swal.fire("Insumo", "Agregado con éxito.", "success");
            }
        } catch (error) {
            console.log("Error al crear el documento: ", error);
            Swal.fire("Ups", "Ocurrió un error inesperado", "error");
            setIsLoading(false);
        }
    };

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

    const deleteSupply = async (supplyId: string, removeSupply: string) => {

        try {
            const response = await dbContext.supplies.remove(supplyId, removeSupply);
            setIsLoading(false);

            if (response.ok)
                Swal.fire('Insumo', 'Eliminado.', 'success');

            navigate('/init/overview/supply');
        } catch (error) {
            console.log('Error al actualizar el documento: ', error);
            Swal.fire('Ups', 'Ocurrio un error inesperado ', 'error');
            setIsLoading(false);
        }
    }

    const addReservedStock = async (supplyId: string, quantity: number) => {
        console.log("SUPPLY ID PROVIDED: ", supplyId);
        console.log("SUPPLIES AVAILABLE: ", supplies);
        setIsLoading(true);
        try {
            const supply = supplies.find(supply => supply._id === supplyId);
            if (!supply) {
                console.error("Supply not found with ID:", supplyId);
                throw new Error("Insumo no encontrado.");
            }

            const updatedSupply: Supply = {
                ...supply,
                reservedStock: supply.reservedStock + quantity
            };

            const response = await dbContext.supplies.put(updatedSupply);
            if (response.ok) {
                setSupplies(supplies.map(s => (s._id === supplyId ? updatedSupply : s)));
                Swal.fire('Insumo', 'Stock reservado agregado con éxito.', 'success');
            }
            setIsLoading(false);
        } catch (error) {
            console.log('Error al agregar stock reservado: ', error);
            Swal.fire('Ups', 'Ocurrió un error inesperado', 'error');
            setIsLoading(false);
        }
    };


    const removeReservedStock = async (supplyId: string, quantity: number) => {
        setIsLoading(true);
        try {
            const supply = supplies.find(supply => supply._id === supplyId);
            if (!supply) throw new Error("Insumo no encontrado.");
            if (supply.reservedStock < quantity) throw new Error("Stock reservado insuficiente.");

            const updatedSupply: Supply = {
                ...supply,
                reservedStock: supply.reservedStock - quantity,
                currentStock: supply.currentStock - quantity
            };

            const response = await dbContext.supplies.put(updatedSupply);
            if (response.ok) {
                setSupplies(supplies.map(s => (s._id === supplyId ? updatedSupply : s)));
                Swal.fire('Insumo', 'Stock reservado removido con éxito.', 'success');
            }
            setIsLoading(false);
        } catch (error) {
            console.log('Error al remover stock reservado: ', error);
            Swal.fire('Ups', 'Ocurrió un error inesperado', 'error');
            setIsLoading(false);
        }
    };


    return {
        supplies,
        isLoading,
        supplyByDeposits,
        supplyError,
        stockBySupplies,
        // supplies = documents.filter(supply => supply.currentStock === 0);


        setSupplies,
        getSupplies,
        createSupply,
        updateSupply,
        deleteSupply,
        setSupplyError,
        addReservedStock,
        removeReservedStock,
        getStockBySupplyAndDeposits,
        getStockBySupplies,
        getStockByDepositAndLocation,
    }

}