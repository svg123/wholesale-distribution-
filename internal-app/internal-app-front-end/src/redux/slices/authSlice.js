import { createSlice } from '@reduxjs/toolkit';
import config from '../../config/env';

const initialState = {
  user: null,
  token: localStorage.getItem(config.tokenKey) || null,
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem(config.tokenKey),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem(config.tokenKey, action.payload.token);
      localStorage.setItem(config.userKey, JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem(config.tokenKey);
      localStorage.removeItem(config.userKey);
    },
    restoreAuth: (state) => {
      const token = localStorage.getItem(config.tokenKey);
      const user = localStorage.getItem(config.userKey);
      if (token && user) {
        state.token = token;
        state.user = JSON.parse(user);
        state.isAuthenticated = true;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, restoreAuth, clearError } =
  authSlice.actions;
export default authSlice.reducer;
