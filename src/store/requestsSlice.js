import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';

const adapter = createEntityAdapter({
  // newest first
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
});

/*
 * Thunks receive the API client through `extra`, so tests can inject a
 * fake and the UI never imports the transport directly.
 */
export const fetchRequests = createAsyncThunk(
  'requests/fetchAll',
  (_, { extra: { api } }) => api.listRequests(),
  {
    // Avoid duplicate fetches (e.g. React StrictMode double effects).
    condition: (_, { getState }) => getState().requests.loading !== 'pending',
  },
);

export const createRequest = createAsyncThunk(
  'requests/create',
  async (payload, { extra: { api }, rejectWithValue }) => {
    try {
      return await api.createRequest(payload);
    } catch (err) {
      return rejectWithValue(err.body ?? { error: err.message });
    }
  },
);

export const changeStatus = createAsyncThunk(
  'requests/changeStatus',
  async ({ id, status, note }, { extra: { api }, rejectWithValue }) => {
    try {
      return await api.updateStatus(id, status, note);
    } catch (err) {
      return rejectWithValue(err.body ?? { error: err.message });
    }
  },
);

export const deleteRequest = createAsyncThunk(
  'requests/delete',
  async (id, { extra: { api } }) => {
    await api.deleteRequest(id);
    return id;
  },
);

const initialState = adapter.getInitialState({
  loading: 'idle', // idle | pending | succeeded | failed
  error: null,
  pendingIds: {}, // id -> true while a status change is in flight
});

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    dismissError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        adapter.setAll(state, action.payload);
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        adapter.addOne(state, action.payload);
      })
      .addCase(changeStatus.pending, (state, action) => {
        state.pendingIds[action.meta.arg.id] = true;
      })
      .addCase(changeStatus.fulfilled, (state, action) => {
        delete state.pendingIds[action.payload.id];
        adapter.setOne(state, action.payload);
      })
      .addCase(changeStatus.rejected, (state, action) => {
        delete state.pendingIds[action.meta.arg.id];
        state.error = action.payload?.error ?? action.error.message;
      })
      .addCase(deleteRequest.fulfilled, (state, action) => {
        adapter.removeOne(state, action.payload);
      });
  },
});

export const { dismissError } = requestsSlice.actions;
export default requestsSlice.reducer;

export const {
  selectAll: selectAllRequests,
  selectById: selectRequestById,
  selectTotal: selectRequestCount,
} = adapter.getSelectors((state) => state.requests);
