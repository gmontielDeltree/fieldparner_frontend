import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CostsExpenses, CostsExpensesState} from '../../interfaces/costsExpenses';


const initialState: CostsExpensesState = {
    costsExpensesActive: null,
    CostsExpenses: [],
}



export const costsExpensesSlice = createSlice({
    name: 'Costs Expenses',
    initialState: initialState,
    reducers: {
        setCostsExpensesActive: (state, action: PayloadAction<CostsExpenses>) => {
            state. costsExpensesActive = action.payload;
        },
        removeCostsExpensesActive: (state) => {
            state. costsExpensesActive = null
        },
        loadCostsExpensesActive: (state, action: PayloadAction<CostsExpenses[]>) => {
            state. CostsExpenses = action.payload;
        },
        removeCostsExpenses: (state) => {
            state. CostsExpenses = [];
        }
    }
});


export const {
    loadCostsExpensesActive,
    removeCostsExpenses,
    removeCostsExpensesActive,
    setCostsExpensesActive,
} = costsExpensesSlice.actions;