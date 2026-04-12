import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  requests: [],
  selectedRequest: null,
  isLoading: false,
  error: null,
  filter: 'ALL',
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

const requestSlice = createSlice({
  name: 'request',
  initialState,
  reducers: {
    fetchRequestsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchRequestsSuccess: (state, action) => {
      state.isLoading = false;
      state.requests = action.payload.requests;
      state.pagination.total = action.payload.total;
    },
    fetchRequestsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedRequest: (state, action) => {
      state.selectedRequest = action.payload;
    },
    submitRequestStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    submitRequestSuccess: (state, action) => {
      state.isLoading = false;
      state.requests.unshift(action.payload);
    },
    submitRequestFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateRequestStatusStart: (state) => {
      state.isLoading = true;
    },
    updateRequestStatusSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.requests.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.requests[index] = action.payload;
      }
    },
    updateRequestStatusFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setRequestFilter: (state, action) => {
      state.filter = action.payload;
    },
    setRequestPage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
});

export const {
  fetchRequestsStart,
  fetchRequestsSuccess,
  fetchRequestsFailure,
  setSelectedRequest,
  submitRequestStart,
  submitRequestSuccess,
  submitRequestFailure,
  updateRequestStatusStart,
  updateRequestStatusSuccess,
  updateRequestStatusFailure,
  setRequestFilter,
  setRequestPage,
} = requestSlice.actions;
export default requestSlice.reducer;
