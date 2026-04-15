import { useState } from "react";
import { TypeVehicle, Vehicle } from "@types";
import { dbContext } from "../services";
import { useAppDispatch, useAppSelector } from "./useRedux";
import { onLogout } from "../redux/auth";
import { useTranslation } from "react-i18next";
import { NotificationService } from "../services/notificationService";

export const useVehicle = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<TypeVehicle[]>([]);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const getVehicles = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        dispatch(onLogout(t('unexpected_error')));
        return;
      }

      const result = await dbContext.vehicles.find({
        selector: { accountId: user.accountId, licenceId: user.licenceId }
      });
      const documents = result.docs as Vehicle[];
      setVehicles(documents);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      NotificationService.showError(t('no_vehicles_found'), {}, t('error_label'));
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const getTypeVehicles = async () => {
    setIsLoading(true);
    try {
      const result = await dbContext.typeVehicles.allDocs({
        include_docs: true
      });

      if (result.rows.length) {
        const documents: TypeVehicle[] = result.rows.map(
          (row) => row.doc as TypeVehicle
        );
        setVehicleTypes(documents);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      NotificationService.showError(`${t('vehicle_fetch_error')}: ${error}`, {}, t('error_label'));
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const createVehicleType = async (newVehicleType: TypeVehicle) => {
    setIsLoading(true);
    try {
      const response = await dbContext.typeVehicles.post(newVehicleType);
      setIsLoading(false);

      if (response.ok) {
        NotificationService.showAdded({ type: newVehicleType.name }, t('vehicle_type_label'));
      } else {
        NotificationService.showError(t('verify_fields'), {}, t('vehicle_type_label'));
      }
    } catch (error) {
      console.log(error);
      NotificationService.showError(t('unexpected_error'), {}, t('error_label'));
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const createVehicle = async (newVehicle: Vehicle) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error(t('user_not_found'));
      newVehicle.accountId = user.accountId;
      newVehicle.licenceId = user.licenceId;

      const response = await dbContext.vehicles.post(newVehicle);
      setIsLoading(false);

      if (response.ok) {
        NotificationService.showAdded({ vehicle: newVehicle.patent }, t('vehicle_label'));
      } else {
        NotificationService.showError(t('verify_fields'), {}, t('vehicle_label'));
      }
    } catch (error) {
      console.log(error);
      NotificationService.showError(t('unexpected_error'), {}, t('error_label'));
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const updateVehicle = async (updateVehicle: Vehicle) => {
    setIsLoading(true);
    try {
      const response = await dbContext.vehicles.put(updateVehicle);

      if (response.ok) {
        NotificationService.showUpdated({ vehicle: updateVehicle.patent }, t('vehicle_label'));
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      NotificationService.showError(t('unexpected_error'), {}, t('error_label'));
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const deleteVehicle = async (id: string, rev: string) => {
    setIsLoading(true);
    try {
      const response = await dbContext.vehicles.remove(id, rev);
      if (response.ok) {
        NotificationService.showDeleted({ id }, t('vehicle_label'));
        getVehicles();
      } else {
        NotificationService.showError(t('delete_vehicle_error'), {}, t('error_label'));
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      NotificationService.showError(t('unexpected_error'), {}, t('error_label'));
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const getVehicleByPatent = async (patent: string) => {
    setIsLoading(true);
    try {
      if (!user) {
        dispatch(onLogout(t('unexpected_error')));
        return;
      }
      if (patent === "") return;
      const result = await dbContext.vehicles.find({
        selector: { patent: patent, accountId: user.accountId, licenceId: user.licenceId }
      });
      setIsLoading(false);
      return result.docs[0] as Vehicle;

    } catch (error) {
      console.log(error);
      NotificationService.showError(t('no_vehicles_found'), {}, t('error_label'));
      setIsLoading(false);
      if (error) setError(error);
    }
  }

  const getVehicleById = async (id: string) => {
    setIsLoading(true);
    try {
      if (!user) {
        dispatch(onLogout(t('unexpected_error')));
        return;
      }
      const result = await dbContext.vehicles.find({
        selector: { _id: id, accountId: user.accountId, licenceId: user.licenceId }
      });
      setIsLoading(false);
      return result.docs[0] as Vehicle;

    } catch (error) {
      console.log(error);
      NotificationService.showError(t('no_vehicles_found'), {}, t('error_label'));
      setIsLoading(false);
      if (error) setError(error);
    }
  }

  return {
    vehicles,
    vehicleTypes,
    error,
    isLoading,
    getVehicles,
    getTypeVehicles,
    createVehicle,
    createVehicleType,
    updateVehicle,
    deleteVehicle,
    getVehicleByPatent,
    getVehicleById
  };
};