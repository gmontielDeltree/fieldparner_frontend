import { useState } from 'react';
import { useAppSelector } from './useRedux';
import { dbContext } from '../services';
import { Company } from '../interfaces/company';

export const useCompany = () => {

    const { user } = useAppSelector(state => state.auth);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getCompanies = async () => {
        setIsLoading(true);
        try {
            if (!user) throw new Error("User not logged.");

            const response = await dbContext.Companies.find({
                selector: { accountId: user.accountId }
            });

            if (response.docs.length)
                setCompanies(response.docs.map(doc => doc as Company));

            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.log('error', error)
        }
    }

    return {
        companies,
        isLoading,
        getCompanies
    }
}