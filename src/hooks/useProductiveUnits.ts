import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { ProductiveUnits, ListProductiveUnits } from '../interfaces/productiveUnits';
import { dbContext} from "../services/pouchdbService";
import { useAppSelector } from '.';
import { useTranslation } from 'react-i18next';

export const useProductiveUnits = () => {
  const navigate = useNavigate();
  useAppSelector(state => state.auth);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [productiveUnits, setProductiveUnits] = useState<ProductiveUnits[]>([]);
  const [listProductiveUnits, setListProductiveUnits] = useState<ListProductiveUnits[]>([]);
  const [conceptoError, setConceptoError] = useState(false);
  const {t} = useTranslation();

  const handleDatabaseError = (error: any) => {
    console.error('Database error:', error);
    Swal.fire('Error', `Database error: ${error.message || 'Unexpected error'}`, 'error');
    setIsLoading(false);
    setError(error);
  };

  const createProductiveUnits = async (newProductiveUnits: ProductiveUnits) => {
    setIsLoading(true);
  
    try {
      const response = await dbContext.productiveUnits.post(newProductiveUnits);
      if (response.ok) {
        Swal.fire('Unidades Productivas', 'Agregada', 'success');
      } else {
        Swal.fire('Unidades Productivas', "Error", 'error');
      }
      
      navigate('/init/overview/productive-units/');
    } catch (error) {
      handleDatabaseError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProductiveUnits = async () => {
    setIsLoading(true);
    try {
      const response = await dbContext.productiveUnits.allDocs({ include_docs: true });
      if (response.rows.length) {
        const documents: ProductiveUnits[] = response.rows.map(row => row.doc as ProductiveUnits);
        setProductiveUnits(documents);
      } else {
        setProductiveUnits([]);
      }
    } catch (error) {
      console.error('Error during getProductiveUnits:', error);
      Swal.fire('Error', "Error2", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProductiveUnits = async (updateProductiveUnits: ProductiveUnits) => {
    setIsLoading(true);
    console.log("EJECUTANDO!")

    if (!updateProductiveUnits._id?.trim()) {
      console.error('El objeto updateProductiveUnits no tiene un _id. No se puede actualizar.');
      Swal.fire('Error', 'No se puede actualizar sin un ID válido.', 'error');
      setConceptoError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await dbContext.productiveUnits.put(updateProductiveUnits);
      setIsLoading(false);
  
      if (response.ok) {
        Swal.fire('Unidades Productivas', t("_updated"), 'success');
        navigate('/init/overview/productive-units/');
      } else {
        Swal.fire('Unidades Productivas', "Error en la actualización", 'error');
      }
    } catch (error) {
      Swal.fire('Error', t("no_destinations_procedences_found"), 'error');
      setIsLoading(false);
      if (error) setError(error);
    } finally {
      setIsLoading(false);
    }
    console.log("EJECUTANDO+")
  };
  
  const removeProductiveUnits = async (ProductiveUnitsId: string, removeProductiveUnits: string) => {
    try {
      const response = await dbContext.productiveUnits.remove(ProductiveUnitsId, removeProductiveUnits);
      setIsLoading(false);

      if (response.ok)
        Swal.fire('Unidades Productivas', t("_deleted"), 'success');

      navigate('/init/overview/productive-units/');
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
    productiveUnits,
    listProductiveUnits,
    conceptoError, 

    //* Métodos
    createProductiveUnits, 
    getProductiveUnits, 
    setListProductiveUnits,
    updateProductiveUnits, 
    removeProductiveUnits,
  }
}
