import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
    id: string;
    email: string;
}

export interface AuthState {
    status: 'checking' | 'authenticated' | 'not-authenticated';
    user: User | null;
    errorMessage: string;
}

const initialState: AuthState = {
    status: 'not-authenticated', // 'authenticated','not-authenticated',
    user: null,
    errorMessage: '',
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
        }
    }
});


// Action creators are generated for each case reducer function
export const { onChecking, onLogin, onLogout, clearErrorMessage } = authSlice.actions;
