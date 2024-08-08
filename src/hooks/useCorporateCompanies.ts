import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { CorporateCompanies } from "../types";
import { dbContext} from "../services/pouchdbService";
import { useAppSelector } from '.';
import { useTranslation } from 'react-i18next';

export const useCorporateCompanies = () => {
  const navigate = useNavigate();
  useAppSelector(state => state.auth);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [corporateCompanies, setCorporateCompanies] = useState<CorporateCompanies[]>([]);
  const [conceptoError] = useState(false);
  const {t} = useTranslation();

  const handleDatabaseError = (error: any) => {
    console.error('Database error:', error);
    Swal.fire('Error', `Database error: ${error.message || 'Unexpected error'}`, 'error');
    setIsLoading(false);
    setError(error);
  };

const createCorporateCompanies = async (newCorporateCompanies: CorporateCompanies) => {
  setIsLoading(true);

  try {
    const response = await dbContext.corporateCompanies.post(newCorporateCompanies);
    if (response.ok) {
      Swal.fire(t("origin_destination"), t("new_origin_destination"), 'success');
    } else {
      Swal.fire(t("origin_destination"), "Error1", 'error');
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
      const response = await dbContext.corporateCompanies.allDocs({ include_docs: true });
      if (response.rows.length) {
        const documents: CorporateCompanies[] = response.rows.map(row => row.doc as CorporateCompanies);
        setCorporateCompanies(documents);
      } else {
        setCorporateCompanies([]);
      }
    } catch (error) {
      console.error('Error during getCorporateCompanies:', error);
      Swal.fire('Error', "Error2", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCorporateCompanies = async (updateCorporateCompanies: CorporateCompanies) => {
    setIsLoading(true);

    // if (!updateOriginDestinations.name.trim()) {
    //   setConceptoError(true);
    //   setIsLoading(false);
    //   return;
    // }

    try {
      const response = await dbContext.corporateCompanies.put(updateCorporateCompanies);
      setIsLoading(false);

      if (response.ok)
        Swal.fire(t("origin_destination"), t("_updated"), 'success');

      navigate('/init/overview/corporate-companies/');
    } catch (error) {
      console.log(error);
      Swal.fire('Error', t("no_destinations_procedences_found"), 'error');
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const removeCorporateCompanies = async (CorporateCompaniesId: string, removeCorporateCompanies: string) => {

    try {
      const response = await dbContext.corporateCompanies.remove(CorporateCompaniesId, removeCorporateCompanies);
      setIsLoading(false);

      if (response.ok)
        Swal.fire(t("origin_destination"), t("_deleted"), 'success');

      navigate('/init/overview/corporate-companies/');
    } catch (error) {
      console.log(error)
      Swal.fire('Error', t("no_destinations_procedences_found"), 'error');
      setIsLoading(false);
      if (error) setError(error);
    }
  } 

//   const searchOriginDestinations = async (searchTerm: string) => {
//     setIsLoading(true);
  
//     try {
//       const response = await dbContext.corporateCompanies.query('origins-destinations-search-view', {
//         startkey: searchTerm,
//         endkey: searchTerm + '\uffff',
//         include_docs: true,
//       });
  
//       setIsLoading(false);
  
//       if (response.rows.length) {
//         const searchResults: OriginDestinations[] = response.rows.map(row => row.doc as OriginDestinations);
//         setOriginDestinations(searchResults);
//       } else {
//         setOriginDestinations([]);
//       }
//     } catch (error) {
//       console.error(error);
//       Swal.fire('Error', t("error_during_search"), 'error');
//       setIsLoading(false);
//       if (error) setError(error);
//     }
//   };
   

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
        //searchOriginDestinations,
    }
}

