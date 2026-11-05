import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStore } from '../test/renderWithStore';
import RequestForm from './RequestForm';
import { selectAllRequests } from '../store/requestsSlice';

describe('<RequestForm />', () => {
  it('shows validation errors and does not submit an empty form', async () => {
    const onCreated = vi.fn();
    renderWithStore(<RequestForm onCreated={onCreated} />);
    await userEvent.click(screen.getByRole('button', { name: /submit request/i }));

    expect(screen.getByText(/title must be at least 4/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/client \*/i)).toHaveAttribute('aria-invalid', 'true');
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('submits a valid request and adds it to the store', async () => {
    const onCreated = vi.fn();
    const user = userEvent.setup();
    const { store } = renderWithStore(<RequestForm onCreated={onCreated} />);

    await user.type(screen.getByLabelText(/title \*/i), 'Newsletter template');
    await user.type(screen.getByLabelText(/client \*/i), 'Globex');
    await user.selectOptions(screen.getByLabelText(/category \*/i), 'Design');
    await user.click(screen.getByLabelText(/urgent/i));
    await user.type(screen.getByLabelText(/estimated hours/i), '5');
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));
    expect(onCreated.mock.calls[0][0]).toMatchObject({
      title: 'Newsletter template',
      priority: 'urgent',
      status: 'submitted',
    });
    expect(selectAllRequests(store.getState()).some((r) => r.title === 'Newsletter template')).toBe(
      true,
    );
    // form resets after success
    expect(screen.getByLabelText(/title \*/i)).toHaveValue('');
  });

  it('shows a form-level error when the API fails', async () => {
    const api = { createRequest: vi.fn().mockRejectedValue(new Error('Network down')) };
    const user = userEvent.setup();
    renderWithStore(<RequestForm />, { api });

    await user.type(screen.getByLabelText(/title \*/i), 'Valid title');
    await user.type(screen.getByLabelText(/client \*/i), 'Acme');
    await user.selectOptions(screen.getByLabelText(/category \*/i), 'Support');
    await user.type(screen.getByLabelText(/estimated hours/i), '2');
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    expect(await screen.findByText('Network down')).toBeInTheDocument();
  });
});
