import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStore } from '../test/renderWithStore';
import RequestList from './RequestList';
import { fetchRequests } from '../store/requestsSlice';

async function setup() {
  const utils = renderWithStore(<RequestList />);
  await utils.store.dispatch(fetchRequests());
  return utils;
}

describe('<RequestList />', () => {
  it('renders all requests with a count', async () => {
    await setup();
    expect(await screen.findByText(/showing 23 of 23/i)).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(23);
  });

  it('filters by status and search, then clears', async () => {
    const user = userEvent.setup();
    await setup();

    await user.selectOptions(screen.getByLabelText('Status'), 'completed');
    screen.getAllByRole('article').forEach((card) => {
      expect(within(card).getAllByTestId('status-badge')[0]).toHaveTextContent('Completed');
    });

    await user.type(screen.getByLabelText('Search'), 'kpi');
    const cards = screen.getAllByRole('article');
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach((c) => expect(c).toHaveTextContent(/kpi/i));

    await user.click(screen.getByRole('button', { name: /clear \(2\)/i }));
    expect(screen.getAllByRole('article')).toHaveLength(23);
  });

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup();
    await setup();
    await user.type(screen.getByLabelText('Search'), 'zzzz-no-match');
    expect(screen.getByText(/no requests match/i)).toBeInTheDocument();
  });

  it('moves a request through the workflow', async () => {
    const user = userEvent.setup();
    await setup();
    await user.type(screen.getByLabelText('Search'), 'Refund flow');
    const card = screen.getByRole('article');

    await user.click(within(card).getByRole('button', { name: /start review/i }));
    expect(await within(card).findByRole('button', { name: /^approve/i })).toBeInTheDocument();
    expect(within(card).getAllByTestId('status-badge')[0]).toHaveTextContent('In review');

    await user.click(within(card).getByRole('button', { name: /^reject/i }));
    expect(await within(card).findByRole('button', { name: /resubmit/i })).toBeInTheDocument();
    expect(within(card).getByText(/history \(3\)/i)).toBeInTheDocument();
  });
});
