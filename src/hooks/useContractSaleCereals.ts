import dayjs from 'dayjs';
import { ContractDeliveyDate, ContractSaleCereal, ContractSaleCerealItem } from '../interfaces/contract-sale-cereals';
import { onLogout } from '../redux/auth';
import { dbContext } from '../services';
import { useAppDispatch, useAppSelector } from './useRedux';
import { useState } from 'react';
import { CropDeposit } from '../interfaces/crop-deposit';
import { Campaign, Crop, EnumStatusContract, Numerator, NumeratorType, OriginDestinations } from '../types';
import { Company } from '../interfaces/company';
import { Business } from '../interfaces/socialEntity';
import { useNumerator } from './useNumerator';
import { TransportDocument } from '../interfaces/transportDocument';
import { TransportDocumentByCertificateDeposit } from '../interfaces/certificate-deposit';
import { useTranslation } from 'react-i18next';
import { NotificationService } from '../services/notificationService';

export const useContractSaleCereals = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { getLastNumerator, putLastNumerator } = useNumerator();
    const [contractsSaleCerealsFull, setContractsSaleCerealsFull] = useState<ContractSaleCerealItem[]>([]);
    const [contractsSaleCereals, setContractsSaleCereals] = useState<ContractSaleCereal[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Busca por cada nro carta de porte q tenga un certificado de deposito, el kg neto confirmado
    const getTotalKgConfirmado = async (numerosCartaPorte: string[]) => {
        let totalKgConfirmado = 0;
        if (numerosCartaPorte.length === 0) return totalKgConfirmado;
        // obtenemos los certificados de deposito por nro de carta de porte
        const responseCPorteXCertDeposito = await dbContext.transportDocumentCertificateDeposit.find({
            selector: {
                numeroCartaPorte: { "$in": numerosCartaPorte }
            }
        });
        if (responseCPorteXCertDeposito) {
            const certificateDeposit = responseCPorteXCertDeposito.docs.map(doc => doc as TransportDocumentByCertificateDeposit);
            certificateDeposit.forEach((certDep) => {
                totalKgConfirmado += certDep.kgNeto;
            });
        }
        return totalKgConfirmado;
    };

    const getContractsSaleCereals = async (withRelations = true) => {
        setIsLoading(true);
        try {
            if (!user) {
                dispatch(onLogout(t("sessionExpired")));
                setIsLoading(false);
                return;
            };
            const selectorWithLicence = {
                selector: { accountId: user.accountId, licenceId: user.licenceId }
            };
            const selectorWithoutLicence = { selector: { accountId: user.accountId } };

            if (!withRelations) {
                const response = await Promise.all([dbContext.contractSaleCereals.find(selectorWithLicence)]);
                if (response) {
                    const contracts = response[0].docs.map(doc => doc as ContractSaleCereal);
                    setContractsSaleCereals(contracts);
                }
                else { setContractsSaleCereals([]); }
                return;
            }
            const responseAll = await Promise.all([
                dbContext.contractSaleCereals.find(selectorWithLicence),
                dbContext.campaigns.find(selectorWithoutLicence),
                dbContext.crops.allDocs({ include_docs: true }),
                dbContext.companies.find(selectorWithLicence),
                dbContext.socialEntities.find(selectorWithoutLicence),
                dbContext.originsDestinations.allDocs({ include_docs: true }),
                dbContext.transportDocument.find(selectorWithLicence),
            ]);

            if (responseAll) {
                const contracts = responseAll[0].docs.map(doc => doc as ContractSaleCereal);
                const campaigns = responseAll[1].docs.map(doc => doc as Campaign);
                const crops = responseAll[2].rows.map(row => row.doc as Crop);
                const companies = responseAll[3].docs.map(doc => doc as Company);
                const socialEntities = responseAll[4].docs.map(doc => doc as Business);
                const originsDestinations = responseAll[5].rows.map(row => row.doc as OriginDestinations);
                const listCartaPorte = responseAll[6].docs.map(doc => doc as TransportDocument);

                const contractsSaleCerealItem = await Promise.all(
                    contracts.map(async (contract) => {
                        // Obtener los nros de carta de porte por contrato
                        let cartaPorteXContratoVtaCereal: string[] = [];
                        listCartaPorte.forEach((cartaPorte) => {
                            if (cartaPorte.contractSaleNumber === contract.contractSaleNumber) {
                                cartaPorteXContratoVtaCereal.push(cartaPorte.nroCartaPorte);
                            }
                        });
                        const totalKgDelivered = await getTotalKgConfirmado(cartaPorteXContratoVtaCereal);

                        const campaign = campaigns.find((campaign: Campaign) => campaign._id === contract.campaignId);
                        const crop = crops.find((crop: any) => crop._id === contract.cropId);
                        const company = companies.find((company: any) => company._id === contract.companyId);
                        const producer = socialEntities.find((socialEntity: any) => socialEntity._id === contract.producerId);
                        const buyer = socialEntities.find((socialEntity: any) => socialEntity._id === contract.buyerId);
                        const destination = originsDestinations.find((originDestination: any) => originDestination._id === contract.destinationId);
                        const deliver = socialEntities.find((socialEntity: any) => socialEntity._id === contract.delivererId);
                        const broker = socialEntities.find((socialEntity: any) => socialEntity._id === contract.brokerId);
                        const comssionAgent = socialEntities.find((socialEntity: any) => socialEntity._id === contract.comissionAgentId);

                        return {
                            ...contract,
                            campaign,
                            crop,
                            company,
                            producer,
                            buyer,
                            destination,
                            deliver,
                            broker,
                            comssionAgent,
                            kgDelivered: totalKgDelivered.toString()
                        } as ContractSaleCerealItem;
                    })
                )
                setContractsSaleCerealsFull(contractsSaleCerealItem);
            }
            else
                setContractsSaleCerealsFull([]);
        } catch (error) {
            setIsLoading(false);
            console.error(t("errorLoadingDocuments"), error);
            NotificationService.showError(t("errorGettingContracts"), error, t("error_label"));
            return false;
        }
    };

    const getContractSaleCerealByContractNumber = async (contractNumber: string) => {
        try {
            if (!user) {
                dispatch(onLogout(t("sessionExpired")));
                setIsLoading(false);
                return null;
            };
            const { docs } = await dbContext.contractSaleCereals.find({
                selector: {
                    accountId: user.accountId,
                    licenceId: user.licenceId,
                    contractSaleNumber: contractNumber
                }
            });
            return docs[0] as ContractSaleCereal;
        } catch (error) {
            console.log(t("errorGettingContract"), error);
            NotificationService.showError(t("errorGettingContractByNumber"), error, t("error_label"));
            return null;
        }
    };
    //TODO: revisar despues de crear la db remota
    const getContractNumber = async () => {
        try {
            if (!user) {
                dispatch(onLogout(t("sessionExpired")));
                setIsLoading(false);
                return null;
            };
            const responseContractNumber = await getLastNumerator(user.accountId, NumeratorType.ContractSaleCereal);
            if (responseContractNumber) return responseContractNumber.lastNumerator + 1;
            console.log(t("contractNumberNotFound"));
            return 1;
        } catch (error) {
            console.log(t("errorGettingContractNumber"), error);
            NotificationService.showError(t("errorGettingContractNumber"), error, t("error_label"));
            return 0;
        }
    }

    const putContracSaleNumber = async () => {
        try {
            if (!user) {
                dispatch(onLogout(t("sessionExpired")));
                setIsLoading(false);
                return null;
            };
            let initializeContractCerealNumerator: Numerator = {
                accountId: user.accountId,
                numeratorType: NumeratorType.ContractSaleCereal,
                lastNumerator: 1
            };

            const contractNumberFound = await getLastNumerator(user.accountId, NumeratorType.ContractSaleCereal);

            if (!contractNumberFound) {
                await putLastNumerator(initializeContractCerealNumerator, true);
            } else {
                let putContractNumber = { ...contractNumberFound };
                putContractNumber.lastNumerator = (contractNumberFound.lastNumerator + 1);
                await putLastNumerator(putContractNumber, false);
            }
            return true;
        } catch (error) {
            console.log(t("errorUpdateContractCereal"), error);
            NotificationService.showError(t("errorUpdateContractCereal"), error, t("error_label"));
            return false;
        }
    }

    const addContractSaleCereal = async (newContract: ContractSaleCereal, newDeliveryDates: string[]) => {
        setIsLoading(true);
        try {
            if (!user) {
                dispatch(onLogout(t("sessionExpired")));
                setIsLoading(false);
                return;
            };
            await putContracSaleNumber();
            const contractNumber = newContract.contractSaleNumber;
            const newDeliveryDatesData = newDeliveryDates.map((date) => {
                return {
                    contractSaleNumber: contractNumber,
                    deliveryDate: date,
                    dateCreated: dayjs().format('YYYY-MM-DD HH:mm:ss')
                } as ContractDeliveyDate;
            });
            const response = await Promise.all([
                dbContext.contractSaleCereals.post({
                    ...newContract,
                    contractSaleNumber: contractNumber,
                    accountId: user.accountId,
                    licenceId: user.licenceId,
                    currency: user.currency,
                    status: EnumStatusContract.Activo
                }),
                dbContext.contractDeliveryDates.bulkDocs(newDeliveryDatesData)
            ]);

            // Actualizar stock comprometido en control de cultivos
            try {
                const selector: any = {
                    selector: {
                        accountId: user.accountId,
                        licenceId: user.licenceId,
                        campaignId: newContract.campaignId,
                        cropId: newContract.cropId,
                    }
                };
                // Si hay zafra en la campaña, intentamos reducir con zafra exacta; si no, sin zafra
                // zafra viene de la campaña, pero el form no lo mapea aún; soporte básico sin zafra
                const found = await dbContext.cropDeposits.find(selector);
                if (found.docs && found.docs.length > 0) {
                    const doc = found.docs[0] as CropDeposit & PouchDB.Core.IdMeta & PouchDB.Core.RevisionIdMeta;
                    const currentCommitted = Number(doc.committedStock || 0);
                    const toDiscount = Math.max(0, Number(newContract.kg) || 0);
                    await dbContext.cropDeposits.put({ ...doc, committedStock: Math.max(0, currentCommitted - toDiscount), lastUpdate: dayjs().toISOString() });
                }
            } catch (e) {
                console.warn('Crop stock control update skipped', e);
            }

            setIsLoading(false);

            if (response[0].ok) {
                NotificationService.showAdded(newContract, t("contractSaleCereal_label"));
            }

            return response[0].ok;

        } catch (error) {
            setIsLoading(false);
            console.error(t("errorLoadingDocuments"), error);
            NotificationService.showError(t("errorAddingContractCereal"), error, t("error_label"));
            return false;
        }
    };

    const updateContractSaleCereal = async (updateContract: ContractSaleCereal) => {
        // Implementación pendiente
    };

    return {
        contractsSaleCerealsFull,
        contractsSaleCereals,
        isLoading,
        getContractsSaleCereals,
        getContractNumber,
        getContractSaleCerealByContractNumber,
        addContractSaleCereal,
        updateContractSaleCereal,
    }
}