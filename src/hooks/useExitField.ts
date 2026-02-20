import { Crop, ExitFieldItem, Movement, StockMovement, TypeMovement } from "../types";
import { useState } from "react";
import { dbContext } from '../services';
import { useAppSelector, useStockMovement } from '.';
import { useTranslation } from "react-i18next";
import { NotificationService } from "../services/notificationService";

export const useExitField = () => {
    // const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAppSelector(state => state.auth);
    const { getControlStockCrop, updateCropStockTables } = useStockMovement();
    const [exitFields, setExitFields] = useState<ExitFieldItem[]>([]);
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const getExitFields = async () => {
        setIsLoading(true);
        try {
            if (!user) throw new Error(t("userNotFound"));
            const promisesResult = await Promise.all([
                dbContext.exitFields.find({
                    selector: { "accountId": user?.accountId }
                }),
                dbContext.crops.allDocs({ include_docs: true }),
                dbContext.socialEntities.find({ selector: { "accountId": user?.accountId } }),
                dbContext.fields.find({ selector: { "accountId": user?.accountId } }),
                dbContext.campaigns.find({ selector: { "accountId": user?.accountId } })
            ]);
            const exitFields = promisesResult[0].docs;
            const crops = promisesResult[1].rows.map(row => row.doc as Crop);
            const socialEntities = promisesResult[2].docs;
            const fields = promisesResult[3].docs;
            const campaigns = promisesResult[4].docs;

            if (exitFields.length) {
                const documents: ExitFieldItem[] = exitFields.map((row) => {
                    const fieldDoc = fields.find(s => s._id === row.fieldId);
                    const lot = fieldDoc?.lotes?.find((l: any) =>
                        (l.properties?.uuid || l.id) === row.lotId
                    );
                    return {
                        ...row,
                        crop: crops.find(s => s._id === row.cropId),
                        transport: socialEntities.find(s => s._id === row.transportId),
                        field: fieldDoc,
                        campaign: campaigns.find((c: any) => c._id === row.campaignId || c.campaignId === row.campaignId),
                        lot,
                    } as ExitFieldItem
                });
                setExitFields(documents);
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error)
            NotificationService.showError(t("unexpectedError", { error }), error, t("error_label"));
            setIsLoading(false);
            if (error) setError(error);
        }
    }
    //Modificar el stock del cultivo en la tabla STOCK DE CULTIVOS
    const createExitField = async (newExitField: ExitFieldItem) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error(t("userNotFound"));
            const { accountId, id: userId } = user;
            newExitField.accountId = accountId;

            if (!newExitField.deposit || !newExitField.crop) {
                throw new Error(t("depositOrCropNotSelected"));
            }

            // Asegurarse de que netWeight sea un número válido y positivo
            const safeNetWeight = Math.max(0, Number(newExitField.netWeight) || 0);

            // Actualizar el valor en el objeto para asegurar consistencia
            newExitField.netWeight = safeNetWeight;

            // Buscar control de stock del cultivo por campaña
            let stockOfCrop = await getControlStockCrop({
                accountId,
                campaignId: newExitField.campaignId,
                cropId: newExitField.cropId
            });

            if (!stockOfCrop) {
                throw new Error(t("insufficientOrNotFoundStock"));
            }

            // Restar del stock disponible
            stockOfCrop.currentStock = Number(stockOfCrop.currentStock || 0) - safeNetWeight;
            stockOfCrop.lastUpdate = new Date().toISOString();

            //Modificar movimiento de stock para q tenga cropId , y un booleano para saber si es insumo o cultivo
            let newStockMovement: StockMovement = {
                accountId,
                userId,
                amount: safeNetWeight,
                depositId: newExitField.depositId,
                cropId: newExitField.cropId,
                isCrop: true,
                location: newExitField.deposit.locations && newExitField.deposit.locations.length > 0
                    ? newExitField.deposit.locations[0]
                    : "",
                creationDate: newExitField.creationDate,
                campaignId: newExitField.campaignId,
                voucher: newExitField.additionalInformation || "",
                isIncome: false,
                currency: "",
                detail: t("fieldExitDetail", { date: newExitField.creationDate }),
                dueDate: "",
                nroLot: "",
                typeMovement: TypeMovement.SalidaDeCampo,
                hours: "",
                movement: Movement.Automatico,
                operationDate: newExitField.creationDate,
                totalValue: 0,
            };

            // Crear una copia limpia del objeto sin referencias complejas
            const cleanExitField = { ...newExitField };

            // Eliminar objetos complejos para evitar errores de serialización
            delete cleanExitField.crop;
            delete cleanExitField.deposit;
            delete cleanExitField.transport;
            delete cleanExitField.campaign;
            delete cleanExitField.field;
            delete cleanExitField.lot;
            delete cleanExitField.harvester;
            delete cleanExitField.trucker;

            // Asegurarse de que todos los valores numéricos sean números válidos
            cleanExitField.grossWeight = Math.max(0, Number(cleanExitField.grossWeight) || 0);
            cleanExitField.tareWeight = Math.max(0, Number(cleanExitField.tareWeight) || 0);
            cleanExitField.humidityPercentage = Math.max(0, Number(cleanExitField.humidityPercentage) || 0);
            cleanExitField.mermaPercentage = Math.max(0, Number(cleanExitField.mermaPercentage) || 0);
            cleanExitField.volatilePercentage = Math.max(0, Number(cleanExitField.volatilePercentage) || 0);
            cleanExitField.otherPercentage = Math.max(0, Number(cleanExitField.otherPercentage) || 0);
            cleanExitField.totalMerma = Math.max(0, Number(cleanExitField.totalMerma) || 0);
            cleanExitField.kgNet = Math.max(0, Number(cleanExitField.kgNet) || 0);

            const promisesAll = [
                dbContext.exitFields.post(cleanExitField),
                dbContext.stockMovements.post(newStockMovement),
                dbContext.cropStockControl.put(stockOfCrop),
                updateCropStockTables(newStockMovement, newExitField.crop, newExitField.deposit, { zafra: newExitField.zafra })
            ]

            const responseAll = await Promise.all(promisesAll);

            if (responseAll) {
                NotificationService.showSuccess(t("createdSuccessfully"), newExitField, t("fieldExit_label"));
            } else {
                NotificationService.showError(t("verifyFields"), newExitField, t("fieldExit_label"));
            }

            setIsLoading(false);
        } catch (error) {
            console.log("Error en createExitField:", error);
            NotificationService.showError(t("unexpectedError", { error }), error, t("error_label"));
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    return {
        //* Props
        exitFields,
        error,
        isLoading,

        //*Methods
        setExitFields,
        getExitFields,
        createExitField,
    }
}