import { Zones } from "@types";
import { useState } from "react";
import { dbContext } from "../services";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NotificationService } from "../services/notificationService";
import { useAppSelector } from "./useRedux";

export const useZones = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const [zones, setZones] = useState<Zones[]>([]);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [conceptoError] = useState(false);
  const { t } = useTranslation();

  // Prefijo personalizado para las zonas
  const zoneLabel = t('zone_label', 'Zona:');

  const getZones = async () => {
    setIsLoading(true);
    try {
      const result = await dbContext.zones.find({
        selector: { accountId: user?.accountId }
      });
      if (result.docs.length) {
        const documents: Zones[] = result.docs.map(
          (doc) => doc as Zones
        );
        setZones(documents);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      NotificationService.showError(t("no_vehicles_records"));
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const createZone = async (newZone: Zones) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error(t("user_not_logged"));
      newZone.accountId = user.accountId;
      newZone.licenceId = user.licenceId;
      const response = await dbContext.zones.post(newZone);
      setIsLoading(false);

      if (response.ok) {
        // Usar la propiedad zone como valor del servicio
        NotificationService.showAdded({
          service: newZone.zone || newZone._id
        }, zoneLabel);
      } else {
        NotificationService.showError(t("check_fields"));
      }

      navigate('/init/overview/zones/');
    } catch (error) {
      console.log(error);
      NotificationService.showError(t("unexpected_error"));
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const updateZone = async (updateZone: Zones) => {
    setIsLoading(true);
    try {
      const response = await dbContext.zones.put(updateZone);

      if (response.ok) {
        // Usar la propiedad zone como valor del servicio
        NotificationService.showUpdated({
          service: updateZone.zone || updateZone._id
        }, zoneLabel);
      }

      navigate('/init/overview/zones/');
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      NotificationService.showError(t("unexpected_error"));
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const removeZone = async (ZoneId: string, removeZone: string) => {
    setIsLoading(true);
    try {
      // Intentar obtener el nombre de la zona antes de eliminar
      let zoneValue = null;
      try {
        const doc = await dbContext.zones.get(ZoneId);
        if (doc && doc.zone) {
          zoneValue = doc.zone;
        }
      } catch (err) {
        console.log("Could not fetch zone details", err);
      }

      const response = await dbContext.zones.remove(ZoneId, removeZone);
      setIsLoading(false);

      if (response.ok) {
        // Usar la propiedad zone como valor del servicio
        NotificationService.showDeleted({
          service: zoneValue || ZoneId
        }, zoneLabel);
      }

      navigate('/init/overview/zones/');
    } catch (error) {
      console.log(error)
      NotificationService.showError(t("no_destinations_procedences_found"));
      setIsLoading(false);
      if (error) setError(error);
    }
  }

  return {
    //* Props
    zones,
    error,
    isLoading,
    conceptoError,

    //*Methods
    getZones,
    createZone,
    updateZone,
    removeZone,
  };
};