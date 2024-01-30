import { createSlice } from "@reduxjs/toolkit";

export const fieldListSlice = createSlice({
  name: "fieldList",
  initialState: {
    isVisible: false
  },
  reducers: {
    showFieldList: (state) => {
      state.isVisible = true;
    },
    hideFieldList: (state) => {
      state.isVisible = false;
    }
  }
});

export const { showFieldList, hideFieldList } = fieldListSlice.actions;

export default fieldListSlice.reducer;
