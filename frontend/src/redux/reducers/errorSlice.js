import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

const errorSlice = createSlice({
  name: "errors",
  initialState,
  reducers: {
    getErrors(state, action) {
      return action.payload;
    },
    clearErrors(state, action) {
      return {};
    },
  },
});

export const { getErrors, clearErrors } = errorSlice.actions;
export default errorSlice.reducer;
