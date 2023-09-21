import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Supply, SupplyState } from '@types';


const initialState: SupplyState = {
    supplyActive: null,
    supplies: [],
}

export const supplySlice = createSlice({
    name: 'Supplies',
    initialState: initialState,
    reducers: {
        setSupplyActive: (state, action: PayloadAction<Supply>) => {
            state.supplyActive = action.payload;
        },
        removeSupplyActive: (state) => {
            state.supplyActive = null
        },
        loadSupplies: (state, action: PayloadAction<Supply[]>) => {
            state.supplies = action.payload;
        },
        removeSupplies: (state) => {
            state.supplies = [];
        }
    }
});


export const {
    loadSupplies,
    removeSupplies,
    removeSupplyActive,
    setSupplyActive
} = supplySlice.actions;
