import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductiveUnits, ProductiveUnitsState} from '../../interfaces/productiveUnits';


const initialState: ProductiveUnitsState = {
    productiveUnitsActive: null,
    ProductiveUnits: [],
}



export const productiveUnitsSlice = createSlice({
    name: 'Productive Units',
    initialState: initialState,
    reducers: {
        setProductiveUnitsActive: (state, action: PayloadAction<ProductiveUnits>) => {
            state. productiveUnitsActive = action.payload;
        },
        removeProductiveUnitsActive: (state) => {
            state. productiveUnitsActive = null
        },
        loadProductiveUnitsActive: (state, action: PayloadAction<ProductiveUnits[]>) => {
            state. ProductiveUnits = action.payload;
        },
        removeProductiveUnits: (state) => {
            state. ProductiveUnits = [];
        }
    }
});


export const {
    loadProductiveUnitsActive,
    removeProductiveUnits,
    removeProductiveUnitsActive,
    setProductiveUnitsActive,
} = productiveUnitsSlice.actions;