import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useState } from "react"
import { MenuModules } from "../interfaces/menuModules";
import { dbContext } from "../services/pouchdbService";


export const useMenuModules = () => {

    const navigate = useNavigate();
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [menuModules, setMenuModule] = useState<MenuModules[]>([]);



    const createMenuModules = async (newMenuModules: MenuModules) => {
        setIsLoading(true);
        try {
            const response = await dbContext.menuModules.post(newMenuModules);

            setIsLoading(false);
            if (response.ok)
                Swal.fire('Menu Modulo', 'Nuevo Menu Modulo agregado.', 'success');
            else
                Swal.fire('Cliente', 'Verificar campos obligatorios.', 'error');

            navigate('/menus-modules');
        } catch (error) {
            console.log(error)
            Swal.fire('Ups', 'Ocurrio un error inesperado ', 'error');
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    const getMenuModules = async () => {
        setIsLoading(true);
        try {
            const response = await dbContext.menuModules.allDocs({ include_docs: true });

            setIsLoading(false);

            if (response.rows.length) {
                const documents: MenuModules[] = response.rows.map(row => row.doc as MenuModules);
                setMenuModule(documents);
            }
            else
                setMenuModule([]);

        } catch (error) {
            console.log(error)
            Swal.fire('Error', 'No se encontraron Menu Modulo.', 'error');
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    const updateMenuModules = async (updateMenuModules: MenuModules) => {
        setIsLoading(true);

        try {
            const response = await dbContext.menuModules.put(updateMenuModules);
            setIsLoading(false);

            if (response.ok)
                Swal.fire('Menu Modulo', 'Actualizado.', 'success');

            navigate('/menus-modules');
        } catch (error) {
            console.log(error)
            Swal.fire('Error', 'No se encontraron licenes.', 'error');
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    const removeMenuModules = async (menuModulesId: string, revMenuModules: string) => {
        setIsLoading(true);

        try {
            const response = await dbContext.menuModules.remove(menuModulesId, revMenuModules);
            setIsLoading(false);

            if (response.ok)
                Swal.fire('Menu Modulo', 'Eliminado.', 'success');

            navigate('/menus-modules');
        } catch (error) {
            console.log(error)
            Swal.fire('Error', 'No se encontraron Menu Modulo.', 'error');
            setIsLoading(false);
            if (error) setError(error);
        }
    }



    return {
        //* Propiedades
        error,
        isLoading,
        menuModules,

        //* Métodos
        createMenuModules,
        getMenuModules,
        setMenuModule,
        updateMenuModules,
        removeMenuModules,
    };
};