import Swal from 'sweetalert2';
import { StockMovement, StockMovementItem, Supply, TypeMovement } from "../types";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { dbContext } from '../services';
import { useAppSelector } from './useRedux';


export const useStockMovement = () => {
    const navigate = useNavigate();
    const { user } = useAppSelector(state => state.auth);
    const [stockMovements, setStockMovements] = useState<StockMovementItem[]>([]);
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

    //TODO:
    // Si el movimiento es de tipo Compra, sumar la cantidad al stock actual del insumo
    // Si el movimiento es de tipo Venta, restar ||
    // Dependiendo si es ingreso o salida, hacer el calculo del mismo
    // validar si el tipo de movimiento es transferencia, generar 2 movimientos:
    // -1 egreso de stock del deposito
    // -2 ingreso de stock al deposito destino 
    // -3 actualizar el stock actual corrspondiente al insumo

    const addNewStockMovement = async (newMovement: StockMovement, supplyDto: Supply, depositIdDestination?: string) => {
        setIsLoading(true);
        let responseAll = null;
        try {
            if (!user) throw new Error();

            const { typeMovement, isIncome, amount } = newMovement;
            const accountId = user.accountId;
            const amountValue = Number(amount);

            if (!(typeMovement === TypeMovement.TransferenciaDeposito.toString())) {
                switch (typeMovement) {
                    case TypeMovement.Compra:
                        supplyDto.currentStock += amountValue;
                        break;
                    case TypeMovement.VentasVarias:
                        supplyDto.currentStock -= amountValue;
                        break;
                    case (TypeMovement.Ajustes || TypeMovement.Prestamos):
                        if (isIncome) supplyDto.currentStock += amountValue;
                        else supplyDto.currentStock -= amountValue;
                        break;
                    default:
                        if (isIncome) supplyDto.currentStock += amountValue;
                        else supplyDto.currentStock -= amountValue;
                        break;
                }
                responseAll = await Promise.all([
                    dbContext.supplies.put(supplyDto),
                    dbContext.stockMovements.post({ ...newMovement, accountId })
                ]);
            }
            else {
                if (!depositIdDestination) throw new Error();
                responseAll = await Promise.all([
                    dbContext.stockMovements.post({ ...newMovement, isIncome: false, accountId }),
                    dbContext.stockMovements.post({
                        ...newMovement,
                        depositId: depositIdDestination,
                        isIncome: true,
                        accountId
                    })
                ]);
            }
            // const response = await dbContext.stockMovements.post({ ...newMovement, accountId: user?.accountId });
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


    return {
        //* Props
        stockMovements,
        error,
        isLoading,

        //*Methods
        setStockMovements,
        getStockMovements,
        addNewStockMovement,
        updateMovement

    }
}