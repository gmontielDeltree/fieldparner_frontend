import Swal from 'sweetalert2';
// import PouchDB from 'pouchdb';
import { DepositDestination, StockMovement, StockMovementItem, StockByLot, Supply, TypeMovement, TransformSupply, Movement } from "../types";
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
            setIsLoading(false);
            return existingNroLot.docs[0];
        } catch (error) {
            setIsLoading(false);
            console.log(error)
        }
    }

    //Si nroLot es "" , quiere decir q no aplica por stock
    const addNewStockMovement = async (newMovement: StockMovement, supplyDto: Supply, depositDestination?: DepositDestination) => {
        setIsLoading(true);
        let responseAll = null; let promiseStockByLot: Promise<PouchDB.Core.Response> | undefined = undefined;
        try {
            if (!user || !supplyDto._id) throw new Error();

            const { typeMovement, isIncome, amount, depositId, nroLot, location } = newMovement;
            const accountId = user.accountId;
            const amountValue = Number(amount);
            //Chequeamos si existe en la tabla auxiliar ese nro de lote
            let existingStock = await getStock(supplyDto._id, depositId, location, nroLot);

            if (!(typeMovement === TypeMovement.TransferenciaDeposito.toString())) {
                if (isIncome) {
                    supplyDto.currentStock += amountValue;
                    //Si existe , le sumamos la cantidad al stock actual
                    if (existingStock) {
                        existingStock.currentStock += amountValue;
                        promiseStockByLot = dbContext.stockByLots.put(existingStock);
                    } else {
                        //Si no existe, creamos un nuevo registro.
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
                    //Si es una salida, debe tener stock del insumo en la tabla auxiliar.
                    if (!existingStock) throw new Error("Stock por insumo no encontrado.");
                    supplyDto.currentStock -= amountValue;
                    existingStock.currentStock -= amountValue;
                    promiseStockByLot = dbContext.stockByLots.put(existingStock);
                }
                responseAll = await Promise.all([
                    promiseStockByLot,
                    dbContext.supplies.put(supplyDto),
                    dbContext.stockMovements.post({ ...newMovement, accountId, userId: user.id })
                ]);
            }
            else {
                //Chequeamos que exista destino con deposito y ubicacion
                if (!depositDestination || !existingStock) throw new Error();
                //Chequeamos si ya tiene stock  para ese insumo, deposito y ubicacion. 
                let existingLotInDepositDestination = await getStock(supplyDto._id, depositDestination.depositId, depositDestination.location, existingStock.nroLot);
                let promiseAll: Promise<PouchDB.Core.Response>[] = [
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
                // Si existe le actualizamos el stock actual, caso contrario creamos nuevo registro.
                if (existingLotInDepositDestination) {
                    promiseAll.push(dbContext.stockByLots.put({
                        ...existingLotInDepositDestination,
                        depositId: depositDestination.depositId,
                        location: depositDestination.location,
                        currentStock: existingLotInDepositDestination.currentStock + amountValue
                    }))
                }
                else {
                    promiseAll.push(dbContext.stockByLots.post({
                        accountId: user.accountId,
                        nroLot: existingStock.nroLot,
                        supplyId: existingStock.supplyId,
                        depositId: depositDestination.depositId,
                        location: depositDestination.location,
                        currentStock: amountValue
                    }))
                }
                responseAll = await Promise.all(promiseAll);
            }
            setIsLoading(false);

            if (responseAll)
                Swal.fire('Nuevo Movimiento de Stock', 'Agregado.', 'success');
            else
                Swal.fire('Nuevo Movimiento de Stock', 'Verifica los datos ingresados.', 'error');

            navigate('/init/overview/stock-movements');

        } catch (error) {
            console.log(error)
            Swal.fire('Ups', 'Ocurrio un error inesperado ', 'error');
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
                    campaignId: 0,
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
                    campaignId: 0,
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

    return {
        //* Props
        stockMovements,
        stockByLots,
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

    }
}