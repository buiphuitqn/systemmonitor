// src/appRedux/actions/Auth.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  SIGNIN_USER_SUCCESS,
  SIGNIN_USER_FAIL,
  ON_SHOW_LOADER,
  SHOW_MESSAGE,
  ON_HIDE_LOADER
} from 'constants/ActionTypes';
import { setCookieValue, setLocalStorage, removeCookieValue, removeLocalStorage } from 'util/Commons';
import api from 'util/Api';
import Helper from 'Helper';
export const loginUser = (data) => {
  return async (dispatch) => {
    dispatch({ type: ON_SHOW_LOADER });

    try {
      const res = await api.post('/token', data);
      if (res.status == 200) {
        setCookieValue('tokenInfo', res.data.token);
        if (res.data.refreshToken) {
          setCookieValue('refreshToken', res.data.refreshToken);
        }
        setLocalStorage('userInfo', {
          fullName: res.data.fullName,
          email: res.data.email,
          avatarUrl: res.data.avatarUrl
        });
        dispatch({ type: SIGNIN_USER_SUCCESS, payload: { token: res.data.token, refreshToken: res.data.refreshToken, user: res.data } });
        dispatch({ type: ON_HIDE_LOADER });
        window.location.href = '/';
      }
      else {
        Helper.openNotificationWithIcon('error', 'Login Failed', 'Invalid username or password.');
        dispatch({ type: ON_HIDE_LOADER });
        return;
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại.';
      Helper.openNotificationWithIcon('error', 'Đăng nhập thất bại', errorMessage);
      dispatch({ type: ON_HIDE_LOADER });
    }
  };
};
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
      removeCookieValue('tokenInfo')
      removeCookieValue('refreshToken')
      removeLocalStorage('userInfo')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = action.payload.user
        state.isAuthenticated = true
        setCookieValue('tokenInfo', action.payload.token, { path: '/' })
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
