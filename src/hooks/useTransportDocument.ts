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

    // Función para verificar si existe un documento con el mismo número de carta de porte
    const checkDuplicateCartaPorte = async (nroCartaPorte: string, documentId?: string): Promise<boolean> => {
        if (!user) throw new Error("User not logged.");
        if (!nroCartaPorte) return false;

        try {
            // Buscar documentos con el mismo número de carta de porte
            const response = await dbContext.transportDocument.find({
                selector: {
                    accountId: user?.accountId,
                    nroCartaPorte: nroCartaPorte
                }
            });

            const existingDocs = response.docs as TransportDocument[];

            // Si es una actualización, excluimos el documento actual de la verificación
            if (documentId) {
                return existingDocs.some(doc => doc._id !== documentId);
            }

            // Si es una creación nueva, cualquier resultado significa duplicado
            return existingDocs.length > 0;
        } catch (error) {
            console.error("Error al verificar duplicados:", error);
            return false;
        }
    }

    const addTransportDocument = async (newDocument: TransportDocument) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error("User not logged.");

            // Verificar si el número de carta de porte ya existe
            const isDuplicate = await checkDuplicateCartaPorte(newDocument.nroCartaPorte);

            if (isDuplicate) {
                setIsLoading(false);
                Swal.fire("Error", "Ya existe un documento con el mismo número de Carta de Porte.", "error");
                return false;
            }

            const response = await dbContext.transportDocument.post({
                ...newDocument,
                accountId: user.accountId,
                licenceId: user.licenceId
            });
            setIsLoading(false);

            if (response.ok) {
                Swal.fire("Carta de Porte", "Agregado con éxito.", "success");
                return true;
            }
            return false;
        } catch (error) {
            Swal.fire("Ups", "Ocurrió un error inesperado ", "error");
            setIsLoading(false);
            console.error("Error al cargar documentos:", error);
            return false;
        }
    }

    const getTransporDocumentById = async (id: string) => {
        return dbContext.transportDocument.get(id).then((doc) => {
            return doc as TransportDocument;
        }).catch((error) => {
            console.log('error', error);
            return null;
        });
    }

    const updateTransportDocument = async (updateDoc: TransportDocument) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error("User not logged.");

            // Verificar si el número de carta de porte ya existe en otro documento
            const isDuplicate = await checkDuplicateCartaPorte(updateDoc.nroCartaPorte, updateDoc._id);

            if (isDuplicate) {
                setIsLoading(false);
                Swal.fire("Error", "Ya existe otro documento con el mismo número de Carta de Porte.", "error");
                return false;
            }

            const response = await dbContext.transportDocument.put({
                ...updateDoc,
                accountId: user.accountId,
                licenceId: user.licenceId
            });
            setIsLoading(false);

            if (response.ok) {
                Swal.fire("Carta de Porte", "Actualizado con éxito.", "success");
                return true;
            }
            return false;
        } catch (error) {
            Swal.fire("Ups", "Ocurrió un error inesperado ", "error");
            setIsLoading(false);
            console.error("Error al cargar documentos:", error);
            return false;
        }
    }

    return {
        transportDocumentsItem,
        isLoading,

        getTransportDocuments,
        addTransportDocument,
        getTransporDocumentById,
        updateTransportDocument,
        checkDuplicateCartaPorte
    }
}