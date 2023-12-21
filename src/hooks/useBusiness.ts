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
            setIsLoading(false);

            if (result.rows.length) {
                const documents: Business[] = result.rows.map(row => row.doc as Business);
                setBusinesses(documents);
            } else {
                setBusinesses([]);
            }

        } catch (error) {
            console.log(error)
            //Swal.fire('Error', 'No hay registro de empresas/personas.', 'error');
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    const createBusiness = async (newBusiness: Business) => {
        setIsLoading(true);

        try {
            const response = await dbContext.socialEntities.post(newBusiness);
            setIsLoading(false);

            if (response.ok) {
                Swal.fire({
                    title: 'Entidad Social',
                    text: 'Agregada con éxito.',
                    icon: 'success',
                });
            } else {
                Swal.fire({
                    title: 'Entidad Social',
                    text: 'Error al agregar. Verifica los campos.',
                    icon: 'error',
                });
            }

            navigate('/init/overview/business');
        } catch (error) {
            console.log(error);
            Swal.fire({
                title: 'Ups',
                text: 'Ocurrió un error inesperado.',
                icon: 'error',
            });
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

            if (response.ok) {
                Swal.fire({
                    title: 'Entidad Social',
                    text: 'Actualizada con éxito.',
                    icon: 'success',
                });
            }
            navigate("/init/overview/business");

        } catch (error) {
            console.log(error)
            Swal.fire({
                title: 'Error',
                text: 'No hay registro de la Entidad Social.',
                icon: 'error',
            });
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    const deleteBusiness = async (businessId: string, revBusiness: string) => {
        setIsLoading(true);
        try {
            const response = await dbContext.socialEntities.remove(businessId, revBusiness);
            setIsLoading(false);

            if (response.ok) {
                Swal.fire({
                    title: 'Entidad Social',
                    text: 'Eliminada con éxito.',
                    icon: 'success',
                });
            }
            navigate("/init/overview/business");

        } catch (error) {
            console.log(error)
            Swal.fire({
                title: 'Error',
                text: 'No hay registro de la Entidad Social.',
                icon: 'error',
            });
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    return {
        //* Props
        businesses,
        error,
        isLoading,
   

        //* Methods
        setBusinesses,
        deleteBusiness,
        getBusinesses,
        createBusiness,
        updateBusiness,
    }
};