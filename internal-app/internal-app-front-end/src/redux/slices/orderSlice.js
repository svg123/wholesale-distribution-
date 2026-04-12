import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  selectedOrder: null,
  orderTimeline: null,
  isLoading: false,
  error: null,
  filters: {
    status: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  },
  pagination: {
    page: 1,
    limit: 20,
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
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    fetchTimelineStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchTimelineSuccess: (state, action) => {
      state.isLoading = false;
      state.orderTimeline = action.payload;
    },
    fetchTimelineFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearOrderState: (state) => {
      state.selectedOrder = null;
      state.orderTimeline = null;
      state.error = null;
    },
  },
});

export const {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  setSelectedOrder,
  fetchTimelineStart,
  fetchTimelineSuccess,
  fetchTimelineFailure,
  setFilters,
  setPage,
  clearOrderState,
} = orderSlice.actions;
export default orderSlice.reducer;
