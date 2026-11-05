# 📅 Monthly Requests Platform

> Intake, review and delivery tracking for recurring client work, built with React and Redux Toolkit.

Clients raise service requests for a given month. The delivery team triages each one through a strict review pipeline, and a dashboard turns the history into totals, a status breakdown and a demand forecast for the coming month.

<p align="center">
  <img src="docs/dashboard.png" alt="Analytics dashboard with monthly volume chart and forecast" width="820" />
</p>

---

## ✨ What it does

**Request intake.** A form with live, per-field validation. Errors from the API (HTTP 422) are mapped back onto the matching inputs, and network failures appear as a single banner.

**Review pipeline.** Each request follows one path:

```
submitted → in_review → approved → in_progress → completed
                 ↘ rejected → (resubmit) → submitted
```

These rules are defined once, as a finite-state machine in `src/domain/workflow.js`. The form buttons, the Redux thunks and the API all read from it, so a skipped step is impossible anywhere. The API rejects one with `409 Conflict`.

**Finding work.** Combine free-text search with status, month, client and priority filters, then sort by date, priority or effort. Results come from memoised selectors and recompute only when their inputs change.

**Insight.** Headline numbers for the current month, open and urgent work, a pipeline bar per status, and a six-month volume chart. The extra hatched bar is a least-squares forecast of next month's requests or hours.

**Swappable backend.** By default the app talks to an in-browser REST server that has realistic latency, status codes and `localStorage` persistence. Set `VITE_API_URL` and the same client calls a real service.

**Built for everyone.** Landmark elements, a skip link, labelled controls, polite live regions, visible focus, light and dark themes, reduced-motion support, and layouts from 360 px phones up to wide desktops.

| Request board | Submitting on a phone |
| :---: | :---: |
| <img src="docs/requests.png" alt="Filterable request board" width="480" /> | <img src="docs/mobile-form.png" alt="Request form on a mobile screen" width="220" /> |

---

## 🎯 Why it fits the INDI Junior React Developer role

| From the job post | Evidence in this repository |
| --- | --- |
| Platform that facilitates monthly requests | This is the product itself: intake, approval and tracking of monthly work |
| ReactJS plus Flux / Redux | Hooks-only React 19 UI. State lives in Redux Toolkit slices, `createAsyncThunk` and `createEntityAdapter`, and data flows one way, Flux style |
| Big data and predictive analytics | `src/domain/analytics.js` aggregates in a single pass, fills empty months, and fits an ordinary-least-squares trend to forecast demand |
| Practical problem solving | Business rules sit in pure modules, and the API client is injected through the thunk `extraArgument`, so it can be replaced or faked |
| Code reviews and testing | 49 tests across the domain, API, store and component layers (Vitest and Testing Library), plus CI on every push |
| JavaScript, CSS3, HTML5, ES2015+ | Modules, destructuring, spread, `async`/`await`, optional chaining, `structuredClone`. Custom properties, grid, `color-mix()`, `:has()`. Semantic HTML5 markup |
| Command line, APIs, client-side performance | npm scripts, a REST client with typed `ApiError`s, `React.memo`, memoised selectors, and a hand-rolled chart that keeps the bundle near 90 kB gzipped |
| Data structures and variable types | `Map` buckets, `Set` de-duplication, a normalised entity store, frozen enum objects |

---

## 🚀 Run it locally

You need Node.js 20 or newer.

```bash
npm install        # install dependencies
npm run dev        # start the dev server on http://localhost:5173
npm test           # run all tests once
npm run build      # create an optimised build in dist/
npm run preview    # serve that build locally
```

On first launch the app seeds six months of sample requests into `localStorage`. Clear the site's storage to start over.

### Connecting a real API

Create `.env.local` containing:

```
VITE_API_URL=https://api.example.com
```

The backend must implement the five routes listed at the top of `src/api/mockServer.js`.

---

## 🗂️ Code layout

| Folder | Responsibility |
| --- | --- |
| `src/domain/` | Framework-free rules: workflow state machine, validation, analytics |
| `src/api/` | Mock REST server, seed generator, HTTP client |
| `src/store/` | Store factory, slices, memoised selectors |
| `src/components/` | Dashboard, chart, filter bar, request cards, submission form |
| `src/hooks/` | `useHashView`, a dependency-free hash router |
| `src/test/` | Global test setup and a render-with-store helper |

## 🧰 Stack

React 19 · Redux Toolkit 2 · React Redux 9 · Vite 7 · Vitest 3 · Testing Library · vanilla CSS

## 📄 License

Released under the [MIT License](LICENSE).
