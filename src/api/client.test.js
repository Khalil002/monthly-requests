import { describe, it, expect, beforeEach } from 'vitest';
import { createMockServer, STORAGE_KEY } from './mockServer';
import { createApiClient, ApiError } from './client';
import { STATUS } from '../domain/workflow';

const payload = {
  title: 'New reporting widget',
  client: 'Globex',
  category: 'Development',
  priority: 'medium',
  month: '2026-11',
  estimatedHours: '6',
  description: 'Show weekly totals',
};

let api;
beforeEach(() => {
  window.localStorage.clear();
  api = createApiClient({ server: createMockServer({ latency: 0 }) });
});

describe('mock REST API', () => {
  it('serves the seed data', async () => {
    const list = await api.listRequests();
    expect(list.length).toBeGreaterThan(10);
    expect(list[0]).toHaveProperty('status');
  });

  it('creates a request in the submitted state and persists it', async () => {
    const created = await api.createRequest(payload);
    expect(created).toMatchObject({ status: STATUS.SUBMITTED, estimatedHours: 6 });
    expect(created.history).toHaveLength(1);
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain(created.id);
  });

  it('returns 422 with field errors for invalid input', async () => {
    await expect(api.createRequest({ ...payload, title: '' })).rejects.toMatchObject({
      status: 422,
      body: { errors: { title: expect.any(String) } },
    });
  });

  it('applies valid status transitions and records history', async () => {
    const { id } = await api.createRequest(payload);
    const updated = await api.updateStatus(id, STATUS.IN_REVIEW);
    expect(updated.status).toBe(STATUS.IN_REVIEW);
    expect(updated.history.map((h) => h.status)).toEqual([STATUS.SUBMITTED, STATUS.IN_REVIEW]);
  });

  it('returns 409 for an illegal transition', async () => {
    const { id } = await api.createRequest(payload);
    const err = await api.updateStatus(id, STATUS.COMPLETED).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(409);
  });

  it('returns 404 for unknown ids and deletes known ones', async () => {
    await expect(api.getRequest('nope')).rejects.toMatchObject({ status: 404 });
    const { id } = await api.createRequest(payload);
    await expect(api.deleteRequest(id)).resolves.toBeNull();
    await expect(api.getRequest(id)).rejects.toMatchObject({ status: 404 });
  });

  it('does not leak internal references', async () => {
    const [first] = await api.listRequests();
    first.title = 'mutated';
    const [again] = await api.listRequests();
    expect(again.title).not.toBe('mutated');
  });
});
