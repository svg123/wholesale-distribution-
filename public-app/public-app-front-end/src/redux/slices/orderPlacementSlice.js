import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cart: [],
  selectedProduct: null,
  searchResults: [],
  isSearching: false,
  schemeModalOpen: false,
  activeScheme: null,
  summary: {
    totalItems: 0,
    totalQuantity: 0,
    totalFreeQuantity: 0,
    subtotal: 0,
    totalGst: 0,
    grandTotal: 0,
  },
  lastOrderSummary: null,
  orderPlaced: false,
  error: null,
};

const orderPlacementSlice = createSlice({
  name: 'orderPlacement',
  initialState,
  reducers: {
    // Search actions
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
      state.isSearching = false;
    },
    setSearching: (state, action) => {
      state.isSearching = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },

    // Product selection
    selectProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },

    // Cart management
    addToCart: (state, action) => {
      const { product, quantity } = action.payload;
      
      // Check if product already exists in cart
      const existingItemIndex = state.cart.findIndex(
        (item) => item.productCode === product.productCode
      );

      if (existingItemIndex !== -1) {
        // Merge quantities
        state.cart[existingItemIndex].quantity += quantity;
        
        // Recalculate free quantity
        const item = state.cart[existingItemIndex];
        if (item.scheme) {
          item.freeQuantity = Math.floor(item.quantity / item.scheme.buy) * item.scheme.free;
        }
        
        // Recalculate totals
        const baseTotal = item.quantity * item.pricePerUnit;
        const gstAmount = (baseTotal * item.gst) / 100;
        item.totalPrice = baseTotal + gstAmount;
      } else {
        // Calculate free quantity based on scheme
        let freeQuantity = 0;
        if (product.scheme) {
          freeQuantity = Math.floor(quantity / product.scheme.buy) * product.scheme.free;
        }

        // Calculate pricing
        const baseTotal = quantity * product.pricePerUnit;
        const gstAmount = (baseTotal * product.gst) / 100;
        const totalPrice = baseTotal + gstAmount;

        // Add new item to cart
        state.cart.push({
          productCode: product.productCode,
          productName: product.productName,
          companyName: product.companyName,
          category: product.category,
          quantity,
          freeQuantity,
          pricePerUnit: product.pricePerUnit,
          gst: product.gst,
          totalPrice,
          scheme: product.scheme,
          stock: product.stock,
        });
      }

      // Recalculate summary
      orderPlacementSlice.caseReducers.calculateSummary(state);
    },

    updateCartItemQuantity: (state, action) => {
      const { productCode, quantity } = action.payload;
      const item = state.cart.find((item) => item.productCode === productCode);

      if (item) {
        item.quantity = quantity;

        // Recalculate free quantity
        if (item.scheme) {
          item.freeQuantity = Math.floor(quantity / item.scheme.buy) * item.scheme.free;
        }

        // Recalculate pricing
        const baseTotal = quantity * item.pricePerUnit;
        const gstAmount = (baseTotal * item.gst) / 100;
        item.totalPrice = baseTotal + gstAmount;

        // Recalculate summary
        orderPlacementSlice.caseReducers.calculateSummary(state);
      }
    },

    removeFromCart: (state, action) => {
      const productCode = action.payload;
      state.cart = state.cart.filter((item) => item.productCode !== productCode);
      
      // Recalculate summary
      orderPlacementSlice.caseReducers.calculateSummary(state);
    },

    clearCart: (state) => {
      state.cart = [];
      state.summary = {
        totalItems: 0,
        totalQuantity: 0,
        totalFreeQuantity: 0,
        subtotal: 0,
        totalGst: 0,
        grandTotal: 0,
      };
    },

    // Summary calculation
    calculateSummary: (state) => {
      const totalItems = state.cart.length;
      const totalQuantity = state.cart.reduce((sum, item) => sum + item.quantity, 0);
      const totalFreeQuantity = state.cart.reduce((sum, item) => sum + item.freeQuantity, 0);
      
      let subtotal = 0;
      let totalGst = 0;

      state.cart.forEach((item) => {
        const baseTotal = item.quantity * item.pricePerUnit;
        const gstAmount = (baseTotal * item.gst) / 100;
        subtotal += baseTotal;
        totalGst += gstAmount;
      });

      const grandTotal = subtotal + totalGst;

      state.summary = {
        totalItems,
        totalQuantity,
        totalFreeQuantity,
        subtotal,
        totalGst,
        grandTotal,
      };
    },

    // Scheme modal
    openSchemeModal: (state, action) => {
      state.schemeModalOpen = true;
      state.activeScheme = action.payload;
    },
    closeSchemeModal: (state) => {
      state.schemeModalOpen = false;
      state.activeScheme = null;
    },

    // Order placement
    placeOrder: (state) => {
      // Save the current summary before clearing
      state.lastOrderSummary = { ...state.summary };
      
      // This would typically trigger an API call
      state.orderPlaced = true;
      state.cart = [];
      state.selectedProduct = null;
      state.summary = {
        totalItems: 0,
        totalQuantity: 0,
        totalFreeQuantity: 0,
        subtotal: 0,
        totalGst: 0,
        grandTotal: 0,
      };
    },

    resetOrderPlaced: (state) => {
      state.orderPlaced = false;
      state.lastOrderSummary = null;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setSearchResults,
  setSearching,
  clearSearchResults,
  selectProduct,
  clearSelectedProduct,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  calculateSummary,
  openSchemeModal,
  closeSchemeModal,
  placeOrder,
  resetOrderPlaced,
  setError,
  clearError,
} = orderPlacementSlice.actions;

export default orderPlacementSlice.reducer;
