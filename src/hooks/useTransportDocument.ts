import { useAppSelector } from "./useRedux";
import { useState } from "react";
import { TransportDocument } from "../interfaces/transportDocument";
import { dbContext } from "../services";
import Swal from "sweetalert2";


export const useTransportDocument = () => {

    // const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const [transportDocuments, setTransportDocuments] = useState<TransportDocument[]>([]);
    const [isLoading, setIsLoading] = useState(false);



    const getTransportDocuments = async () => {
        setIsLoading(true);
        try {
            if (!user) throw new Error("User not logged.");

            const response = await dbContext.TransportDocument.find({
                selector: { accountId: user?.accountId }
            });

            if (response.docs.length)
                setTransportDocuments(response.docs.map(doc => doc as TransportDocument));

            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error("Error al cargar documentos:", error);
        }
    }

    const addTransportDocument = async (newDocument: TransportDocument) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error("User not logged.");

            const response = await dbContext.TransportDocument.post({
                ...newDocument,
                accountId: user.accountId
            });
            setIsLoading(false);

            if (response.ok)
                Swal.fire("Carta de Porte", "Agregado con exito.", "success");
        } catch (error) {
            Swal.fire("Ups", "Ocurrio un error inesperado ", "error");
            setIsLoading(false);
            console.error("Error al cargar documentos:", error);
        }
    }


    return {
        transportDocuments,
        isLoading,

        getTransportDocuments,
        addTransportDocument
    }
}