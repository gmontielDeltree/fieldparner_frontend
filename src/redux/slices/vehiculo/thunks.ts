import { cargarVehiculos } from ".";
import { getVehiculoService } from "../../../services";
import { AppDispatch } from "../../store";
import { uiFinishLoading, uiStartLoading } from "../ui";


export const getVehiculos = () => {
    return async (dispatch: AppDispatch) => {
        dispatch(uiStartLoading());
        try {
            const response = await getVehiculoService();

            if (response) dispatch(cargarVehiculos(response));

            dispatch(uiFinishLoading());
        } catch (error) {
            dispatch(uiFinishLoading());
        }
    }
}