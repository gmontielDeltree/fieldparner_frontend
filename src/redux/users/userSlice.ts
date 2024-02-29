import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Users, UsersState } from '@types';


const initialState: UsersState = {
    usersActive: null,
    Users: [],
}

export const usersSlice = createSlice({
    name: 'Users',
    initialState: initialState,
    reducers: {
        setUsersActive: (state, action: PayloadAction<Users>) => {
            state.usersActive = action.payload;
        },
        removeUsersActive: (state) => {
            state.usersActive = null
        },
        loadUsers: (state, action: PayloadAction<Users[]>) => {
            state.Users = action.payload;
        },
        removeUsers: (state) => {
            state.Users = [];
        }
    }
});


export const {
    loadUsers,
    removeUsers,
    removeUsersActive,
    setUsersActive
} = usersSlice.actions;
