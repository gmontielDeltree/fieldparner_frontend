import Swal from 'sweetalert2';
import { DepositDestination, StockMovement, StockMovementItem, Stock, Supply, TypeMovement, MovementType, Crop } from "../types";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { dbContext } from '../services';
import { useAppDispatch, useAppSelector } from './useRedux';
import { onLogout } from '../redux/auth';


export const useStockMovement = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const [stockMovements, setStockMovements] = useState<StockMovementItem[]>([]);
    const [stockByLots, setStockByLots] = useState<Stock[]>([]);
    const [movementsType, setMovementsType] = useState<MovementType[]>([]);
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const getStockMovements = async () => {
        setIsLoading(true);
        try {
            const result = await dbContext.stockMovements.find({
                selector: { "accountId": user?.accountId }
            });
            const promisesResult = await Promise.all([
                dbContext.deposits.find({ selector: { "accountId": user?.accountId } }),
                dbContext.supplies.find({
                    selector: {
                        $or: [
                            { "accountId": user?.accountId },
                            { "generico": true }
                        ]
                    },
                }),
                dbContext.crops.allDocs({ include_docs: true })
            ]);
            const deposits = promisesResult[0].docs;
            const supplies = promisesResult[1].docs;
            const crops = promisesResult[2].rows.map(row => row.doc as Crop);

            setIsLoading(false);

            if (result.docs.length) {
                const documents: StockMovementItem[] = result.docs.map((sm) => {
                    return {
                        ...sm,
                        deposit: deposits.find(d => d._id === sm.depositId),
                        supply: supplies.find(s => s._id === sm.supplyId),
                        crop: crops.find(c => c._id === sm.cropId)
                    } as StockMovementItem;
                });
                setStockMovements(documents);
            }
            else
                setStockMovements([]);

        } catch (error) {
            console.log(error)
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    const getStockBySupply = async (supplyId: string, depositId: string, location: string, nroLot: string) => {
        setIsLoading(true);
        try {
            const existingNroLot = await dbContext.stock.find({
                selector: {
                    "$and": [
                        { "supplyId": supplyId },
                        { "depositId": depositId },
                        { "location": location },
                        { "nroLot": nroLot }
                    ],
                }
            });
            setIsLoading(false);
            return existingNroLot.docs[0];
        } catch (error) {
            setIsLoading(false);
            console.log(error);
        }
    }

    const getStockByCrop = async (cropId: string, depositId: string, location: string, nroLot: string) => {
        setIsLoading(true);
        try {
            const foundStockCrop = await dbContext.cropStockControl.find({
                selector: {
                    "$and": [
                        { "cropId": cropId },
                        { "depositId": depositId },
                        { "location": location },
                        { "nroLot": nroLot }
                    ],
                }
            });

            setIsLoading(false);
            return foundStockCrop.docs[0];
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            return null;
        }
    }

    const addStockMovementCrop = async (newMovement: StockMovement, cropData: Crop, depositDestination?: DepositDestination) => {
        try {
            if (!cropData._id) return false;

            let responseAll = null;
            let promisesStockCrop: Promise<PouchDB.Core.Response> | undefined = undefined;
            const accountId = newMovement.accountId;
            const { typeMovement, isIncome, amount, depositId, nroLot, location } = newMovement;
            const amountValue = Number(amount);
            let existingStockCrop = await getStockByCrop(cropData._id, depositId, location, nroLot);

            if (!(typeMovement === TypeMovement.TransferenciaDeposito.toString())) {
                if (isIncome) {
                    if (existingStockCrop) {
                        existingStockCrop.currentStock += amountValue;
                        promisesStockCrop = dbContext.cropStockControl.put(existingStockCrop);
                    } else {
                        promisesStockCrop = dbContext.cropStockControl.post({
                            accountId: accountId,
                            cropId: cropData._id,
                            nroLot,
                            depositId,
                            location,
                            currentStock: amountValue
                        });
                    }
                } else {
                    if (!existingStockCrop) {
                        throw new Error("Stock de cultivo no encontrado.");
                    }
                    existingStockCrop.currentStock -= amountValue;
                    promisesStockCrop = dbContext.cropStockControl.put(existingStockCrop);
                }
                responseAll = await Promise.all([
                    promisesStockCrop,
                    dbContext.stockMovements.post(newMovement)
                ]);
            } else {
                if (!depositDestination || !existingStockCrop) {
                    throw new Error("Información de destino no provista o stock inicial no encontrado");
                }
                let existingLotInDepositDestination = await getStockByCrop(
                    cropData._id,
                    depositDestination.depositId,
                    depositDestination.location,
                    existingStockCrop.nroLot);
                let promiseAll = [
                    dbContext.cropStockControl.put({ ...existingStockCrop, currentStock: existingStockCrop.currentStock - amountValue }),
                    dbContext.stockMovements.post({ ...newMovement, isIncome: false }),
                    dbContext.stockMovements.post({
                        ...newMovement,
                        depositId: depositDestination.depositId,
                        location: depositDestination.location,
                        isIncome: true,
                    })
                ];

                if (existingLotInDepositDestination) {
                    promiseAll.push(dbContext.cropStockControl.put({
                        ...existingLotInDepositDestination,
                        depositId: depositDestination.depositId,
                        location: depositDestination.location,
                        currentStock: existingLotInDepositDestination.currentStock + amountValue
                    }));
                } else {
                    promiseAll.push(dbContext.cropStockControl.post({
                        accountId: accountId,
                        nroLot: existingStockCrop.nroLot,
                        cropId: existingStockCrop.cropId,
                        depositId: depositDestination.depositId,
                        location: depositDestination.location,
                        currentStock: amountValue
                    }));
                }
                responseAll = await Promise.all(promiseAll);
            }
            return !!responseAll
        } catch (error) {
            throw error;
        }
    }

    const addStockMovementSupply = async (newMovement: StockMovement, supplyData: Supply, depositDestination?: DepositDestination) => {
        try {
            if (!supplyData._id) return false;
            let responseAll = null;
            let promiseStockByLot: Promise<PouchDB.Core.Response> | undefined = undefined;
            const { typeMovement, isIncome, amount, depositId, nroLot, location } = newMovement;
            const accountId = newMovement.accountId;
            const amountValue = Number(amount);

            let existingStock = await getStockBySupply(supplyData._id, depositId, location, nroLot);

            if (!(typeMovement === TypeMovement.TransferenciaDeposito.toString())) {
                if (isIncome) {
                    if (existingStock) {
                        existingStock.currentStock += amountValue;
                        promiseStockByLot = dbContext.stock.put(existingStock);
                    } else {
                        promiseStockByLot = dbContext.stock.post({
                            accountId: accountId,
                            supplyId: supplyData._id,
                            nroLot,
                            depositId,
                            location,
                            currentStock: amountValue
                        });
                    }
                } else {
                    if (!existingStock) {
                        throw new Error("Stock de insumo no encontrado.");
                    }
                    existingStock.currentStock -= amountValue;
                    promiseStockByLot = dbContext.stock.put(existingStock);
                }
                responseAll = await Promise.all([
                    promiseStockByLot,
                    dbContext.stockMovements.post(newMovement)
                ]);
            } else {
                if (!depositDestination || !existingStock) {
                    throw new Error("Información de destino no provista o stock inicial no encontrado");
                }
                let existingLotInDepositDestination = await getStockBySupply(supplyData._id, depositDestination.depositId, depositDestination.location, existingStock.nroLot);

                let promiseAll = [
                    dbContext.stock.put({ ...existingStock, currentStock: existingStock.currentStock - amountValue }),
                    dbContext.stockMovements.post({ ...newMovement, isIncome: false }),
                    dbContext.stockMovements.post({
                        ...newMovement,
                        depositId: depositDestination.depositId,
                        location: depositDestination.location,
                        isIncome: true
                    })
                ];

                if (existingLotInDepositDestination) {
                    promiseAll.push(dbContext.stock.put({
                        ...existingLotInDepositDestination,
                        depositId: depositDestination.depositId,
                        location: depositDestination.location,
                        currentStock: existingLotInDepositDestination.currentStock + amountValue
                    }));
                } else {
                    promiseAll.push(dbContext.stock.post({
                        accountId: newMovement.accountId,
                        nroLot: existingStock.nroLot,
                        supplyId: existingStock.supplyId,
                        depositId: depositDestination.depositId,
                        location: depositDestination.location,
                        currentStock: amountValue
                    }));
                }

                responseAll = await Promise.all(promiseAll);
            }

            return !!responseAll;

        } catch (error) {
            throw error;
        }
    }

    const addNewStockMovement = async (
        newMovement: StockMovement,
        supplyData: Supply | null,
        cropData: Crop | null,
        depositDestination?: DepositDestination) => {
        try {
            setIsLoading(true);
            if (!user) {
                dispatch(onLogout("Session expired."));
                setIsLoading(false);
                return;
            };
            newMovement.currency = user.currency;
            newMovement.accountId = user.accountId;
            let responseAll = null;

            if (supplyData)
                responseAll = await addStockMovementSupply(newMovement, supplyData, depositDestination);
            else if (cropData) {
                responseAll = await addStockMovementCrop(newMovement, cropData, depositDestination);
            }

            setIsLoading(false);
            if (responseAll)
                Swal.fire('Nuevo Movimiento de Stock', 'Agregado.', 'success');
            else
                Swal.fire('Nuevo Movimiento de Stock', 'Verifica los datos ingresados.', 'error');

            if (newMovement.typeMovement !== TypeMovement.Labores) {
                navigate('/init/overview/stock-movements');
            }

        } catch (error) {
            console.error("Error en addNewStockMovement:", error);
            Swal.fire('Ups', "Ocurrio un error inesperado.", 'error');
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    const updateMovement = async (updateMovement: StockMovement) => {
        setIsLoading(true);
        try {
            const response = await dbContext.stockMovements.put(updateMovement);
            setIsLoading(false);

            if (response.ok)
                Swal.fire('Movimiento de Stock', 'Actualizado.', 'success');

            navigate("/init/overview/stock-movements");
        } catch (error) {
            console.log(error)
            Swal.fire('Error', 'No hay registro de la Entidad Social.', 'error');
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    const getNroLotsBySupplyAndDeposit = async (supplyId: string, depositId: string, location: string) => {
        setIsLoading(true);

        try {
            const result = await dbContext.stock.find({
                selector: {
                    "$and": [
                        { "supplyId": supplyId },
                        { "depositId": depositId },
                        { "location": location }
                    ],
                }
            });
            if (result.docs.length) {
                const documents: Stock[] = result.docs;
                setStockByLots(documents);
            }
            else setStockByLots([]);

            setIsLoading(false);
        } catch (error) {
            console.log(error)
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    // const transformStock = async (
    //     suppliesToBeDiscounted: TransformSupply[],
    //     suppliesToAdd: TransformSupply[],
    //     stockBySupplies: StockByLot[],
    //     detail: string,
    //     operationDate: string) => {
    //     setIsLoading(true);
    //     try {
    //         let newMovements: StockMovement[] = [];

    //         if (!user) throw new Error();
    //         const { accountId, id: userId } = user;
    //         //Recorremos cada insumo/deposito/ubicacion/lote para crear su movimiento.
    //         suppliesToBeDiscounted.forEach(ts => {
    //             if (!ts.deposit._id || !ts.supply._id) return;
    //             let newMovement: StockMovement = {
    //                 accountId,
    //                 userId,
    //                 amount: ts.amount,
    //                 creationDate: today,
    //                 campaignId: "",
    //                 currency: "",
    //                 voucher: "",
    //                 totalValue: 0,
    //                 hours: "", //TODO: ?
    //                 depositId: ts.deposit._id,
    //                 supplyId: ts.supply._id,
    //                 detail,
    //                 operationDate,
    //                 dueDate: ts.dueDate,
    //                 isIncome: false,
    //                 location: ts.location,
    //                 movement: Movement.Manual,
    //                 nroLot: ts.nroLot,
    //                 typeMovement: TypeMovement.Transformacion,
    //             }
    //             newMovements.push(newMovement);
    //         });
    //         // Creamos los movimientos de insumo/deposito/ubicacion/lote 
    //         suppliesToAdd.forEach(sa => {
    //             if (!sa.deposit._id || !sa.supply._id) return;
    //             newMovements.push({
    //                 accountId,
    //                 userId,
    //                 amount: sa.amount,
    //                 creationDate: today,
    //                 campaignId: "",
    //                 currency: "",
    //                 voucher: "",
    //                 totalValue: 0,
    //                 hours: "", //TODO: ?
    //                 depositId: sa.deposit._id,
    //                 supplyId: sa.supply._id,
    //                 detail,
    //                 operationDate,
    //                 dueDate: sa.dueDate,
    //                 isIncome: true,
    //                 location: sa.location,
    //                 movement: Movement.Manual,
    //                 nroLot: sa.nroLot,
    //                 typeMovement: TypeMovement.Transformacion,
    //             });
    //         });
    //         //Previamente validado
    //         // Actualizar en la tabla auxiliar para ese insumo/deposito/ubicacion/lote.
    //         let promisesAll: Promise<Array<PouchDB.Core.Response | PouchDB.Core.Error>>[] = [
    //             dbContext.stockMovements.bulkDocs(newMovements),
    //             dbContext.stockByLots.bulkDocs(stockBySupplies),
    //         ];
    //         const responseAll = await Promise.all(promisesAll);

    //         if (responseAll)
    //             Swal.fire('Transformación de Stock', 'Realizado con exito.', 'success');
    //         else
    //             Swal.fire('Transformación de Stock', 'Verifica los datos ingresados.', 'error');

    //         setIsLoading(false);
    //     } catch (error) {
    //         console.log(error)
    //         setIsLoading(false);
    //         if (error) setError(error);
    //     }
    // }

    const getMovementsType = async () => {
        try {
            setIsLoading(true);
            const response = await dbContext.movementsType.allDocs({ include_docs: true });

            if (response)
                setMovementsType(response.rows.map(row => row.doc as MovementType));
            else
                setMovementsType([]);

            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.log(error)
        }
    }

    return {
        //* Props
        stockMovements,
        stockByLots,
        movementsType,
        error,
        isLoading,

        //*Methods
        setStockMovements,
        getStockMovements,
        addNewStockMovement,
        updateMovement,
        getNroLotsBySupplyAndDeposit,
        // transformStock,
        getStockBySupply,
        getMovementsType,
        getStockByCrop
    }
}