import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { CostsExpenses } from '../interfaces/costsExpenses';
import { dbContext} from "../services/pouchdbService";
import { useAppSelector } from '.';
import { useTranslation } from 'react-i18next';

export const useCostsExpensess = () => {
  const navigate = useNavigate();
  useAppSelector(state => state.auth);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [costsExpenses, setCostsExpenses] = useState<CostsExpenses []>([]);
  const [conceptoError, setConceptoError] = useState(false);
  const {t} = useTranslation();

  const handleDatabaseError = (error: any) => {
    console.error('Database error:', error);
    Swal.fire('Error', `Database error: ${error.message || 'Unexpected error'}`, 'error');
    setIsLoading(false);
    setError(error);
  };

  const createCostsExpenses = async (newCostsExpenses: CostsExpenses) => {
    setIsLoading(true);
  
    try {
      const response = await dbContext.costsExpenses.post(newCostsExpenses);
      if (response.ok) {
        Swal.fire('Unidades Costs Expenses', 'Agregada', 'success');
      } else {
        Swal.fire('Unidades Costs Expenses', "Error", 'error');
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
      console.error('Error during getCostsExpenses:', error);
      Swal.fire('Error', "Error2", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCostsExpenses = async (updateCostsExpenses: CostsExpenses) => {
    setIsLoading(true);
    console.log("EJECUTANDO!")

    if (!updateCostsExpenses._id?.trim()) {
      console.error('El objeto updateCostsExpenses no tiene un _id. No se puede actualizar.');
      Swal.fire('Error', 'No se puede actualizar sin un ID válido.', 'error');
      setConceptoError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await dbContext.costsExpenses.put(updateCostsExpenses);
      setIsLoading(false);
  
      if (response.ok) {
        Swal.fire('Unidades Costs Expenses', t("_updated"), 'success');
        navigate('/init/overview/costs-expenses/');
      } else {
        Swal.fire('Unidades Costs Expenses', "Error en la actualización", 'error');
      }
    } catch (error) {
      Swal.fire('Error', t("Costs Expenses"), 'error');
      setIsLoading(false);
      if (error) setError(error);
    } finally {
      setIsLoading(false);
    }
    console.log("EJECUTANDO+")
  };
  
  const removeCostsExpenses = async (CostsExpensesId: string, removeCostsExpenses: string) => {
    try {
      const response = await dbContext.costsExpenses.remove(CostsExpensesId, removeCostsExpenses);
      setIsLoading(false);

      if (response.ok)
        Swal.fire('Unidades Costs Expenses', t("_deleted"), 'success');

      navigate('/init/overview/costs-expenses/');
    } catch (error) {
      console.log(error);
      Swal.fire('Error', t("no_destinations_procedences_found"), 'error');
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
