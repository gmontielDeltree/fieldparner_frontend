import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { CorporateCompanies } from "../types";
import { dbContext } from "../services/pouchdbService";
import { useAppDispatch, useAppSelector } from '.';
import { useTranslation } from 'react-i18next';
import { onLogout } from '../redux/auth';
import { NotificationService } from "../services/notificationService";

export const useCorporateCompanies = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [corporateCompanies, setCorporateCompanies] = useState<CorporateCompanies[]>([]);
  const [conceptoError, setConceptoError] = useState(false);
  const { t } = useTranslation();

  const handleDatabaseError = (error: any) => {
    console.error(t("databaseErrorLog"), error);
    NotificationService.showError(t("databaseError", { error: error.message || t("unexpectedError") }), error, t("error_label"));
    setIsLoading(false);
    setError(error);
  };

  const createCorporateCompanies = async (newCorporateCompanies: CorporateCompanies) => {
    setIsLoading(true);

    try {
      if (!user) { dispatch(onLogout(t("sessionExpired"))); return; }

      newCorporateCompanies.accountId = user.accountId;
      newCorporateCompanies.licenceId = user.licenceId;
      newCorporateCompanies.countryId = user.countryId;

      const response = await dbContext.corporateCompanies.post(newCorporateCompanies);
      if (response.ok) {
        NotificationService.showAdded(newCorporateCompanies, t("corporateCompany_label"));
      } else {
        NotificationService.showError(t("genericError"), null, t("corporateCompany_label"));
      }
      navigate('/init/overview/corporate-companies/');
    } catch (error) {
      handleDatabaseError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCorporateCompanies = async () => {
    setIsLoading(true);
    try {
      if (!user) { dispatch(onLogout(t("sessionExpired"))); return; }
      const response = await dbContext.corporateCompanies.find({
        selector: { accountId: user.accountId, licenceId: user.licenceId }
      });

      if (response.docs.length) {
        const documents = response.docs.map(doc => doc as CorporateCompanies);
        setCorporateCompanies(documents);
      } else {
        setCorporateCompanies([]);
      }
    } catch (error) {
      console.error(t("errorDuringGetCorporateCompanies"), error);
      NotificationService.showError(t("genericError"), error, t("error_label"));
    } finally {
      setIsLoading(false);
    }
  };

  const updateCorporateCompanies = async (updateCorporateCompanies: CorporateCompanies) => {
    setIsLoading(true);

    if (!updateCorporateCompanies._id?.trim()) {
      console.error(t("noIdErrorLog"));
      NotificationService.showError(t("noIdError"), null, t("error_label"));
      setConceptoError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await dbContext.corporateCompanies.put(updateCorporateCompanies);
      setIsLoading(false);

      if (response.ok) {
        NotificationService.showUpdated(updateCorporateCompanies, t("corporateCompany_label"));
        navigate('/init/overview/corporate-companies/');
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

  const removeCorporateCompanies = async (CorporateCompaniesId: string, removeCorporateCompanies: string) => {
    try {
      const response = await dbContext.corporateCompanies.remove(CorporateCompaniesId, removeCorporateCompanies);
      setIsLoading(false);

      if (response.ok)
        NotificationService.showDeleted({ id: CorporateCompaniesId }, t("corporateCompany_label"));

      navigate('/init/overview/corporate-companies/');
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
    corporateCompanies,
    conceptoError,

    //* Métodos
    createCorporateCompanies,
    getCorporateCompanies,
    setCorporateCompanies,
    updateCorporateCompanies,
    removeCorporateCompanies,
  }
}