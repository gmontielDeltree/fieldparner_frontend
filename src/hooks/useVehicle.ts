import Swal from "sweetalert2";
import { useState } from "react";
import { TypeVehicle, Vehicle } from "@types";
import { dbContext } from "../services";
import { useAppDispatch, useAppSelector } from "./useRedux";
import { onLogout } from "../redux/auth";
import { useTranslation } from "react-i18next";

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
      Swal.fire(t('error'), t('no_vehicles_found'), "error");
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
      Swal.fire(t('error'), `${t('vehicle_fetch_error')}: ${error}`, "error");
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
        Swal.fire(t('vehicle'), t('vehicle_type_added'), "success");
      } else {
        Swal.fire(t('vehicle_type'), t('verify_fields'), "error");
      }
    } catch (error) {
      console.log(error);
      Swal.fire(t('error'), t('unexpected_error'), "error");
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
        Swal.fire(t('vehicle'), t('vehicle_created'), "success");
      } else {
        Swal.fire(t('vehicle'), t('verify_fields'), "error");
      }
    } catch (error) {
      console.log(error);
      Swal.fire(t('error'), t('unexpected_error'), "error");
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const updateVehicle = async (updateVehicle: Vehicle) => {
    setIsLoading(true);
    try {
      const response = await dbContext.vehicles.put(updateVehicle);

      if (response.ok) {
        Swal.fire(t('vehicle'), t('vehicle_updated'), "success");
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      Swal.fire(t('error'), t('unexpected_error'), "error");
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const deleteVehicle = async (id: string, rev: string) => {
    setIsLoading(true);
    try {
      const response = await dbContext.vehicles.remove(id, rev);
      if (response.ok) {
        Swal.fire(t('vehicle'), t('vehicle_deleted'), "success");
        getVehicles();
      } else {
        Swal.fire(t('error'), t('delete_vehicle_error'), "error");
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      Swal.fire(t('error'), t('unexpected_error'), "error");
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
      Swal.fire(t('error'), t('no_vehicles_found'), "error");
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
      Swal.fire(t('error'), t('no_vehicles_found'), "error");
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