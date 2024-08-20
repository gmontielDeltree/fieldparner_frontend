import { useAppSelector } from "./useRedux";
import { useState } from "react";
import { TransportDocument, TransportDocumentItem } from "../interfaces/transportDocument";
import { dbContext } from "../services";
import Swal from "sweetalert2";
import { ExitField } from "../types";
import { Company } from "../interfaces/company";


export const useTransportDocument = () => {

    // const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const [transportDocumentsItem, setTransportDocumentsItem] = useState<TransportDocumentItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);



    const getTransportDocuments = async () => {
        setIsLoading(true);
        try {
            if (!user) throw new Error("User not logged.");

            const response = await Promise.all([
                dbContext.transportDocument.find({
                    selector: { accountId: user?.accountId }
                }),
                dbContext.exitFields.find({
                    selector: { accountId: user?.accountId }
                }),
                dbContext.companies.find({
                    selector: { accountId: user?.accountId }
                })
            ]);
            const transportDocuments = response[0].docs.map(doc => doc as TransportDocument);
            const exitFields = response[1].docs.map(doc => doc as ExitField);
            const companies = response[2].docs.map(doc => doc as Company);

            if (transportDocuments.length) {
                setTransportDocumentsItem(transportDocuments.map(doc => {
                    const exitField = exitFields.find(exit => exit._id === doc.salidaCampoId);
                    const company = companies.find(company => company.trybutaryCode === doc.cuitCompania);
                    return {
                        ...doc,
                        exitField,
                        company
                    }
                }));
            }

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

            const response = await dbContext.transportDocument.post({
                ...newDocument,
                accountId: user.accountId,
                licenceId: user.licenceId
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
        transportDocumentsItem,
        isLoading,

        getTransportDocuments,
        addTransportDocument
    }
}