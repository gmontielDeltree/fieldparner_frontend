import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Business, BusinessState } from '@types';


const initialState: BusinessState = {
    businessActive: null,
    businesses: []
}

export const businessSlice = createSlice({
    name: 'Business',
    initialState: initialState,
    reducers: {
        setBusinessActive: (state, action: PayloadAction<Business>) => {
            state.businessActive = action.payload;
        },
        removeBusinessActive: (state) => {
            state.businessActive = null
        },
        loadBusinesses: (state, action: PayloadAction<Business[]>) => {
            state.businesses = action.payload;
        },
        removeBusinesses: (state) => {
            state.businesses = [];
        }
    }
});


export const {
    setBusinessActive,
    removeBusinessActive,
    loadBusinesses,
    removeBusinesses
} = businessSlice.actions;
