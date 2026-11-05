import { describe, it, expect, beforeEach } from 'vitest';
import { makeStore } from './index';
import { createApiClient } from '../api/client';
import { createMockServer } from '../api/mockServer';
import {
  fetchRequests,
  createRequest,
  changeStatus,
  selectAllRequests,
  selectRequestById,
} from './requestsSlice';
import { setFilter, resetFilters } from './filtersSlice';
import {
  selectVisibleRequests,
  selectActiveFilterCount,
  selectDashboardStats,
} from './selectors';
import { STATUS } from '../domain/workflow';

let store;
beforeEach(async () => {
  window.localStorage.clear();
  const api = createApiClient({ server: createMockServer({ latency: 0 }) });
  store = makeStore({ api });
  await store.dispatch(fetchRequests());
});

describe('requests slice', () => {
  it('loads requests from the API', () => {
    expect(store.getState().requests.loading).toBe('succeeded');
    expect(selectAllRequests(store.getState()).length).toBeGreaterThan(0);
  });

  it('adds a created request to the top of the list', async () => {
    const action = await store.dispatch(
      createRequest({
        title: 'Brand new request',
        client: 'Zeta',
        category: 'Support',
        priority: 'low',
        month: '2099-01',
        estimatedHours: 3,
      }),
    );
    expect(action.type).toBe('requests/create/fulfilled');
    expect(selectAllRequests(store.getState())[0].title).toBe('Brand new request');
  });

  it('surfaces validation errors via rejectWithValue', async () => {
    const action = await store.dispatch(createRequest({ title: 'x' }));
    expect(action.type).toBe('requests/create/rejected');
    expect(action.payload.errors.title).toBeDefined();
  });

  it('updates status and stores the API error on illegal moves', async () => {
    const submitted = selectAllRequests(store.getState()).find(
      (r) => r.status === STATUS.SUBMITTED,
    );
    await store.dispatch(changeStatus({ id: submitted.id, status: STATUS.IN_REVIEW }));
    expect(selectRequestById(store.getState(), submitted.id).status).toBe(STATUS.IN_REVIEW);

    await store.dispatch(changeStatus({ id: submitted.id, status: STATUS.COMPLETED }));
    expect(store.getState().requests.error).toMatch(/Cannot move/);
    expect(store.getState().requests.pendingIds).toEqual({});
  });
});

describe('selectors', () => {
  it('filters by status and search text', () => {
    store.dispatch(setFilter({ field: 'status', value: STATUS.COMPLETED }));
    store.dispatch(setFilter({ field: 'search', value: 'kpi' }));
    const visible = selectVisibleRequests(store.getState());
    expect(visible.length).toBeGreaterThan(0);
    visible.forEach((r) => {
      expect(r.status).toBe(STATUS.COMPLETED);
      expect(r.title.toLowerCase()).toContain('kpi');
    });
    expect(selectActiveFilterCount(store.getState())).toBe(2);
  });

  it('sorts by priority', () => {
    store.dispatch(setFilter({ field: 'sortBy', value: 'priority' }));
    const [first] = selectVisibleRequests(store.getState());
    expect(first.priority).toBe('urgent');
  });

  it('is memoised between identical states', () => {
    const a = selectVisibleRequests(store.getState());
    const b = selectVisibleRequests(store.getState());
    expect(a).toBe(b);
  });

  it('resets filters', () => {
    store.dispatch(setFilter({ field: 'client', value: 'Globex' }));
    store.dispatch(resetFilters());
    expect(selectActiveFilterCount(store.getState())).toBe(0);
  });

  it('computes dashboard stats with a forecast for the following month', () => {
    const stats = selectDashboardStats(store.getState());
    expect(stats.series.length).toBe(6);
    expect(stats.thisMonthCount).toBeGreaterThan(0);
    expect(stats.forecast.count).toBeGreaterThanOrEqual(0);
    expect(stats.forecast.month > stats.series.at(-1).month).toBe(true);
  });
});
