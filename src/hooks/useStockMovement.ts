import Swal from 'sweetalert2';
import { StockMovement } from "../types";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { dbContext } from '../services';


export const useStockMovement = () => {
    const navigate = useNavigate();
    const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const getStockMovements = async () => {
        setIsLoading(true);
        try {
            const result = await dbContext.stockMovements.allDocs({ include_docs: true });
            setIsLoading(false);

            if (result.rows.length) {
                const documents: StockMovement[] = result.rows.map(row => row.doc as StockMovement);
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

    const addNewStockMovement = async (newStockMovement: StockMovement) => {
        setIsLoading(true);
        try {
            const response = await dbContext.stockMovements.post(newStockMovement);
            setIsLoading(false);

            if (response.ok)
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