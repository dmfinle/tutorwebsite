import isEmpty from "../../utils/is-empty";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import setAuthToken from "../../utils/setAuthToken";
import jwt_decode from "jwt-decode";
import { getErrors, clearErrors } from "../reducers/errorSlice";

const initialState = {
  isAuthenticated: false,
  user: {},
};

//Thunk functions

// Register User
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const resp = await axios.post("/api/users/register", userData);
      dispatch(clearErrors());
      //create async thunk must return a promise i.e the response from the request
      return resp.data;
    } catch (err) {
      if (!err.response) {
        throw err;
      }
      //Set error state with specific details
      dispatch(getErrors(err.response.data));
      return rejectWithValue(err.response.data);
    }
  }
);

// Login - Get User JWT
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post("/api/users/login", userData);
      // save to localStorage
      const { token } = res.data;
      // set token to localStorage
      localStorage.setItem("jwtToken", token);
      // set token to auth header
      setAuthToken(token);
      // decode token to get user data
      const decoded = jwt_decode(token);
      // set current user
      dispatch(setCurrentUser(decoded));
      return token;
    } catch (err) {
      if (!err.response) {
        throw err;
      }
      dispatch(getErrors(err.response.data));
      return rejectWithValue(err.response.data);
    }
  }
);

// Log out user
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (userData = {}, { dispatch }) => {
    try {
      // Remove token from localStorage
      localStorage.removeItem("jwtToken");
      // Set auth header for future requests
      setAuthToken(false);
      // Set current user to {} which will set isAuthenticated to false
      dispatch(setCurrentUser(userData));
    } catch (err) {
      console.log("error logging out");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCurrentUser(state, action) {
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      //On pending action display load circle
      .addCase(registerUser.fulfilled, (state, action) => {})
      .addCase(registerUser.rejected, (state, action) => {})
      .addCase(loginUser.fulfilled, (state, action) => {})
      .addCase(loginUser.rejected, (state, action) => {})
      .addCase(logoutUser.fulfilled, (state, action) => {});
  },
});

export const { setCurrentUser } = authSlice.actions;
export default authSlice.reducer;
