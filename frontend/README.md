# Resilient City Planning Simulator: Frontend

The React UI of the Resilient City Planning Simulator. It is built with Vite and TypeScript, and in production it is served by Firebase Hosting, which forwards `/api` to the backend.

The coding standards for the frontend are in section 12 of [docs/CODING_STANDARDS.md](../docs/CODING_STANDARDS.md). For an overview of the whole repository, see the [root README](../README.md).

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
| `api/` | Typed client for the backend. The only place that calls `fetch` for `/api`. `client.ts` has `api(path, options)`, which adds the sign-in token to every call; `health.ts` has `getHealth()` |
| `auth/` | Firebase Authentication: `auth.ts` (`login`, `logout`, `onAuthChange`, `getRole`, `getIdToken`), `firebase.ts` (setup) and the `useAuth()` hook |
| `features/<area>/` | Screens and logic for one area (for example `features/auth/LoginForm.tsx`, `features/auth/MePanel.tsx`, which shows the account as the backend sees it through `GET /api/me`, and `features/health/HealthPanel.tsx`, which shows whether the backend is reachable) |

Tests sit next to the code they test. They mock `fetch` or the `api/` and `auth/` modules, never the real network.

## Signing in

The UI signs users in with Firebase Authentication (email and password). There is no sign-up screen: an administrator creates the accounts. The app shows the login form until someone is signed in.

1. The browser signs in with the Firebase SDK and gets an ID token that lasts about an hour.
2. `api()` asks Firebase for the token on every request and sends it as `Authorization: Bearer <token>`. The token is never stored by our code.
3. The role comes from a custom claim called `role` (`PLANNER`, `EMERGENCY_SERVICES_MANAGER` or `AUDITOR`). Only the server sets it. The UI uses it to show the role and to hide controls, but the backend enforces roles. A role assigned after sign-in appears after the token refreshes (sign out and in again).

Copy `.env.example` to `.env.local` and fill in the web app values from the Firebase console (Project settings, Your apps). They identify the project and are public, but `.env*` files stay out of git, and service-account keys must never be committed.

| Variable | Meaning |
|---|---|
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` | The Firebase web app configuration |
| `VITE_API_URL` | Optional. Leave it empty so calls stay on the same origin (`/api`, proxied by Vite in development) |

## Calling the backend

The UI calls the backend only through relative `/api/...` URLs. The dev server proxies `/api` to `http://localhost:8080` (see `vite.config.ts`), which mirrors Firebase Hosting in production: the UI and the API share one origin, so the backend needs no CORS setup.

To work against the real API, start the backend as described in [backend/README.md](../backend/README.md), then run `npm run dev`.
