import { useState } from "react";
import { CorporateContract, CompanyByContract } from "../interfaces/corporateContract";
import { dbContext } from "../services/pouchdbService";
import { useTranslation } from 'react-i18next';
import { NotificationService } from "../services/notificationService";
import { useAppDispatch, useAppSelector } from './useRedux';
import { onLogout } from '../redux/auth';

export const useCorporateContract = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [listCorporateContract, setListCorporateContract] = useState<CorporateContract[]>([]);
  const [corporateContract, setCorporateContract] = useState<CorporateContract | null>(null);
  const [companiesFromContract, setCompaniesContract] = useState<CompanyByContract[]>([]);

  const { t } = useTranslation();

  const handleDatabaseError = (error: any) => {
    console.error(t("databaseErrorLog"), error);
    NotificationService.showError(t("databaseError", { error: error.message || t("unexpectedError") }), error, t("error_label"));
    setIsLoading(false);
    setError(error);
  };

  const createCorporateContract = async (contract: CorporateContract, companies: CompanyByContract[]) => {
    setIsLoading(true);
    try {
      if (!user) {
        dispatch(onLogout(t("sessionExpired")));
        return;
      }
      const newContract: CorporateContract = {
        ...contract,
        accountId: user.accountId,
        licenceId: user.licenceId,
        totalCompany: companies.length,
      };
      const newCompanies = companies.map(c => ({ ...c, contractId: newContract.idContract }));
      const responseAll = await Promise.all([
        dbContext.corporateContract.post(newContract),
        dbContext.companiesByContract.bulkDocs(newCompanies)
      ]);

      if (responseAll[0].ok) {
        NotificationService.showAdded(contract, t("corporateContract_label"));
      } else {
        NotificationService.showError(t("genericError"), null, t("corporateContract_label"));
      }

      // navigate('/init/overview/corporate-contract/');
    } catch (error) {
      handleDatabaseError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCorporateContractById = async (contractId: string) => {
    setIsLoading(true);
    try {
      const responseAll = await Promise.all([
        dbContext.corporateContract.find({ selector: { idContract: contractId } }),
        dbContext.companiesByContract.find({ selector: { contractId: contractId } })
      ]);

      const contract = responseAll[0].docs[0] as CorporateContract;
      const companies = responseAll[1].docs as CompanyByContract[];
      //Si existe el contrato, deberia de existe al menos una compañia asociada
      if (contract) {
        setCorporateContract(contract);
        setCompaniesContract(companies);
        return { contract, companies };
      }
      return null;
    } catch (error) {
      console.error(t("errorDuringGetCorporateContract"), error);
      NotificationService.showError(t("genericError"), error, t("error_label"));
    } finally {
      setIsLoading(false);
    }
  };

  const getCorporateContract = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        dispatch(onLogout(t("sessionExpired")));
        return;
      }
      const response = await dbContext.corporateContract.find({ selector: { accountId: user?.accountId } });
      const documents: CorporateContract[] = response.docs.map(doc => doc as CorporateContract);
      if (documents.length) {
        setListCorporateContract(documents);
      }
    } catch (error) {
      console.error(t("errorDuringGetCorporateContract"), error);
      NotificationService.showError(t("genericError"), error, t("error_label"));
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminamos las compañias que tenga ese contrato y luego le agregamos las nuevas compañias
  const updateCorporateContract = async (contract: CorporateContract, companies: CompanyByContract[]) => {
    setIsLoading(true);
    try {

      if (!user) {
        dispatch(onLogout(t("sessionExpired")));
        return;
      }
      const foundContract = await getCorporateContractById(contract.idContract);
      if (foundContract?.companies.length) {
        const companiesToDelete = foundContract.companies.map(c => ({ ...c, _deleted: true }));
        await dbContext.companiesByContract.bulkDocs(companiesToDelete);
      }
      const updateContract: CorporateContract = { ...contract, totalCompany: companies.length };
      const newCompanies = companies.map(({ _id, _rev, ...rest }) =>
        ({ ...rest, contractId: contract.idContract }));
      const responseAll = await Promise.all([
        dbContext.corporateContract.put(updateContract),
        dbContext.companiesByContract.bulkDocs(newCompanies)
      ]);

      setIsLoading(false);

      if (responseAll[0].ok) {
        NotificationService.showAdded(updateContract, t("corporateContract_label"));
      }
    } catch (error) {
      console.log(error);
      NotificationService.showError(t("updateError"), null, t("corporateContract_label"));
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

      // navigate('/init/overview/corporate-contract/');
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
    companiesFromContract,
    listCorporateContract,

    //* Métodos
    createCorporateContract,
    getCorporateContractById,
    getCorporateContract,
    setCorporateContract,
    updateCorporateContract,
    removeCorporateContract,
  }
}