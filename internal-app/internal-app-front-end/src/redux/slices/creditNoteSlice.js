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
  DRAFT: { label: 'Draft', bgClass: 'bg-gray-100', textClass: 'text-gray-700', dotClass: 'bg-gray-400' },
  PENDING_APPROVAL: { label: 'Pending Approval', bgClass: 'bg-yellow-100', textClass: 'text-yellow-700', dotClass: 'bg-yellow-400' },
  APPROVED: { label: 'Approved', bgClass: 'bg-blue-100', textClass: 'text-blue-700', dotClass: 'bg-blue-400' },
  REJECTED: { label: 'Rejected', bgClass: 'bg-red-100', textClass: 'text-red-700', dotClass: 'bg-red-400' },
  READY_TO_PROCESS: { label: 'Ready to Process', bgClass: 'bg-green-100', textClass: 'text-green-700', dotClass: 'bg-green-400' },
  PARTIALLY_USED: { label: 'Partially Used', bgClass: 'bg-indigo-100', textClass: 'text-indigo-700', dotClass: 'bg-indigo-400' },
  FULLY_UTILIZED: { label: 'Fully Utilized', bgClass: 'bg-emerald-100', textClass: 'text-emerald-700', dotClass: 'bg-emerald-400' },
  EDIT_REQUESTED: { label: 'Edit Requested', bgClass: 'bg-purple-100', textClass: 'text-purple-700', dotClass: 'bg-purple-400' },
  DELETE_REQUESTED: { label: 'Delete Requested', bgClass: 'bg-pink-100', textClass: 'text-pink-700', dotClass: 'bg-pink-400' },
};

const initialState = {
  // Credit Notes list (management view)
  creditNotes: [],
  selectedCreditNote: null,
  isLoading: false,
  error: null,

  // Pagination
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  // Filters
  filters: {
    status: 'all',
    returnType: 'all',
    search: '',
    dateFrom: null,
    dateTo: null,
    areaCode: '',
  },

  // Dashboard stats
  stats: {
    draft: 0,
    pendingApproval: 0,
    approved: 0,
    readyToProcess: 0,
    partiallyUsed: 0,
    fullyUtilized: 0,
    editRequested: 0,
    deleteRequested: 0,
    totalCreditAmount: 0,
    totalUsedAmount: 0,
    totalRemainingAmount: 0,
  },

  // Configuration
  config: {
    expiryClaimWindow: 90,
    creditUsageValidity: 180,
    enabledReturnTypes: ['EXPIRY', 'BREAKAGE_DAMAGE', 'GOOD_RETURN'],
    partialApprovalEnabled: true,
    autoApplyInBilling: true,
  },

  // Area-based configs
  areaConfigs: [],
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
      state.selectedCreditNote = action.payload;
    },
    fetchCreditNoteDetailFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ===== Stage 1: Approve / Reject =====
    approveCreditNoteStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    approveCreditNoteSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.creditNotes.findIndex((cn) => cn.id === action.payload.id);
      if (index !== -1) {
        state.creditNotes[index] = action.payload;
      }
      if (state.selectedCreditNote?.id === action.payload.id) {
        state.selectedCreditNote = action.payload;
      }
    },
    approveCreditNoteFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    rejectCreditNoteStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    rejectCreditNoteSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.creditNotes.findIndex((cn) => cn.id === action.payload.id);
      if (index !== -1) {
        state.creditNotes[index] = action.payload;
      }
      if (state.selectedCreditNote?.id === action.payload.id) {
        state.selectedCreditNote = action.payload;
      }
    },
    rejectCreditNoteFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ===== Stage 2: Ready-to-Process =====
    markReadyToProcessStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    markReadyToProcessSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.creditNotes.findIndex((cn) => cn.id === action.payload.id);
      if (index !== -1) {
        state.creditNotes[index] = action.payload;
      }
      if (state.selectedCreditNote?.id === action.payload.id) {
        state.selectedCreditNote = action.payload;
      }
    },
    markReadyToProcessFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ===== Handle Edit/Delete Requests =====
    handleEditRequestStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    handleEditRequestSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.creditNotes.findIndex((cn) => cn.id === action.payload.id);
      if (index !== -1) {
        state.creditNotes[index] = action.payload;
      }
      if (state.selectedCreditNote?.id === action.payload.id) {
        state.selectedCreditNote = action.payload;
      }
    },
    handleEditRequestFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    handleDeleteRequestStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    handleDeleteRequestSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.creditNotes.findIndex((cn) => cn.id === action.payload.id);
      if (index !== -1) {
        state.creditNotes[index] = action.payload;
      }
      if (state.selectedCreditNote?.id === action.payload.id) {
        state.selectedCreditNote = action.payload;
      }
    },
    handleDeleteRequestFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ===== Stats =====
    fetchStatsStart: (state) => {
      state.isLoading = true;
    },
    fetchStatsSuccess: (state, action) => {
      state.isLoading = false;
      state.stats = { ...state.stats, ...action.payload };
    },
    fetchStatsFailure: (state, action) => {
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
    updateConfigStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateConfigSuccess: (state, action) => {
      state.isLoading = false;
      state.config = { ...state.config, ...action.payload };
    },
    updateConfigFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ===== Area Configs =====
    fetchAreaConfigsStart: (state) => {
      state.isLoading = true;
    },
    fetchAreaConfigsSuccess: (state, action) => {
      state.isLoading = false;
      state.areaConfigs = action.payload;
    },
    fetchAreaConfigsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    upsertAreaConfigStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    upsertAreaConfigSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.areaConfigs.findIndex((ac) => ac.areaCode === action.payload.areaCode);
      if (index !== -1) {
        state.areaConfigs[index] = action.payload;
      } else {
        state.areaConfigs.push(action.payload);
      }
    },
    upsertAreaConfigFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    deleteAreaConfigStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteAreaConfigSuccess: (state, action) => {
      state.isLoading = false;
      state.areaConfigs = state.areaConfigs.filter((ac) => ac.areaCode !== action.payload);
    },
    deleteAreaConfigFailure: (state, action) => {
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

    // ===== Selection =====
    setSelectedCreditNote: (state, action) => {
      state.selectedCreditNote = action.payload;
    },
    clearSelectedCreditNote: (state) => {
      state.selectedCreditNote = null;
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
  approveCreditNoteStart,
  approveCreditNoteSuccess,
  approveCreditNoteFailure,
  rejectCreditNoteStart,
  rejectCreditNoteSuccess,
  rejectCreditNoteFailure,
  markReadyToProcessStart,
  markReadyToProcessSuccess,
  markReadyToProcessFailure,
  handleEditRequestStart,
  handleEditRequestSuccess,
  handleEditRequestFailure,
  handleDeleteRequestStart,
  handleDeleteRequestSuccess,
  handleDeleteRequestFailure,
  fetchStatsStart,
  fetchStatsSuccess,
  fetchStatsFailure,
  fetchConfigStart,
  fetchConfigSuccess,
  fetchConfigFailure,
  updateConfigStart,
  updateConfigSuccess,
  updateConfigFailure,
  fetchAreaConfigsStart,
  fetchAreaConfigsSuccess,
  fetchAreaConfigsFailure,
  upsertAreaConfigStart,
  upsertAreaConfigSuccess,
  upsertAreaConfigFailure,
  deleteAreaConfigStart,
  deleteAreaConfigSuccess,
  deleteAreaConfigFailure,
  setCreditNoteFilters,
  setCreditNotePage,
  setSelectedCreditNote,
  clearSelectedCreditNote,
  clearError,
} = creditNoteSlice.actions;

export default creditNoteSlice.reducer;
