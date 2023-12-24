import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Vehicle } from '../../types';

export interface VehiculoState {
    vehiculos: Vehicle[];
    vehiculoActivo: Vehicle | null;
}

const initialState: VehiculoState = {
    vehiculos: [],
    vehiculoActivo: null,
}

export const vehiculoSlice = createSlice({
    name: 'Vehiculo',
    initialState,
    reducers: {
        cargarVehiculos: (state, action: PayloadAction<Vehicle[]>) => {
            state.vehiculos = action.payload;
        },
        setVehiculoActivo: (state, action: PayloadAction<Vehicle>) => {
            state.vehiculoActivo = action.payload;
        },
        removerVehiculoActivo: (state) => {
            state.vehiculoActivo = null;
        },
        agregarNuevoVehiculo: (state, action: PayloadAction<Vehicle>) => {
            state.vehiculos = [...state.vehiculos, action.payload];
        },
        actualizarVehiculo: (state, action: PayloadAction<Vehicle>) => {
            state.vehiculos = state.vehiculos.map(
                v => (v._id === action.payload._id) ? action.payload : v
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
