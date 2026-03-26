import { useState } from 'react';
import { CertificateDeposit, CertificateDepositItemRow, TransportDocumentByCertificateDeposit } from "../interfaces/certificate-deposit";
import { useAppSelector } from "./useRedux";
import { dbContext } from '../services';
import { TransportDocument } from '../interfaces/transportDocument';
import { Campaign, EnumTransportDocumentStatus, Supply } from '../types';
import dayjs from 'dayjs';
import { CropStockControl } from '../interfaces/stock';
import { useTranslation } from 'react-i18next';
import { NotificationService } from '../services/notificationService';

export const useCertificateDeposit = () => {
    const { t } = useTranslation();
    const { user } = useAppSelector((state) => state.auth);
    const [certificateDepositsItem, setCertificateDepositsItem] = useState<CertificateDepositItemRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getCertificateDeposits = async () => {
        setIsLoading(true);
        try {
            if (!user) throw new Error(t("userNotLogged"));

            const responseAll = await Promise.all([
                dbContext.certificateDeposit.find({
                    selector: { accountId: user.accountId }
                }),
                dbContext.supplies.find({
                    selector: { accountId: user.accountId }
                }),
                dbContext.campaigns.find({
                    selector: { accountId: user.accountId }
                })
            ]);
            const certificateDeposits = responseAll[0].docs.map(doc => doc as CertificateDeposit);
            const supplies = responseAll[1].docs.map(doc => doc as Supply);
            const campaigns = responseAll[2].docs.map(doc => doc as Campaign);
            setCertificateDepositsItem(
                certificateDeposits.map(doc => {
                    const supply = supplies.find(supply => supply._id === doc.cultivoId);
                    const campaign = campaigns.find(camp => camp._id === doc.campaniaId);
                    return {
                        _id: doc._id,
                        _rev: doc._rev,
                        numeroCertificado: doc.certificacionElectronicaGranos?.coe || '',
                        archivoCertificado: doc.archivoCertificado,
                        campania: campaign?.name || campaign?.description || '',
                        cultivo: supply?.name || doc.certificacionElectronicaGranos?.granoYTipo || "",
                        fechaEmision: doc.certificacionElectronicaGranos?.fechaEmision || '',
                        planta: doc.plantaNro || '',
                        kgConfirmados: (doc.peso?.pesoNeto || 0).toString(),
                    } as CertificateDepositItemRow
                })
            );
            setIsLoading(false);

        } catch (error) {
            setIsLoading(false);
            console.error(t("errorLoadingDocuments"), error);
            NotificationService.showError(t("errorLoadingCertificates"), error, t("error_label"));
        }
    }

    const addCertificateDeposit = async (
        newDocument: CertificateDeposit,
        newTransportsByCert: TransportDocumentByCertificateDeposit[]) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error(t("userNotLogged"));

            const responseTransport = await dbContext.transportDocument.find({
                selector: {
                    accountId: user.accountId,
                    licenceId: user.licenceId,
                    nroCartaPorte: { "$in": newTransportsByCert.map(t => t.numeroCartaPorte) }
                }
            });
            const transportsDoc = responseTransport.docs as TransportDocument[];
            const updateStatusTransport = transportsDoc.map(doc => {
                return {
                    ...doc,
                    status: EnumTransportDocumentStatus.ENTREGADA
                }
            });

            const promiseAll = [
                dbContext.certificateDeposit.post({
                    ...newDocument,
                    accountId: user.accountId,
                    licenceId: user.licenceId,
                    createdDate: new Date().toISOString(),
                }),
                dbContext.transportDocumentCertificateDeposit.bulkDocs(newTransportsByCert),
                dbContext.transportDocument.bulkDocs(updateStatusTransport)
            ];
            const response = await Promise.all(promiseAll);

            // Actualizar stock entregado en control de cultivos
            try {
                const selector: any = {
                    selector: {
                        accountId: user.accountId,
                        licenceId: user.licenceId,
                        campaignId: newDocument.campaniaId,
                        cropId: newDocument.cultivoId,
                    }
                };
                const found = await dbContext.cropStockControl.find(selector);
                if (found.docs && found.docs.length > 0) {
                    const doc = found.docs[0] as CropStockControl & PouchDB.Core.IdMeta & PouchDB.Core.RevisionIdMeta;
                    const currentDelivered = Number(doc.deliveredStock || 0);
                    const toAdd = Math.max(0, Number(newDocument.peso?.pesoNeto) || 0);
                    await dbContext.cropStockControl.put({ ...doc, deliveredStock: currentDelivered + toAdd, lastUpdate: dayjs().toISOString() });
                }
            } catch (e) {
                console.warn('Crop stock control update skipped', e);
            }
            setIsLoading(false);
            if (response.length)
                NotificationService.showAdded(newDocument, t("certificateDeposit_label"));

        } catch (error) {
            setIsLoading(false);
            console.error(t("errorAddingDocument"), error);
            NotificationService.showError(t("unexpectedError"), error, t("error_label"));
        }
    }

    return {
        isLoading,
        certificateDepositsItem,
        addCertificateDeposit,
        getCertificateDeposits
    }
}