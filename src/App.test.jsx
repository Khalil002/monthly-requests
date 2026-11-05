import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStore } from './test/renderWithStore';
import App from './App';

beforeEach(() => {
  window.location.hash = '';
});

describe('<App />', () => {
  it('loads data and shows the dashboard by default', async () => {
    renderWithStore(<App />);
    expect(await screen.findByText(/requests this month/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('list', { name: /requests count per month/i })).toBeInTheDocument();
  });

  it('navigates between views', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);
    await user.click(screen.getByRole('link', { name: 'New request' }));
    expect(screen.getByRole('heading', { name: /new monthly request/i })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/new');

    await user.click(screen.getByRole('link', { name: 'Requests' }));
    expect(await screen.findByRole('heading', { name: 'Requests' })).toBeInTheDocument();
  });
});
