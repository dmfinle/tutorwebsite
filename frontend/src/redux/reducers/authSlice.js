import isEmpty from "../../utils/is-empty";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import setAuthToken from "../../utils/setAuthToken";
import jwt_decode from "jwt-decode";

const initialState = {
  isAuthenticated: false,
  user: {},
};

//Thunk functions

// Register User
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData) => {
    const resp = await axios.post("/api/users/register", userData);
    return resp.data;
  }
);

// Login - Get User JWT
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData) => {
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
    return decoded;
  }
);

// Log out user
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  // Remove token from localStorage
  localStorage.removeItem("jwtToken");
  // Set auth header for future requests
  setAuthToken(false);
  // Set current user to {} which will set isAuthenticated to false
  return {};
});

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
      .addCase(registerUser.fulfilled, (state, action) => {
        //const resp = action.payload;
        //if(resp.status === 200)
        return {}; //clear errors
      })
      .addCase(registerUser.rejected, (state, action) => {
        return action.payload;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        authSlice.caseReducers.setCurrentUser(state, action);
      })
      .addCase(loginUser.rejected, (state, action) => {
        return action.payload; //return error
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        authSlice.caseReducers.setCurrentUser(state, action);
      });
  },
});

export const { setCurrentUser } = authSlice.actions;
export default authSlice.reducer;
