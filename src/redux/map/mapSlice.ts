import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MapState {
  map: any;
}

const initialState: MapState = {
  map: null
};

export const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setMap: (state, action: PayloadAction<any>) => {
      state.map = action.payload;
    }
  }
});

export const { setMap } = mapSlice.actions;
