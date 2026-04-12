import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeModal: null,
  modalData: null,
  notifications: [],
  reauthRequired: false,
  reauthCallback: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    collapseSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    restoreSidebar: (state) => {
      const saved = localStorage.getItem('cc_sidebar_collapsed');
      if (saved !== null) {
        state.sidebarCollapsed = saved === 'true';
      }
    },
    saveSidebarState: (state) => {
      localStorage.setItem('cc_sidebar_collapsed', state.sidebarCollapsed);
    },
    openModal: (state, action) => {
      state.activeModal = action.payload.type;
      state.modalData = action.payload.data || null;
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    requireReauth: (state, action) => {
      state.reauthRequired = true;
      state.reauthCallback = action.payload || null;
    },
    clearReauth: (state) => {
      state.reauthRequired = false;
      state.reauthCallback = null;
    },
  },
});

export const {
  toggleSidebar,
  collapseSidebar,
  restoreSidebar,
  saveSidebarState,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  clearNotifications,
  requireReauth,
  clearReauth,
} = uiSlice.actions;
export default uiSlice.reducer;
