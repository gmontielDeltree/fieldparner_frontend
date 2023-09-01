import Swal from 'sweetalert2';
import { Business } from "@types";
import { useState } from "react";
import { fieldpartnerAPI } from "../config";
import { HttpStatusCode } from "axios";
import { useNavigate } from 'react-router-dom';


const controller = "/business";

export const useBusiness = () => {
    const navigate = useNavigate();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const getBusinesses = async () => {
        setIsLoading(true);
        try {
            const response = await fieldpartnerAPI.get(controller);
            setIsLoading(false);

            if (response.status === HttpStatusCode.Ok)
                setBusinesses(response.data);
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
            const response = await fieldpartnerAPI.post(controller, newBusiness);
            setIsLoading(false);

            if (response.status === HttpStatusCode.Created)
                Swal.fire('Empresa/Persona', 'Agregado.', 'success');
            else
                Swal.fire('Empresa/Persona', 'Verificar campos.', 'error');

            navigate('/init/overview/business');
        } catch (error) {
            console.log(error)
            Swal.fire('Ups', 'Ocurrio un error inesperado ', 'error');
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    const updateBusiness = async (businessId: string, updateBusiness: Business) => {
        setIsLoading(true);
        try {
            const response = await fieldpartnerAPI.patch(`${controller}/${businessId}`, updateBusiness);
            
            if (response.status === HttpStatusCode.Ok)
            Swal.fire('Empresa/Persona', 'Empresa/persona actualizado.', 'success');

        } catch (error) {
            console.log(error)
            Swal.fire('Error', 'No hay registro de la Empresa o Persona.', 'error');
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
        getBusinesses,
        createBusiness,
        updateBusiness

    }
}