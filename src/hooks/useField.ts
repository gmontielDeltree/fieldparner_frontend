import Swal from "sweetalert2";
import { Field } from "@types";
import { useState } from "react";
import { dbContext } from "../services";
import { useAppSelector } from ".";


export const useField = () => {

    const { user } = useAppSelector(state => state.auth);
    const [fields, setFields] = useState<Field[]>([]);
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const getFields = async () => {
        setIsLoading(true);
        try {
            if (!user) throw new Error("User not found");

            // const result = await dbContext.fields.allDocs({ include_docs: true });
            const result = await dbContext.fields.find({
                selector: { "accountId": user.accountId }
            });

            // const vehiculos = response.map((v: any) => v.content);
            if (result.docs.length) {
                const documents: Field[] = result.docs.map(doc => doc as Field);
                setFields(documents);
            }

            setIsLoading(false);
        } catch (error) {
            console.log(error)
            Swal.fire('Error', 'No hay registro de Campos.', 'error');
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    return {
        //* Props
        campaigns: fields,
        error,
        isLoading,

        //*Methods
        getFields,
    }

}