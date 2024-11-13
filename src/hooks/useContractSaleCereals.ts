import dayjs from 'dayjs';
import { ContractDeliveyDate, ContractSaleCereal } from '../interfaces/contract-sale-cereals';
import { onLogout } from '../redux/auth';
import { dbContext } from '../services';
import { useAppDispatch, useAppSelector } from './useRedux';
import { useState } from 'react';


export const useContractSaleCereals = () => {

    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [contractsSaleCereals, setContractsSaleCereals] = useState<ContractSaleCereal[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getContractsSaleCereals = async () => { };

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
            const contractNumber = newContract.contractSaleNumber; //TODO: Generar número de contrato y obtenerlo 
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
                    licenceId: user.licenceId
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