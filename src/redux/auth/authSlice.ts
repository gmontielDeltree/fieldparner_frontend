import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
    id: string;
    email: string;
}

export interface AuthState {
    status: 'checking' | 'authenticated' | 'not-authenticated';
    user: User | null;
    errorMessage: string;
    isLoading: boolean;
}

const initialState: AuthState = {
    status: 'not-authenticated', // 'authenticated','not-authenticated',
    user: null,
    errorMessage: '',
    isLoading: false,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        onChecking: (state) => {
            state.status = 'checking';
            state.user = null;
            state.errorMessage = '';
        },
        onLogin: (state, action: PayloadAction<User>) => {
            state.status = 'authenticated';
            state.user = action.payload;
            state.errorMessage = '';
        },
        onLogout: (state, action: PayloadAction<string>) => {
            state.status = 'not-authenticated';
            state.user = null;
            state.errorMessage = action.payload;
        },
        clearErrorMessage: (state) => {
            state.errorMessage = '';
        },
        startLoading: (state) => {
            state.isLoading = true;
        },
        finishLoading: (state) => {
            state.isLoading = false;
        }
    }
});


// Action creators are generated for each case reducer function
export const {
    onChecking,
    onLogin,
    onLogout,
    clearErrorMessage,
    startLoading,
    finishLoading,
} = authSlice.actions;
