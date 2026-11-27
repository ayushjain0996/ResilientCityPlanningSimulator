# set-role

Assigns a role to a Firebase user. The role is stored as a custom claim called `role`, and the backend reads it from the user's ID token. Only this script (run on a trusted machine) sets roles: the UI and the API never do.

Roles: `PLANNER`, `EMERGENCY_SERVICES_MANAGER`, `AUDITOR`.

## Usage

Install once, from this folder (Node 22 or later):

```bash
npm install
```

Then point the script at your service-account key, which must be saved **outside the repository**, and run it with the user's UID (Firebase console, Authentication, Users):

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json node set-role.js <UID> PLANNER
```

In PowerShell:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\key.json"
node set-role.js <UID> PLANNER
```

Running it with no arguments prints the usage message and changes nothing.

## Things to know

- Each call **overwrites** the user's existing custom claims. This script only ever sets `role`, so nothing else is lost today, but any other claim added later would be replaced.
- The new role shows up only after the user's token refreshes: the user signs out and in again, or the app calls `getIdToken(true)`.
- **Never commit the key file.** `.gitignore` ignores the usual names (`*serviceAccount*.json`, `*service-account*.json`, `*firebase-adminsdk*.json`), but keep the key outside the repository anyway. Anyone with the key has full admin access to the Firebase project.
