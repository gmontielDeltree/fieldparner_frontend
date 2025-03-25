import { useState } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { onLogout } from '../redux/auth';
import { dbContext } from '../services';
import { CampaingExpenses } from '../interfaces/campaignExpenses';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
        Swal.fire('Error', `Database error: ${err.message || 'Unexpected error'}`, 'error');
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
                Swal.fire('Gasto de Campaña', 'Agregado', 'success');
                navigate('/init/overview/campaign-expenses/');
                return true;
            } else {
                Swal.fire('Gasto de Campaña', "Error", 'error');
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
                Swal.fire('Gasto de Campaña', t("_deleted"), 'success');
                navigate('/init/overview/campaign-expenses/');
                return true;
            } else {
                Swal.fire('Error', t("delete_failed"), 'error');
                return false;
            }
        } catch (err) {
            console.error("Error removing campaign expense:", err);
            Swal.fire('Error', t("no_destinations_procedences_found"), 'error');
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