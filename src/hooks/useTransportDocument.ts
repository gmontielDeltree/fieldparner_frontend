import { useAppSelector } from "./useRedux";
import { useState } from "react";
import { TransportDocument, TransportDocumentItem } from "../interfaces/transportDocument";
import { dbContext } from "../services";
import { ExitField } from "../types";
import { Company } from "../interfaces/company";
import { useTranslation } from "react-i18next";
import { NotificationService } from "../services/notificationService";

export const useTransportDocument = () => {

    // const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const [transportDocumentsItem, setTransportDocumentsItem] = useState<TransportDocumentItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

    const getTransportDocuments = async () => {
        setIsLoading(true);
        try {
            if (!user) throw new Error(t("user_not_logged"));

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
            console.error(t("documents_loading_error"), error);
        }
    }

    // Función para verificar si existe un documento con el mismo número de carta de porte
    const checkDuplicateCartaPorte = async (nroCartaPorte: string, documentId?: string): Promise<boolean> => {
        if (!user) throw new Error(t("user_not_logged"));
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
            console.error(t("duplicate_check_error"), error);
            return false;
        }
    }

    const addTransportDocument = async (newDocument: TransportDocument) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error(t("user_not_logged"));

            // Verificar si el número de carta de porte ya existe
            const isDuplicate = await checkDuplicateCartaPorte(newDocument.nroCartaPorte);

            if (isDuplicate) {
                setIsLoading(false);
                NotificationService.showError(t("duplicate_waybill_number"), {}, t("error_label"));
                return false;
            }

            const response = await dbContext.transportDocument.post({
                ...newDocument,
                accountId: user.accountId,
                licenceId: user.licenceId
            });
            setIsLoading(false);

            if (response.ok) {
                NotificationService.showAdded({ document: newDocument.nroCartaPorte }, t("waybill_label"));
                return true;
            }
            return false;
        } catch (error) {
            NotificationService.showError(t("unexpected_error"), {}, t("oops_label"));
            setIsLoading(false);
            console.error(t("documents_loading_error"), error);
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
            if (!user) throw new Error(t("user_not_logged"));

            // Verificar si el número de carta de porte ya existe en otro documento
            const isDuplicate = await checkDuplicateCartaPorte(updateDoc.nroCartaPorte, updateDoc._id);

            if (isDuplicate) {
                setIsLoading(false);
                NotificationService.showError(t("duplicate_waybill_other_document"), {}, t("error_label"));
                return false;
            }

            const response = await dbContext.transportDocument.put({
                ...updateDoc,
                accountId: user.accountId,
                licenceId: user.licenceId
            });
            setIsLoading(false);

            if (response.ok) {
                NotificationService.showUpdated({ document: updateDoc.nroCartaPorte }, t("waybill_label"));
                return true;
            }
            return false;
        } catch (error) {
            NotificationService.showError(t("unexpected_error"), {}, t("oops_label"));
            setIsLoading(false);
            console.error(t("documents_loading_error"), error);
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