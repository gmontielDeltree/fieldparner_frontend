import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CampaingExpenses } from '../interfaces/campaignExpenses';
import { dbContext } from "../services/pouchdbService";
import { useAppDispatch, useAppSelector } from './useRedux';
import { useTranslation } from 'react-i18next';
import { NotificationService } from "../services/notificationService";
import { onLogout } from '../redux/auth';

const createCampaignExpenseId = () => {
  const randomId =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `campaign-expense:${randomId}`;
};

const normalizeCampaignExpense = (expense: CampaingExpenses): CampaingExpenses => ({
  ...expense,
  zafra: expense.zafra || '',
  partial: expense.partial || '',
  listCamapingExpeses: Array.isArray(expense.listCamapingExpeses) ? expense.listCamapingExpeses : [],
});

export const useCampaingExpenses = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [campaingExpenses, setCampaingExpenses] = useState<CampaingExpenses[]>([]);
  const { t } = useTranslation();

  const handleDatabaseError = (currentError: unknown, notificationLabel?: string) => {
    console.error(t("databaseErrorLog"), currentError);
    NotificationService.showError(
      t("databaseError", {
        error: currentError instanceof Error ? currentError.message : t("unexpectedError"),
      }),
      currentError,
      notificationLabel || t("error_label"),
    );
    setError(currentError);
  };

  const ensureUser = () => {
    if (!user) {
      dispatch(onLogout(t("sessionExpired")));
      throw new Error(t("sessionExpired"));
    }

    return user;
  };

  const getCampaingExpenses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentUser = ensureUser();
      const response = await dbContext.campaingExpenses.find({
        selector: {
          accountId: currentUser.accountId,
          licenceId: currentUser.licenceId,
        },
      });

      const documents = response.docs.map(doc => normalizeCampaignExpense(doc as CampaingExpenses));
      setCampaingExpenses(documents);
      return documents;
    } catch (currentError) {
      handleDatabaseError(currentError, t("campaign_expense_label"));
      setCampaingExpenses([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getCampaingExpenseById = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const currentUser = ensureUser();
      const document = normalizeCampaignExpense(await dbContext.campaingExpenses.get(id) as CampaingExpenses);

      if (
        document.accountId &&
        document.licenceId &&
        (document.accountId !== currentUser.accountId || document.licenceId !== currentUser.licenceId)
      ) {
        throw new Error(t("expense_not_found"));
      }

      return document;
    } catch (currentError) {
      handleDatabaseError(currentError, t("campaign_expense_label"));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const buildCampaignExpenseDocument = (draft: CampaingExpenses) => {
    const currentUser = ensureUser();
    const now = new Date().toISOString();

    return normalizeCampaignExpense({
      ...draft,
      _id: draft._id || createCampaignExpenseId(),
      accountId: currentUser.accountId,
      licenceId: currentUser.licenceId,
      createdAt: draft.createdAt || now,
      updatedAt: now,
    });
  };

  const createCampingExpeses = async (draft: CampaingExpenses) => {
    setIsLoading(true);
    setError(null);

    try {
      const document = buildCampaignExpenseDocument(draft);
      const response = await dbContext.campaingExpenses.put(document);

      if (response.ok) {
        NotificationService.showAdded(document, t("campaign_expense_label"));
        navigate('/init/overview/campaign-expenses/');
        return true;
      }

      NotificationService.showError(t("genericError"), null, t("campaign_expense_label"));
      return false;
    } catch (currentError) {
      handleDatabaseError(currentError, t("campaign_expense_label"));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCampingExpeses = async (draft: CampaingExpenses) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!draft._id?.trim()) {
        throw new Error(t("noIdError"));
      }

      const document = buildCampaignExpenseDocument(draft);
      const response = await dbContext.campaingExpenses.put(document);

      if (response.ok) {
        NotificationService.showUpdated(document, t("campaign_expense_label"));
        navigate('/init/overview/campaign-expenses/');
        return true;
      }

      NotificationService.showError(t("updateError"), null, t("campaign_expense_label"));
      return false;
    } catch (currentError) {
      handleDatabaseError(currentError, t("campaign_expense_label"));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeCampingExpeses = async (campaignExpenseId: string, campaignExpenseRev: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await dbContext.campaingExpenses.remove(campaignExpenseId, campaignExpenseRev);

      if (response.ok) {
        NotificationService.showDeleted({ id: campaignExpenseId }, t("campaign_expense_label"));
        navigate('/init/overview/campaign-expenses/');
        return true;
      }

      NotificationService.showError(t("delete_failed"), null, t("campaign_expense_label"));
      return false;
    } catch (currentError) {
      handleDatabaseError(currentError, t("campaign_expense_label"));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    isLoading,
    campaingExpenses,
    createCampingExpeses,
    getCampaingExpenses,
    getCampaingExpenseById,
    setCampaingExpenses,
    updateCampingExpeses,
    removeCampingExpeses,
  };
}
