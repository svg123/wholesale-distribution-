import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: {
    totalOrders: 0,
    pendingOrders: 0,
    dispatchingOrders: 0,
    completedOrders: 0,
    todayOrders: 0,
    todayDispatched: 0,
    todayRevenue: 0,
  },
  recentOrders: [],
  dailyStats: [],
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    fetchStatsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchStatsSuccess: (state, action) => {
      state.isLoading = false;
      state.stats = action.payload.stats;
      state.recentOrders = action.payload.recentOrders;
    },
    fetchStatsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchDailyStatsStart: (state) => {
      state.isLoading = true;
    },
    fetchDailyStatsSuccess: (state, action) => {
      state.isLoading = false;
      state.dailyStats = action.payload;
    },
    fetchDailyStatsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchStatsStart,
  fetchStatsSuccess,
  fetchStatsFailure,
  fetchDailyStatsStart,
  fetchDailyStatsSuccess,
  fetchDailyStatsFailure,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
