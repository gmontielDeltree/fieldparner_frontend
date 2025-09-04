import { Supply } from "../types";
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
                setSupplies(documents);
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
                        .filter(m => m.depositId === stock.depositId && m.nroLot.toLowerCase() === stock.nroLot.toLowerCase()),
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
                        // { "id": supplyId },
                        { "accountId": user?.accountId },
                        { "depositId": depositId },
                    ],
                }
            });
            const stockSupplyAndDeposits = responseStock.docs;
            stockSupplyAndDeposits.filter(x => x.id === supplyId).forEach((stock) => {
                supplyByDeposits.push(stock);
            });
            setStockSupplyAndDeposit(supplyByDeposits);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error(t("error_loading_documents"), error);
        }
    }

    const getStockBySupplies = async () => {
        setIsLoading(true);
        let stockBySupplies: StockItem[] = [];
        try {
            if (!user) throw new Error(t("user_not_found"));
            const promisesResult = await Promise.all([
                dbContext.stock.find({
                    selector: {
                        "$and": [
                            { "accountId": user?.accountId },
                            { "tipo": TipoStock.INSUMO },
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
                // AGREGAR: También buscar cultivos
                dbContext.crops.allDocs({ include_docs: true })
            ]);
            
            const [suppliesStock, supplies, cropsResult] = promisesResult;
            
            // Convertir cultivos al formato de supplies
            const crops = cropsResult.rows.map(row => ({
                ...row.doc,
                _id: row.doc._id || row.id,
                name: row.doc.descriptionES || row.doc.descriptionEN || 'Cultivo',
                supplyType: 'Cultivo',
                isCrop: true,
                // Agregar otros campos necesarios para compatibilidad
                accountId: user?.accountId,
                unit: row.doc.unit || 'kg'
            }));
            const supplyIds = suppliesStock.docs.map(s => s.id);//Obtenemos los id de insumos
            const groupSupplyIds = Array.from(new Set(supplyIds));//Agrupamos por id de insumo
            
            // Combinar supplies y crops en un solo array
            const allItems = [...supplies.docs, ...crops];
            
            groupSupplyIds.forEach(id => {
                const foundSupplyStock = suppliesStock.docs.filter(m => (m.id === id)); //Obtenemos todo los stock de ese insumo
                
                // Buscar tanto en supplies como en crops
                const foundSupply = allItems.find(m => (m._id === id));
                
                if (!foundSupply) {
                    console.log('⚠️ No se encontró supply/crop para el stock con ID:', id);
                    return;
                }
                const totalCurrentStock = foundSupplyStock.reduce((acc, stock) => acc + stock.currentStock, 0);
                const totalReservedStock = foundSupplyStock.reduce((acc, stock) => acc + stock.reservedStock, 0);
                stockBySupplies.push({
                    ...foundSupplyStock[0],
                    dataSupply: foundSupply,
                    currentStock: totalCurrentStock,
                    reservedStock: totalReservedStock,
                });
            });
            setStockBySupplies(stockBySupplies);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error(t("error_loading_documents"), error);
        }
    }

    const getSupplyStockByDeposits = async () => {
        setIsLoading(true);
        try {
            let supplyByDeposits: StockItem[] = [];
            const responseAll = await Promise.all([
                dbContext.stock.find({
                    selector: {
                        "$and": [
                            { "accountId": user?.accountId },
                            { "tipo": TipoStock.INSUMO },
                        ],
                    }
                }),
                dbContext.deposits.find({ selector: { "accountId": user?.accountId } }),
                dbContext.supplies.find({
                    selector: {
                        $or: [
                            { accountId: user?.accountId },
                            { isDefault: true }
                        ]
                    }
                }),
                // AGREGAR: También buscar cultivos
                dbContext.crops.allDocs({ include_docs: true })
            ]);
            const [stockBySupplies, responseDeposits, responseSupplies, cropsResult] = responseAll;
            
            // Convertir cultivos al formato de supplies
            const crops = cropsResult.rows.map(row => ({
                ...row.doc,
                _id: row.doc._id || row.id,
                name: row.doc.descriptionES || row.doc.descriptionEN || 'Cultivo',
                supplyType: 'Cultivo',
                isCrop: true,
                accountId: user?.accountId,
                unit: row.doc.unit || 'kg'
            }));
            //Obtenemos los idDepositos y agrupamos
            const depositsId = stockBySupplies.docs.map(s => s.depositId);
            const groupDepositsId = Array.from(new Set(depositsId));

            groupDepositsId.forEach(depositId => {
                const foundDepositStock = stockBySupplies.docs.filter(m => (m.depositId === depositId)); //Obtenemos todos los stock de ese deposito
                const idInsumosDelDepositoConStock = foundDepositStock.map(s => s.id); //Insumos que tienen stock en ese deposito
                const groupInsumosId = Array.from(new Set(idInsumosDelDepositoConStock)); //Agrupamos por id de insumo
                groupInsumosId.forEach(idInsumo => {
                    // Combinar supplies y crops en un solo array
                    const allItems = [...responseSupplies.docs, ...crops];
                    
                    // Buscar tanto en supplies como en crops
                    const foundSupply = allItems.find(m => (m._id === idInsumo)); //Obtenemos el insumo o cultivo
                    
                    if (!foundSupply) {
                        console.log('⚠️ No se encontró supply/crop para el stock con ID:', idInsumo);
                        return;
                    }
                    const foundDeposit = responseDeposits.docs.find(m => (m._id === depositId)); // Obtenemos el deposito
                    if (!foundDeposit) return;
                    const totalCurrentStock = foundDepositStock.filter(x => x.id === idInsumo).reduce((acc, stock) => acc + stock.currentStock, 0);
                    const totalReservedStock = foundDepositStock.filter(x => x.id === idInsumo).reduce((acc, stock) => acc + stock.reservedStock, 0);

                    supplyByDeposits.push({
                        ...foundDepositStock[0],
                        dataDeposit: foundDeposit,
                        dataSupply: foundSupply,
                        currentStock: totalCurrentStock,
                        reservedStock: totalReservedStock,
                    });
                });

            })
            setStockByDeposits(supplyByDeposits);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error(t("error_loading_documents"), error);
        }
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
            }
        } catch (error) {
            console.log(t("error_creating_document"), error);
            NotificationService.showError(t("unexpected_error"), {}, t("oops_label"));
            setIsLoading(false);
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

    const addReservedStock = async (supplyId: string, quantity: number) => {
        setIsLoading(true);
        try {
            const supply = supplies.find(supply => supply._id === supplyId);
            if (!supply) {
                console.error(t("supply_not_found_with_id", { id: supplyId }));
                throw new Error(t("supply_not_found"));
            }

            const updatedSupply: Supply = {
                ...supply,
                reservedStock: supply.reservedStock + quantity
            };

            const response = await dbContext.supplies.put(updatedSupply);
            if (response.ok) {
                setSupplies(supplies.map(s => (s._id === supplyId ? updatedSupply : s)));
                NotificationService.showSuccess(t("reserved_stock_added"), { name: supply.name }, t("supply_label"));
            }
            setIsLoading(false);
        } catch (error) {
            console.log(t("error_adding_reserved_stock"), error);
            NotificationService.showError(t("unexpected_error"), {}, t("oops_label"));
            setIsLoading(false);
        }
    };

    const removeReservedStock = async (supplyId: string, quantity: number) => {
        setIsLoading(true);
        try {
            const supply = supplies.find(supply => supply._id === supplyId);
            if (!supply) throw new Error(t("supply_not_found"));
            if (supply.reservedStock < quantity) throw new Error(t("insufficient_reserved_stock"));

            const updatedSupply: Supply = {
                ...supply,
                reservedStock: supply.reservedStock - quantity,
                currentStock: supply.currentStock - quantity
            };

            const response = await dbContext.supplies.put(updatedSupply);
            if (response.ok) {
                setSupplies(supplies.map(s => (s._id === supplyId ? updatedSupply : s)));
                NotificationService.showSuccess(t("reserved_stock_removed"), { name: supply.name }, t("supply_label"));
            }
            setIsLoading(false);
        } catch (error) {
            console.log(t("error_removing_reserved_stock"), error);
            NotificationService.showError(t("unexpected_error"), {}, t("oops_label"));
            setIsLoading(false);
        }
    };

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
        addReservedStock,
        removeReservedStock,
        getStockBySupplyActive,
        getStockBySupplies,
        getSupplyStockByDeposits,
        getStockBySupplyAndDeposit
    }
}