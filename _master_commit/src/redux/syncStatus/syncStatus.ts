import { createSlice } from "@reduxjs/toolkit";

export const syncStatusSlice = createSlice({
  name: "syncStatus",
  initialState: {
    syncStatus: 0,
  },
  reducers: {
    setSyncStatus: (state, action) => {
      state.syncStatus = action.payload;
    },
    incrementSyncCounter: (state) => {
      state.syncStatus = state.syncStatus + 1;
    },
  },
});

export const { setSyncStatus, incrementSyncCounter } = syncStatusSlice.actions;

export const selectSyncStatus = (state) => state.syncStatus.syncStatus;

export default syncStatusSlice.reducer;
