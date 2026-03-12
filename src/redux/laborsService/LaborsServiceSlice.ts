import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {LaborsServices, LaborsServicesState } from '@types';


const initialState: LaborsServicesState = {
    LaborsServicesActive: null,
    LaborsServices: [],
}

export const laborsServicesSlice = createSlice({
    name: 'LaborsServices',
    initialState: initialState,
    reducers: {
        setLaborsServicesActive: (state, action: PayloadAction<LaborsServices>) => {
            state.LaborsServicesActive = action.payload;
        },
        removeLaborsServicesActive: (state) => {
            state.LaborsServicesActive = null
        },
        loadLaborsServices: (state, action: PayloadAction<LaborsServices[]>) => {
            state.LaborsServices = action.payload;
        },
        removeLaborsServices: (state) => {
            state.LaborsServices = [];
        }
    }
});


export const {
    loadLaborsServices,
    removeLaborsServices,
    removeLaborsServicesActive,
    setLaborsServicesActive,
} = laborsServicesSlice.actions;
