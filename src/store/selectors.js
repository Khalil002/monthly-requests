import { createSelector } from '@reduxjs/toolkit';
import { selectAllRequests } from './requestsSlice';
import { initialFilters } from './filtersSlice';
import { PRIORITIES } from '../domain/validation';
import { countBy, monthlyTotals, forecast, addMonths, currentMonth } from '../domain/analytics';
import { isOpen } from '../domain/workflow';

export const selectFilters = (state) => state.filters;

const PRIORITY_RANK = Object.fromEntries(PRIORITIES.map((p, i) => [p, i]));

const SORTERS = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
  priority: (a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority],
  hours: (a, b) => b.estimatedHours - a.estimatedHours,
};

/** Memoised: recomputes only when requests or filters change. */
export const selectVisibleRequests = createSelector(
  [selectAllRequests, selectFilters],
  (requests, f) => {
    const q = f.search.trim().toLowerCase();
    const result = requests.filter(
      (r) =>
        (f.status === 'all' || r.status === f.status) &&
        (f.month === 'all' || r.month === f.month) &&
        (f.client === 'all' || r.client === f.client) &&
        (f.priority === 'all' || r.priority === f.priority) &&
        (!q ||
          r.title.toLowerCase().includes(q) ||
          r.client.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)),
    );
    return result.sort(SORTERS[f.sortBy] ?? SORTERS.newest);
  },
);

export const selectActiveFilterCount = createSelector([selectFilters], (f) =>
  Object.keys(initialFilters).filter((k) => k !== 'sortBy' && f[k] !== initialFilters[k]).length,
);

export const selectClients = createSelector([selectAllRequests], (requests) =>
  [...new Set(requests.map((r) => r.client))].sort(),
);

export const selectMonths = createSelector([selectAllRequests], (requests) =>
  [...new Set(requests.map((r) => r.month))].sort().reverse(),
);

export const selectStatusCounts = createSelector([selectAllRequests], (requests) =>
  countBy(requests, 'status'),
);

export const selectDashboardStats = createSelector([selectAllRequests], (requests) => {
  const thisMonth = currentMonth();
  const monthItems = requests.filter((r) => r.month === thisMonth);
  const open = requests.filter((r) => isOpen(r.status));
  const series = monthlyTotals(requests);
  const lastMonth = series.length ? series[series.length - 1].month : thisMonth;
  const [nextCount] = forecast(series.map((s) => s.count), 1);
  const [nextHours] = forecast(series.map((s) => s.hours), 1);
  return {
    thisMonthCount: monthItems.length,
    thisMonthHours: monthItems.reduce((s, r) => s + r.estimatedHours, 0),
    openCount: open.length,
    urgentOpen: open.filter((r) => r.priority === 'urgent').length,
    series,
    forecast: { month: addMonths(lastMonth, 1), count: nextCount, hours: nextHours },
  };
});
