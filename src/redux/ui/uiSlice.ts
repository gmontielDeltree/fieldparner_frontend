import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
    isLoading: boolean;
}

const initialState: UIState = {
    isLoading: false,
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
    },
})

export const {
    uiStartLoading,
    uiFinishLoading } = uiSlice.actions;
