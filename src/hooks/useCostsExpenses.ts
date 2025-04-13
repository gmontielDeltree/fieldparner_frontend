import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { CostsExpenses } from '../interfaces/costsExpenses';
import { dbContext } from "../services/pouchdbService";
import { useAppSelector } from '.';
import { useTranslation } from 'react-i18next';
import { NotificationService } from "../services/notificationService";

export const useCostsExpensess = () => {
  const navigate = useNavigate();
  useAppSelector(state => state.auth);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [costsExpenses, setCostsExpenses] = useState<CostsExpenses[]>([]);
  const [conceptoError, setConceptoError] = useState(false);
  const { t } = useTranslation();

  const handleDatabaseError = (error: any) => {
    console.error(t("databaseErrorLog"), error);
    NotificationService.showError(t("databaseError", { error: error.message || t("unexpectedError") }), error, t("error_label"));
    setIsLoading(false);
    setError(error);
  };

  const createCostsExpenses = async (newCostsExpenses: CostsExpenses) => {
    setIsLoading(true);

    try {
      const response = await dbContext.costsExpenses.post(newCostsExpenses);
      if (response.ok) {
        NotificationService.showAdded(newCostsExpenses, t("costsExpenses_label"));
      } else {
        NotificationService.showError(t("genericError"), null, t("costsExpenses_label"));
      }

      navigate('/init/overview/costs-expenses/');
    } catch (error) {
      handleDatabaseError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCostsExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await dbContext.costsExpenses.allDocs({ include_docs: true });
      if (response.rows.length) {
        const documents: CostsExpenses[] = response.rows.map(row => row.doc as CostsExpenses);
        setCostsExpenses(documents);
      } else {
        setCostsExpenses([]);
      }
    } catch (error) {
      console.error(t("errorDuringGetCostsExpenses"), error);
      NotificationService.showError(t("genericError"), error, t("error_label"));
    } finally {
      setIsLoading(false);
    }
  };

  const updateCostsExpenses = async (updateCostsExpenses: CostsExpenses) => {
    setIsLoading(true);
    console.log(t("executing"));

    if (!updateCostsExpenses._id?.trim()) {
      console.error(t("noIdErrorLog"));
      NotificationService.showError(t("noIdError"), null, t("error_label"));
      setConceptoError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await dbContext.costsExpenses.put(updateCostsExpenses);
      setIsLoading(false);

      if (response.ok) {
        NotificationService.showUpdated(updateCostsExpenses, t("costsExpenses_label"));
        navigate('/init/overview/costs-expenses/');
      } else {
        NotificationService.showError(t("updateError"), null, t("costsExpenses_label"));
      }
    } catch (error) {
      NotificationService.showError(t("genericError"), error, t("costsExpenses_label"));
      setIsLoading(false);
      if (error) setError(error);
    } finally {
      setIsLoading(false);
    }
    console.log(t("executingPlus"));
  };

  const removeCostsExpenses = async (CostsExpensesId: string, removeCostsExpenses: string) => {
    try {
      const response = await dbContext.costsExpenses.remove(CostsExpensesId, removeCostsExpenses);
      setIsLoading(false);

      if (response.ok)
        NotificationService.showDeleted({ id: CostsExpensesId }, t("costsExpenses_label"));

      navigate('/init/overview/costs-expenses/');
    } catch (error) {
      console.log(error);
      NotificationService.showError(t("no_destinations_procedences_found"), error, t("error_label"));
      setIsLoading(false);
      if (error) setError(error);
    }
  }

  return {
    //* Propiedades
    error,
    isLoading,
    costsExpenses,
    conceptoError,

    //* Métodos
    createCostsExpenses,
    getCostsExpenses,
    updateCostsExpenses,
    removeCostsExpenses,
  }
}