import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authSlice";
import errorReducer from "./reducers/errorSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    errors: errorReducer,
  },
});

export default store;
