import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Deposit, DepositState } from '@types';


const initialState: DepositState = {
    depositActive: null,
    deposits: [],
}

export const depositSlice = createSlice({
    name: 'Deposits',
    initialState: initialState,
    reducers: {
        setDepositActive: (state, action: PayloadAction<Deposit>) => {
            state.depositActive = action.payload;
        },
        removeDepositActive: (state) => {
            state.depositActive = null
        },
        loadDeposits: (state, action: PayloadAction<Deposit[]>) => {
            state.deposits = action.payload;
        },
        removeDeposits: (state) => {
            state.deposits = [];
        }
    }
});


export const {
    loadDeposits,
    removeDepositActive,
    removeDeposits,
    setDepositActive
} = depositSlice.actions;
