import Swal from 'sweetalert2';
import { ExitFieldItem, Movement, StockMovement, TypeMovement } from "../types";
import { useState } from "react";
import { dbContext } from '../services';
import { useAppSelector, useStockMovement } from '.';


export const useExitField = () => {
    // const navigate = useNavigate();
    const { user } = useAppSelector(state => state.auth);
    const { getStock } = useStockMovement();
    const [exitFields, setExitFields] = useState<ExitFieldItem[]>([]);
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const getExitFields = async () => {
        setIsLoading(true);
        try {

            if (!user) throw new Error("User not found");
            const promisesResult = await Promise.all([
                dbContext.exitFields.find({
                    selector: { "accountId": user?.accountId }
                }),
                dbContext.supplies.find({ selector: { "accountId": user?.accountId } }),
                dbContext.socialEntities.find({ selector: { "accountId": user?.accountId } }),
                dbContext.fields.find({ selector: { "accountId": user?.accountId } })
            ]);
            const exitFields = promisesResult[0].docs;
            const supplies = promisesResult[1].docs;
            const socialEntities = promisesResult[2].docs;
            const fields = promisesResult[3].docs;

            if (exitFields.length) {
                // const documents = exitFields.map(row => row as ExitField);
                const documents: ExitFieldItem[] = exitFields.map((row) => {
                    return {
                        ...row,
                        supply: supplies.find(s => s._id === row.cropId),
                        transport: socialEntities.find(s => s._id === row.transportId),
                        field: fields.find(s => s._id === row.fieldId),
                    } as ExitFieldItem
                });
                setExitFields(documents);
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error)
            Swal.fire('Error', 'Ocurrio un error inesperado: ' + error, 'error');
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    const createExitField = async (newExitField: ExitFieldItem) => {
        setIsLoading(true);
        try {

            if (!user) throw new Error("User not found");
            const { accountId, id: userId } = user;

            if (!newExitField.deposit || !newExitField.supply) throw new Error();

            let stockOfSupply = await getStock(
                newExitField.cropId,
                newExitField.depositId,
                newExitField.deposit.locations[0],
                ""
            );

            if (!stockOfSupply) throw new Error("Insufficient stock.");

            stockOfSupply.currentStock -= Number(newExitField.netWeight);
            let updateSupply = { ...newExitField.supply };
            updateSupply.currentStock -= Number(newExitField.netWeight);

            let newStockMovement: StockMovement = {
                accountId,
                userId,
                amount: newExitField.netWeight,
                depositId: newExitField.depositId,
                supplyId: newExitField.cropId,
                location: newExitField.deposit.locations[0],
                creationDate: newExitField.creationDate,
                campaignId: newExitField.campaignId,
                voucher: newExitField.additionalInformation,
                isIncome: false,
                currency: "",
                detail: `Salida de Campo: ${newExitField.creationDate}`,
                dueDate: "",
                nroLot: "",
                typeMovement: TypeMovement.SalidaDeCampo,
                hours: "",
                movement: Movement.Automatico,
                operationDate: newExitField.creationDate,
                totalValue: 0,
            };

            delete newExitField.supply;
            delete newExitField.deposit;
            delete newExitField.transport;
            // delete newExitField.harvester;

            const promisesAll = [
                dbContext.exitFields.post(newExitField),
                dbContext.stockMovements.post(newStockMovement),
                dbContext.stockByLots.put(stockOfSupply),
                dbContext.supplies.put(updateSupply)
            ]

            const responseAll = await Promise.all(promisesAll);

            if (responseAll)
                Swal.fire('Salida de Campo', 'Creado exitosamente.', 'success');
            else
                Swal.fire('Salida de Campo', 'Verificar campos.', 'error');

            setIsLoading(false);
            // navigate('/init/overview/business');
        } catch (error) {
            console.log(error)
            Swal.fire('Ups', 'Ocurrio un error inesperado: ' + error, 'error');
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