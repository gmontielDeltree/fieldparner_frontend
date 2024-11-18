import { useState } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { dbContext } from '../services';
import { Company } from '../interfaces/company';
import { onLogout } from '../redux/auth';

export const useCompany = () => {

    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getCompanies = async () => {
        setIsLoading(true);
        try {
            if (!user) { dispatch(onLogout("Session expired")); return; }

            const response = await dbContext.companies.find({
                selector: { $and: [{ accountId: user.accountId }, { licenceId: user.licenceId }] }
            });

            if (response.docs.length)
                setCompanies(response.docs.map(doc => doc as Company));

            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.log('error', error)
        }
    }
    const getCompaniesByEmail = async () => {
        setIsLoading(true);
        try {
            if (!user) { dispatch(onLogout("Session expired")); return; }
            const response = await dbContext.companies.find({
                selector: { email: user.email }
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
        getCompanies,
        getCompaniesByEmail
    }
}