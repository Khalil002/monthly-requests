import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { makeStore } from '../store';
import { createApiClient } from '../api/client';
import { createMockServer } from '../api/mockServer';

/** Render a component with a fresh store backed by a zero-latency mock API. */
export function renderWithStore(ui, { api } = {}) {
  const client = api ?? createApiClient({ server: createMockServer({ latency: 0 }) });
  const store = makeStore({ api: client });
  return { store, api: client, ...render(<Provider store={store}>{ui}</Provider>) };
}
