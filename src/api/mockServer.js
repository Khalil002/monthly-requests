/**
 * A tiny in-browser REST "server". It mimics the shape of a real JSON API
 * (status codes, JSON bodies, latency) so the app is written exactly as it
 * would be against a backend, and data persists in localStorage.
 *
 * Routes:
 *   GET    /requests                 -> 200 Request[]
 *   GET    /requests/:id             -> 200 Request | 404
 *   POST   /requests                 -> 201 Request | 422 { errors }
 *   PATCH  /requests/:id/status      -> 200 Request | 404 | 409 { error }
 *   DELETE /requests/:id             -> 204 | 404
 */
import { buildSeed } from './seed';
import { validateRequest, isValid } from '../domain/validation';
import { STATUS, canTransition } from '../domain/workflow';

export const STORAGE_KEY = 'monthly-requests:db:v1';

function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* fall through to seed */
  }
  return buildSeed();
}

function save(db) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* storage may be unavailable (private mode); keep working in memory */
  }
}

const json = (status, body) => ({ status, body });

let idCounter = 0;
function newId() {
  idCounter += 1;
  return `req-${Date.now().toString(36)}-${idCounter}`;
}

export function createMockServer({ latency = 250, now = () => new Date() } = {}) {
  let db = load();

  const routes = [
    ['GET', /^\/requests$/, () => json(200, db)],

    ['GET', /^\/requests\/([\w-]+)$/, (_, [id]) => {
      const item = db.find((r) => r.id === id);
      return item ? json(200, item) : json(404, { error: 'Not found' });
    }],

    ['POST', /^\/requests$/, (body) => {
      const errors = validateRequest(body);
      if (!isValid(errors)) return json(422, { errors });
      const at = now().toISOString();
      const item = {
        id: newId(),
        title: body.title.trim(),
        client: body.client.trim(),
        category: body.category,
        priority: body.priority,
        month: body.month,
        estimatedHours: Number(body.estimatedHours),
        description: (body.description ?? '').trim(),
        status: STATUS.SUBMITTED,
        createdAt: at,
        updatedAt: at,
        history: [{ status: STATUS.SUBMITTED, at }],
      };
      db = [item, ...db];
      save(db);
      return json(201, item);
    }],

    ['PATCH', /^\/requests\/([\w-]+)\/status$/, (body, [id]) => {
      const item = db.find((r) => r.id === id);
      if (!item) return json(404, { error: 'Not found' });
      if (!canTransition(item.status, body?.status)) {
        return json(409, { error: `Cannot move from ${item.status} to ${body?.status}` });
      }
      const at = now().toISOString();
      const updated = {
        ...item,
        status: body.status,
        updatedAt: at,
        history: [...item.history, { status: body.status, at, note: body.note }],
      };
      db = db.map((r) => (r.id === id ? updated : r));
      save(db);
      return json(200, updated);
    }],

    ['DELETE', /^\/requests\/([\w-]+)$/, (_, [id]) => {
      if (!db.some((r) => r.id === id)) return json(404, { error: 'Not found' });
      db = db.filter((r) => r.id !== id);
      save(db);
      return json(204, null);
    }],
  ];

  async function handle(method, path, body) {
    if (latency > 0) await new Promise((r) => setTimeout(r, latency));
    for (const [m, re, fn] of routes) {
      const match = method === m && path.match(re);
      if (match) {
        // structuredClone so callers can never mutate the "database" directly
        return structuredClone(fn(body, match.slice(1)));
      }
    }
    return json(404, { error: `No route for ${method} ${path}` });
  }

  function reset() {
    db = buildSeed(now());
    save(db);
  }

  return { handle, reset };
}
