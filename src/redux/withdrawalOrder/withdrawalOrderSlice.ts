import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WithdrawalOrder } from '../../types';

interface WithdrawalOrderState {
    withdrawalOrderActive: WithdrawalOrder | null;
    withdrawalOrders: WithdrawalOrder[];
}


const initialState: WithdrawalOrderState = {
    withdrawalOrderActive: null,
    withdrawalOrders: [],
}

export const withdrawalOrderSlice = createSlice({
    name: 'WithdrawalOrder',
    initialState: initialState,
    reducers: {
        loadWithdrawalOrders: (state, action: PayloadAction<WithdrawalOrder[]>) => {
            state.withdrawalOrders = action.payload;
        },
        removeWithdrawalOrders: (state) => {
            state.withdrawalOrders = [];
        },
        setWithdrawalOrderActive: (state, action: PayloadAction<WithdrawalOrder>) => {
            state.withdrawalOrderActive = action.payload;
        },
        removeWithdrawalOrderActivve: (state) => {
            state.withdrawalOrderActive = null;
        }
    }
});


export const {
    loadWithdrawalOrders,
    removeWithdrawalOrderActivve,
    removeWithdrawalOrders,
    setWithdrawalOrderActive
} = withdrawalOrderSlice.actions;
