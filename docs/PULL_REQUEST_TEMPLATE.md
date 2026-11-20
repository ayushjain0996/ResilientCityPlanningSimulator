<!--
How to use this template:
- GitHub fills a new pull request with this file. If it doesn't, copy everything below this comment into the description.
- Title: a short imperative sentence, e.g. "Add Validator for plan inputs".
- Keep every section. Write "None" or "Not applicable" instead of deleting one.
- AI agents: fill in every section from the actual commits and diff, run the checks before ticking them, and tick only what is true.
-->

## Summary

<!-- What this change does and why, in two or three sentences. -->

## Related work

<!-- Issue, use case (e.g. UC-04) or architecture component this change relates to. -->

## Type of change

- [ ] New feature
- [ ] Bug fix
- [ ] Refactor (no change in behaviour)
- [ ] Tests only
- [ ] Documentation
- [ ] Build, CI or tooling

## Changes

<!-- The main changes, grouped by part. Remove a part's line only if this change doesn't touch it. -->

- **Backend:**
- **Frontend:**
- **Docs / CI:**

## How it was tested

<!-- New or changed tests, and any manual testing (steps and what you saw). -->

## Screenshots

<!-- For UI changes, before and after. Otherwise "Not applicable". -->

## Checklist

See `docs/CODING_STANDARDS.md`.

- [ ] The code follows the Coding Standards, including naming with British spelling and the formatting rules.
- [ ] Tests were written or updated for the changed behaviour.
- [ ] `mvn test` passes in `backend/` (if backend changed).
- [ ] `npm run lint`, `npm test` and `npm run build` pass in `frontend/` (if frontend changed).
- [ ] Backend: code is in the right module and package, with no Spring in `domain`, `port` or `service`.
- [ ] Backend: any new exception is in `domain.exception`, and current time comes from an injected `Clock`.
- [ ] Partial, Flagged, seed and audit rules are followed where relevant.
- [ ] No new library, unless this change uses it and the team agreed to it.
- [ ] No secrets, credentials or `.env` files.
- [ ] READMEs are updated if the structure or conventions changed.
- [ ] Any `package-info.java` in a package that now has classes has been deleted.

## Notes for reviewers

<!-- Anything reviewers should look at closely, open questions, or follow-up work. -->
