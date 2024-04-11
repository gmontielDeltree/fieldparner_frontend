import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {Zones, ZoneState } from '@types';


const initialState: ZoneState = {
    zoneActive: null,
    zones: [],
}

export const zoneSlice = createSlice({
    name: 'Zones',
    initialState: initialState,
    reducers: {
        setZoneActive: (state, action: PayloadAction<Zones>) => {
            state.zoneActive = action.payload;
        },
        removeZoneActive: (state) => {
            state.zoneActive = null
        },
        loadZones: (state, action: PayloadAction<Zones[]>) => {
            state.zones = action.payload;
        },
        removeZones: (state) => {
            state.zones = [];
        }
    }
});


export const {
    loadZones,
    removeZones,
    removeZoneActive,
    setZoneActive,
} = zoneSlice.actions;
