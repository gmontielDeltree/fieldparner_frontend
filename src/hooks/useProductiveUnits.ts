
import { useState } from "react";
import { ProductUnits, FieldsByProductUnit } from '../interfaces/productiveUnits';
import { dbContext } from "../services/pouchdbService";
import { useAppDispatch, useAppSelector } from '.';
import { useTranslation } from 'react-i18next';
import { NotificationService } from "../services/notificationService";
import { onLogout } from '../redux/auth';
import uuid4 from "uuid4";


export const useProductiveUnits = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [listProductiveUnits, setListProductiveUnits] = useState<ProductUnits[]>([]);
  const [productiveUnits, setProductiveUnits] = useState<ProductUnits | null>(null);
  const [fieldsByProductiveUnits, setFieldsByProductiveUnits] = useState<FieldsByProductUnit[]>([]);
  const { t } = useTranslation();

  const handleDatabaseError = (error: any) => {
    console.error(t('database_error_log'), error);
    NotificationService.showError(`${t('database_error')}: ${error.message || t('unexpected_error')}`, {}, t('error_label'));
    setIsLoading(false);
    setError(error);
  };

  const createProductiveUnits = async (productUnit: ProductUnits, fields: FieldsByProductUnit[]) => {
    setIsLoading(true);

    try {
      if (!user) {
        dispatch(onLogout(t("sessionExpired")));
        return;
      }
      const newProductiveUnits: ProductUnits = {
        ...productUnit,
        accountId: user.accountId,
        licenceId: user.licenceId,
        idProductiveUnit: uuid4() || '',
      };
      const newFields = fields.map(field => ({ ...field, productiveUnitId: newProductiveUnits.idProductiveUnit, }));

      const responseAll = await Promise.all([
        dbContext.productiveUnits.post(newProductiveUnits),
        dbContext.fieldsByProductUnit.bulkDocs(newFields)
      ]);
      if (responseAll[0].ok) {
        NotificationService.showAdded({ name: newProductiveUnits.units }, t('productive_units_label'));
      } else {
        NotificationService.showError(t('generic_error'), null, t('productive_units_label'));
      }


    } catch (error) {
      handleDatabaseError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProductiveUnitById = async (prodUnitId: string) => {
    setIsLoading(true);
    try {
      const responseAll = await Promise.all([
        dbContext.productiveUnits.find({ selector: { idProductiveUnit: prodUnitId } }),
        dbContext.fieldsByProductUnit.find({ selector: { productiveUnitId: prodUnitId } })
      ]);

      const productiveUnit = responseAll[0].docs[0] as ProductUnits;
      const fieldsByProductive = responseAll[1].docs as FieldsByProductUnit[];
      //Si existe el contrato, deberia de existe al menos una compañia asociada
      if (productiveUnit) {
        setProductiveUnits(productiveUnit);
        setFieldsByProductiveUnits(fieldsByProductive);
        return { productiveUnit, fieldsByProductive };
      }
      return null;
    } catch (error) {
      console.error(t("getProductiveUnitById"), error);
      NotificationService.showError(t("genericError"), error, t("error_label"));
    } finally {
      setIsLoading(false);
    }
  };

  const getProductiveUnits = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        dispatch(onLogout(t("sessionExpired")));
        return;
      }
      const response = await dbContext.productiveUnits.find({ selector: { accountId: user?.accountId } });
      const docs = response.docs as ProductUnits[];

      if (docs.length) {
        setListProductiveUnits(docs);
      }

    } catch (error) {
      console.error(t('getProductiveUnits'), error);
      NotificationService.showError(t('generic_error'), {}, t('error_label'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateProductiveUnits = async (updateProductUnit: ProductUnits, fields: FieldsByProductUnit[]) => {
    setIsLoading(true);
    try {

      if (!user) {
        dispatch(onLogout(t("sessionExpired")));
        return;
      }

      const foundFields = await getProductiveUnitById(updateProductUnit.idProductiveUnit);
      if (foundFields?.fieldsByProductive?.length) {
        const fieldsToDelete = foundFields?.fieldsByProductive.map(c => ({ ...c, _deleted: true }));
        await dbContext.fieldsByProductUnit.bulkDocs(fieldsToDelete);
      }
      
      const newFields = fields.map(({ _id, _rev, ...rest }) =>
        ({ ...rest, productiveUnitId: updateProductUnit.idProductiveUnit, }));
      
      const responseAll = await Promise.all([
        dbContext.productiveUnits.put(updateProductUnit),
        dbContext.fieldsByProductUnit.bulkDocs(newFields)
      ]);

      setIsLoading(false);

      if (responseAll[0].ok) {
        NotificationService.showUpdated(updateProductUnit.units, "Unidad Productiva actualizada");
      }
    } catch (error) {
      console.log(error);
      NotificationService.showError(t('generic_error'), {}, t('error_label'));
    } finally {
      setIsLoading(false);
    }
  };

  const removeProductiveUnits = async (ProductiveUnitsId: string, removeProductiveUnits: string) => {
    try {
      const response = await dbContext.productiveUnits.remove(ProductiveUnitsId, removeProductiveUnits);
      setIsLoading(false);

      if (response.ok)
        NotificationService.showDeleted({ id: ProductiveUnitsId }, t('productive_units_label'));

      // navigate('/init/overview/productive-units/');
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
    fieldsByProductiveUnits,

    //* Métodos
    createProductiveUnits,
    getProductiveUnits,
    setListProductiveUnits,
    updateProductiveUnits,
    removeProductiveUnits,
    getProductiveUnitById
  }
}