import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserByAccount, UsersState } from '@types';


const initialState: UsersState = {
    userActive: null,
    users: [],
}

export const usersSlice = createSlice({
    name: 'Users',
    initialState: initialState,
    reducers: {
        setUserActive: (state, action: PayloadAction<UserByAccount>) => {
            state.userActive = action.payload;
        },
        removeUsersActive: (state) => {
            state.userActive = null
        },
        loadUsers: (state, action: PayloadAction<UserByAccount[]>) => {
            state.users = action.payload;
        },
        removeUsers: (state) => {
            state.users = [];
        }
    }
});


export const {
    loadUsers,
    removeUsers,
    removeUsersActive,
    setUserActive
} = usersSlice.actions;
