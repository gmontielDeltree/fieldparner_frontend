import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { OriginDestinations } from "../types";
import { dbContext} from "../services/pouchdbService";
import { useAppSelector } from '.';
import { useTranslation } from 'react-i18next';

export const useOriginDestinations = () => {
  const navigate = useNavigate();
  useAppSelector(state => state.auth);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [originsDestinations, setOriginDestinations] = useState<OriginDestinations[]>([]);
  const [conceptoError, setConceptoError] = useState(false);
const {t} = useTranslation();
  const createOriginDestinations = async (newSOriginDestinations: OriginDestinations) => {
    setIsLoading(true);

    if (!newSOriginDestinations.name.trim()) {
      setConceptoError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await dbContext.OriginsDestinations.post(newSOriginDestinations);

      setIsLoading(false);
      if (response.ok)
        Swal.fire(t("origin_destination"), t("new_origin_destination"), 'success');
      else
        Swal.fire(t("origin_destination"), t("verify_mandatory_fields"), 'error');

      navigate('/init/overview/origins-destinations/');
    } catch (error) {
      console.log(error);
      Swal.fire('Ups',  t("unexpected_error"), 'error');
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const getOriginDestinations = async () => {
    setIsLoading(true);
    try {
      const response = await dbContext.OriginsDestinations.allDocs({ include_docs: true });

      setIsLoading(false);

      if (response.rows.length) {
        const documents: OriginDestinations[] = response.rows.map(row => row.doc as OriginDestinations);
        setOriginDestinations(documents);
      }
      else
        setOriginDestinations([]);

    } catch (error) {
      console.log(error)
      Swal.fire('Error', t("no_destinations_procedences_found"), 'error');
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
      const response = await dbContext.OriginsDestinations.put(updateOriginDestinations);
      setIsLoading(false);

      if (response.ok)
        Swal.fire(t("origin_destination"), t("_updated"), 'success');

      navigate('/init/overview/origins-destinations/');
    } catch (error) {
      console.log(error);
      Swal.fire('Error', t("no_destinations_procedences_found"), 'error');
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const removeOriginDestinations = async (OriginDestinationsId: string, removeOriginDestinations: string) => {

    try {
      const response = await dbContext.OriginsDestinations.remove(OriginDestinationsId, removeOriginDestinations);
      setIsLoading(false);

      if (response.ok)
        Swal.fire(t("origin_destination"), t("_deleted"), 'success');

      navigate('/init/overview/origins-destinations/');
    } catch (error) {
      console.log(error)
      Swal.fire('Error', t("no_destinations_procedences_found"), 'error');
      setIsLoading(false);
      if (error) setError(error);
    }
  } 

  const searchOriginDestinations = async (searchTerm: string) => {
    setIsLoading(true);
  
    try {
      const response = await dbContext.OriginsDestinations.query('origins-destinations-search-view', {
        startkey: searchTerm,
        endkey: searchTerm + '\uffff',
        include_docs: true,
      });
  
      setIsLoading(false);
  
      if (response.rows.length) {
        const searchResults: OriginDestinations[] = response.rows.map(row => row.doc as OriginDestinations);
        setOriginDestinations(searchResults);
      } else {
        setOriginDestinations([]);
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', t("error_during_search"), 'error');
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

