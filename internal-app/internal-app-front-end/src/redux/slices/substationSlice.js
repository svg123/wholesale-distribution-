import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import substationService from '../../services/substationService';

const initialState = {
  substations: [],
  selectedSubstation: null,
  substationOrders: [],
  isLoading: false,
  error: null,
  crudLoading: false,
};

// Async Thunks
export const fetchSubstations = createAsyncThunk(
  'substation/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await substationService.getAll();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch substations');
    }
  }
);

export const createSubstation = createAsyncThunk(
  'substation/create',
  async (substationData, { rejectWithValue }) => {
    try {
      const data = await substationService.create(substationData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create substation');
    }
  }
);

export const updateSubstation = createAsyncThunk(
  'substation/update',
  async ({ id, ...substationData }, { rejectWithValue }) => {
    try {
      const data = await substationService.update(id, substationData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update substation');
    }
  }
);

export const deleteSubstation = createAsyncThunk(
  'substation/delete',
  async (id, { rejectWithValue }) => {
    try {
      await substationService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete substation');
    }
  }
);

export const updateSubstationStatus = createAsyncThunk(
  'substation/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const data = await substationService.updateStatus(id, status);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

const substationSlice = createSlice({
  name: 'substation',
  initialState,
  reducers: {
    fetchSubstationsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSubstationsSuccess: (state, action) => {
      state.isLoading = false;
      state.substations = action.payload;
    },
    fetchSubstationsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedSubstation: (state, action) => {
      state.selectedSubstation = action.payload;
    },
    fetchSubstationOrdersStart: (state) => {
      state.isLoading = true;
    },
    fetchSubstationOrdersSuccess: (state, action) => {
      state.isLoading = false;
      state.substationOrders = action.payload;
    },
    fetchSubstationOrdersFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearSubstationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchSubstations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubstations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.substations = action.payload;
      })
      .addCase(fetchSubstations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createSubstation.pending, (state) => {
        state.crudLoading = true;
        state.error = null;
      })
      .addCase(createSubstation.fulfilled, (state, action) => {
        state.crudLoading = false;
        state.substations.push(action.payload);
      })
      .addCase(createSubstation.rejected, (state, action) => {
        state.crudLoading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateSubstation.pending, (state) => {
        state.crudLoading = true;
        state.error = null;
      })
      .addCase(updateSubstation.fulfilled, (state, action) => {
        state.crudLoading = false;
        const index = state.substations.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.substations[index] = action.payload;
        }
      })
      .addCase(updateSubstation.rejected, (state, action) => {
        state.crudLoading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteSubstation.pending, (state) => {
        state.crudLoading = true;
        state.error = null;
      })
      .addCase(deleteSubstation.fulfilled, (state, action) => {
        state.crudLoading = false;
        state.substations = state.substations.filter((s) => s.id !== action.payload);
      })
      .addCase(deleteSubstation.rejected, (state, action) => {
        state.crudLoading = false;
        state.error = action.payload;
      })
      // Update Status
      .addCase(updateSubstationStatus.fulfilled, (state, action) => {
        const index = state.substations.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.substations[index] = action.payload;
        }
      });
  },
});

export const {
  fetchSubstationsStart,
  fetchSubstationsSuccess,
  fetchSubstationsFailure,
  setSelectedSubstation,
  fetchSubstationOrdersStart,
  fetchSubstationOrdersSuccess,
  fetchSubstationOrdersFailure,
  clearSubstationError,
} = substationSlice.actions;
export default substationSlice.reducer;
