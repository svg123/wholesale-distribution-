import { createSlice } from '@reduxjs/toolkit';
import { DELIVERY_STATUSES, DELIVERY_AVAILABILITY } from '../../utils/constants';

const initialState = {
  deliveryTasks: [],
  deliveryPersonnel: [],
  areaMappings: [],
  approvedLeaves: [],
  isLoading: false,
  error: null,
  filters: {
    status: '',
    area: '',
    search: '',
    assignedTo: '',
  },
  stats: {
    unassigned: 0,
    assigned: 0,
    inProgress: 0,
    delivered: 0,
  },
};

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    deliveryLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deliveryError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    initializeDeliveryData: (state, action) => {
      const { tasks, personnel, areaMappings } = action.payload;
      state.deliveryTasks = tasks;
      state.deliveryPersonnel = personnel;
      state.areaMappings = areaMappings;
      state.isLoading = false;
      state.stats = calculateStats(tasks);
    },
    addDeliveryTask: (state, action) => {
      state.deliveryTasks.unshift(action.payload);
      state.stats = calculateStats(state.deliveryTasks);
    },
    updateDeliveryTaskStatus: (state, action) => {
      const { taskId, status, updatedAt } = action.payload;
      const task = state.deliveryTasks.find((t) => t.id === taskId);
      if (task) {
        task.status = status;
        task.updatedAt = updatedAt || new Date().toISOString();
        if (status === DELIVERY_STATUSES.ASSIGNED) {
          task.assignedAt = new Date().toISOString();
        }
        if (status === DELIVERY_STATUSES.IN_PROGRESS) {
          task.dispatchedAt = new Date().toISOString();
        }
        if (status === DELIVERY_STATUSES.DELIVERED) {
          task.deliveredAt = new Date().toISOString();
        }
      }
      state.stats = calculateStats(state.deliveryTasks);
    },
    assignDeliveryTask: (state, action) => {
      const { taskId, personnelId, personnelName, assignedBy } = action.payload;
      const task = state.deliveryTasks.find((t) => t.id === taskId);
      if (task) {
        task.assignedTo = {
          id: personnelId,
          name: personnelName,
        };
        task.assignedBy = assignedBy;
        task.status = DELIVERY_STATUSES.ASSIGNED;
        task.assignedAt = new Date().toISOString();
        task.updatedAt = new Date().toISOString();
      }
      state.stats = calculateStats(state.deliveryTasks);
    },
    unassignDeliveryTask: (state, action) => {
      const { taskId } = action.payload;
      const task = state.deliveryTasks.find((t) => t.id === taskId);
      if (task) {
        task.assignedTo = null;
        task.assignedBy = null;
        task.status = DELIVERY_STATUSES.READY_FOR_DISPATCH;
        task.assignedAt = null;
        task.updatedAt = new Date().toISOString();
      }
      state.stats = calculateStats(state.deliveryTasks);
    },
    reassignDeliveryTask: (state, action) => {
      const { taskId, personnelId, personnelName, reassignedBy } = action.payload;
      const task = state.deliveryTasks.find((t) => t.id === taskId);
      if (task) {
        task.assignedTo = {
          id: personnelId,
          name: personnelName,
        };
        task.assignedBy = reassignedBy;
        task.updatedAt = new Date().toISOString();
      }
    },
    addDeliveryPerson: (state, action) => {
      state.deliveryPersonnel.push(action.payload);
    },
    updateDeliveryPerson: (state, action) => {
      const { id, updates } = action.payload;
      const idx = state.deliveryPersonnel.findIndex((p) => p.id === id);
      if (idx !== -1) {
        state.deliveryPersonnel[idx] = { ...state.deliveryPersonnel[idx], ...updates };
      }
    },
    removeDeliveryPerson: (state, action) => {
      state.deliveryPersonnel = state.deliveryPersonnel.filter(
        (p) => p.id !== action.payload
      );
    },
    addAreaMapping: (state, action) => {
      state.areaMappings.push(action.payload);
    },
    updateAreaMapping: (state, action) => {
      const { area, updates } = action.payload;
      const idx = state.areaMappings.findIndex((m) => m.area === area);
      if (idx !== -1) {
        state.areaMappings[idx] = { ...state.areaMappings[idx], ...updates };
      }
    },
    removeAreaMapping: (state, action) => {
      state.areaMappings = state.areaMappings.filter(
        (m) => m.area !== action.payload
      );
    },
    syncLeaveStatus: (state, action) => {
      const { approvedLeaves } = action.payload;
      const now = new Date();
      approvedLeaves.forEach((leave) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const isActive = now >= start && now <= end;
        const person = state.deliveryPersonnel.find(
          (p) => p.id === leave.userId || p.staffId === leave.userId
        );
        if (person) {
          if (isActive && leave.status === 'APPROVED') {
            person.availability = DELIVERY_AVAILABILITY.ON_LEAVE;
            person.activeLeave = leave;
          } else if (!isActive && person.availability === DELIVERY_AVAILABILITY.ON_LEAVE) {
            person.availability = DELIVERY_AVAILABILITY.AVAILABLE;
            person.activeLeave = null;
          }
        }
      });
    },
    setDeliveryFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearDeliveryFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

function calculateStats(tasks) {
  return {
    unassigned: tasks.filter((t) => t.status === DELIVERY_STATUSES.READY_FOR_DISPATCH).length,
    assigned: tasks.filter((t) => t.status === DELIVERY_STATUSES.ASSIGNED).length,
    inProgress: tasks.filter((t) => t.status === DELIVERY_STATUSES.IN_PROGRESS).length,
    delivered: tasks.filter((t) => t.status === DELIVERY_STATUSES.DELIVERED).length,
  };
}

export const {
  deliveryLoading,
  deliveryError,
  initializeDeliveryData,
  addDeliveryTask,
  updateDeliveryTaskStatus,
  assignDeliveryTask,
  unassignDeliveryTask,
  reassignDeliveryTask,
  addDeliveryPerson,
  updateDeliveryPerson,
  removeDeliveryPerson,
  addAreaMapping,
  updateAreaMapping,
  removeAreaMapping,
  syncLeaveStatus,
  setDeliveryFilters,
  clearDeliveryFilters,
} = deliverySlice.actions;

export default deliverySlice.reducer;
