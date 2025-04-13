import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { CorporateContract, ListCorporateContract } from "../interfaces/corporateContract";
import { dbContext } from "../services/pouchdbService";
import { useAppSelector } from '.';
import { useTranslation } from 'react-i18next';
import { NotificationService } from "../services/notificationService";

export const useCorporateContract = () => {
  const navigate = useNavigate();
  useAppSelector(state => state.auth);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [corporateContract, setCorporateContract] = useState<CorporateContract[]>([]);
  const [listCorporateContract, setListCorporateContract] = useState<ListCorporateContract[]>([]);
  const [conceptoError, setConceptoError] = useState(false);
  const { t } = useTranslation();

  const handleDatabaseError = (error: any) => {
    console.error(t("databaseErrorLog"), error);
    NotificationService.showError(t("databaseError", { error: error.message || t("unexpectedError") }), error, t("error_label"));
    setIsLoading(false);
    setError(error);
  };

  const createCorporateContract = async (newCorporateContract: CorporateContract) => {
    setIsLoading(true);

    try {
      const response = await dbContext.corporateContract.post(newCorporateContract);
      if (response.ok) {
        NotificationService.showAdded(newCorporateContract, t("corporateContract_label"));
      } else {
        NotificationService.showError(t("genericError"), null, t("corporateContract_label"));
      }

      navigate('/init/overview/corporate-contract/');
    } catch (error) {
      handleDatabaseError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // const addListCorporateContract = async (newContractList: ListCorporateContract) => {
  //   setIsLoading(true);

  //   try {
  //     const response = await dbContext.listCorporateContract.post(newContractList);
  //     if (response.ok) {
  //       NotificationService.showAdded(newContractList, t("corporateContract_label"));
  //     } else {
  //       NotificationService.showError(t("genericError"), null, t("corporateContract_label"));
  //     }
  //   } catch (error) {
  //     handleDatabaseError(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const getListCorporateContract = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await dbContext.listCorporateContract.allDocs({ include_docs: true });
  //     if (response.rows.length) {
  //       const documents: ListCorporateContract[] = response.rows.map(row => row.doc as ListCorporateContract);
  //       setListCorporateContract(documents);
  //     } else {
  //       setListCorporateContract([]);
  //     }
  //   } catch (error) {
  //     console.error(t("errorDuringGetCorporateContract"), error);
  //     NotificationService.showError(t("genericError"), error, t("error_label"));
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const getCorporateContract = async () => {
    setIsLoading(true);
    try {
      const response = await dbContext.corporateContract.allDocs({ include_docs: true });
      if (response.rows.length) {
        const documents: CorporateContract[] = response.rows.map(row => row.doc as CorporateContract);
        setCorporateContract(documents);
      } else {
        setCorporateContract([]);
      }
    } catch (error) {
      console.error(t("errorDuringGetCorporateContract"), error);
      NotificationService.showError(t("genericError"), error, t("error_label"));
    } finally {
      setIsLoading(false);
    }
  };

  const updateCorporateContract = async (updateCorporateContract: CorporateContract) => {
    setIsLoading(true);

    if (!updateCorporateContract.description?.trim()) {
      console.error(t("noDescriptionErrorLog"));
      NotificationService.showError(t("noIdError"), null, t("error_label"));
      setConceptoError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await dbContext.corporateContract.put(updateCorporateContract);
      setIsLoading(false);

      if (response.ok) {
        NotificationService.showUpdated(updateCorporateContract, t("corporateContract_label"));
        navigate('/init/overview/corporate-contract/');
      } else {
        NotificationService.showError(t("updateError"), null, t("corporateContract_label"));
      }
    } catch (error) {
      NotificationService.showError(t("no_destinations_procedences_found"), error, t("error_label"));
      setIsLoading(false);
      if (error) setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCorporateContract = async (CorporateContractId: string, removeCorporateContract: string) => {
    try {
      const response = await dbContext.corporateContract.remove(CorporateContractId, removeCorporateContract);
      setIsLoading(false);

      if (response.ok)
        NotificationService.showDeleted({ id: CorporateContractId }, t("corporateContract_label"));

      navigate('/init/overview/corporate-contract/');
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
    corporateContract,
    listCorporateContract,
    conceptoError,

    //* Métodos
    createCorporateContract,
    getCorporateContract,
    setCorporateContract,
    updateCorporateContract,
    removeCorporateContract,
  }
}