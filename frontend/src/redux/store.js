import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authSlice";
import errorReducer from "./reducers/errorSlice";
import profileReducer from "./reducers/profileSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    errors: errorReducer,
    profile: profileReducer,
  },
});

export default store;
