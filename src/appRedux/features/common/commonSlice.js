import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../services/axiosClient";
import { data } from "react-router-dom";

/*
   Generic API Thunk
*/
export const fetchStart = createAsyncThunk(
  "common/fetchStart",
  async ({ url, method, data,params,key }, thunkAPI) => {
    try {
      const response = await axiosClient({
        url,
        method,
        data,
        params,
        key,
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

const commonSlice = createSlice({
  name: "common",
  initialState: {
    loading: false,
    error: null,
    response: {},
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchStart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStart.fulfilled, (state, action) => {
        state.loading = false;
        state.response[action.meta.arg.key] = action.payload;
      })
      .addCase(fetchStart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default commonSlice.reducer;