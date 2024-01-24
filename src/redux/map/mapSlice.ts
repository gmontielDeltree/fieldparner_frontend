import { createSlice } from "@reduxjs/toolkit";

export const mapSlice = createSlice({
  name: "map",
  initialState: {
    map: null
  },
  reducers: {
    setMap: (state, action) => {
      state.map = action.payload;
    }
  }
});

export const { setMap } = mapSlice.actions;

export const selectMap = (state) => state.map.map;

export default mapSlice.reducer;
