import Swal from 'sweetalert2';
import { Business } from "../types";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { dbContext } from '../services';


export const useBusiness = () => {
    const navigate = useNavigate();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const getBusinesses = async () => {
        setIsLoading(true);
        try {
            const result = await dbContext.socialEntities.allDocs({ include_docs: true });
            // const response = await fieldpartnerAPI.get(controller);
            setIsLoading(false);

            if (result.rows.length) {
                const documents: Business[] = result.rows.map(row => row.doc as Business);
                setBusinesses(documents);
            }
            else
                setBusinesses([]);

        } catch (error) {
            console.log(error)
            // Swal.fire('Error', 'No hay registro de empresas/personas.', 'error');
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    const createBusiness = async (newBusiness: Business) => {
        setIsLoading(true);
        try {
            const response = await dbContext.socialEntities.post(newBusiness);
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

    const updateBusiness = async (updateBusiness: Business) => {
        setIsLoading(true);
        try {
            // const response = await fieldpartnerAPI.patch(`${controller}/${businessId}`, updateBusiness);
            const response = await dbContext.socialEntities.put(updateBusiness);

            setIsLoading(false);

            if (response.ok)
                Swal.fire('Entidad Social', 'Actualizado.', 'success');
            navigate("/init/overview/business");

        } catch (error) {
            console.log(error)
            Swal.fire('Error', 'No hay registro de la Entidad Social.', 'error');
            setIsLoading(false);
            if (error) setError(error);
        }
    }


    return {
        //* Props
        businesses,
        error,
        isLoading,

        //*Methods
        setBusinesses,
        getBusinesses,
        createBusiness,
        updateBusiness

    }
}