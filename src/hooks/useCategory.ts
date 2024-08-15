import Swal from 'sweetalert2';
import { useState } from "react"
import { Category } from "../types";
import { dbContext } from "../services/pouchdbService";


export const useCategory = () => {

    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const getCategories = async () => {
        setIsLoading(true);
        try {
            const response = await dbContext.categories.allDocs({ include_docs: true });

            setIsLoading(false);

            if (response.rows.length) {
                const documents: Category[] = response.rows.map(row => row.doc as Category);
                setCategories(documents);
            }
            else
                setCategories([]);

        } catch (error) {
            console.log(error)
            Swal.fire('Error', 'No se encontraron categorias.', 'error');
            setIsLoading(false);
            if (error) setError(error);
        }
    }




    return {
        //* Propiedades
        error,
        isLoading,
        categories,

        //* Métodos
        getCategories,
        // setCategories,
    }
}