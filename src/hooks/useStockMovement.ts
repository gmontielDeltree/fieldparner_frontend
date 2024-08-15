import Swal from 'sweetalert2';
// import PouchDB from 'pouchdb';
import { DepositDestination, StockMovement, StockMovementItem, StockByLot, Supply, TypeMovement, TransformSupply, Movement, MovementType } from "../types";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { dbContext } from '../services';
import { useAppSelector } from './useRedux';
import { getShortDate } from '../helpers/dates';


const today = getShortDate();

export const useStockMovement = () => {
    const navigate = useNavigate();
    const { user } = useAppSelector(state => state.auth);
    const [stockMovements, setStockMovements] = useState<StockMovementItem[]>([]);
    const [stockByLots, setStockByLots] = useState<StockByLot[]>([]);
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
                dbContext.supplies.find({ selector: { "accountId": user?.accountId } })
            ]);
            const deposits = promisesResult[0].docs;
            const supplies = promisesResult[1].docs;

            setIsLoading(false);

            if (result.docs.length) {
                const documents: StockMovementItem[] = result.docs.map((sm) => {
                    return {
                        ...sm,
                        deposit: deposits.find(d => d._id === sm.depositId),
                        supply: supplies.find(s => s._id === sm.supplyId)
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

    const getStock = async (supplyId: string, depositId: string, location: string, nroLot: string) => {
        console.log(`Fetching stock with Supply ID: ${supplyId}, Deposit ID: ${depositId}, Location: ${location}, Lot Number: ${nroLot}`);
        setIsLoading(true);
        try {
            const existingNroLot = await dbContext.stockByLots.find({
                selector: {
                    "$and": [
                        { "supplyId": supplyId },
                        { "depositId": depositId },
                        { "location": location },
                        { "nroLot": nroLot }
                    ],
                }
            });
            console.log('Database response:', existingNroLot.docs);
            setIsLoading(false);
            return existingNroLot.docs[0];
        } catch (error) {
            console.log('Error fetching stock:', error);
            setIsLoading(false);
            console.log(error);
        }
    }

    // Si nroLot es "" , quiere decir q no aplica por stock
    const addNewStockMovement = async (newMovement: StockMovement, supplyDto: Supply, depositDestination?: DepositDestination) => {
        setIsLoading(true);
        let responseAll = null;
        let promiseStockByLot: Promise<PouchDB.Core.Response> | undefined = undefined;

        try {
            console.log("Inicio de addNewStockMovement", newMovement, supplyDto, depositDestination);

            if (!user || !supplyDto._id) {
                console.log("Error: Usuario no logueado o ID de suministro no provisto");
                throw new Error("Usuario no logueado o ID de suministro no provisto");
            }

            const { typeMovement, isIncome, amount, depositId, nroLot, location } = newMovement;
            const accountId = user.accountId;
            const amountValue = Number(amount);

            console.log("Datos procesados de newMovement:", { typeMovement, isIncome, amount, amountValue, depositId, nroLot, location });
            console.log("Preparing to fetch existing stock with parameters:", supplyDto._id, depositId, location, nroLot);
            let existingStock = await getStock(supplyDto._id, depositId, location, nroLot);
            console.log("Stock existente:", existingStock);

            if (!(typeMovement === TypeMovement.TransferenciaDeposito.toString())) {
                if (isIncome) {
                    supplyDto.currentStock += amountValue;
                    console.log("Actualización de stock de entrada:", supplyDto.currentStock);

                    if (existingStock) {
                        existingStock.currentStock += amountValue;
                        promiseStockByLot = dbContext.stockByLots.put(existingStock);
                    } else {
                        console.log("Creación de nuevo stock por no existir previamente.");
                        promiseStockByLot = dbContext.stockByLots.post({
                            accountId: user.accountId,
                            supplyId: supplyDto._id,
                            nroLot,
                            depositId,
                            location,
                            currentStock: amountValue
                        });
                    }
                } else {
                    if (!existingStock) {
                        console.log("Error: Stock de insumo no encontrado para salida.");
                        throw new Error("Stock por insumo no encontrado.");
                    }
                    supplyDto.currentStock -= amountValue;
                    existingStock.currentStock -= amountValue;
                    promiseStockByLot = dbContext.stockByLots.put(existingStock);
                }
                responseAll = await Promise.all([
                    promiseStockByLot,
                    dbContext.supplies.put(supplyDto),
                    dbContext.stockMovements.post({ ...newMovement, accountId, userId: user.id })
                ]);
                console.log("Respuesta de operaciones asincrónicas:", responseAll);
            } else {
                if (!depositDestination || !existingStock) {
                    console.log("Error: Información de destino no provista o stock inicial no encontrado.");
                    throw new Error("Información de destino no provista o stock inicial no encontrado");
                }

                let existingLotInDepositDestination = await getStock(supplyDto._id, depositDestination.depositId, depositDestination.location, existingStock.nroLot);
                console.log("Stock en destino:", existingLotInDepositDestination);

                let promiseAll = [
                    dbContext.stockByLots.put({ ...existingStock, currentStock: existingStock.currentStock - amountValue }),
                    dbContext.stockMovements.post({ ...newMovement, isIncome: false, accountId, userId: user.id }),
                    dbContext.stockMovements.post({
                        ...newMovement,
                        depositId: depositDestination.depositId,
                        location: depositDestination.location,
                        isIncome: true,
                        accountId,
                        userId: user.id
                    })
                ];

                if (existingLotInDepositDestination) {
                    promiseAll.push(dbContext.stockByLots.put({
                        ...existingLotInDepositDestination,
                        depositId: depositDestination.depositId,
                        location: depositDestination.location,
                        currentStock: existingLotInDepositDestination.currentStock + amountValue
                    }));
                } else {
                    promiseAll.push(dbContext.stockByLots.post({
                        accountId: user.accountId,
                        nroLot: existingStock.nroLot,
                        supplyId: existingStock.supplyId,
                        depositId: depositDestination.depositId,
                        location: depositDestination.location,
                        currentStock: amountValue
                    }));
                }

                responseAll = await Promise.all(promiseAll);
                console.log("Respuestas de transferencias y movimientos:", responseAll);
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
            Swal.fire('Ups', String(error), 'error');
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
            const result = await dbContext.stockByLots.find({
                selector: {
                    "$and": [
                        { "supplyId": supplyId },
                        { "depositId": depositId },
                        { "location": location }
                    ],
                }
            });
            if (result.docs.length) {
                const documents: StockByLot[] = result.docs;
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

    const transformStock = async (
        suppliesToBeDiscounted: TransformSupply[],
        suppliesToAdd: TransformSupply[],
        stockBySupplies: StockByLot[],
        detail: string,
        operationDate: string) => {
        setIsLoading(true);
        try {
            let newMovements: StockMovement[] = [];

            if (!user) throw new Error();
            const { accountId, id: userId } = user;
            //Recorremos cada insumo/deposito/ubicacion/lote para crear su movimiento.
            suppliesToBeDiscounted.forEach(ts => {
                if (!ts.deposit._id || !ts.supply._id) return;
                let newMovement: StockMovement = {
                    accountId,
                    userId,
                    amount: ts.amount,
                    creationDate: today,
                    campaignId: "",
                    currency: "",
                    voucher: "",
                    totalValue: 0,
                    hours: "", //TODO: ?
                    depositId: ts.deposit._id,
                    supplyId: ts.supply._id,
                    detail,
                    operationDate,
                    dueDate: ts.dueDate,
                    isIncome: false,
                    location: ts.location,
                    movement: Movement.Manual,
                    nroLot: ts.nroLot,
                    typeMovement: TypeMovement.Transformacion,
                }
                newMovements.push(newMovement);
            });
            // Creamos los movimientos de insumo/deposito/ubicacion/lote 
            suppliesToAdd.forEach(sa => {
                if (!sa.deposit._id || !sa.supply._id) return;
                newMovements.push({
                    accountId,
                    userId,
                    amount: sa.amount,
                    creationDate: today,
                    campaignId: "",
                    currency: "",
                    voucher: "",
                    totalValue: 0,
                    hours: "", //TODO: ?
                    depositId: sa.deposit._id,
                    supplyId: sa.supply._id,
                    detail,
                    operationDate,
                    dueDate: sa.dueDate,
                    isIncome: true,
                    location: sa.location,
                    movement: Movement.Manual,
                    nroLot: sa.nroLot,
                    typeMovement: TypeMovement.Transformacion,
                });
            });
            //Previamente validado
            // Actualizar en la tabla auxiliar para ese insumo/deposito/ubicacion/lote.
            let promisesAll: Promise<Array<PouchDB.Core.Response | PouchDB.Core.Error>>[] = [
                dbContext.stockMovements.bulkDocs(newMovements),
                dbContext.stockByLots.bulkDocs(stockBySupplies),
            ];
            const responseAll = await Promise.all(promisesAll);

            if (responseAll)
                Swal.fire('Transformación de Stock', 'Realizado con exito.', 'success');
            else
                Swal.fire('Transformación de Stock', 'Verifica los datos ingresados.', 'error');

            setIsLoading(false);
        } catch (error) {
            console.log(error)
            setIsLoading(false);
            if (error) setError(error);
        }
    }

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
        transformStock,
        getStock,
        getMovementsType
    }
}