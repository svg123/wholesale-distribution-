import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  filters: {
    status: 'all',
    dateFrom: null,
    dateTo: null,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    fetchOrdersStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchOrdersSuccess: (state, action) => {
      state.isLoading = false;
      state.orders = action.payload.orders;
      state.pagination.total = action.payload.total;
    },
    fetchOrdersFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchOrderDetailsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchOrderDetailsSuccess: (state, action) => {
      state.isLoading = false;
      state.currentOrder = action.payload;
    },
    fetchOrderDetailsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    createOrderStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createOrderSuccess: (state, action) => {
      state.isLoading = false;
      state.orders.unshift(action.payload);
      state.error = null;
    },
    createOrderFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateOrderStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateOrderSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.orders.findIndex((o) => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    updateOrderFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
});

export const {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  fetchOrderDetailsStart,
  fetchOrderDetailsSuccess,
  fetchOrderDetailsFailure,
  createOrderStart,
  createOrderSuccess,
  createOrderFailure,
  updateOrderStart,
  updateOrderSuccess,
  updateOrderFailure,
  setFilters,
  setPagination,
} = orderSlice.actions;

export default orderSlice.reducer;
