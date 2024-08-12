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
  const [conceptoError, setConceptoError] = useState(false);
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
      Swal.fire('Compañia Societaria', 'Agregada', 'success');
    } else {
      Swal.fire('Compañia Societaria', "Error", 'error');
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
   

    if (!updateCorporateCompanies._id?.trim()) {
      console.error('El objeto updateCorporateCompanies no tiene un _id. No se puede actualizar.');
      Swal.fire('Error', 'No se puede actualizar sin un ID válido.', 'error');
      setConceptoError(true);
      setIsLoading(false);
      return;
    }

  
    try {
     
      const response = await dbContext.corporateCompanies.put(updateCorporateCompanies);
     
  
      setIsLoading(false);
  
      if (response.ok) {
      
        Swal.fire('Compañia Societaria', t("_updated"), 'success');
        navigate('/init/overview/corporate-companies/');
      } else {
       
        Swal.fire('Compañia Societaria', "Error en la actualización", 'error');
      }
    } catch (error) {
     
      Swal.fire('Error', t("no_destinations_procedences_found"), 'error');
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
        Swal.fire('Compañia Societaria', t("_deleted"), 'success');

      navigate('/init/overview/corporate-companies/');
    } catch (error) {
      console.log(error)
      Swal.fire('Error', t("no_destinations_procedences_found"), 'error');
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

