import { useState } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { dbContext } from '../services';
import { Company } from '../interfaces/company';
import { onLogout } from '../redux/auth';
import { useTranslation } from 'react-i18next';
import { NotificationService } from '../services/notificationService';
import uuid4 from 'uuid4';

export const useCompany = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({});

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

    const handleDatabaseError = (error: any) => {
        console.error(t("databaseErrorLog"), error);
        NotificationService.showError(t("databaseError", { error: error.message || t("unexpectedError") }), error, t("error_label"));
        setIsLoading(false);
        setError(error);
    };

    const createCompany = async (newCorporateCompanies: Company) => {
        setIsLoading(true);

        try {
            if (!user) { dispatch(onLogout(t("sessionExpired"))); return; }

            newCorporateCompanies.accountId = user.accountId;
            newCorporateCompanies.licenceId = user.licenceId;
            newCorporateCompanies.country = user.countryId;
            newCorporateCompanies.companyId = uuid4();
            const response = await dbContext.companies.post(newCorporateCompanies);
            if (response.ok) {
                NotificationService.showAdded(newCorporateCompanies, t("corporateCompany_label"));
            } else {
                NotificationService.showError(t("genericError"), null, t("corporateCompany_label"));
            }
            
        } catch (error) {
            handleDatabaseError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateCompany = async (updateCorporateCompanies: Company) => {
        setIsLoading(true);

        if (!updateCorporateCompanies._id?.trim()) {
            console.error(t("noIdErrorLog"));
            NotificationService.showError(t("noIdError"), null, t("error_label"));
            setIsLoading(false);
            return;
        }

        try {
            const response = await dbContext.companies.put(updateCorporateCompanies);
            setIsLoading(false);

            if (response.ok) {
                NotificationService.showUpdated(updateCorporateCompanies, t("corporateCompany_label"));
                
            } else {
                NotificationService.showError(t("updateError"), null, t("corporateCompany_label"));
            }
        } catch (error) {
            NotificationService.showError(t("no_destinations_procedences_found"), error, t("error_label"));
            setIsLoading(false);
            if (error) setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeCompany = async (id: string, rev: string) => {
        try {
            const response = await dbContext.companies.remove(id, rev);
            setIsLoading(false);

            if (response.ok)
                NotificationService.showDeleted({ id }, t("corporateCompany_label"));

            // navigate('/init/overview/corporate-companies/');
        } catch (error) {
            console.log(error);
            NotificationService.showError(t("no_destinations_procedences_found"), error, t("error_label"));
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    return {
        companies,
        isLoading,
        error,
        getCompanies,
        getCompaniesByEmail,
        createCompany,
        updateCompany,
        removeCompany,
    }
}