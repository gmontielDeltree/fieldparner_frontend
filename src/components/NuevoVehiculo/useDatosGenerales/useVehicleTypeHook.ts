import { useState, useEffect } from "react";
import { useVehicle } from "../../../hooks";

export const useVehicleTypeHook = (initialValue: string) => {
  const { vehicleTypes, getTypeVehicles, createVehicleType } = useVehicle();
  const [vehicleType, setVehicleType] = useState(initialValue);
  const typeVehicles = vehicleTypes.map(t => t.name);

  useEffect(() => {
    getTypeVehicles();
  }, []);

  const handleOnBlurTipoVehiculo = async () => {
    const checkTipoVehiculo = (tV: string) =>
      tV.toLowerCase().trim() === vehicleType.toLowerCase().trim();

    if (vehicleType !== "" && !typeVehicles.some(checkTipoVehiculo)) {
      const newVehicleType = { name: vehicleType };
      await createVehicleType(newVehicleType);
    }
  };

  return {
    vehicleType,
    typeVehicles,
    setVehicleType,
    handleOnBlurTipoVehiculo
  };
};