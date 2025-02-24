import Swal from 'sweetalert2';
import { Supply, SupplyByDeposits, StockByNroLot, StockBySupply } from "../types";
import { useState } from "react";
import { dbContext } from '../services';
import { useAppDispatch, useAppSelector } from '.';
import { useNavigate } from 'react-router-dom';
import { onLogout } from '../redux/auth';
import { useTranslation } from 'react-i18next';

export const useSupply = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
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

    const getStockBySupplyAndDeposits = async () => {
        setIsLoading(true);
        let supplyByDeposits: SupplyByDeposits[] = [];
        try {
            if (!supplyActive) throw new Error(t("supply_not_found"));
            const promisesResult = await Promise.all([
                dbContext.stock.find({
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
            const groupDepositsId = Array.from(new Set(depositIds));
            groupDepositsId.forEach(depositId => {
                const depositDto = deposits.docs.find(d => d._id === depositId);
                if (!depositDto) throw new Error(t("deposit_not_found"));
                const depositMovements = movements.docs.filter(m => m.depositId === depositId);

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
                            dueDate: depositMovements[0].dueDate,
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
            console.error(t("error_loading_documents"), error);
        }
    }

    const getStockBySupplies = async () => {
        setIsLoading(true);
        let stockBySupplies: StockBySupply[] = [];
        try {
            if (!user) throw new Error(t("user_not_found"));
            const promisesResult = await Promise.all([
                dbContext.stock.find({ selector: { "accountId": user.accountId } }),
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
            console.error(t("error_loading_documents"), error);
        }
    }

    const getStockByDepositAndLocation = async () => {
        setIsLoading(true);
        try {
            let supplyByDeposits: SupplyByDeposits[] = [];
            const promisesResult = await Promise.all([
                dbContext.stock.find({ selector: { "accountId": user?.accountId } }),
                dbContext.deposits.find({ selector: { "accountId": user?.accountId } }),
                dbContext.supplies.find({
                    selector: {
                        $or: [
                            { "accountId": user?.accountId },
                            { "generico": true }
                        ]
                    }
                })
            ]);
            const [stockBySupplies, deposits, supplies] = promisesResult;
            let supplyIds = stockBySupplies.docs.map(m => m.supplyId);
            const groupSupplyIds = Array.from(new Set(supplyIds));

            deposits.docs.forEach(depositDto => {
                groupSupplyIds.forEach(supplyId => {
                    const supplyDto = supplies.docs.find(s => s._id === supplyId);
                    if (!supplyDto) throw new Error(t("supply_not_found"));

                    let currentStockOfDeposit = 0;
                    stockBySupplies.docs.forEach(stockBySupply => {
                        if (stockBySupply.supplyId === supplyId && stockBySupply.depositId === depositDto._id) {
                            currentStockOfDeposit += stockBySupply.currentStock;
                        }
                    });
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
                Swal.fire(t("supply"), t("supply_already_exists", { name: newSupply.name, type: newSupply.type }), "warning");
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
                Swal.fire(t("supply"), t("added_successfully"), "success");
            }
        } catch (error) {
            console.log(t("error_creating_document"), error);
            Swal.fire(t("ups"), t("unexpected_error"), "error");
            setIsLoading(false);
        }
    };

    const updateSupply = async (updateSupply: Supply) => {
        setIsLoading(true);
        try {
            const response = await dbContext.supplies.put(updateSupply);
            setIsLoading(false);

            if (response.ok) {
                Swal.fire(t("supply"), t("updated_successfully"), "success");
            }
        } catch (error) {
            console.log(t("error_updating_document"), error);
            Swal.fire(t("ups"), t("unexpected_error"), "error");
            setIsLoading(false);
        }
    }

    const deleteSupply = async (supplyId: string, removeSupply: string) => {
        try {
            const response = await dbContext.supplies.remove(supplyId, removeSupply);
            setIsLoading(false);

            if (response.ok)
                Swal.fire(t("supply"), t("deleted"), "success");

            navigate('/init/overview/supply');
        } catch (error) {
            console.log(t("error_updating_document"), error);
            Swal.fire(t("ups"), t("unexpected_error"), "error");
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
                Swal.fire(t("supply"), t("reserved_stock_added"), "success");
            }
            setIsLoading(false);
        } catch (error) {
            console.log(t("error_adding_reserved_stock"), error);
            Swal.fire(t("ups"), t("unexpected_error"), "error");
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
                Swal.fire(t("supply"), t("reserved_stock_removed"), "success");
            }
            setIsLoading(false);
        } catch (error) {
            console.log(t("error_removing_reserved_stock"), error);
            Swal.fire(t("ups"), t("unexpected_error"), "error");
            setIsLoading(false);
        }
    };

    return {
        supplies,
        isLoading,
        supplyByDeposits,
        supplyError,
        stockBySupplies,
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