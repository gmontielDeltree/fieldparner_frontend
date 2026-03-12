import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { OriginDestinations } from "../types";
import { dbContext } from "../services/pouchdbService";
import { useAppSelector } from '.';
import { useTranslation } from 'react-i18next';
import { NotificationService } from "../services/notificationService";

export const useOriginDestinations = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [originsDestinations, setOriginDestinations] = useState<OriginDestinations[]>([]);
  const [conceptoError, setConceptoError] = useState(false);
  const { t } = useTranslation();

  // Prefijo personalizado para los orígenes/destinos
  const originLabel = t('origin_or_destination', 'Origen/Destino:');

  const createOriginDestinations = async (newSOriginDestinations: OriginDestinations) => {
    setIsLoading(true);

    if (!newSOriginDestinations.name.trim()) {
      setConceptoError(true);
      setIsLoading(false);
      return;
    }

    try {
      if (!user) throw new Error(t("user_not_logged"));
      newSOriginDestinations.accountId = user.accountId;
      newSOriginDestinations.licenceId = user.licenceId;

      const response = await dbContext.originsDestinations.post(newSOriginDestinations);

      setIsLoading(false);
      if (response.ok)
        // Pasamos el nombre y el prefijo personalizado 
        NotificationService.showAdded(newSOriginDestinations.name, originLabel);
      else
        NotificationService.showError(t("verify_mandatory_fields"));

      navigate('/init/overview/origins-destinations/');
    } catch (error) {
      console.log(error);
      NotificationService.showError(t("unexpected_error"));
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const getOriginDestinations = async () => {
    setIsLoading(true);
    try {
      const response = await dbContext.originsDestinations.find({
        selector: { accountId: user?.accountId }
      });

      setIsLoading(false);

      if (response.docs.length) {
        const documents: OriginDestinations[] = response.docs.map(doc => doc as OriginDestinations);
        setOriginDestinations(documents);
      }
      else
        setOriginDestinations([]);

    } catch (error) {
      console.log(error)
      NotificationService.showError(t("no_destinations_procedences_found"));
      setIsLoading(false);
      if (error) setError(error);
    }
  }

  const updateOriginDestinations = async (updateOriginDestinations: OriginDestinations) => {
    setIsLoading(true);

    if (!updateOriginDestinations.name.trim()) {
      setConceptoError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await dbContext.originsDestinations.put(updateOriginDestinations);
      setIsLoading(false);

      if (response.ok)
        // Pasamos el nombre y el prefijo personalizado
        NotificationService.showUpdated(updateOriginDestinations.name, originLabel);

      navigate('/init/overview/origins-destinations/');
    } catch (error) {
      console.log(error);
      NotificationService.showError(t("no_destinations_procedences_found"));
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const removeOriginDestinations = async (OriginDestinationsId: string, removeOriginDestinations: string) => {
    setIsLoading(true);

    try {
      // Intentar obtener el nombre antes de eliminar
      let originName = null;
      try {
        const doc = await dbContext.originsDestinations.get(OriginDestinationsId);
        if (doc && doc.name) {
          originName = doc.name;
        }
      } catch (err) {
        console.log("Could not fetch origin/destination details", err);
      }

      const response = await dbContext.originsDestinations.remove(OriginDestinationsId, removeOriginDestinations);
      setIsLoading(false);

      if (response.ok)
        // Pasamos el nombre y el prefijo personalizado
        NotificationService.showDeleted(originName || OriginDestinationsId, originLabel);

      navigate('/init/overview/origins-destinations/');
    } catch (error) {
      console.log(error)
      NotificationService.showError(t("no_destinations_procedences_found"));
      setIsLoading(false);
      if (error) setError(error);
    }
  }

  const searchOriginDestinations = async (searchTerm: string) => {
    setIsLoading(true);

    try {
      const response = await dbContext.originsDestinations.query('origins-destinations-search-view', {
        startkey: searchTerm,
        endkey: searchTerm + '\uffff',
        include_docs: true,
      });

      setIsLoading(false);

      if (response.rows.length) {
        const searchResults: OriginDestinations[] = response.rows.map(row => row.doc as OriginDestinations);
        setOriginDestinations(searchResults);

        // Mostrar notificación de búsqueda exitosa con la cantidad de resultados
        if (searchResults.length > 0) {
          NotificationService.showInfo(`${searchResults.length} ${t('results_found')}`);
        } else {
          NotificationService.showInfo(t('no_results_found'));
        }
      } else {
        setOriginDestinations([]);
        NotificationService.showInfo(t('no_results_found'));
      }
    } catch (error) {
      console.error(error);
      NotificationService.showError(t("error_during_search"));
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  return {
    //* Propiedades
    error,
    isLoading,
    originsDestinations,
    conceptoError,

    //* Métodos
    createOriginDestinations,
    getOriginDestinations,
    setOriginDestinations,
    updateOriginDestinations,
    removeOriginDestinations,
    searchOriginDestinations,
  }
}