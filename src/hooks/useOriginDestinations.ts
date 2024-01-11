import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { OriginDestinations } from "../types";
import { dbContext} from "../services/pouchdbService";
import { useAppSelector } from '.';

export const useOriginDestinations = () => {
  const navigate = useNavigate();
  useAppSelector(state => state.auth);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [originsDestinations, setOriginDestinations] = useState<OriginDestinations[]>([]);
  const [conceptoError, setConceptoError] = useState(false);

  const createOriginDestinations = async (newSOriginDestinations: OriginDestinations) => {
    setIsLoading(true);

    if (!newSOriginDestinations.name.trim()) {
      setConceptoError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await dbContext.originsDestinations.post(newSOriginDestinations);

      setIsLoading(false);
      if (response.ok)
        Swal.fire('Procedencia/Destino', 'Nueva Procedencia/Destino.', 'success');
      else
        Swal.fire('Procedencia/Destino', 'Verificar campos obligatorios.', 'error');

      navigate('/init/overview/origins-destinations/');
    } catch (error) {
      console.log(error);
      Swal.fire('Ups', 'Ocurrió un error inesperado', 'error');
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const getOriginDestinations = async () => {
    setIsLoading(true);
    try {
      const response = await dbContext.originsDestinations.allDocs({ include_docs: true });

      setIsLoading(false);

      if (response.rows.length) {
        const documents: OriginDestinations[] = response.rows.map(row => row.doc as OriginDestinations);
        setOriginDestinations(documents);
      }
      else
        setOriginDestinations([]);

    } catch (error) {
      console.log(error)
      Swal.fire('Error', 'No se encontraron destinos/procedencias.', 'error');
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
        Swal.fire('Procedencia/Destino', 'Actualizado.', 'success');

      navigate('/init/overview/origins-destinations/');
    } catch (error) {
      console.log(error);
      Swal.fire('Error', 'No se encontraron Procedencia/Destino.', 'error');
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const removeOriginDestinations = async (OriginDestinationsId: string, removeOriginDestinations: string) => {

    try {
      const response = await dbContext.originsDestinations.remove(OriginDestinationsId, removeOriginDestinations);
      setIsLoading(false);

      if (response.ok)
        Swal.fire('Destino/procedencia', 'Eliminada.', 'success');

      navigate('/init/overview/origins-destinations/');
    } catch (error) {
      console.log(error)
      Swal.fire('Error', 'No se encontraron Destinos/procedencias.', 'error');
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
      } else {
        setOriginDestinations([]);
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Ocurrió un error durante la búsqueda.', 'error');
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

