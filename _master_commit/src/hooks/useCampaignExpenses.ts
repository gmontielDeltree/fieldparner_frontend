import { useState } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { onLogout } from '../redux/auth';
import { dbContext } from '../services';
import { CampaingExpenses } from '../interfaces/campaignExpenses';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NotificationService } from '../services/notificationService';

export const useCampaingExpenses = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [campaingExpenses, setCampaingExpenses] = useState<CampaingExpenses[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [listCampingExpeses, setListCampingExpeses] = useState<any[]>([]);
    const [conceptoError, setConceptoError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const getCampaingExpenses = async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (!user) {
                dispatch(onLogout("Session expired."));
                setIsLoading(false);
                return false;
            }

            if (!dbContext) {
                console.error("Database context is not initialized");
                setIsLoading(false);
                return false;
            }

            if (!dbContext.campaingExpenses) {
                console.error("campaingExpenses database is not available");
                setIsLoading(false);
                return false;
            }

            const selector = {
                selector: {
                    accountId: user.accountId,
                    licenceId: user.licenceId
                }
            };
            const response = await dbContext.campaingExpenses.find(selector);

            if (response && response.docs) {
                const expenses = response.docs.map(doc => doc as CampaingExpenses);
                setCampaingExpenses(expenses);
                setIsLoading(false);
                return true;
            } else {
                setCampaingExpenses([]);
                setIsLoading(false);
                return false;
            }
        } catch (err) {
            console.error("Error durante getCampaingExpenses:", err);
            setError(err);
            setIsLoading(false);
            return false;
        }
    };

    const handleDatabaseError = (err: any) => {
        console.error('Database error:', err);
        NotificationService.showError(
            t("database_error", { error: err.message || t("unexpected_error") }),
            {},
            t("error_label")
        );
        setIsLoading(false);
        setError(err);
    };

    const createCampingExpeses = async (newCampaingExpenses: CampaingExpenses) => {
        setIsLoading(true);
        setError(null);

        try {
            if (!dbContext || !dbContext.campaingExpenses) {
                throw new Error("Database context is not initialized properly");
            }

            const response = await dbContext.campaingExpenses.post(newCampaingExpenses);
            if (response.ok) {
                NotificationService.showAdded({}, t("campaign_expense_label"));
                navigate('/init/overview/campaign-expenses/');
                return true;
            } else {
                NotificationService.showError(t("operation_failed"), {}, t("campaign_expense_label"));
                return false;
            }
        } catch (err) {
            handleDatabaseError(err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const removeCampingExpeses = async (CampingExpesesId: string, removeCampingExpeses: string) => {
        setIsLoading(true);
        setError(null);

        try {
            if (!dbContext || !dbContext.campaingExpenses) {
                throw new Error("Database context is not initialized properly");
            }

            const response = await dbContext.campaingExpenses.remove(CampingExpesesId, removeCampingExpeses);

            if (response.ok) {
                NotificationService.showDeleted({}, t("campaign_expense_label"));
                navigate('/init/overview/campaign-expenses/');
                return true;
            } else {
                NotificationService.showError(t("delete_failed"), {}, t("campaign_expense_label"));
                return false;
            }
        } catch (err) {
            console.error("Error removing campaign expense:", err);
            NotificationService.showError(t("expense_not_found"), {}, t("campaign_expense_label"));
            setError(err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        // Properties
        error,
        isLoading,
        campaingExpenses,
        listCampingExpeses,
        conceptoError,
        // Methods
        setListCampingExpeses,
        createCampingExpeses,
        getCampaingExpenses,
        setCampaingExpenses,
        removeCampingExpeses,
    };
};
