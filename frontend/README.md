# Resilient City Planning Simulator: Frontend

The React UI of the Resilient City Planning Simulator. It is built with Vite and TypeScript, and in production it is served by Firebase Hosting, which forwards `/api` to the backend.

The coding standards for the frontend are in section 12 of [AGENTS.md](../AGENTS.md). For an overview of the whole repository, see the [root README](../README.md).

## Requirements

Node 22 or later. The version is pinned in `.nvmrc`, so `nvm use` picks it up.

## Commands

Run these from the `frontend/` folder:

```bash
npm install        # install dependencies (use npm ci in CI)
npm run dev        # start the dev server on http://localhost:5173
npm test           # run the tests once (Vitest + React Testing Library)
npm run test:watch # run the tests in watch mode
npm run lint       # lint with oxlint
npm run build      # type-check and build into dist/
npm run preview    # serve the built app locally
```

## Source layout

Under `src/`:

| Folder | Contents |
|---|---|
| `api/` | Typed client for the backend. The only place that calls `fetch` for `/api` (for example `getHealth()` in `health.ts`) |
| `features/<area>/` | Screens and logic for one area (for example `features/health/HealthPanel.tsx`, which shows whether the backend is reachable) |

Tests sit next to the code they test. They mock `fetch` or the `api/` module, never the real network.

## Calling the backend

The UI calls the backend only through relative `/api/...` URLs. The dev server proxies `/api` to `http://localhost:8080` (see `vite.config.ts`), which mirrors Firebase Hosting in production: the UI and the API share one origin, so the backend needs no CORS setup.

To work against the real API, start the backend as described in [backend/README.md](../backend/README.md), then run `npm run dev`.
