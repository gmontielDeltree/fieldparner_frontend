import Swal from 'sweetalert2';
import { Business } from "../types";
import { useState } from "react";
import { fieldpartnerAPI } from "../config";
import { HttpStatusCode } from "axios";
import { useNavigate } from 'react-router-dom';


const controller = "/business";

// const businessesData: Business[] = [
//     {
//         "id": "ec3590d5c24e5bec5a21299d3000cf77",
//         "tipoEntidad": "persona",
//         "cuit": "",
//         "documento": "35424827",
//         "razonSocial": "",
//         "nombreCompleto": "German Montiel",
//         "cp": "CP",
//         "domicilio": "Domicilio",
//         "localidad": "localidad",
//         "pais": "Argentina",
//         "provincia": "Bs As",
//         "email": "german_montiel96@hotmail.com",
//         "telefono": "",
//         "sitioWeb": "",
//         "contactoPrincipal": "",
//         "contactoSecundario": ""
//     },
//     {
//         "id": "ec3590d5c24e5bec5a21299d30018305",
//         "tipoEntidad": "juridica",
//         "cuit": "51047067/00112",
//         "documento": "",
//         "razonSocial": "QTSAgro Brasil",
//         "nombreCompleto": "",
//         "cp": "80240-110",
//         "domicilio": "Rua Bento Viana 553",
//         "localidad": "Curitiba",
//         "pais": "Brasil",
//         "provincia": "Parana",
//         "email": "juan.dambra@qtsagro.net",
//         "telefono": "+5541992590099",
//         "sitioWeb": "www.qtsagro.net",
//         "contactoPrincipal": "Juan",
//         "contactoSecundario": "Juan"
//     }
// ]

// const loadBusinesses = () => new Promise<Business[]>((resolve, reject) => {
//     setTimeout(() => {
//         if (businessesData.length)
//             resolve(businessesData);
//         else
//             reject("Businesses not found.");
//     }, 1000);
// });

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
            setIsLoading(false);

            if (response.status === HttpStatusCode.Ok)
                Swal.fire('Empresa/Persona', 'Empresa/persona actualizado.', 'success');
            navigate("/init/overview/business");
            
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
        setBusinesses,
        getBusinesses,
        createBusiness,
        updateBusiness

    }
}