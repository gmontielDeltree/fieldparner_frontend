import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { ProductiveUnits, ListProductiveUnits } from '../interfaces/productiveUnits';
import { dbContext } from "../services/pouchdbService";
import { useAppSelector } from '.';
import { useTranslation } from 'react-i18next';
import { NotificationService } from "../services/notificationService";

export const useProductiveUnits = () => {
  const navigate = useNavigate();
  useAppSelector(state => state.auth);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [productiveUnits, setProductiveUnits] = useState<ProductiveUnits[]>([]);
  const [listProductiveUnits, setListProductiveUnits] = useState<ListProductiveUnits[]>([]);
  const [conceptoError, setConceptoError] = useState(false);
  const { t } = useTranslation();

  const handleDatabaseError = (error: any) => {
    console.error(t('database_error_log'), error);
    NotificationService.showError(`${t('database_error')}: ${error.message || t('unexpected_error')}`, {}, t('error_label'));
    setIsLoading(false);
    setError(error);
  };

  const createProductiveUnits = async (newProductiveUnits: ProductiveUnits) => {
    setIsLoading(true);

    try {
      const response = await dbContext.productiveUnits.post(newProductiveUnits);
      if (response.ok) {
        NotificationService.showAdded({ name: newProductiveUnits.name }, t('productive_units_label'));
      } else {
        NotificationService.showError(t('generic_error'), {}, t('productive_units_label'));
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
      console.error(t('error_get_productive_units'), error);
      NotificationService.showError(t('generic_error'), {}, t('error_label'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateProductiveUnits = async (updateProductiveUnits: ProductiveUnits) => {
    setIsLoading(true);
    console.log(t('executing_log'));

    if (!updateProductiveUnits._id?.trim()) {
      console.error(t('missing_id_error_log'));
      NotificationService.showError(t('cannot_update_without_id'), {}, t('error_label'));
      setConceptoError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await dbContext.productiveUnits.put(updateProductiveUnits);
      setIsLoading(false);

      if (response.ok) {
        NotificationService.showUpdated({ name: updateProductiveUnits.name }, t('productive_units_label'));
        navigate('/init/overview/productive-units/');
      } else {
        NotificationService.showError(t('update_error'), {}, t('productive_units_label'));
      }
    } catch (error) {
      NotificationService.showError(t('no_destinations_procedences_found'), {}, t('error_label'));
      setIsLoading(false);
      if (error) setError(error);
    } finally {
      setIsLoading(false);
    }
    console.log(t('executing_log_end'));
  };

  const removeProductiveUnits = async (ProductiveUnitsId: string, removeProductiveUnits: string) => {
    try {
      const response = await dbContext.productiveUnits.remove(ProductiveUnitsId, removeProductiveUnits);
      setIsLoading(false);

      if (response.ok)
        NotificationService.showDeleted({ id: ProductiveUnitsId }, t('productive_units_label'));

      navigate('/init/overview/productive-units/');
    } catch (error) {
      console.log(error);
      NotificationService.showError(t('no_destinations_procedences_found'), {}, t('error_label'));
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