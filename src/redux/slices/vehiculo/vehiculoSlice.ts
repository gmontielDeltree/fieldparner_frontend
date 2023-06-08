import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Vehiculo } from '../../../types';

export interface VehiculoState {
    vehiculos: Vehiculo[];
    vehiculoActivo: Vehiculo | null;
}

const initialState: VehiculoState = {
    vehiculos: [],
    vehiculoActivo: null,
}

export const vehiculoSlice = createSlice({
    name: 'Vehiculo',
    initialState,
    reducers: {
        cargarVehiculos: (state, action: PayloadAction<Vehiculo[]>) => {
            state.vehiculos = action.payload;
        },
        setVehiculoActivo: (state, action: PayloadAction<Vehiculo>) => {
            state.vehiculoActivo = action.payload;
        },
        removerVehiculoActivo: (state) => {
            state.vehiculoActivo = null;
        },
        agregarNuevoVehiculo: (state, action: PayloadAction<Vehiculo>) => {
            state.vehiculos = [...state.vehiculos, action.payload];
        },
        actualizarVehiculo: (state, action: PayloadAction<Vehiculo>) => {
            state.vehiculos = state.vehiculos.map(
                v => (v.nro === action.payload.nro) ? action.payload : v
            )
        }
    },
})

export const {
    cargarVehiculos,
    setVehiculoActivo,
    removerVehiculoActivo,
    agregarNuevoVehiculo,
    actualizarVehiculo
} = vehiculoSlice.actions
