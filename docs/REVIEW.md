# Code Review Instructions

These instructions are for an AI agent asked to review code in this repository. Developers can use them as a review checklist too.

The review checks a branch's changes against [CODING_STANDARDS.md](CODING_STANDARDS.md) and the architecture described in [backend/README.md](../backend/README.md) and [frontend/README.md](../frontend/README.md). It reports findings. It does not change code.

---

## 1. Agree what to review

The review compares two branches:

- the **head branch**: the branch with the changes to review
- the **base branch**: the branch it will be merged into

If the developer's request already names both, use them. Otherwise, ask the developer before doing anything else:

> Which branch should I review, and which branch should I compare it against? If you don't say, I'll review the current branch against `origin/main`.

If the developer doesn't name them, or replies with something like "just go ahead", use the defaults:

| Branch | Default |
|---|---|
| Head | The current branch (`git branch --show-current`) |
| Base | `origin/main` |

If the developer names only one, use the default for the other. Before starting, tell the developer which two branches you are comparing.

## 2. Collect the changes

1. Fetch the remote so the base branch is up to date: `git fetch origin`.
2. Check that both branches exist (`git rev-parse --verify <branch>`). If one doesn't, tell the developer and stop.
3. List the commits under review: `git log --oneline <base>..<head>`.
4. List the changed files: `git diff --stat <base>...<head>`.
5. Read the full diff: `git diff <base>...<head>`.

Use three dots (`...`) for `git diff`. That compares the head branch against the point where it split from the base, so changes made on the base branch since then are not counted as part of the review.

If the head branch is the current branch and has uncommitted changes, mention them to the developer. Review only committed changes unless the developer asks you to include them.

If there are no commits between the branches, say so and stop.

## 3. Read the context

Before judging the diff:

- Read [CODING_STANDARDS.md](CODING_STANDARDS.md) in full.
- Read the README of each part the diff touches: [backend/README.md](../backend/README.md) for `backend/`, [frontend/README.md](../frontend/README.md) for `frontend/`.
- For each changed file, read enough of the whole file, not just the changed lines, to understand what the change does.

## 4. Review the changes

Check every changed file. For each rule broken, record a finding. Work through these areas.

### Correctness

- Does the code do what the commits and any PR description say it does?
- Are there bugs: unhandled edge cases, wrong conditions, missing null or empty checks, resource leaks, concurrency problems?
- Are exceptions handled, or wrapped with the original kept as the cause? None may be caught and ignored.

### Architecture (backend)

- Is each class in the right module and package (Coding Standards section 2)?
- Do dependencies point inwards only? Does `domain`, `port` or `service` import Spring?
- Does `domain` contain only records, POJOs, enums and exceptions, with no logic beyond compact-constructor checks? Does `port` contain only interfaces?
- Are all exception classes in `domain.exception`?
- Is there business logic in a controller, adapter or `@Configuration` class? It belongs in `service`.
- Does the backend call any of the five external services? It must not.
- Do JPA entities, repositories or SQL appear outside `adapter.outbound.persistence`? Do controllers accept or return domain objects instead of `*Request`/`*Response` DTOs?

### Domain behaviours (Coding Standards section 5)

- Is a Partial result treated as a status value, not an exception?
- Does the Validator return a `ValidationResult` instead of throwing?
- Is a Flagged result ever used to justify a decision or start a later scenario?
- Does every run use an explicit, saved `long` seed, with no unseeded random-number generator?
- Does the current time always come from an injected `Clock`?
- Do plan changes, finalisations and reviews record who did them and when, without updating or deleting audit records?

### Architecture (frontend)

- Is code in the right folder under `frontend/src/` (Coding Standards section 12)?
- Does any code outside `api/` call `fetch` for `/api`? Does the UI call an external service other than Map Data?
- Are Partial and Flagged shown as statuses, not errors?
- Is there any secret in frontend code?

### Naming, style and dependencies

- Do names use the architecture document's terms and British spelling (`Analyser`, `finalise`, `utilisation`)?
- Do type names follow the suffix patterns (Coding Standards section 3)?
- Does the formatting follow Coding Standards section 4 (Java) or section 12 (frontend): indentation, 120-character lines, braces, import order, member order?
- Is a new library added only in the change that first uses it, and in the right part? Is it in the architecture document, or did the team agree to it? Are there versions in a module POM, or a Spring Boot starter outside `application`?
- Is there any secret, credential or `.env` file?

### Tests

- Is new or changed behaviour covered by tests (Coding Standards sections 9 and 12)?
- Do the tests follow the naming rules, use AssertJ in the backend, and stay deterministic (fixed `Clock`, fixed seeds, no real network calls)?
- Do service tests run without a Spring context?

### Documentation

- If the structure or conventions changed, is the matching README updated in the same change?
- Do new `port` interfaces and methods have Javadoc that names the use cases?
- Was each `package-info.java` deleted from any package that now has classes?
- Are there comments that explain *what* instead of *why*, or commented-out code?

## 5. Run the checks

Run the checks for each part the diff touches:

| Part | Commands, run from that folder |
|---|---|
| `backend/` | `mvn test` |
| `frontend/` | `npm ci`, then `npm run lint`, `npm test` and `npm run build` |

The checks must run against the head branch. If the head branch is not checked out, don't switch branches in the developer's working tree. Either check it out in a temporary worktree (`git worktree add <scratch-folder> <head>`, then `git worktree remove <scratch-folder>` afterwards), or skip the checks and say so in the report.

Report each command's result. If one fails, include the relevant part of the output.

## 6. Report

Don't edit files, commit, push or comment on a pull request unless the developer asks.

Write the report in this shape:

```markdown
## Review: <head> against <base>

<Commit count and a one or two sentence summary of what the change does.>

### Checks

| Command | Result |
|---|---|
| `mvn test` (backend) | Passed / Failed / Not run (reason) |

### Findings

#### Blocking

1. **<Short title>**: [path/to/File.java:42](path/to/File.java#L42)
   <What is wrong and why it matters.>
   Rule: <Coding Standards section, e.g. "Section 5, Time">
   Fix: <What to change.>

#### Should fix

...

#### Suggestions

...

### Verdict

<Ready to merge / Ready once blocking findings are fixed / Needs rework>
```

Sort findings into three levels:

| Level | Meaning |
|---|---|
| **Blocking** | A bug, a failing check, a security problem, or a broken non-negotiable rule (Coding Standards section 1). The change must not be merged until it is fixed. |
| **Should fix** | Breaks another rule in the Coding Standards, or is missing tests or documentation. |
| **Suggestion** | Optional: clearer naming, simpler code, a better test. Not required by any rule. |

Rules for findings:

- Point every finding to a file and line, and name the rule it breaks if there is one.
- Report only problems you have checked in the code. If you are unsure, say so in the finding instead of stating it as fact.
- Don't report the same problem twice. If it occurs in several places, list them in one finding.
- If a level has no findings, write "None".
- If the Coding Standards and a README disagree, report it as a finding rather than choosing one.
