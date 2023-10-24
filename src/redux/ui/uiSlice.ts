import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
    isLoading: boolean;
    openSideBar: boolean;
}

const initialState: UIState = {
    isLoading: false,
    openSideBar: false,
}

export const uiSlice = createSlice({
    name: 'UI',
    initialState,
    reducers: {
        uiStartLoading: (state) => {
            state.isLoading = true;
        },
        uiFinishLoading: (state) => {
            state.isLoading = false;
        },
        uiOpenSideBard: (state, action: PayloadAction<boolean>) => {
            state.openSideBar = action.payload;
        }
    },
})

export const {
    uiStartLoading,
    uiFinishLoading,
    uiOpenSideBard, } = uiSlice.actions;
