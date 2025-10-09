import { Movement, StockMovement, StockMovementItem, TransformSupply, TypeMovement } from "../types";
import { useStockMovement } from ".";
import { useAppDispatch, useAppSelector } from ".";
import { useState } from "react";
import { getShortDate } from "../helpers/dates";
import { dbContext } from "../services";
import { onLogout } from "../redux/auth";
import { Stock } from "../interfaces/stock";
import { useTranslation } from "react-i18next";
import { NotificationService } from "../services/notificationService";

const today = getShortDate();

type TransformMovementGroup = {
    [id: string]: {
        income: StockMovementItem[],
        output: StockMovementItem[],
    }
};

export const useTransformStock = () => {

    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const [transformMovements, setTransformMovements] = useState<TransformMovementGroup>({});
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();
    const stockMovementHook = useStockMovement();
    const { updateCropStockTables } = stockMovementHook;

    //Nueva Transformacion/Valor agregado
    const transformStock = async (
        supplyOrCultiveOrigin: TransformSupply[],
        supplyOrCultiveDestination: TransformSupply[],
        stockBySupplies: Stock[],
        detail: string,
        operationDate: string) => {
        setIsLoading(true);
        try {
            let newMovements: StockMovement[] = [];

            if (!user) { dispatch(onLogout(t("session_expired"))); return; }
            const { accountId, id: userId } = user;
            //Recorremos cada insumo/cultivo deposito , ubicacion, lote para crear su movimiento.
            supplyOrCultiveOrigin.forEach(ts => {
                if (!ts.crop?._id && !ts.supply?._id) return;
                if (!ts.deposit?._id) return;
                const isCrop = !!ts.crop?._id;

                let newMovement: StockMovement = {
                    accountId,
                    userId,
                    amount: ts.amount,
                    creationDate: today,
                    campaignId: ts.campaignId,
                    currency: "",
                    voucher: "",
                    totalValue: 0,
                    hours: "", //TODO: ?
                    depositId: ts.deposit._id,
                    supplyId: ts.supply?._id,
                    isCrop,
                    cropId: ts.crop?._id,
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
                // Si es cultivo en ORIGEN, actualizar tablas de cultivos
                if (isCrop) {
                    updateCropStockTables(newMovement, ts.crop, ts.deposit, { zafra: ts.zafra });
                }
            });
            // Creamos los movimientos de insumo/cultivo, deposito ubicacion lote 
            supplyOrCultiveDestination.forEach(sa => {
                if (!sa.crop?._id && !sa.supply?._id) return;
                if (!sa.deposit?._id) return;
                const isCrop = !!sa.crop?._id;
                newMovements.push({
                    accountId,
                    userId,
                    amount: sa.amount,
                    creationDate: today,
                    campaignId: sa.campaignId,
                    currency: "",
                    voucher: "",
                    totalValue: 0,
                    hours: "", //TODO: ?
                    depositId: sa.deposit?._id,
                    supplyId: sa.supply?._id,
                    isCrop,
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
            
            // Actualizar stock: solo insumos en tabla stock (cultivos se actualizan en updateCropStockTables)
            let promisesAll: Promise<Array<PouchDB.Core.Response | PouchDB.Core.Error>>[] = [
                dbContext.stockMovements.bulkDocs(newMovements),
                dbContext.stock.bulkDocs(stockBySupplies),
            ];
            const responseAll = await Promise.all(promisesAll);

            if (responseAll)
                NotificationService.showSuccess(t("transform_success"), {}, t("stock_transformation_label"));
            else
                NotificationService.showError(t("verify_entered_data"), {}, t("stock_transformation_label"));

            setIsLoading(false);
        } catch (error) {
            console.log(error)
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    const getTransformationMovements = async () => {
        setIsLoading(true);
        if (!user) return;
        try {

            if (!user) { dispatch(onLogout(t("session_expired"))); return; }
            const promisesResult = await Promise.all([
                dbContext.stockMovements.find({
                    selector: {
                        "$and": [
                            { accountId: user.accountId },
                            { typeMovement: TypeMovement.Transformacion },
                        ],
                    }
                }),
                dbContext.deposits.find({ selector: { "accountId": user.accountId } }),
                dbContext.supplies.find({
                    selector: {
                        $or: [
                            { accountId: user.accountId },
                            { isDefault: true }
                        ]
                    },
                })
            ]);
            const transformMovements = promisesResult[0].docs;
            const deposits = promisesResult[1].docs;
            const supplies = promisesResult[2].docs;

            let movementsGroup: TransformMovementGroup = {};

            transformMovements.forEach(doc => {
                let docItem: StockMovementItem = { ...doc };
                docItem.deposit = deposits.find(d => d._id === doc.depositId);
                docItem.supply = supplies.find(s => s._id === doc.supplyId);

                if (docItem.creationDate in movementsGroup) {
                    if (docItem.isIncome)
                        movementsGroup[docItem.creationDate].income.push(docItem);
                    else
                        movementsGroup[docItem.creationDate].output.push(docItem);
                }
                else {
                    let movementIncome: StockMovementItem[] = [];
                    let movementOutput: StockMovementItem[] = [];
                    movementsGroup[docItem.creationDate] = {
                        income: docItem.isIncome ? movementIncome.concat(docItem) : movementIncome,
                        output: !docItem.isIncome ? movementOutput.concat(docItem) : movementOutput,
                    }
                }
            });
            setTransformMovements(movementsGroup);
            setIsLoading(false);
        } catch (error) {
            console.log(error)
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    return {
        transformMovements,
        isLoading,
        error,
        transformStock,
        getTransformationMovements
    }
}