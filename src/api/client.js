/**
 * HTTP client used by the Redux layer. By default it talks to the in-browser
 * mock server; set VITE_API_URL to point the same code at a real REST API.
 */
import { createMockServer } from './mockServer';

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export function createApiClient({ baseUrl, server } = {}) {
  async function request(method, path, body) {
    let status;
    let data;
    if (baseUrl) {
      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      status = res.status;
      data = status === 204 ? null : await res.json();
    } else {
      ({ status, body: data } = await server.handle(method, path, body));
    }
    if (status >= 400) throw new ApiError(status, data);
    return data;
  }

  return {
    listRequests: () => request('GET', '/requests'),
    getRequest: (id) => request('GET', `/requests/${id}`),
    createRequest: (payload) => request('POST', '/requests', payload),
    updateStatus: (id, status, note) =>
      request('PATCH', `/requests/${id}/status`, { status, note }),
    deleteRequest: (id) => request('DELETE', `/requests/${id}`),
  };
}

const baseUrl = import.meta.env?.VITE_API_URL;
export const mockServer = createMockServer({ latency: import.meta.env?.MODE === 'test' ? 0 : 300 });
export const api = createApiClient({ baseUrl, server: mockServer });
