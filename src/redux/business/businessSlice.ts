import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Business, BusinessState } from '@types';


const initialState: BusinessState = {
    businessActive: null,
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
        }
    }
});


export const {
    setBusinessActive,
    removeBusinessActive
} = businessSlice.actions;
