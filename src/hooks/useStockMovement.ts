import { Stock, StockItem, TipoStock } from '../interfaces/stock';
import { DepositDestination, StockMovement, StockMovementItem, Supply, TypeMovement, MovementType, Crop, GetStockRequest, GetControlStockCropRequest, Campaign } from "../types";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { dbContext } from '../services';
import { useAppDispatch, useAppSelector } from './useRedux';
import { onLogout } from '../redux/auth';
import { useTranslation } from 'react-i18next';
import { NotificationService } from "../services/notificationService";

export const useStockMovement = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const [stockMovements, setStockMovements] = useState<StockMovementItem[]>([]);
    const [stockData, setStockData] = useState<StockItem[]>([]);
    const [movementsType, setMovementsType] = useState<MovementType[]>([]);
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

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
                dbContext.crops.allDocs({ include_docs: true }),
                dbContext.campaigns.find({ selector: { "accountId": user?.accountId } }),
            ]);
            const deposits = promisesResult[0].docs;
            const supplies = promisesResult[1].docs;
            const crops = promisesResult[2].rows.map(row => row.doc as Crop);
            const campaigns = promisesResult[3].docs as Campaign[];

            setIsLoading(false);

            if (result.docs.length) {
                const documents: StockMovementItem[] = result.docs.map((sm) => {
                    return {
                        ...sm,
                        deposit: deposits.find(d => d._id === sm.depositId),
                        supply: supplies.find(s => s._id === sm.supplyId),
                        crop: crops.find(c => c._id === sm.cropId),
                        campaign: campaigns.find(c => c.campaignId === sm.campaignId),
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

    const getStock = async (request: GetStockRequest, fullItem = false) => {
        try {
            setIsLoading(true);
            if (!user) { dispatch(onLogout(t("session_expired"))); return; }

            // Para cultivos, leer de cropDeposits
            if (request.tipo === TipoStock.CULTIVO) {
                const cropQuery: any = {
                    selector: {
                        accountId: user.accountId,
                        ...(request.id && { cropId: request.id }),
                        ...(request.campaignId && { campaignId: request.campaignId }),
                        ...(request.depositId && { depositId: request.depositId }),
                    }
                };
                const responseCropDeposits = await dbContext.cropDeposits.find(cropQuery);
                let dataStock: StockItem[] = responseCropDeposits.docs.map((cd: any) => ({
                    _id: cd._id,
                    _rev: cd._rev,
                    id: cd.cropId,
                    tipo: TipoStock.CULTIVO,
                    accountId: cd.accountId,
                    depositId: cd.depositId,
                    location: cd.location || '',
                    nroLot: cd.nroLot || '',
                    campaignId: cd.campaignId,
                    fieldId: cd.fieldId || '',
                    fieldLot: cd.lotId || '',
                    currentStock: cd.currentStockKg || 0,
                    reservedStock: cd.reservedStockKg || 0,
                    lastUpdate: cd.lastUpdate,
                }));

                if (fullItem) {
                    const responseAll = await Promise.all([
                        dbContext.deposits.find({ selector: { "accountId": user?.accountId } }),
                        dbContext.crops.allDocs({ include_docs: true }),
                        dbContext.campaigns.find({ selector: { "accountId": user?.accountId } }),
                        dbContext.fields.find({ selector: { "accountId": user?.accountId } })
                    ]);
                    const deposits = responseAll[0].docs;
                    const crops = responseAll[1].rows.map(row => row.doc as Crop);
                    const campaigns = responseAll[2].docs;
                    const fields = responseAll[3].docs;

                    dataStock.forEach((stock) => {
                        if (stock.id) {
                            const crop = crops.find(c => c._id === stock.id);
                            stock.dataCrop = crop;
                        }
                        if (stock.depositId) {
                            const deposit = deposits.find(d => d._id === stock.depositId);
                            stock.dataDeposit = deposit;
                        }
                        if (stock.campaignId) {
                            const campaign = campaigns.find(c => c._id === stock.campaignId);
                            stock.dataCampaign = campaign;
                        }
                        if (stock.fieldId) {
                            const field = fields.find(f => f._id === stock.fieldId);
                            stock.dataField = field;
                        }
                    });
                }
                setStockData(dataStock);
                setIsLoading(false);
                return dataStock;
            }

            // Para insumos, mantener lectura de stock legacy
            const selectorRequest: GetStockRequest = {
                accountId: user.accountId,
                ...request
            };
            const responseStock = await dbContext.stock.find({
                selector: selectorRequest
            });
            let dataStock = responseStock.docs as StockItem[];
            if (fullItem) {
                const responseAll = await Promise.all([
                    dbContext.deposits.find({ selector: { "accountId": user?.accountId } }),
                    dbContext.supplies.find({
                        selector: {
                            $or: [
                                { accountId: user?.accountId },
                                { isDefault: true }
                            ]
                        },
                    }),
                    dbContext.crops.allDocs({ include_docs: true }),
                    dbContext.campaigns.find({ selector: { "accountId": user?.accountId } }),
                    dbContext.fields.find({ selector: { "accountId": user?.accountId } })
                ]);
                const deposits = responseAll[0].docs;
                const supplies = responseAll[1].docs;
                const crops = responseAll[2].rows.map(row => row.doc as Crop);
                const campaigns = responseAll[3].docs;
                const fields = responseAll[4].docs;
                dataStock.forEach((stock) => {
                    if (stock.id && stock.tipo === TipoStock.INSUMO) {
                        const supply = supplies.find(s => s._id === stock.id);
                        stock.dataSupply = supply;
                    }
                    if (stock.id && stock.tipo === TipoStock.CULTIVO) {
                        const crop = crops.find(c => c._id === stock.id);
                        stock.dataCrop = crop;
                    }
                    if (stock.depositId) {
                        const deposit = deposits.find(d => d._id === stock.depositId);
                        stock.dataDeposit = deposit;
                    }
                    if (stock.campaignId) {
                        const campaign = campaigns.find(c => c._id === stock.campaignId);
                        stock.dataCampaign = campaign;
                    }
                    if (stock.fieldId) {
                        const field = fields.find(f => f._id === stock.fieldId);
                        stock.dataField = field;
                    }
                });
            }
            setStockData(dataStock);
            setIsLoading(false);
            return dataStock
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            return [];
        }
    }

    const getControlStockCrop = async (request: GetControlStockCropRequest) => {
        setIsLoading(true);
        if (!user) { dispatch(onLogout(t("session_expired"))); return; }
        const query: GetControlStockCropRequest = {
            accountId: user.accountId,
            ...(request.campaignId && { campaignId: request.campaignId }),
            ...(request.cropId && { cropId: request.cropId }),
        }
        try {
            const foundStockCrop = await dbContext.cropStockControl.find({
                selector: query
            });
            setIsLoading(false);
            return foundStockCrop.docs[0];
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            return null;
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

            let responseStockSupply = await getStock({
                id: supplyData._id,
                campaignId: newMovement.campaignId,
                tipo: TipoStock.INSUMO,
                depositId,
                nroLot,
                location
            });
            let existingStock = responseStockSupply ? responseStockSupply[0] : null;

            if (!(typeMovement === TypeMovement.TransferenciaDeposito.toString())) {
                if (isIncome) {
                    if (existingStock) {
                        existingStock.currentStock += amountValue;
                        promiseStockByLot = dbContext.stock.put(existingStock);
                    } else {
                        promiseStockByLot = dbContext.stock.post({
                            accountId: accountId,
                            id: supplyData._id,
                            nroLot,
                            depositId,
                            location,
                            currentStock: amountValue,
                            campaignId: newMovement.campaignId,
                            fieldId: "",
                            fieldLot: "",
                            tipo: TipoStock.INSUMO,
                            lastUpdate: new Date().toISOString(),
                            reservedStock: 0
                        });
                    }
                } else {
                    if (!existingStock) {
                        console.log('🔍 DEBUG: No se encontró stock existente para insumo:', supplyData._id);
                        console.log('  Verificando si el depósito permite stock negativo...');

                        // Verificar si el depósito permite stock negativo
                        try {
                            const depositDoc = await dbContext.deposits.get(depositId);
                            console.log('  📦 Información del depósito:', depositDoc);
                            console.log('  ✅ Permite stock negativo:', depositDoc?.isNegative);

                            if (depositDoc && depositDoc.isNegative) {
                                console.log('  ✅ Creando stock negativo para depósito que lo permite');
                                // Crear un nuevo registro de stock si el depósito permite negativo
                                promiseStockByLot = dbContext.stock.post({
                                    accountId: accountId,
                                    id: supplyData._id,
                                    nroLot,
                                    depositId,
                                    location,
                                    currentStock: -amountValue, // Comenzar con stock negativo
                                    campaignId: newMovement.campaignId,
                                    fieldId: "",
                                    fieldLot: "",
                                    tipo: TipoStock.INSUMO,
                                    lastUpdate: new Date().toISOString(),
                                    reservedStock: 0
                                });
                            } else {
                                console.log('  ❌ Depósito NO permite stock negativo, lanzando error');
                                throw new Error(t("supply_stock_not_found"));
                            }
                        } catch (error) {
                            console.log('  ❌ Error al obtener información del depósito:', error);
                            if (error instanceof Error && error.name === 'not_found') {
                                console.log('  ❌ Depósito no encontrado');
                                throw new Error(t("supply_stock_not_found_invalid_deposit"));
                            } else {
                                console.log('  ❌ Lanzando error: stock no encontrado');
                                throw new Error(t("supply_stock_not_found"));
                            }
                        }
                    } else {
                        existingStock.currentStock -= amountValue;
                        promiseStockByLot = dbContext.stock.put(existingStock);
                    }
                }
                responseAll = await Promise.all([
                    promiseStockByLot,
                    dbContext.stockMovements.post(newMovement)
                ]);
            } else {
                if (!depositDestination || !existingStock) {
                    throw new Error(t("destination_info_missing_or_stock_not_found"));
                }
                // supplyData._id, depositDestination.depositId, depositDestination.location, existingStock.nroLot
                let responseStockInDepositDest = await getStock(
                    {
                        id: supplyData._id,
                        campaignId: newMovement.campaignId,
                        tipo: TipoStock.INSUMO,
                        depositId: depositDestination.depositId,
                        nroLot: existingStock.nroLot,
                        location: depositDestination.location
                    }
                );
                let existingLotInDepositDestination = responseStockInDepositDest ? responseStockInDepositDest[0] : null;
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
                        id: existingStock.id,
                        depositId: depositDestination.depositId,
                        location: depositDestination.location,
                        currentStock: amountValue,
                        tipo: TipoStock.INSUMO,
                        campaignId: newMovement.campaignId,
                        fieldId: "",
                        fieldLot: "",
                        lastUpdate: new Date().toISOString(),
                        reservedStock: 0
                    }));
                }

                responseAll = await Promise.all(promiseAll);
            }

            return !!responseAll;

        } catch (error) {
            throw error;
        }
    };

    const addNewStockMovement = async (
        newMovement: StockMovement,
        supplyData: Supply,
        depositDestination?: DepositDestination) => {
        try {
            setIsLoading(true);
            if (!user) {
                dispatch(onLogout(t("session_expired")));
                setIsLoading(false);
                return;
            };
            newMovement.currency = user.currency;
            newMovement.accountId = user.accountId;
            // Si el movimiento proviene de Labores y no se especificó la leyenda,
            // marcarlo como Automatica para reflejar origen automático
            if (newMovement.typeMovement === TypeMovement.Labores && !newMovement.movement) {
                (newMovement as any).movement = 'Automatica';
            }
            let responseAll = await addStockMovementSupply(newMovement, supplyData, depositDestination);

            setIsLoading(false);
            if (responseAll)
                NotificationService.showAdded({ movement: newMovement.typeMovement }, t("new_stock_movement_label"));
            else
                NotificationService.showError(t("verify_entered_data"), {}, t("new_stock_movement_label"));

            if (newMovement.typeMovement !== TypeMovement.Labores) {
                navigate('/init/overview/stock-movements');
            }

        } catch (error) {
            console.error(t("error_in_add_new_stock_movement"), error);
            NotificationService.showError(t("unexpected_error"), {}, t("oops_label"));
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    // Actualizar tablas de stock de cultivos (cropMovements, cropDeposits, cropStockControl)
    const updateCropStockTables = async (movement: StockMovement, crop: any, deposit: any, extras?: { fieldId?: string, lotId?: string, zafra?: string }) => {
        try {
            if (!user) { dispatch(onLogout(t("session_expired"))); return; }
            const cropMovement = {
                accountId: user.accountId,
                licenceId: user.licenceId,
                depositId: deposit?._id || movement.depositId,
                cropId: crop?._id || movement.cropId || movement.supplyId,
                campaignId: movement.campaignId,
                zafra: extras?.zafra,
                fieldId: extras?.fieldId,
                lotId: extras?.lotId,
                inOut: movement.isIncome ? 'E' : 'S',
                date: movement.operationDate || movement.creationDate,
                movement: movement.typeMovement,
                detail: movement.detail,
                amountKg: Number(movement.amount || 0)
            } as any;

            // upsert CropDeposit
            const depositQuery = {
                selector: {
                    accountId: user.accountId,
                    licenceId: user.licenceId,
                    campaignId: movement.campaignId,
                    zafra: extras?.zafra,
                    depositId: deposit?._id || movement.depositId,
                    cropId: crop?._id || movement.cropId || movement.supplyId,
                }
            } as any;
            const found = await dbContext.cropDeposits.find(depositQuery);
            const todayStr = new Date().toISOString();
            if (found.docs && found.docs.length > 0) {
                const doc = found.docs[0];
                const delta = movement.isIncome ? +Number(movement.amount) : -Number(movement.amount);
                await dbContext.cropDeposits.put({ ...doc, currentStockKg: Number(doc.currentStockKg || 0) + delta, lastUpdate: todayStr });
            } else {
                await dbContext.cropDeposits.post({
                    accountId: user.accountId,
                    licenceId: user.licenceId,
                    campaignId: movement.campaignId,
                    zafra: extras?.zafra,
                    depositId: deposit?._id || movement.depositId,
                    cropId: crop?._id || movement.cropId || movement.supplyId,
                    fieldId: extras?.fieldId,
                    lotId: extras?.lotId,
                    currentStockKg: Number(movement.amount || 0) * (movement.isIncome ? 1 : -1),
                    reservedStockKg: 0,
                    lastUpdate: todayStr,
                } as any);
            }

            // upsert CropStockControl
            const ctrlQuery = { selector: { accountId: user.accountId, licenceId: user.licenceId, campaignId: movement.campaignId, zafra: extras?.zafra, cropId: crop?._id || movement.cropId || movement.supplyId } } as any;
            const ctrlFound = await dbContext.cropStockControl.find(ctrlQuery);
            if (ctrlFound.docs && ctrlFound.docs.length > 0) {
                const doc = ctrlFound.docs[0];
                const delta = movement.isIncome ? +Number(movement.amount) : -Number(movement.amount);
                await dbContext.cropStockControl.put({ ...doc, currentStock: Number(doc.currentStock || 0) + delta, lastUpdate: todayStr });
            } else {
                await dbContext.cropStockControl.post({ accountId: user.accountId, licenceId: user.licenceId, campaignId: movement.campaignId, zafra: extras?.zafra, cropId: crop?._id || movement.cropId || movement.supplyId, currentStock: Number(movement.amount || 0) * (movement.isIncome ? 1 : -1), committedStock: 0, deliveredStock: 0, lastUpdate: todayStr } as any);
            }

            // write CropMovement
            await dbContext.cropMovements.post(cropMovement);
        } catch (error) {
            console.log('Error updating crop stock tables:', error);
        }
    }

    const updateMovement = async (updateMovement: StockMovement) => {
        setIsLoading(true);
        try {
            const response = await dbContext.stockMovements.put(updateMovement);
            setIsLoading(false);

            if (response.ok)
                NotificationService.showUpdated({ movement: updateMovement.typeMovement }, t("stock_movement_label"));

            navigate("/init/overview/stock-movements");
        } catch (error) {
            console.log(error)
            NotificationService.showError(t("no_social_entity_record"), {}, t("error_label"));
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
                setStockData(documents);
            }
            else setStockData([]);

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
    //             NotificationService.showSuccess(t("transform_success"), {}, t("stock_transformation_label"));
    //         else
    //             NotificationService.showError(t("verify_entered_data"), {}, t("stock_transformation_label"));

    //         setIsLoading(false);
    //     } catch (error) {
    //         console.log(error)
    //         setIsLoading(false);
    //         if (error) setError(error);
    //     }
    // }

    const getMovementsType = async (onlyManual = false) => {
        try {
            setIsLoading(true);
            const response = await dbContext.movementsType.allDocs({ include_docs: true });
            let movement = response.rows.map(row => row.doc as MovementType);
            if (movement.length) {
                setMovementsType(
                    onlyManual ? movement.filter(m => m.manual) : movement
                );
            }
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
        stockByLots: stockData,
        movementsType,
        error,
        isLoading,

        //*Methods
        setStockMovements,
        getStockMovements,
        addNewStockMovement,
        updateMovement,
        getNroLotsBySupplyAndDeposit,
        getStock,
        getMovementsType,
        getControlStockCrop,
        updateCropStockTables
    }
}