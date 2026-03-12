import { createSlice } from "@reduxjs/toolkit";

export const mapSlice = createSlice({
  name: "map",
  initialState: {
    map: null,
    lotActive: null,
  },
  reducers: {
    setMap: (state, action) => {
      state.map = action.payload;
    },
    setLotActive: (state, action) => {
      state.lotActive = action.payload;
    },
    removeLotActive: (state) => {
      state.lotActive = null;
    }
  }
});

export const { setMap, setLotActive, removeLotActive } = mapSlice.actions;

export const selectMap = (state) => state.map.map;

export default mapSlice.reducer;
