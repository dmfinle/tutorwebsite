import isEmpty from "../../utils/is-empty";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getErrors, clearErrors } from "../reducers/errorSlice";

const initialState = {
  profile: null,
  profiles: null,
  searchString: "",
  loading: false,
};

// Return profile of currently logged in user
export const getCurrentProfile = createAsyncThunk(
  "profile/getCurrentProfile",
  async ({}, { dispatch, rejectWithValue }) => {
    try {
      const resp = await axios.get("/api/profile");
      dispatch(getProfile(resp.data));
      //create async thunk must return a promise i.e the response from the request
      return resp.data;
    } catch (err) {
      if (!err.response) {
        throw err;
      }
      //Set error state with specific details
      dispatch(getProfile({}));
      return rejectWithValue(err.response.data);
    }
  }
);

//Create a profile
export const createProfile = createAsyncThunk(
  "profile/createProfile",
  async (profileData, { dispatch, rejectWithValue }) => {
    try {
      await axios.post("/api/profile", profileData.data);
      profileData.history.push("/profile");
    } catch (err) {
      console.error(err);
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    getProfile(state, action) {
      return {
        ...state,
        profile: action.payload,
        //loading: false,
      };
    },
    // clearCurrentProfile(state, action) {
    //   return {
    //     ...state,
    //     profile: null,
    //   };
    // },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentProfile.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getCurrentProfile.fulfilled, (state, action) => {
        //dispatch(getProfile(action.payload));
        state.loading = false;
      });
  },
});

export const { getProfile } = profileSlice.actions;
export default profileSlice.reducer;
