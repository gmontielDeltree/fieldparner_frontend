import Swal from "sweetalert2";
import { useState } from "react";
import { TypeVehicle, Vehicle } from "@types";
import { dbContext } from "../services";

export const useVehicle = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<TypeVehicle[]>([]);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const getVehicles = async () => {
    setIsLoading(true);
    try {
      const result = await dbContext.Vehicles.allDocs({ include_docs: true });
      if (result.rows.length) {
        const documents: Vehicle[] = result.rows.map(
          (row) => row.doc as Vehicle
        );
        setVehicles(documents);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "No hay registro de Vehiculos.", "error");
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const getTypeVehicles = async () => {
    setIsLoading(true);
    try {
      const result = await dbContext.TypeVehicles.allDocs({
        include_docs: true
      });
      // const vehiculos = response.map((v: any) => v.content);
      if (result.rows.length) {
        const documents: TypeVehicle[] = result.rows.map(
          (row) => row.doc as TypeVehicle
        );
        setVehicleTypes(documents);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "No hay registro de Vehiculos: " + error, "error");
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const createVehicleType = async (newVehicleType: TypeVehicle) => {
    setIsLoading(true);
    try {
      const response = await dbContext.TypeVehicles.post(newVehicleType);
      setIsLoading(false);

      if (response.ok)
        Swal.fire("Vehiculo", "Tipo de Vehiculo agregado.", "success");
      else Swal.fire("Tipo de Vehiculo", "Verificar campos.", "error");
    } catch (error) {
      console.log(error);
      Swal.fire("Ups", "Ocurrio un error inesperado ", "error");
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const createVehicle = async (newVehicle: Vehicle) => {
    setIsLoading(true);
    try {
      const response = await dbContext.Vehicles.post(newVehicle);
      setIsLoading(false);

      if (response.ok) Swal.fire("Vehiculo", "Vehiculo agregado.", "success");
      else Swal.fire("Vehiculo", "Verificar campos.", "error");
    } catch (error) {
      console.log(error);
      Swal.fire("Ups", "Ocurrio un error inesperado ", "error");
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const updateVehicle = async (updateVehicle: Vehicle) => {
    setIsLoading(true);
    try {
      const response = await dbContext.Vehicles.put(updateVehicle);

      if (response.ok) {
        Swal.fire("Vehiculo", "Actualizado.", "success");
      }

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Ocurrio un error inesperado.", "error");
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const deleteVehicle = async (id: string, rev: string) => {
    setIsLoading(true);
    try {
      const response = await dbContext.Vehicles.remove(id, rev);
      if (response.ok) {
        Swal.fire("Vehiculo", "Vehiculo eliminado.", "success");
        getVehicles(); // Actualizar la lista de vehículos
      } else {
        Swal.fire("Error", "No se pudo eliminar el vehiculo.", "error");
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Ocurrio un error inesperado.", "error");
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  return {
    //* Props
    vehicles,
    vehicleTypes,
    error,
    isLoading,

    //* Methods
    getVehicles,
    getTypeVehicles,
    createVehicle,
    createVehicleType,
    updateVehicle,
    deleteVehicle
  };
};
