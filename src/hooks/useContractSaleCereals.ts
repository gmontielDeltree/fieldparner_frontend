import dayjs from 'dayjs';
import { ContractDeliveyDate, ContractSaleCereal, ContractSaleCerealItem } from '../interfaces/contract-sale-cereals';
import { onLogout } from '../redux/auth';
import { dbContext } from '../services';
import { useAppDispatch, useAppSelector } from './useRedux';
import { useState } from 'react';


export const useContractSaleCereals = () => {

    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [contractsSaleCereals, setContractsSaleCereals] = useState<ContractSaleCerealItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getContractsSaleCereals = async () => {
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
            const responseAll = await Promise.all([
                dbContext.contractSaleCereals.find({ selector: selectorWithLicence }),
                dbContext.campaigns.find({ selector: selectorWithoutLicence }),
                dbContext.crops.allDocs({ include_docs: true }),
                dbContext.companies.find({ selector: selectorWithLicence }),
                dbContext.socialEntities.find({ selector: selectorWithoutLicence }),
                dbContext.originsDestinations.allDocs({ include_docs: true }),
            ])
            if (responseAll) {
                const contracts = responseAll[0].docs as ContractSaleCereal[];
                const campaigns = responseAll[1].docs;
                const crops = responseAll[2].rows.map(row => row.doc);
                const companies = responseAll[3].docs;
                const socialEntities = responseAll[4].docs;
                const originsDestinations = responseAll[5].rows.map(row => row.doc);

                const contractsSaleCerealItem = contracts.map((contract) => {
                    const campaign = campaigns.find((campaign: any) => campaign._id === contract.campaignId);
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
                    } as ContractSaleCerealItem;
                });
                console.log('contractsSaleCerealItem', contractsSaleCerealItem)
                setContractsSaleCereals(contractsSaleCerealItem);
            }
            else
                setContractsSaleCereals([]);
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
    const getLastContractNumber = async () => {
        try {
            if (!user) {
                dispatch(onLogout("Session expired."));
                setIsLoading(false);
                return null;
            };

            const { docs } = await dbContext.contractSaleCereals.find({
                selector: {
                    "$and": [{ "accountId": user.accountId }, { "licenceId": user.licenceId }],
                },
                // fields: ['contractSaleNumber'],
                // sort: ['contractSaleNumber']
            });
            if (docs.length === 0) return '1';
            else return (parseInt(docs[0].contractSaleNumber) + 1).toString();

        } catch (error) {
            console.log("Error al obtener el último número de contrato:", error);
            return "-1";
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
                    currency: user.currency
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
        contractsSaleCereals,
        isLoading,
        getContractsSaleCereals,
        getLastContractNumber,
        getContractSaleCerealByContractNumber,
        addContractSaleCereal,
        updateContractSaleCereal,
    }

}