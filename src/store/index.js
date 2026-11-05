import { configureStore } from '@reduxjs/toolkit';
import requestsReducer from './requestsSlice';
import filtersReducer from './filtersSlice';
import { api as defaultApi } from '../api/client';

export function makeStore({ api = defaultApi, preloadedState } = {}) {
  return configureStore({
    reducer: {
      requests: requestsReducer,
      filters: filtersReducer,
    },
    preloadedState,
    middleware: (getDefault) => getDefault({ thunk: { extraArgument: { api } } }),
  });
}
