import { useSelector, useDispatch } from 'react-redux';
import { setFilter, resetFilters } from '../store/filtersSlice';
import {
  selectFilters,
  selectClients,
  selectMonths,
  selectActiveFilterCount,
} from '../store/selectors';
import { STATUS_ORDER, STATUS_LABELS } from '../domain/workflow';
import { PRIORITIES } from '../domain/validation';
import { formatMonth } from '../domain/analytics';

function Select({ id, label, value, onChange, options }) {
  return (
    <label className="field field--inline" htmlFor={id}>
      <span>{label}</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function FilterBar() {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const clients = useSelector(selectClients);
  const months = useSelector(selectMonths);
  const active = useSelector(selectActiveFilterCount);
  const set = (field) => (value) => dispatch(setFilter({ field, value }));

  return (
    <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
      <label className="field field--grow" htmlFor="f-search">
        <span>Search</span>
        <input
          id="f-search"
          type="search"
          placeholder="Title, client or description"
          value={filters.search}
          onChange={(e) => set('search')(e.target.value)}
        />
      </label>
      <Select
        id="f-status"
        label="Status"
        value={filters.status}
        onChange={set('status')}
        options={[['all', 'All'], ...STATUS_ORDER.map((s) => [s, STATUS_LABELS[s]])]}
      />
      <Select
        id="f-month"
        label="Month"
        value={filters.month}
        onChange={set('month')}
        options={[['all', 'All'], ...months.map((m) => [m, formatMonth(m)])]}
      />
      <Select
        id="f-client"
        label="Client"
        value={filters.client}
        onChange={set('client')}
        options={[['all', 'All'], ...clients.map((c) => [c, c])]}
      />
      <Select
        id="f-priority"
        label="Priority"
        value={filters.priority}
        onChange={set('priority')}
        options={[['all', 'All'], ...PRIORITIES.map((p) => [p, p[0].toUpperCase() + p.slice(1)])]}
      />
      <Select
        id="f-sort"
        label="Sort"
        value={filters.sortBy}
        onChange={set('sortBy')}
        options={[
          ['newest', 'Newest'],
          ['oldest', 'Oldest'],
          ['priority', 'Priority'],
          ['hours', 'Hours'],
        ]}
      />
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => dispatch(resetFilters())}
        disabled={active === 0}
      >
        Clear{active > 0 ? ` (${active})` : ''}
      </button>
    </form>
  );
}
