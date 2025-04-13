import Swal from "sweetalert2";
import { useVehicle } from "../../../hooks";

export const usePatentHook = () => {
  const { getVehicleByPatent } = useVehicle();

  const checkPatentAvailability = async (patent: string) => {
    if (patent !== "") {
      const vehicleFound = await getVehicleByPatent(patent);
      if (vehicleFound) {
        Swal.fire("Error", "Matricula no disponible.", "error");
        return false;
      }
    }
    return true;
  };

  return { checkPatentAvailability };
};