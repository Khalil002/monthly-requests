# Monthly Requests

A responsive React + Redux Toolkit app where clients submit monthly service requests and a delivery team reviews, approves and tracks them through a defined workflow. A small analytics dashboard summarises monthly volume and forecasts next month's demand.

![Dashboard](docs/dashboard.png)

## Features

- **Submit requests** through a validated, accessible form: inline field errors, server-side (422) error mapping, and a form-level error when the API fails.
- **Status workflow**: `submitted → in review → approved → in progress → completed`, with `rejected → resubmit` as the side path. The rules live in one finite-state machine module that the UI, the Redux layer and the API all share, so an illegal move is blocked everywhere (the API answers it with HTTP 409).
- **Filter, search and sort** by status, month, client and priority, with free-text search. Memoised selectors keep the list fast.
- **Dashboard** with this month's totals, open and urgent work, a pipeline breakdown, and a monthly volume chart that includes a **linear-regression forecast** for the next month.
- **Mock REST API** that runs in the browser with real status codes, latency and `localStorage` persistence. Set `VITE_API_URL` and the same client talks to a real backend.
- **Responsive and accessible**: semantic HTML5 landmarks, a skip link, labelled controls, `aria-live` counts, keyboard focus styles, light and dark themes, and reduced-motion support.

| Requests | Mobile form |
| --- | --- |
| ![Requests](docs/requests.png) | ![Mobile form](docs/mobile-form.png) |

## How this maps to the INDI Junior React Developer role

| Posting asks for | Where it shows up here |
| --- | --- |
| "Provide the technology for a platform that facilitates monthly requests" | The whole product: monthly request intake, review workflow and tracking |
| ReactJS, Flux / Redux | React 19 function components and hooks; Redux Toolkit slices, `createAsyncThunk`, `createEntityAdapter`, one-way Flux data flow |
| Big data and predictive analytics | `src/domain/analytics.js`: single-pass aggregation, gap-filled monthly series, OLS regression forecast |
| Design practical solutions to problems | Workflow as a pure state machine; API injected through the thunk `extraArgument` so it can be swapped or faked |
| Code reviews and testing | 49 Vitest + Testing Library tests (domain, API, store and UI) and a GitHub Actions CI workflow |
| JavaScript, CSS3, HTML5, ES2015+ | ES modules, destructuring, spread, `async/await`, optional chaining, `structuredClone`; CSS custom properties, grid, `color-mix()`, `:has()`; semantic HTML5 |
| APIs, command line, client-side performance | REST client with typed errors; npm scripts; memoised selectors, `React.memo` cards, a zero-dependency chart (about 90 kB gzipped JS in total) |
| Data structures and types | `Map` buckets, `Set` de-duplication, a normalised entity store, frozen enums |

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # run the test suite once
npm run build    # production build in dist/
```

Requires Node 20 or newer. Demo data is seeded on first load and saved in `localStorage`; clear site data to reset it.

To use a real backend, create `.env.local` with `VITE_API_URL=https://your-api.example.com`. It must expose the routes documented in `src/api/mockServer.js`.

## Project structure

```
src/
  domain/       pure business logic: workflow state machine, validation, analytics
  api/          mock REST server, seed data, HTTP client
  store/        Redux Toolkit store, slices, memoised selectors
  components/   React UI (dashboard, chart, filters, cards, form)
  hooks/        useHashView, a tiny hash router
  test/         test setup and render helper
```

## Tech

React 19, Redux Toolkit 2, React Redux 9, Vite 7, Vitest 3, Testing Library, plain CSS.

## License

MIT
