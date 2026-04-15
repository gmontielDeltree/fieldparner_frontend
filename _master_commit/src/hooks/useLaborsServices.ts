import { LaborsServices } from "../types";
import { useState } from "react";
import { dbContext } from "../services";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NotificationService } from "../services/notificationService";
import { useAppSelector } from "./useRedux";

export const useLaborsServices = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const [laborsServices, setLaborsServices] = useState<LaborsServices[]>([]);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [conceptoError] = useState(false);
  const { t } = useTranslation();

  // Prefijo personalizado para los servicios
  const serviceLabel = t('service_label', 'Servicio:');

  const getLaborsServices = async () => {
    setIsLoading(true);
    try {
      const result = await dbContext.laborsServices.find({
        selector: { accountId: user?.accountId }
      });
      if (result.docs.length) {
        const documents: LaborsServices[] = result.docs.map(
          (doc) => doc as LaborsServices
        );
        setLaborsServices(documents);
      } else {
        setLaborsServices([]);
      }

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      NotificationService.showError(t("noServicesRecords"));
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const createLaborsServices = async (newLaborsServices: LaborsServices, isFromQuickAddModal: boolean = false) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error(t("user_not_logged"));
      newLaborsServices.accountId = user.accountId;
      newLaborsServices.licenceId = user.licenceId;
      const response = await dbContext.laborsServices.post(newLaborsServices);
      setIsLoading(false);

      if (response.ok) {
        // Usar el prefijo personalizado
        NotificationService.showAdded(newLaborsServices.service, serviceLabel);
        
        // Solo navegar si NO es desde el modal de adición rápida
        if (!isFromQuickAddModal) {
          navigate('/init/overview/Labors-services/');
        }
        
        // Retornar el objeto creado para el modal
        return newLaborsServices;
      } else {
        NotificationService.showError(t("verifyFields"));
      }
    } catch (error) {
      console.log(error);
      NotificationService.showError(t("unexpectedError"));
      setIsLoading(false);
      if (error) setError(error);
      throw error; // Re-lanzar el error para que el modal pueda manejarlo
    }
  };

  const updateLaborsServices = async (updatelaborsServices: LaborsServices) => {
    setIsLoading(true);
    try {
      const response = await dbContext.laborsServices.put(updatelaborsServices);

      if (response.ok) {
        // Usar el prefijo personalizado
        NotificationService.showUpdated(updatelaborsServices.service, serviceLabel);
      }
      navigate('/init/overview/Labors-services/');

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      NotificationService.showError(t("unexpectedError"));
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const removeLaborsServices = async (laborsServicesId: string, removelaborsServices: string) => {
    setIsLoading(true);
    try {
      // Intentar obtener el valor del servicio antes de eliminar
      let serviceValue = null;
      try {
        const doc = await dbContext.laborsServices.get(laborsServicesId);
        if (doc && doc.service) {
          serviceValue = doc.service;
        }
      } catch (err) {
        console.log("Could not fetch service details", err);
      }

      const response = await dbContext.laborsServices.remove(laborsServicesId, removelaborsServices);

      if (response.ok) {
        // Actualizar la lista inmediatamente después de eliminar
        await getLaborsServices();

        // Usar el prefijo personalizado
        NotificationService.showDeleted(serviceValue || laborsServicesId, serviceLabel);
      }

      setIsLoading(false);
    } catch (error) {
      console.log(error)
      NotificationService.showError(t("no_destinations_procedences_found"));
      setIsLoading(false);
      if (error) setError(error);
    }
  }

  return {
    // Props
    laborsServices,
    error,
    isLoading,
    conceptoError,

    // Methods
    getLaborsServices,
    createLaborsServices,
    updateLaborsServices,
    removeLaborsServices,
  };
};