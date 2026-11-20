# Resilient City Planning Simulator: Frontend

React + TypeScript + Vite frontend for the CS7CS3 Group 11 architecture checkpoint.
The scope image asks for a minimal technology integration, not twelve complete use cases.

## Run locally

Use Node 22 or later and run these commands inside `frontend/`:

```bash
npm ci
npm run dev
```

Without configuration the development server opens an explicitly labelled local demonstration.
It allows role previews and local growth input preparation. The backend connection panel calls
`GET /api/health`; it never simulates an UP response. An unavailable backend does not stop local
input preparation. Keep the terminal open and use the URL printed by Vite.

The group's new backend contains the health endpoint. The original backend skeleton in this
working copy has not been modified. Run the group's updated backend separately on port 8080,
or configure `BACKEND_PROXY_TARGET` in `.env.local`. Do not run both on the same port.
The backend requires Java 25; this workstation's default Java 17 cannot run that build.

The frontend in this directory can replace the original frontend folder in the group's updated
project after preserving any new team changes. Do not replace their newer backend with the old
backend skeleton from this working copy.

## Delivered behaviour

- English workspace, twelve-use-case scope catalogue and responsive styling.
- UC-01 local plan/city/population/assumptions/seed/horizon input checks and review.
- Download of reviewed inputs as JSON, with an explicit non-simulation notice.
- Actual group health API client: timeout, cancellation, retry, HTTP 401/403/server errors,
  JSON shape checking and rejection of accidental HTML SPA fallback responses.
- Firebase email/password sign-in, sign-out, session restoration and trusted role claims.
- Missing/unknown roles denied access; no role picker in authenticated mode.
- Planner editing and read-only manager/auditor views. Backend permissions remain authoritative.
- Fail-closed Firebase configuration screen and a render-error boundary.
- Validated generation of Hosting configuration with API rewrites before SPA fallback,
  security headers and a fresh production build before deployment.

The city drawing is an illustration, not geographic data. Local inputs are not server records;
no simulation, saved plan, Partial result, Flagged result or audit record is invented. Navigation
retains the draft; refreshing or signing out clears it. JSON download keeps a local copy only.
Business use-case execution is outside the supplied checkpoint scope and the group's available
API contract. The application has no dead simulation buttons or pretend progress/results.

## Modes and Firebase

Copy `.env.example` to `.env.local` when configuring the application; do not commit `.env.local`.

| Command/configuration | Behaviour |
|---|---|
| `npm run dev` without env configuration | Local demonstration; real, unauthenticated health request |
| Development with `VITE_APP_MODE=firebase` and four Firebase Web settings | Real Firebase sign-in; current ID token sent to API |
| `npm run build` | Production Firebase mode; missing settings show a configuration screen |
| `npm run build:demo` then `npm run preview` | Explicit demonstration build, not a staff deployment |
| Production with `VITE_APP_MODE=preview` | Does not bypass authentication; use the explicit demo build for demonstrations |

Required public Web configuration: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
`VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`. The auth domain is a hostname, without a scheme.
Firebase Email/Password sign-in must be enabled, with staff accounts provisioned by the team.
There is no public self-registration or client-controlled role assignment.

The agreed frontend role contract is a Firebase ID-token custom claim named `role` with exactly
`PLANNER`, `EMERGENCY_SERVICES_MANAGER` or `AUDITOR`. Confirm this with the backend owner before
live integration. Unassigned users can refresh their claims or sign out. Session persistence
uses `browserSessionPersistence`; passwords are cleared after sign-in attempts and never logged.
The Firebase SDK manages tokens and refresh; the API reads a fresh usable token on each request.
The frontend never stores a service-account key or implements server token validation.

Authoritative references used for this integration:

- [Firebase authentication persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence)
- [Firebase custom claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Firebase Hosting configuration](https://firebase.google.com/docs/hosting/full-config)

## API contract and ownership

Only `src/api/` calls backend endpoints. Both Vite dev and preview proxy relative `/api` requests
to `BACKEND_PROXY_TARGET`, defaulting to `http://localhost:8080`.

```http
GET /api/health
Accept: application/json
Authorization: Bearer <current Firebase ID token, authenticated mode only>
```

Expected response: HTTP 200 with `Content-Type: application/json` and `{"status":"UP"}`.
The group's `HealthChecker` returns a constant UP. Success confirms this request path, not
PostgreSQL, the simulation engine, Firebase token enforcement or all-system readiness.
No other business endpoint is assumed. The group backend currently has no Firebase token
validation in the supplied snapshot; its owner must implement that before secure deployment.

## Hosting deployment

Ask the team for `FIREBASE_RUN_SERVICE_ID` and `FIREBASE_RUN_REGION`, plus the four Firebase Web
settings. Use a Cloud Run service in the appropriate project and confirm its invocation policy
with the backend owner. Fill `.env.local`, including `VITE_APP_MODE=firebase`, then:

```bash
npm run prepare:hosting
npm run lint
npm test
npm run build
```

The preparation script generates local `firebase.json` and `.firebaserc`. These are ignored in
Git because they contain project-specific destinations. It does not publish anything. Blank
settings, invalid hostnames and demonstration mode are rejected before generating the files.
No environment values or credentials are printed by the script.

With the Firebase CLI installed and an authorised team account:

```bash
firebase login
firebase deploy --only hosting
```

Run from `frontend/`. The predeploy hooks run `check:deploy` and rebuild production assets;
stale generated settings or a missing configuration stop the release. The generated configuration
routes `/api` and `/api/**` to Cloud Run before the SPA fallback. Do not run `firebase init` over
it or replace the rewrites with a catch-all that returns HTML for API calls. Hosting CSP supports
the implemented email/password flow, not additional OAuth providers that have not been tested.

The Firebase SDK was installed at version 12.6.0 from the npm mirror after the workstation's old
registry lacked the default version and direct registry access failed. The lockfile records the
resolved versions and integrity; no global npm registry setting was changed.

## Source layout

```text
src/
  api/health.ts                    typed group endpoint, token, cancellation and error handling
  auth/settings.ts                 explicit mode and Firebase configuration validation
  auth/session.ts                  Firebase SDK session and role boundary
  auth/AuthGate.tsx                sign-in, unavailable service, missing role and session UI
  components/CityPreview.tsx       original, explicitly illustrative SVG
  components/ErrorBoundary.tsx     recoverable rendering failure screen
  features/health/HealthPanel.tsx  real connection check and retry
  features/plans/                  local growth inputs and use case catalogue
  App.tsx                         shared shell, role display, sign-out and navigation
scripts/
  hosting-config.mjs               validated Hosting configuration generator
  prepare-hosting.mjs              prepare/check commands; never deploys automatically
```

The Firebase SDK is the only new application dependency. No router, styling library, formatter,
backend code or simulation package was added. Tests mock Firebase/session and fetch interfaces;
they do not contact real accounts or services.

## Verification on 20 November 2026

- `npm test`: 39 tests passed (API, retry/cancellation, authentication gate, role/config checks,
  workspace input/download and Hosting configuration).
- `npm run lint`: passed without warnings.
- `npm run build` and `npm run build:demo`: passed.
- `npm run prepare:hosting` with blank settings: correctly rejected, without writing a deployment.
- Real Firebase login and Hosting deployment: deferred at the user's request until configuration
  and test accounts are supplied. Refer to the Chinese configuration checklist in the root folder.
- Real Java backend integration: not verified in this environment; Java 25 is required while
  the installed default is Java 17. Mocked API tests are not full-stack verification.
- Browser visual/responsive verification: unavailable because no browser is connected to this
  session. Responsive CSS and DOM tests do not establish visual/browser acceptance.

Build output is `dist/`; `build:demo` replaces it with the explicit demo build. Hosting predeploy
always rebuilds the authenticated production version. Do not double-click `dist/index.html`.

## Source decisions retained from the document review

All original requirements, architecture documents, feedback notes and figures were reviewed in
the initial increment. The supplied scope image sets the delivery boundary as architecture
verification. UC-01 uses growth horizons; UC-02-12 normally select scenarios. Future business
work must preserve Partial acknowledgement, retained Flagged results, reproducible seeds,
shared inventories, server-side role checks and immutable audit records.

Differences still requiring the group to agree before expanding the product: older documents
say Java 21 while repository rules require Java 25; map calls differ between functional and
technical diagrams; Auditor is called read-only but some diagrams describe review writes; the
feedback note proposes a different product name. This frontend preserves the repository name,
uses no live map calls and introduces no review mutation endpoint.
