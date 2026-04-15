import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WithdrawalOrder, WithdrawalOrderItem } from '../../types';

interface WithdrawalOrderState {
    withdrawalOrderActive: WithdrawalOrderItem | null;
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
        setWithdrawalOrderActive: (state, action: PayloadAction<WithdrawalOrderItem>) => {
            state.withdrawalOrderActive = action.payload;
        },
        removeWithdrawalOrderActive: (state) => {
            state.withdrawalOrderActive = null;
        }
    }
});


export const {
    loadWithdrawalOrders,
    removeWithdrawalOrderActive,
    removeWithdrawalOrders,
    setWithdrawalOrderActive
} = withdrawalOrderSlice.actions;
