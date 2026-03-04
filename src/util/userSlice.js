import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from './Api'
import { setCookieValue } from '../util/Commons'

export const loginAsync = createAsyncThunk(
  'auth/login',
  async (data, thunkAPI) => {
    try {
      const res = await api.post('/token', data)
      console.log("Login response:", res.data);
      return res.data
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = action.payload.user
        state.isAuthenticated = true
        setCookieValue('tokenInfo', action.payload.token, { path: '/' })
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
