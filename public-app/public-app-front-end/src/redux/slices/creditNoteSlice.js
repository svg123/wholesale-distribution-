import { createSlice } from '@reduxjs/toolkit';

// ===== Credit Note Status Constants =====
export const CN_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  READY_TO_PROCESS: 'READY_TO_PROCESS',
  PARTIALLY_USED: 'PARTIALLY_USED',
  FULLY_UTILIZED: 'FULLY_UTILIZED',
  EDIT_REQUESTED: 'EDIT_REQUESTED',
  DELETE_REQUESTED: 'DELETE_REQUESTED',
};

// ===== Return Types =====
export const RETURN_TYPES = {
  EXPIRY: 'EXPIRY',
  BREAKAGE_DAMAGE: 'BREAKAGE_DAMAGE',
  GOOD_RETURN: 'GOOD_RETURN',
};

export const RETURN_TYPE_CONFIG = {
  EXPIRY: { label: 'Expiry', color: 'red', icon: '📅' },
  BREAKAGE_DAMAGE: { label: 'Breakage / Damage', color: 'orange', icon: '💔' },
  GOOD_RETURN: { label: 'Good Return', color: 'green', icon: '✅' },
};

// ===== Status Display Config =====
export const CN_STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'gray', bgClass: 'bg-gray-100', textClass: 'text-gray-700' },
  PENDING_APPROVAL: { label: 'Pending Approval', color: 'yellow', bgClass: 'bg-yellow-100', textClass: 'text-yellow-700' },
  APPROVED: { label: 'Approved', color: 'blue', bgClass: 'bg-blue-100', textClass: 'text-blue-700' },
  REJECTED: { label: 'Rejected', color: 'red', bgClass: 'bg-red-100', textClass: 'text-red-700' },
  READY_TO_PROCESS: { label: 'Ready to Process', color: 'green', bgClass: 'bg-green-100', textClass: 'text-green-700' },
  PARTIALLY_USED: { label: 'Partially Used', color: 'indigo', bgClass: 'bg-indigo-100', textClass: 'text-indigo-700' },
  FULLY_UTILIZED: { label: 'Fully Utilized', color: 'emerald', bgClass: 'bg-emerald-100', textClass: 'text-emerald-700' },
  EDIT_REQUESTED: { label: 'Edit Requested', color: 'purple', bgClass: 'bg-purple-100', textClass: 'text-purple-700' },
  DELETE_REQUESTED: { label: 'Delete Requested', color: 'pink', bgClass: 'bg-pink-100', textClass: 'text-pink-700' },
};

const initialState = {
  // Credit Notes list
  creditNotes: [],
  currentCreditNote: null,
  isLoading: false,
  error: null,

  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },

  // Filters
  filters: {
    status: 'all',
    returnType: 'all',
    dateFrom: null,
    dateTo: null,
    search: '',
  },

  // Create/Edit form state
  form: {
    returnType: null,
    invoiceId: null,
    items: [],       // { productId, productName, batchNumber, quantity, maxQuantity, unitPrice, reason, expiryDate }
    notes: '',
  },

  // Available data for form
  invoices: [],
  productBatches: {},

  // Configuration
  config: {
    expiryClaimWindow: 90,
    creditUsageValidity: 180,
    enabledReturnTypes: ['EXPIRY', 'BREAKAGE_DAMAGE', 'GOOD_RETURN'],
    partialApprovalEnabled: true,
    autoApplyInBilling: true,
  },

  // Available credit notes for billing
  availableForBilling: [],

  // Stats
  stats: {
    totalAmount: 0,
    usedAmount: 0,
    remainingAmount: 0,
    pendingCount: 0,
    approvedCount: 0,
  },
};

const creditNoteSlice = createSlice({
  name: 'creditNote',
  initialState,
  reducers: {
    // ===== List Operations =====
    fetchCreditNotesStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchCreditNotesSuccess: (state, action) => {
      state.isLoading = false;
      state.creditNotes = action.payload.creditNotes;
      state.pagination.total = action.payload.total;
    },
    fetchCreditNotesFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ===== Detail =====
    fetchCreditNoteDetailStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchCreditNoteDetailSuccess: (state, action) => {
      state.isLoading = false;
      state.currentCreditNote = action.payload;
    },
    fetchCreditNoteDetailFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ===== Create =====
    createCreditNoteStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createCreditNoteSuccess: (state, action) => {
      state.isLoading = false;
      state.creditNotes.unshift(action.payload);
      state.currentCreditNote = action.payload;
    },
    createCreditNoteFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ===== Update =====
    updateCreditNoteStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateCreditNoteSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.creditNotes.findIndex((cn) => cn.id === action.payload.id);
      if (index !== -1) {
        state.creditNotes[index] = action.payload;
      }
      state.currentCreditNote = action.payload;
    },
    updateCreditNoteFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ===== Delete =====
    deleteCreditNoteStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteCreditNoteSuccess: (state, action) => {
      state.isLoading = false;
      state.creditNotes = state.creditNotes.filter((cn) => cn.id !== action.payload);
      if (state.currentCreditNote?.id === action.payload) {
        state.currentCreditNote = null;
      }
    },
    deleteCreditNoteFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ===== Submit for Approval =====
    submitCreditNoteStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    submitCreditNoteSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.creditNotes.findIndex((cn) => cn.id === action.payload.id);
      if (index !== -1) {
        state.creditNotes[index] = action.payload;
      }
      state.currentCreditNote = action.payload;
    },
    submitCreditNoteFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ===== Request Edit/Delete =====
    requestEditStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    requestEditSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.creditNotes.findIndex((cn) => cn.id === action.payload.id);
      if (index !== -1) {
        state.creditNotes[index] = action.payload;
      }
    },
    requestEditFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    requestDeleteStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    requestDeleteSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.creditNotes.findIndex((cn) => cn.id === action.payload.id);
      if (index !== -1) {
        state.creditNotes[index] = action.payload;
      }
    },
    requestDeleteFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ===== Form State =====
    setReturnType: (state, action) => {
      state.form.returnType = action.payload;
      state.form.invoiceId = null;
      state.form.items = [];
    },
    setInvoiceId: (state, action) => {
      state.form.invoiceId = action.payload;
      state.form.items = [];
    },
    addCreditNoteItem: (state, action) => {
      state.form.items.push(action.payload);
    },
    updateCreditNoteItem: (state, action) => {
      const { index, data } = action.payload;
      if (state.form.items[index]) {
        state.form.items[index] = { ...state.form.items[index], ...data };
      }
    },
    removeCreditNoteItem: (state, action) => {
      state.form.items = state.form.items.filter((_, i) => i !== action.payload);
    },
    setCreditNoteNotes: (state, action) => {
      state.form.notes = action.payload;
    },
    resetForm: (state) => {
      state.form = initialState.form;
    },
    loadFormFromCreditNote: (state, action) => {
      const cn = action.payload;
      state.form.returnType = cn.returnType;
      state.form.invoiceId = cn.invoiceId;
      state.form.items = cn.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        batchNumber: item.batchNumber,
        quantity: item.quantity,
        maxQuantity: item.maxQuantity || item.quantity,
        unitPrice: item.unitPrice,
        reason: item.reason,
        expiryDate: item.expiryDate,
      }));
      state.form.notes = cn.notes || '';
    },

    // ===== Invoice Data =====
    fetchInvoicesStart: (state) => {
      state.isLoading = true;
    },
    fetchInvoicesSuccess: (state, action) => {
      state.isLoading = false;
      state.invoices = action.payload;
    },
    fetchInvoicesFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ===== Product Batches =====
    fetchProductBatchesStart: (state) => {
      state.isLoading = true;
    },
    fetchProductBatchesSuccess: (state, action) => {
      state.isLoading = false;
      const { productId, batches } = action.payload;
      state.productBatches[productId] = batches;
    },
    fetchProductBatchesFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ===== Config =====
    fetchConfigStart: (state) => {
      state.isLoading = true;
    },
    fetchConfigSuccess: (state, action) => {
      state.isLoading = false;
      state.config = { ...state.config, ...action.payload };
    },
    fetchConfigFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ===== Available for Billing =====
    fetchAvailableForBillingStart: (state) => {
      state.isLoading = true;
    },
    fetchAvailableForBillingSuccess: (state, action) => {
      state.isLoading = false;
      state.availableForBilling = action.payload;
    },
    fetchAvailableForBillingFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ===== Filters & Pagination =====
    setCreditNoteFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setCreditNotePage: (state, action) => {
      state.pagination.page = action.payload;
    },

    // ===== Stats =====
    setCreditNoteStats: (state, action) => {
      state.stats = action.payload;
    },

    // ===== Clear =====
    clearCurrentCreditNote: (state) => {
      state.currentCreditNote = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchCreditNotesStart,
  fetchCreditNotesSuccess,
  fetchCreditNotesFailure,
  fetchCreditNoteDetailStart,
  fetchCreditNoteDetailSuccess,
  fetchCreditNoteDetailFailure,
  createCreditNoteStart,
  createCreditNoteSuccess,
  createCreditNoteFailure,
  updateCreditNoteStart,
  updateCreditNoteSuccess,
  updateCreditNoteFailure,
  deleteCreditNoteStart,
  deleteCreditNoteSuccess,
  deleteCreditNoteFailure,
  submitCreditNoteStart,
  submitCreditNoteSuccess,
  submitCreditNoteFailure,
  requestEditStart,
  requestEditSuccess,
  requestEditFailure,
  requestDeleteStart,
  requestDeleteSuccess,
  requestDeleteFailure,
  setReturnType,
  setInvoiceId,
  addCreditNoteItem,
  updateCreditNoteItem,
  removeCreditNoteItem,
  setCreditNoteNotes,
  resetForm,
  loadFormFromCreditNote,
  fetchInvoicesStart,
  fetchInvoicesSuccess,
  fetchInvoicesFailure,
  fetchProductBatchesStart,
  fetchProductBatchesSuccess,
  fetchProductBatchesFailure,
  fetchConfigStart,
  fetchConfigSuccess,
  fetchConfigFailure,
  fetchAvailableForBillingStart,
  fetchAvailableForBillingSuccess,
  fetchAvailableForBillingFailure,
  setCreditNoteFilters,
  setCreditNotePage,
  setCreditNoteStats,
  clearCurrentCreditNote,
  clearError,
} = creditNoteSlice.actions;

export default creditNoteSlice.reducer;
