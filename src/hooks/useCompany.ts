import { useState } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { dbContext } from '../services';
import { Company } from '../interfaces/company';
import { onLogout } from '../redux/auth';
import { useTranslation } from 'react-i18next';
import { NotificationService } from '../services/notificationService';

export const useCompany = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getCompanies = async () => {
        setIsLoading(true);
        try {
            if (!user) {
                dispatch(onLogout(t("sessionExpired")));
                return;
            }

            const response = await dbContext.companies.find({
                selector: { $and: [{ accountId: user.accountId }, { licenceId: user.licenceId }] }
            });

            if (response.docs.length)
                setCompanies(response.docs.map(doc => doc as Company));

            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.log(t("errorGetCompanies"), error);
            NotificationService.showError(t("errorGetCompanies"), error, t("error_label"));
        }
    }

    const getCompaniesByEmail = async () => {
        setIsLoading(true);
        try {
            if (!user) {
                dispatch(onLogout(t("sessionExpired")));
                return;
            }

            const response = await dbContext.companies.find({
                selector: { email: user.email }
            });

            if (response.docs.length)
                setCompanies(response.docs.map(doc => doc as Company));

            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.log(t("errorGetCompaniesByEmail"), error);
            NotificationService.showError(t("errorGetCompaniesByEmail"), error, t("error_label"));
        }
    }

    return {
        companies,
        isLoading,
        getCompanies,
        getCompaniesByEmail
    }
}