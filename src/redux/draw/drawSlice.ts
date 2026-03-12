import { createSlice } from "@reduxjs/toolkit";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

export const drawSlice = createSlice({
  name: "draw",
  initialState: {
    draw: new MapboxDraw({})
  },
  reducers: {
    setDraw: (state, action) => {
      state.draw = action.payload;
    }
  }
});

export const { setDraw } = drawSlice.actions;

export const selectDraw = (state) => state.draw.draw;

export default drawSlice.reducer;
