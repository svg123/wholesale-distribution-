import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  categories: [
    'Cardiovascular',
    'Pain Relief',
    'Antibiotics',
    'Vitamins',
    'Diabetes',
    'Gastrointestinal',
  ],
  isLoading: false,
  error: null,
  filters: {
    category: 'all',
    search: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    fetchProductsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProductsSuccess: (state, action) => {
      state.isLoading = false;
      state.products = action.payload.products;
      state.pagination.total = action.payload.total;
    },
    fetchProductsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setProductFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setProductPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
});

export const {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  setProductFilters,
  setProductPagination,
} = productSlice.actions;

export default productSlice.reducer;
