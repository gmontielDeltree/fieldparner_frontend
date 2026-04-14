import { Supply, Crop } from "../types";
import { useState } from "react";
import { dbContext } from '../services';
import { useAppDispatch, useAppSelector } from '.';
import { useNavigate } from 'react-router-dom';
import { onLogout } from '../redux/auth';
import { useTranslation } from 'react-i18next';
import { StockItem, TipoStock } from '../interfaces/stock';
import { NotificationService } from "../services/notificationService";

export const useSupply = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { supplyActive } = useAppSelector((state) => state.supply);
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [supplyError, setSupplyError] = useState(false);
    const [stockByDeposits, setStockByDeposits] = useState<StockItem[]>([]);
    const [stockBySupplies, setStockBySupplies] = useState<StockItem[]>([]);
    const [stockSupplyAndDeposit, setStockSupplyAndDeposit] = useState<StockItem[]>([])

    const getSupplies = async () => {
        setIsLoading(true);
        try {
            if (!user) { dispatch(onLogout(t("session_expired"))); return; }

            const result = await dbContext.supplies.find({
                selector: {
                    $or: [
                        { accountId: user?.accountId },
                        { isDefault: true }
                    ]
                },
            });

            setIsLoading(false);
            if (result.docs.length) {
                let documents: Supply[] = result.docs.map(row => row as Supply);
                let docsCountryFiltered = documents.filter(doc => doc.countryId === user?.countryId);
                setSupplies(docsCountryFiltered);
            }
        } catch (error) {
            setIsLoading(false);
            console.error(t("error_loading_documents"), error);
        }
    }

    const getStockBySupplyActive = async () => {
        setIsLoading(true);
        let supplyByDeposits: StockItem[] = [];
        try {
            if (!supplyActive) throw new Error(t("supply_not_found"));
            const responseAll = await Promise.all([
                dbContext.stock.find({
                    selector: {
                        "$and": [
                            { "id": supplyActive._id },
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

            const [supplyStockData, deposits, movements] = responseAll;

            supplyStockData.docs.forEach(stock => {
                const foundDeposit = deposits.docs.find(m => (m._id === stock.depositId));
                if (!foundDeposit) return;

                supplyByDeposits.push({
                    dataDeposit: foundDeposit,
                    dataSupply: supplyActive,
                    dataMovements: movements.docs
                        .filter(m => m.depositId === stock.depositId && m.nroLot?.toLowerCase() === stock.nroLot?.toLowerCase()),
                    ...stock
                });
            });
            setStockByDeposits(supplyByDeposits);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error(t("error_loading_documents"), error);
        }
    }

    const getStockBySupplyAndDeposit = async (supplyId: string, depositId: string) => {
        setIsLoading(true);
        let supplyByDeposits: StockItem[] = [];
        try {
            if (!supplyId && !depositId) return [];

            const responseStock = await dbContext.stock.find({
                selector: {
                    "$and": [
                        { "accountId": user?.accountId },
                        { "depositId": depositId },
                        { "id": supplyId },
                    ],
                }
            });
            responseStock.docs.forEach((stock) => {
                supplyByDeposits.push(stock);
            });
            setStockSupplyAndDeposit(supplyByDeposits);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error(t("error_loading_documents"), error);
        }
    }

    const getStockData = async () => {
        setIsLoading(true);
        let dataStock: StockItem[] = [];
        try {
            if (!user) throw new Error(t("user_not_found"));
            const promisesResult = await Promise.all([
                dbContext.stock.find({
                    selector: {
                        "$and": [
                            { "accountId": user?.accountId },
                        ],
                    }
                }),
                dbContext.supplies.find({
                    selector: {
                        $or: [
                            { accountId: user?.accountId },
                            { isDefault: true }
                        ]
                    }
                }),
                dbContext.crops.allDocs({ include_docs: true }),
                // ✅ AGREGADO: Leer cropDeposits para incluir cosechas
                // dbContext.cropDeposits.find({
                //     selector: {
                //         "accountId": user?.accountId
                //     }
                // }),
                //Stock de cultivos
                dbContext.cropStockControl.find({
                    selector: {
                        "$and": [
                            { "accountId": user?.accountId },
                            { "licenceId": user.licenceId }
                        ],
                    }
                }),
            ]);

            const [resultStock, supplies, crops, cropStockControlResult] = promisesResult;

            // Procesar stock legacy (insumos y crops antiguos)
            const stockIds = resultStock?.docs.map(s => s.id) || [];
            const groupStockIds = Array.from(new Set(stockIds));
            groupStockIds.forEach(id => {
                const foundStock = resultStock.docs.filter(m => (m.id === id));

                // Buscar primero en supplies
                const foundSupply = supplies.docs.find(m => (m._id === id));
                if (foundSupply) {
                    const totalCurrentStock = foundStock.reduce((acc, stock) => acc + stock.currentStock, 0);
                    const totalReservedStock = foundStock.reduce((acc, stock) => acc + stock.reservedStock, 0);
                    dataStock.push({
                        ...foundStock[0],
                        dataSupply: foundSupply,
                        currentStock: totalCurrentStock,
                        reservedStock: totalReservedStock,
                    });
                    return;
                }

                // Si no se encuentra en supplies, buscar en crops
                const foundCrop = crops.rows.map(row => row.doc as Crop).find(m => (m._id === id));
                if (foundCrop) {
                    const totalCurrentStock = foundStock.reduce((acc, stock) => acc + stock.currentStock, 0);
                    const totalReservedStock = foundStock.reduce((acc, stock) => acc + stock.reservedStock, 0);
                    dataStock.push({
                        ...foundStock[0],
                        dataCrop: foundCrop,
                        currentStock: totalCurrentStock,
                        reservedStock: totalReservedStock,
                    });
                }
            });

            // ✅ AGREGADO: Procesar cropDeposits (cosechas)
            const cropIds = cropStockControlResult?.docs.map((cd: any) => cd.cropId) || [];
            const groupCropIds = Array.from(new Set(cropIds));

            groupCropIds.forEach(cropId => {
                const foundCropDeposits = cropStockControlResult.docs.filter((cd: any) => cd.cropId === cropId);
                const foundCrop = crops.rows.map(row => row.doc as Crop).find(c => c._id === cropId);

                if (foundCrop) {

                    // Crear nuevo registro
                    dataStock.push({
                        _id: foundCropDeposits[0]._id,
                        _rev: foundCropDeposits[0]._rev,
                        id: cropId,
                        tipo: TipoStock.CULTIVO,
                        accountId: user.accountId,
                        depositId: '',
                        location: '',
                        nroLot: '',
                        campaignId: foundCropDeposits[0].campaignId || '',
                        fieldId: '',
                        fieldLot: '',
                        currentStock: foundCropDeposits[0].currentStock,
                        reservedStock: foundCropDeposits[0].committedStock,
                        lastUpdate: foundCropDeposits[0].lastUpdate,
                        dataCrop: foundCrop,
                        zafra: foundCropDeposits[0].zafra || '',
                    });
                }
            });

            setStockBySupplies(dataStock);
        } catch (error) {
            console.error(t("error_loading_documents"), error);
        }
        finally { setIsLoading(false); }
    }

    const getStockByDeposits = async () => {
        setIsLoading(true);
        try {
            let listStockFromDeposits: StockItem[] = [];
            const responseAll = await Promise.all([
                dbContext.stock.find({ selector: { "accountId": user?.accountId } }),
                dbContext.deposits.find({ selector: { "accountId": user?.accountId } }),
                dbContext.supplies.find({
                    selector: {
                        $or: [
                            { accountId: user?.accountId },
                            { isDefault: true }
                        ]
                    }
                }),
                dbContext.crops.allDocs({ include_docs: true }),
                // ✅ AGREGADO: Leer cropDeposits para incluir cosechas
                dbContext.cropDeposits.find({ selector: { "accountId": user?.accountId } })
            ]);
            const [stockBySupplies, responseDeposits, responseSupplies, cropsResult, cropDepositsResult] = responseAll;

            // Preparar crops como array para facilitar búsqueda
            const crops = cropsResult.rows.map(row => row.doc as Crop);

            // Procesar stock legacy (insumos y crops antiguos)
            const depositsId = stockBySupplies.docs.map(s => s.depositId);
            const groupDepositsId = Array.from(new Set(depositsId));

            groupDepositsId.forEach(depositId => {
                const foundDepositStock = stockBySupplies.docs.filter(m => (m.depositId === depositId));
                const idInsumosDelDepositoConStock = foundDepositStock.map(s => s.id);
                const groupInsumosId = Array.from(new Set(idInsumosDelDepositoConStock));

                groupInsumosId.forEach(idInsumo => {
                    const foundDeposit = responseDeposits.docs.find(m => (m._id === depositId));
                    if (!foundDeposit) return;

                    const stockItem = foundDepositStock.find(s => s.id === idInsumo);
                    if (!stockItem) return;

                    const totalCurrentStock = foundDepositStock.filter(x => x.id === idInsumo).reduce((acc, stock) => acc + stock.currentStock, 0);
                    const totalReservedStock = foundDepositStock.filter(x => x.id === idInsumo).reduce((acc, stock) => acc + stock.reservedStock, 0);

                    const isSupply = stockItem.tipo === TipoStock.INSUMO || !stockItem.tipo;
                    const isCrop = stockItem.tipo === TipoStock.CULTIVO;

                    let stockItemData: StockItem = {
                        ...foundDepositStock[0],
                        dataDeposit: foundDeposit,
                        currentStock: totalCurrentStock,
                        reservedStock: totalReservedStock,
                    };

                    if (isSupply) {
                        const foundSupply = responseSupplies.docs.find(m => (m._id === idInsumo));
                        if (foundSupply) {
                            stockItemData.dataSupply = foundSupply;
                            listStockFromDeposits.push(stockItemData);
                        } else {
                            console.log('⚠️ No se encontró supply para el stock con ID:', idInsumo);
                        }
                    } else if (isCrop) {
                        const foundCrop = crops.find(m => (m._id === idInsumo));
                        if (foundCrop) {
                            stockItemData.dataCrop = foundCrop;
                            listStockFromDeposits.push(stockItemData);
                        } else {
                            console.log('⚠️ No se encontró crop para el stock con ID:', idInsumo);
                        }
                    } else {
                        console.log('⚠️ Tipo de stock no reconocido para ID:', idInsumo, 'Tipo:', stockItem.tipo);
                    }
                });
            });

            // ✅ AGREGADO: Procesar cropDeposits (cosechas)
            cropDepositsResult.docs.forEach((cropDeposit: any) => {
                const foundDeposit = responseDeposits.docs.find(d => d._id === cropDeposit.depositId);
                if (!foundDeposit) return;

                const foundCrop = crops.find(c => c._id === cropDeposit.cropId);
                if (!foundCrop) {
                    console.log('⚠️ No se encontró crop para cropDeposit con cropId:', cropDeposit.cropId);
                    return;
                }

                // Verificar si ya existe este crop+deposit en la lista (del stock legacy)
                const existingIndex = listStockFromDeposits.findIndex(
                    item => item.id === cropDeposit.cropId && item.depositId === cropDeposit.depositId
                );

                if (existingIndex >= 0) {
                    // Sumar al stock existente
                    listStockFromDeposits[existingIndex].currentStock += (cropDeposit.currentStockKg || 0);
                    listStockFromDeposits[existingIndex].reservedStock += (cropDeposit.reservedStockKg || 0);
                } else {
                    // Crear nuevo registro
                    listStockFromDeposits.push({
                        _id: cropDeposit._id,
                        _rev: cropDeposit._rev,
                        id: cropDeposit.cropId,
                        tipo: TipoStock.CULTIVO,
                        accountId: cropDeposit.accountId,
                        depositId: cropDeposit.depositId,
                        location: '',
                        nroLot: '',
                        campaignId: cropDeposit.campaignId || '',
                        fieldId: cropDeposit.fieldId || '',
                        fieldLot: cropDeposit.lotId || '',
                        currentStock: cropDeposit.currentStockKg || 0,
                        reservedStock: cropDeposit.reservedStockKg || 0,
                        lastUpdate: cropDeposit.lastUpdate,
                        dataDeposit: foundDeposit,
                        dataCrop: foundCrop,
                    });
                }
            });

            setStockByDeposits(listStockFromDeposits);
        } catch (error) {
            console.error(t("error_loading_documents"), error);
        }
        finally { setIsLoading(false); }
    }

    const createSupply = async (newSupply: Supply) => {
        setIsLoading(true);
        try {
            if (!user) { dispatch(onLogout(t("session_expired"))); return; }

            const resultFound = await dbContext.supplies.find({
                selector: {
                    $and: [
                        { accountId: user.accountId },
                        { type: newSupply.type },
                        { name: newSupply.name }
                    ]
                }
            });
            if (resultFound.docs.length) {
                NotificationService.showWarning(
                    t("supply_already_exists", { name: newSupply.name, type: newSupply.type }),
                    {},
                    t("supply_label")
                );
                setIsLoading(false);
                return;
            }
            const response = await dbContext.supplies.post({
                ...newSupply,
                accountId: user.accountId,
                countryId: user.countryId,
            });

            setIsLoading(false);

            if (response.ok) {
                NotificationService.showAdded({ name: newSupply.name }, t("supply_label"));

                // Retornar el objeto creado para el modal (si se necesita)
                const createdSupply = { ...newSupply, accountId: user.accountId, countryId: user.countryId };
                return createdSupply;
            }
        } catch (error) {
            console.log(t("error_creating_document"), error);
            NotificationService.showError(t("unexpected_error"), {}, t("oops_label"));
            setIsLoading(false);
            throw error; // Re-lanzar el error para que el modal pueda manejarlo
        }
    };

    const updateSupply = async (updateSupply: Supply) => {
        setIsLoading(true);
        try {
            const response = await dbContext.supplies.put(updateSupply);
            setIsLoading(false);

            if (response.ok) {
                NotificationService.showUpdated({ name: updateSupply.name }, t("supply_label"));
            }
        } catch (error) {
            console.log(t("error_updating_document"), error);
            NotificationService.showError(t("unexpected_error"), {}, t("oops_label"));
            setIsLoading(false);
        }
    }

    const deleteSupply = async (supplyId: string, removeSupply: string) => {
        try {
            const response = await dbContext.supplies.remove(supplyId, removeSupply);
            setIsLoading(false);

            if (response.ok)
                NotificationService.showDeleted({ id: supplyId }, t("supply_label"));

            navigate('/init/overview/supply');
        } catch (error) {
            console.log(t("error_updating_document"), error);
            NotificationService.showError(t("unexpected_error"), {}, t("oops_label"));
            setIsLoading(false);
        }
    }

    // const addReservedStock = async (supplyId: string, quantity: number) => {
    //     setIsLoading(true);
    //     try {
    //         const supply = supplies.find(supply => supply._id === supplyId);
    //         if (!supply) {
    //             console.error(t("supply_not_found_with_id", { id: supplyId }));
    //             throw new Error(t("supply_not_found"));
    //         }

    //         const updatedSupply: Supply = {
    //             ...supply,
    //             reservedStock: supply.reservedStock + quantity
    //         };

    //         const response = await dbContext.supplies.put(updatedSupply);
    //         if (response.ok) {
    //             setSupplies(supplies.map(s => (s._id === supplyId ? updatedSupply : s)));
    //             NotificationService.showSuccess(t("reserved_stock_added"), { name: supply.name }, t("supply_label"));
    //         }
    //         setIsLoading(false);
    //     } catch (error) {
    //         console.log(t("error_adding_reserved_stock"), error);
    //         NotificationService.showError(t("unexpected_error"), {}, t("oops_label"));
    //         setIsLoading(false);
    //     }
    // };

    // const removeReservedStock = async (supplyId: string, quantity: number) => {
    //     setIsLoading(true);
    //     try {
    //         const supply = supplies.find(supply => supply._id === supplyId);
    //         if (!supply) throw new Error(t("supply_not_found"));
    //         if (supply.reservedStock < quantity) throw new Error(t("insufficient_reserved_stock"));

    //         const updatedSupply: Supply = {
    //             ...supply,
    //             reservedStock: supply.reservedStock - quantity,
    //             currentStock: supply.currentStock - quantity
    //         };

    //         const response = await dbContext.supplies.put(updatedSupply);
    //         if (response.ok) {
    //             setSupplies(supplies.map(s => (s._id === supplyId ? updatedSupply : s)));
    //             NotificationService.showSuccess(t("reserved_stock_removed"), { name: supply.name }, t("supply_label"));
    //         }
    //         setIsLoading(false);
    //     } catch (error) {
    //         console.log(t("error_removing_reserved_stock"), error);
    //         NotificationService.showError(t("unexpected_error"), {}, t("oops_label"));
    //         setIsLoading(false);
    //     }
    // };

    return {
        supplies,
        isLoading,
        stockByDeposits,
        supplyError,
        stockBySupplies,
        stockSupplyAndDeposit,
        setSupplies,
        getSupplies,
        createSupply,
        updateSupply,
        deleteSupply,
        setSupplyError,
        // addReservedStock,
        // removeReservedStock,
        getStockBySupplyActive,
        getStockData,
        getStockByDeposits,
        getStockBySupplyAndDeposit
    }
}