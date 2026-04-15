import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
    isLoading: boolean;
    openSideBar: boolean;
    showModal: string;
}

const initialState: UIState = {
    isLoading: false,
    openSideBar: false,
    showModal: '',
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
        },
        uiOpenModal: (state, action: PayloadAction<string>) => {
            state.showModal = action.payload;
        },
        uiCloseModal: (state) => {
            state.showModal = ''
        }
    },
})

export const {
    uiStartLoading,
    uiFinishLoading,
    uiOpenSideBard,
    uiOpenModal,
    uiCloseModal,
} = uiSlice.actions;
