import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductUnits, ProductiveUnitsState} from '../../interfaces/productiveUnits';


const initialState: ProductiveUnitsState = {
    productiveUnitsActive: null,
    productiveUnits: [],
}



export const productiveUnitsSlice = createSlice({
    name: 'Productive Units',
    initialState: initialState,
    reducers: {
        setProductiveUnitsActive: (state, action: PayloadAction<ProductUnits>) => {
            state. productiveUnitsActive = action.payload;
        },
        removeProductiveUnitsActive: (state) => {
            state. productiveUnitsActive = null
        },
        loadProductiveUnitsActive: (state, action: PayloadAction<ProductUnits[]>) => {
            state. productiveUnits = action.payload;
        },
        removeProductiveUnits: (state) => {
            state. productiveUnits = [];
        }
    }
});


export const {
    loadProductiveUnitsActive,
    removeProductiveUnits,
    removeProductiveUnitsActive,
    setProductiveUnitsActive,
} = productiveUnitsSlice.actions;