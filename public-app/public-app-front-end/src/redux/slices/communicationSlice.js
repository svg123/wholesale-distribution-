import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Assistance requests (user → server)
  requests: [],
  isSubmittingRequest: false,
  requestSuccess: false,
  requestError: null,

  // Messages (server → user)
  messages: [],
  isLoadingMessages: false,
  messagesError: null,
  unreadCount: 0,

  // Active sub-tab
  activeTab: 'assistance',
};

const communicationSlice = createSlice({
  name: 'communication',
  initialState,
  reducers: {
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },

    // ── Assistance request actions ──
    submitRequestStart(state) {
      state.isSubmittingRequest = true;
      state.requestError = null;
      state.requestSuccess = false;
    },
    submitRequestSuccess(state, action) {
      state.isSubmittingRequest = false;
      state.requestSuccess = true;
      state.requests.unshift(action.payload);
    },
    submitRequestFailure(state, action) {
      state.isSubmittingRequest = false;
      state.requestError = action.payload;
    },
    clearRequestStatus(state) {
      state.requestSuccess = false;
      state.requestError = null;
    },

    // ── Messages actions ──
    fetchMessagesStart(state) {
      state.isLoadingMessages = true;
      state.messagesError = null;
    },
    fetchMessagesSuccess(state, action) {
      state.isLoadingMessages = false;
      state.messages = action.payload;
      state.unreadCount = action.payload.filter((m) => !m.isRead).length;
    },
    fetchMessagesFailure(state, action) {
      state.isLoadingMessages = false;
      state.messagesError = action.payload;
    },
    markMessageRead(state, action) {
      const message = state.messages.find((m) => m.id === action.payload);
      if (message && !message.isRead) {
        message.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllMessagesRead(state) {
      state.messages.forEach((m) => {
        m.isRead = true;
      });
      state.unreadCount = 0;
    },
  },
});

export const {
  setActiveTab,
  submitRequestStart,
  submitRequestSuccess,
  submitRequestFailure,
  clearRequestStatus,
  fetchMessagesStart,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  markMessageRead,
  markAllMessagesRead,
} = communicationSlice.actions;

export default communicationSlice.reducer;
