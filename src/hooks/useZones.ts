import Swal from "sweetalert2";
// import { useNavigate } from "react-router-dom";
import { Zones } from "@types";
import { useState } from "react";
import { dbContext } from "../services";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const useZones = () => {
  const navigate = useNavigate();
  const [zones, setZones] = useState<Zones[]>([]);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [conceptoError] = useState(false);
  const {t} = useTranslation();

  const getZones = async () => {
    setIsLoading(true);
    try {
      const result = await dbContext.zones.allDocs({ include_docs: true });
      // const vehiculos = response.map((v: any) => v.content);
      if (result.rows.length) {
        const documents: Zones[] = result.rows.map(
          (row) => row.doc as unknown as Zones
        );
        setZones(documents);
      }

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "No hay registro de Vehiculos.", "error");
      setIsLoading(false);
      if (error) setError(error);
    }
  };


  const createZone = async (newZone: Zones) => {
    setIsLoading(true);
    try {
      const response = await dbContext.zones.post(newZone);
      setIsLoading(false);

      if (response.ok) Swal.fire("Zona", "Zona agregada.", "success");
      else Swal.fire("Zona", "Verificar campos.", "error");
      navigate('/init/overview/zones/');
    } catch (error) {
      console.log(error);
      Swal.fire("Ups", "Ocurrio un error inesperado ", "error");
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const updateZone = async (updateZone: Zones) => {
    setIsLoading(true);
    try {
      const response = await dbContext.zones.put(updateZone);

      if (response.ok) {
        Swal.fire("Zona", "Actualizada.", "success");
      }
      navigate('/init/overview/zones/');

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Ocurrio un error inesperado.", "error");
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const removeZone = async (ZoneId: string, removeZone: string) => {

    try {
      const response = await dbContext.zones.remove(ZoneId, removeZone);
      setIsLoading(false);

      if (response.ok)
        Swal.fire(t("origin_destination"), t("_deleted"), 'success');

      navigate('/init/overview/zones/');
    } catch (error) {
      console.log(error)
      Swal.fire('Error', t("no_destinations_procedences_found"), 'error');
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
