import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '@types';
import { ModulesUsers } from '../../interfaces/menuModules';

interface LoadUser {
    user: User;
    modules: ModulesUsers[];
}

const initialState: AuthState = {
    status: 'not-authenticated', // 'authenticated','not-authenticated',
    user: null,
    modules: [],
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
        onLogin: (state, action: PayloadAction<LoadUser>) => {
            state.status = 'authenticated';
            state.user = action.payload.user;
            state.modules = action.payload.modules;
            state.errorMessage = '';
        },
        onLogout: (state, action: PayloadAction<string>) => {
            state.status = 'not-authenticated';
            state.user = null;
            state.modules = [];
            state.errorMessage = action.payload;
        },
        setAuthUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
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
    setAuthUser,
} = authSlice.actions;