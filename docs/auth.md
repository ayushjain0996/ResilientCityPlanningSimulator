# Authentication

Users sign in with Firebase Authentication (email and password). Accounts are created by an administrator: there is no sign-up screen.

## How it works

1. The browser signs in with the Firebase SDK and gets an ID token (a signed JWT, valid for about an hour).
2. `api()` in `frontend/src/api/client.ts` asks Firebase for the token on every request and sends it as `Authorization: Bearer <token>`. Our code never stores the token.
3. The backend (Spring Security, OAuth2 resource server) verifies the token itself: signature, expiry, issuer `https://securetoken.google.com/<project id>` and audience `<project id>`.
4. The user's role is the custom claim `role`: `PLANNER`, `EMERGENCY_SERVICES_MANAGER` or `AUDITOR`. It becomes the authority `ROLE_<role>`, which methods check with `@PreAuthorize("hasRole('PLANNER')")`.
5. Roles are set only on a trusted machine with the Firebase Admin SDK (`tools/set-role`). The UI and the API never set roles, and hiding a control in the UI is only cosmetic: the backend enforces every role check.

`GET /api/health` is the only public endpoint. `GET /api/me` returns the caller's `uid`, `email` and `role` as the backend sees them.

## Environment variables

| Variable | Used by | Meaning |
|---|---|---|
| `FIREBASE_PROJECT_ID` | Backend | The Firebase project ID. Required to run the app. The tests set their own |
| `CORS_ALLOWED_ORIGINS` | Backend | Comma-separated browser origins that may call `/api`. Defaults to `http://localhost:5173`. Not needed while the UI and API share one origin |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` | Frontend | The Firebase web app configuration, from Project settings in the Firebase console. They are public identifiers. Put them in `frontend/.env.local` (see `frontend/.env.example`) |
| `VITE_API_URL` | Frontend | Optional. Leave empty to call `/api` on the same origin |
| `GOOGLE_APPLICATION_CREDENTIALS` | `tools/set-role` only | Path to a service-account key file kept outside the repository |

Restart the Vite dev server after changing `.env.local`.

## Assigning a role

From `tools/set-role/` (details in its README):

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\key.json"
node set-role.js <UID> PLANNER
```

The UID is in the Firebase console under Authentication, Users. Each call overwrites the user's existing claims, and the new role appears only after the user's token refreshes: the user signs out and in again, or the app asks for a fresh token. Never commit the key file.

## Troubleshooting

- **401 with a valid token.** Check that `FIREBASE_PROJECT_ID` matches the project that issued the token, that the token is less than an hour old (sign out and in again), and that the backend can reach Google to fetch the signing keys (`https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`).
- **The backend does not start.** `FIREBASE_PROJECT_ID` is not set.
- **`role` is `null` or "no role assigned".** The user has no role yet, or the token has not refreshed since the role was assigned. Sign out and in again.
- **403 on a call that should be allowed.** The user's role does not allow that endpoint. Check the role in the account bar and in the "Backend confirms" line.
- **CORS error in the browser.** Add the UI's origin to `CORS_ALLOWED_ORIGINS`. In development the Vite proxy keeps everything on one origin, so this should not happen.
- **Sign-in says "Sign-in failed".** The email or password is wrong, or the `VITE_FIREBASE_*` values are missing or wrong (restart the dev server after fixing them), or Email/Password sign-in is not enabled in the Firebase console.
