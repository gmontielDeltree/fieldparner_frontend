import { ContractSaleCereals } from '../interfaces/contract-sale-cereals';
import { useAppSelector } from './useRedux';
import { useState } from 'react';

export const useContractSaleCereals = () => {

    const {user} = useAppSelector((state) => state.auth);
    const [contractsSaleCereals, setContractsSaleCereals] = useState<ContractSaleCereals[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getContractsSaleCereals = async () => {};

    const getContractSaleCerealById = async (id: string) => {};

    const addContractSaleCereal = async (newContract: ContractSaleCereals, newDeliveryDates: string[]) => {};

    const updateContractSaleCereal = async (updateContract: ContractSaleCereals) => {};


    return {
        getContractsSaleCereals,
        getContractSaleCerealById,
        addContractSaleCereal,
        updateContractSaleCereal,
    }

}