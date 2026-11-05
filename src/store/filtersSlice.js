import { createSlice } from '@reduxjs/toolkit';

export const initialFilters = {
  search: '',
  status: 'all',
  month: 'all',
  client: 'all',
  priority: 'all',
  sortBy: 'newest', // newest | oldest | priority | hours
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState: initialFilters,
  reducers: {
    setFilter(state, action) {
      const { field, value } = action.payload;
      if (field in state) state[field] = value;
    },
    resetFilters: () => initialFilters,
  },
});

export const { setFilter, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
