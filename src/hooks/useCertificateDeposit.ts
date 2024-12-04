import { useState } from 'react';
import { CertificateDeposit, CertificateDepositItemRow, TransportDocumentByCertificateDeposit } from "../interfaces/certificate-deposit";
import { useAppSelector } from "./useRedux";
import { dbContext } from '../services';
import { TransportDocument } from '../interfaces/transportDocument';
import { EnumTransportDocumentStatus, Supply } from '../types';
import Swal from 'sweetalert2';


export const useCertificateDeposit = () => {

    const { user } = useAppSelector((state) => state.auth);
    const [certificateDepositsItem, setCertificateDepositsItem] = useState<CertificateDepositItemRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);


    const getCertificateDeposits = async () => {
        setIsLoading(true);
        try {
            if (!user) throw new Error("User not logged.");

            const responseAll = await Promise.all([
                dbContext.certificateDeposit.find({
                    selector: { accountId: user.accountId }
                }),
                dbContext.supplies.find({
                    selector: { accountId: user.accountId }
                })
            ]);
            const certificateDeposits = responseAll[0].docs.map(doc => doc as CertificateDeposit);
            const supplies = responseAll[1].docs.map(doc => doc as Supply);
            setCertificateDepositsItem(
                certificateDeposits.map(doc => {
                    const supply = supplies.find(supply => supply._id === doc.cultivoId);
                    return {
                        _id: doc._id,
                        _rev: doc._rev,
                        numeroCertificado: doc.numeroCertificado,
                        archivoCertificado: doc.archivoCertificado,
                        campania: doc.campaniaId,
                        cultivo: supply?.name || "",
                        fechaEmision: doc.fechaEmision,
                        planta: doc.planta,
                        kgConfirmados: doc.kgNeto.toString(),
                    } as CertificateDepositItemRow
                })
            );
            setIsLoading(false);

        } catch (error) {
            setIsLoading(false);
            console.error("Error al cargar documentos:", error);
        }
    }

    const addCertificateDeposit = async (
        newDocument: CertificateDeposit,
        newTransportsByCert: TransportDocumentByCertificateDeposit[]) => {
        setIsLoading(true);
        try {

            if (!user) throw new Error("User not logged.");

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
            setIsLoading(false);
            if (response.length)
                Swal.fire("Certificado de Deposito", "Agregado con exito.", "success");

        } catch (error) {
            setIsLoading(false);
            console.error("Error al agregar documento:", error);
            Swal.fire("Ups", "Ocurrio un error inesperado ", "error");
        }
    }

    return {
        isLoading,
        certificateDepositsItem,
        addCertificateDeposit,
        getCertificateDeposits

    }
}