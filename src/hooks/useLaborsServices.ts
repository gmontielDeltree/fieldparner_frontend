import Swal from "sweetalert2";
// import { useNavigate } from "react-router-dom";
import { LaborsServices } from "../types";
import { useState } from "react";
import { dbContext } from "../services";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const useLaborsServices = () => {
  const navigate = useNavigate();
  const [laborsServices, setLaborsServices] = useState<LaborsServices[]>([]);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [conceptoError] = useState(false);
  const {t} = useTranslation();

  const getLaborsServices = async () => {
    setIsLoading(true);
    try {
      const result = await dbContext.LaborsServices.allDocs({ include_docs: true });
      // const vehiculos = response.map((v: any) => v.content);
      if (result.rows.length) {
        const documents: LaborsServices[] = result.rows.map(
          (row) => row.doc as unknown as LaborsServices
        );
        setLaborsServices(documents);
      }

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "No hay registro de Vehiculos.", "error");
      setIsLoading(false);
      if (error) setError(error);
    }
  };


  const createLaborsServices = async (newLaborsServices: LaborsServices) => {
    setIsLoading(true);
    try {
      const response = await dbContext.LaborsServices.post(newLaborsServices);
      setIsLoading(false);

      if (response.ok) Swal.fire("Servicio", "Servicio agregado.", "success");
      else Swal.fire("Servicio", "Verificar campos.", "error");
      navigate('/init/overview/Labors-services/');
    } catch (error) {
      console.log(error);
      Swal.fire("Ups", "Ocurrio un error inesperado ", "error");
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const updateLaborsServices = async (updatelaborsServices: LaborsServices) => {
    setIsLoading(true);
    try {
      const response = await dbContext.LaborsServices.put(updatelaborsServices);

      if (response.ok) {
        Swal.fire("Servicio", "Actualizado.", "success");
      }
      navigate('/init/overview/Labors-services/');

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Ocurrio un error inesperado.", "error");
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const removeLaborsServices = async (laborsServicesId: string, removelaborsServices: string) => {

    try {
      const response = await dbContext.LaborsServices.remove(laborsServicesId, removelaborsServices);
      setIsLoading(false);

      if (response.ok)
        Swal.fire(t("origin_destination"), t("_deleted"), 'success');

      navigate('/init/overview/Labors-services/');
    } catch (error) {
      console.log(error)
      Swal.fire('Error', t("no_destinations_procedences_found"), 'error');
      setIsLoading(false);
      if (error) setError(error);
    }
  } 

  return {
    //* Props
    laborsServices,
    error,
    isLoading,
    conceptoError,

    //*Methods
     getLaborsServices,
     createLaborsServices,
     updateLaborsServices,
     removeLaborsServices,
  };
};
