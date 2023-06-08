import { agregarNuevoVehiculo, cargarVehiculos } from ".";
import { getVehiculoService } from "../../../services";
import { Vehiculo } from "../../../types";
import { AppDispatch, RootState } from "../../store";
import { uiFinishLoading, uiStartLoading } from "../ui";


export const getVehiculos = () => {
    return async (dispatch: AppDispatch, getState: () => RootState) => {
        dispatch(uiStartLoading());
        try {
            if (getState().vehiculo.vehiculos.length === 0) {
                const response = await getVehiculoService();
                if (response) dispatch(cargarVehiculos(response));
            }

            dispatch(uiFinishLoading());
        } catch (error) {
            dispatch(uiFinishLoading());
        }
    }
}

export const agregarVehiculo = () => {
    return (dispatch: AppDispatch) => {
        dispatch(agregarNuevoVehiculo({} as Vehiculo));
    }
}