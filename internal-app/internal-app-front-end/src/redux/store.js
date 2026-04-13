import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import orderReducer from './slices/orderSlice';
import dashboardReducer from './slices/dashboardSlice';
import substationReducer from './slices/substationSlice';
import requestReducer from './slices/requestSlice';
import uiReducer from './slices/uiSlice';
import utilityReducer from './slices/utilitySlice';
import deliveryReducer from './slices/deliverySlice';
import staffTrackReducer from './slices/staffTrackSlice';
import creditNoteReducer from './slices/creditNoteSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    order: orderReducer,
    dashboard: dashboardReducer,
    substation: substationReducer,
    request: requestReducer,
    ui: uiReducer,
    utility: utilityReducer,
    delivery: deliveryReducer,
    staffTrack: staffTrackReducer,
    creditNote: creditNoteReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/loginSuccess'],
        ignoredPaths: ['auth.user'],
      },
    }),
});

export default store;
