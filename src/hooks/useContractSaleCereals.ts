import dayjs from 'dayjs';
import { ContractDeliveyDate, ContractSaleCereal, ContractSaleCerealItem } from '../interfaces/contract-sale-cereals';
import { onLogout } from '../redux/auth';
import { dbContext } from '../services';
import { useAppDispatch, useAppSelector } from './useRedux';
import { useState } from 'react';
import { Campaign, Crop, EnumStatusContract, Numerator, NumeratorType, OriginDestinations } from '../types';
import { Company } from '../interfaces/company';
import { Business } from '../interfaces/socialEntity';
import { useNumerator } from './useNumerator';
import { TransportDocument } from '../interfaces/transportDocument';
import { TransportDocumentByCertificateDeposit } from '../interfaces/certificate-deposit';


export const useContractSaleCereals = () => {

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
                dispatch(onLogout("Session expired."));
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
            console.error("Error al cargar documentos:", error);
            return false;
        }
    };

    const getContractSaleCerealByContractNumber = async (contractNumber: string) => {
        try {
            if (!user) {
                dispatch(onLogout("Session expired."));
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
            console.log("Error al obtener el contrato:", error);
            return null;
        }
    };
    //TODO: revisar despues de crear la db remota
    const getContractNumber = async () => {
        try {
            if (!user) {
                dispatch(onLogout("Session expired."));
                setIsLoading(false);
                return null;
            };
            const responseContractNumber = await getLastNumerator(user.accountId, NumeratorType.ContractSaleCereal);
            if (responseContractNumber) return responseContractNumber.lastNumerator + 1;
            console.log("No se encontró el último número de contrato.");
            return 1;
        } catch (error) {
            console.log("Error al obtener el último número de contrato:", error);
            return 0;
        }
    }

    const putContracSaleNumber = async () => {
        try {
            if (!user) {
                dispatch(onLogout("Session expired."));
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
            console.log("Error al crear/actualizar el contrato venta cereal:", error);
            return false;
        }
    }

    const addContractSaleCereal = async (newContract: ContractSaleCereal, newDeliveryDates: string[]) => {
        setIsLoading(true);
        try {
            if (!user) {
                dispatch(onLogout("Session expired."));
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

            setIsLoading(false);

            return response[0].ok;

        } catch (error) {
            setIsLoading(false);
            console.error("Error al cargar documentos:", error);
            return false;
        }
    };

    const updateContractSaleCereal = async (updateContract: ContractSaleCereal) => { };


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