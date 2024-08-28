import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { CorporateContract, ListCorporateContract } from "../types";
import { dbContext} from "../services/pouchdbService";
import { useAppSelector } from '.';
import { useTranslation } from 'react-i18next';

export const useCorporateContract = () => {
  const navigate = useNavigate();
  useAppSelector(state => state.auth);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [corporateContract, setCorporateContract] = useState<CorporateContract[]>([]);
  const [listCorporateContract, setListCorporateContract] = useState<ListCorporateContract[]>([]);
  const [conceptoError, setConceptoError] = useState(false);
  const {t} = useTranslation();

  const handleDatabaseError = (error: any) => {
    console.error('Database error:', error);
    Swal.fire('Error', `Database error: ${error.message || 'Unexpected error'}`, 'error');
    setIsLoading(false);
    setError(error);
  };

  const createCorporateContract = async (newCorporateContract: CorporateContract) => {
    setIsLoading(true);
  
    try {
      const response = await dbContext.corporateContract.post(newCorporateContract);
      if (response.ok) {
        Swal.fire('Compañia Societaria', 'Agregada', 'success');
        
       
        const createdContractId = response.id;
   
        const newContractList: ListCorporateContract = {
          companie: '', 
          percentageOfParticipation: '',
          activity: '',
          id: createdContractId,
        };
  
        await addListCorporateContract(newContractList); // Llamada a la función separada
      } else {
        Swal.fire('Compañia Societaria', "Error", 'error');
      }
      
      navigate('/init/overview/corporate-contract/');
    } catch (error) {
      handleDatabaseError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addListCorporateContract = async (newContractList: ListCorporateContract) => {
    setIsLoading(true);
  
    try {
      const response = await dbContext.listCorporateContract.post(newContractList);
      if (response.ok) {
        Swal.fire('Contrato Societario', 'Agregado', 'success');
      } else {
        Swal.fire('Contrato Societario', "Error", 'error');
      }
    } catch (error) {
      handleDatabaseError(error);
    } finally {
      setIsLoading(false);
    }
  };

const getListCorporateContract = async () => {
  setIsLoading(true);
  try {
    const response = await dbContext.listCorporateContract.allDocs({ include_docs: true });
    if (response.rows.length) {
      const documents: ListCorporateContract[] = response.rows.map(row => row.doc as ListCorporateContract);
      setListCorporateContract(documents);
    } else {
      setListCorporateContract([]);
    }
  } catch (error) {
    console.error('Error during getCorporateContract:', error);
    Swal.fire('Error', "Error2", 'error');
  } finally {
    setIsLoading(false);
  }
};


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
      console.error('Error during getCorporateContract:', error);
      Swal.fire('Error', "Error2", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCorporateContract = async (updateCorporateContract: CorporateContract) => {
    setIsLoading(true);
   

    if (!updateCorporateContract.description?.trim()) {
      console.error('El objeto updateCorporateContract no tiene un _id. No se puede actualizar.');
      Swal.fire('Error', 'No se puede actualizar sin un ID válido.', 'error');
      setConceptoError(true);
      setIsLoading(false);
      return;
    }

  
    try {
     
      const response = await dbContext.corporateContract.put(updateCorporateContract);
     
  
      setIsLoading(false);
  
      if (response.ok) {
      
        Swal.fire('Compañia Contract', t("_updated"), 'success');
        navigate('/init/overview/corporate-contract/');
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
  

  const removeCorporateContract = async (CorporateContractId: string, removeCorporateContract: string) => {

    try {
      const response = await dbContext.corporateContract.remove(CorporateContractId, removeCorporateContract);
      setIsLoading(false);

      if (response.ok)
        Swal.fire('Compañia Societaria', t("_deleted"), 'success');

      navigate('/init/overview/corporate-contract/');
    } catch (error) {
      console.log(error)
      Swal.fire('Error', t("no_destinations_procedences_found"), 'error');
      setIsLoading(false);
      if (error) setError(error);
    }
  } 


  const removeListCorporateContract = async (contractId: string, removeCorporateContract: string) => {
    setIsLoading(true);
  
    try {
      await dbContext.listCorporateContract.remove(contractId,removeCorporateContract);
      Swal.fire('Contrato Societario', 'Eliminado con éxito', 'success');
    } catch (error) {
      Swal.fire('Contrato Societario', 'Error al eliminar', 'error');
      handleDatabaseError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  
    return {
        //* Propiedades
        error,
        isLoading,
        corporateContract,
        listCorporateContract,
        conceptoError, 

        //* Métodos
        addListCorporateContract,
        createCorporateContract, 
        getCorporateContract, 
        getListCorporateContract,
        setCorporateContract,
        updateCorporateContract, 
        removeCorporateContract,
        removeListCorporateContract,
    }
}

