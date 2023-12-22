import Swal from 'sweetalert2';
import { ExitField } from "../types";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { dbContext } from '../services';


export const useExitField = () => {
    const navigate = useNavigate();
    const [exitFields, setExitFields] = useState<ExitField[]>([]);
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const getExitFields = async () => {
        setIsLoading(true);
        try {
            const result = await dbContext.exitFields.allDocs({ include_docs: true });
            // const response = await fieldpartnerAPI.get(controller);
            setIsLoading(false);

            if (result.rows.length) {
                const documents: ExitField[] = result.rows.map(row => row.doc as ExitField);
                setExitFields(documents);
            }
            else
                setExitFields([]);

        } catch (error) {
            console.log(error)
            // Swal.fire('Error', 'No hay registro de empresas/personas.', 'error');
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    const createExitField = async (newExitField: ExitField) => {
        setIsLoading(true);
        try {
            const response = await dbContext.exitFields.post(newExitField);
            setIsLoading(false);

            if (response.ok)
                Swal.fire('Entidad Social', 'Agregado.', 'success');
            else
                Swal.fire('Entidad Social', 'Verificar campos.', 'error');

            navigate('/init/overview/business');
        } catch (error) {
            console.log(error)
            Swal.fire('Ups', 'Ocurrio un error inesperado ', 'error');
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