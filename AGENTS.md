# Coding Standards

These are the rules for all code in this repository. They apply to every contributor, human or AI. An AI agent must follow them exactly. If a task seems to need breaking one, stop and ask instead of improvising.

- [README.md](README.md) explains the architecture: what each module is for and why. Read it before changing code.
- This file says how to write code inside that structure.
- If the two disagree, raise it rather than choosing one.

---

## 1. Non-negotiable rules

1. **Java 25 and Spring Boot 4.0.** Don't change either version.
2. **Six modules with fixed responsibilities:** `domain`, `port`, `service`, `adapter`, `config`, `application`. Don't add, merge or rename modules without the team's agreement.
3. **`domain` contains only records, POJOs, enums and exceptions.** No business logic, no interfaces, no framework annotations. There are two exceptions to the no-logic rule:
   - **Compact-constructor checks** in records, which reject invalid values (see section 4).
   - **Exceptions**, which live in the `domain.exception` package of the `domain` module and nowhere else. No other module defines its own exception classes (see section 5).
4. **`port` contains only interfaces.** No classes, records or enums, and no `default` methods with logic.
5. **All business rules live in `service`.** It's plain Java: no Spring imports or annotations.
6. **Only `application` depends on Spring Boot.** `adapter` and `config` use plain Spring Framework libraries.
7. **Dependencies point inwards.** Never make an inner module depend on an outer one (see the dependency rule in the README).
8. **Add a library only in the change that first uses it.** Never add one in advance.
9. **The backend never calls the five external services** (Map Data, Knowledge Base, Shelter Data, Sensor/Data, Inventory/Staff). Only the Python Simulation Engine does.
10. **The current time always comes from an injected `java.time.Clock`.** Never call `Instant.now()`, `LocalDateTime.now()` or `System.currentTimeMillis()` directly (see section 5).
11. **Follow the naming patterns (section 3) and the indentation and formatting rules (section 4).**

---

## 2. Where code goes

The root package is `ie.tcd.resilientcity`. Use these packages exactly as listed:

| What you're writing | Module | Package |
|---|---|---|
| Model types (Plan, Run, Seed, Role, RunStatus, …) | `domain` | `domain` or `domain.<area>` (e.g. `domain.plan`, `domain.run`) |
| Exceptions | `domain` **only** | `domain.exception` |
| Input port (operation the backend offers) | `port` | `port.in` |
| Output port (something the backend needs) | `port` | `port.out` |
| Plan Manager | `service` | `service.plan` |
| Validator | `service` | `service.validation` |
| Simulation Orchestrator | `service` | `service.orchestration` |
| Analyser | `service` | `service.analysis` |
| Use-case manager (UC-01, UC-02, UC-04 to UC-12) | `service` | `service.usecase.<name>` (e.g. `service.usecase.resiliencescoring`) |
| REST controllers, request/response DTOs | `adapter` | `adapter.inbound.web` |
| Run worker | `adapter` | `adapter.inbound.worker` |
| Records (database) | `adapter` | `adapter.outbound.persistence` |
| Simulation Engine HTTP client | `adapter` | `adapter.outbound.simulation` |
| `@Configuration` classes | `config` | `config` |
| Main class | `application` | `ie.tcd.resilientcity` (root) |

Package names are lowercase, with no underscores and no Java keywords. That's why the adapter packages are `inbound` and `outbound` rather than `in` and `out`.

---

## 3. Naming

### Use the architecture document's terms

Names must match the component and API names in the group's architecture document, using its **British spelling**: `Analyser`, `finalisePlan`, `recordFinalisation`, `utilisation`. Never use `Analyzer` or `finalize`. Method names on ports come directly from the document's component APIs (section 1.4), for example `validateInputs`, `runSimulation`, `saveRunRecords`, `scoreAndRankDistricts`.

### Type suffixes

| Kind | Pattern | Example |
|---|---|---|
| Input port | `<Capability>UseCase` | `StartRunUseCase`, `AssessmentUseCase` |
| Output port | `<Capability>Port` | `SaveRunRecordsPort`, `RunSimulationPort` |
| Service | Architecture component name, no suffix | `PlanManager`, `Validator`, `SimulationOrchestrator`, `Analyser` |
| Use-case manager | Architecture component name | `PhaseGrowthEvaluator`, `ResilienceScoringManager`, `ShelterManager` |
| Typed ID | `<Thing>Id` record | `PlanId`, `RunId`, `ScenarioId` |
| REST controller | `<Resource>Controller` | `PlanController`, `RunController` |
| Web request/response | `<Thing>Request` / `<Thing>Response` | `ScoringRequest`, `RunStatusResponse` |
| Persistence adapter | `<Thing>PersistenceAdapter` | `RunPersistenceAdapter` |
| JPA entity | `<Thing>Entity` | `RunEntity` |
| Spring Data repository | `<Thing>JpaRepository` | `RunJpaRepository` |
| Outbound HTTP client | `<System>Client` | `SimulationEngineClient` |
| Spring configuration | `<Area>Config` | `UseCaseConfig`, `SecurityConfig` |
| Exception | `<Problem>Exception` | `PlanNotFoundException` |

General Java naming: `PascalCase` for types, `camelCase` for methods and fields, `UPPER_SNAKE_CASE` for constants. Avoid abbreviations except accepted ones such as `Id`, `Kpi` and `Uc`.

---

## 4. Java style

### Indentation and formatting

**Indentation by file type**

| File type | Indent |
|---|---|
| Java (`.java`) | 4 spaces |
| Maven POMs and other XML | 4 spaces |
| `.properties` | none (one `key=value` per line) |
| YAML (`.yml`, `.yaml`), JSON | 2 spaces |
| Markdown | 2 spaces for nested list items, 4 inside nested code blocks |

- Never use tabs. Never leave trailing whitespace. End every file with a single newline.
- Files use UTF-8 and Unix line endings (LF).

**Java layout**

- **Continuation lines:** when a statement wraps, indent the continuation 8 spaces (two levels) from the start of the statement.
- **Line length:** 120 characters at most. Break long lines before an operator or `.`, and after a comma.
- **Method chains:** when a chain doesn't fit on one line, put each `.call()` on its own line, indented 8 spaces.
- **Parameters:** when a signature doesn't fit, put every parameter on its own line, indented 8 spaces.
- **Braces:** the opening brace goes at the end of the line (K&R style). Always use braces, even for one-line `if`, `else`, `for` and `while` bodies.
- **`switch`:** use arrow-form `case X ->` labels, indented one level (4 spaces) inside the `switch`.
- **Blank lines:** one blank line between methods, and between the field block and the first constructor. Never use two blank lines in a row.
- **Member order:** constants, then fields, then constructors, then public methods, then private methods.
- **Imports:** no wildcard imports and no unused imports. Order them as static imports, then `java.*` and `javax.*`, then all others alphabetically, with one blank line between the groups.
- **Files:** one top-level type per file.

```java
public final class SimulationOrchestrator implements StartRunUseCase {

    private static final int MAX_PARALLEL_RUNS = 4;

    private final RunSimulationPort runSimulationPort;
    private final SaveRunRecordsPort saveRunRecordsPort;

    public SimulationOrchestrator(
            RunSimulationPort runSimulationPort,
            SaveRunRecordsPort saveRunRecordsPort) {
        this.runSimulationPort = runSimulationPort;
        this.saveRunRecordsPort = saveRunRecordsPort;
    }

    @Override
    public void startRun(ValidatedInputs inputs, boolean isPartial) {
        List<RunResult> results = inputs.scenarioIds().stream()
                .map(scenarioId -> runSimulationPort.runSimulation(inputs.simulationInput(), scenarioId, inputs.seed()))
                .toList();
        saveRunRecordsPort.saveRunRecords(inputs, inputs.seed(), results);
    }
}
```

### Types and immutability
- In `domain`, prefer **records**. Use a class only when a record can't work, for example when a type needs to change state.
- **Compact-constructor checks are allowed in `domain`.** If a record must hold a valid value, enforce it in a compact constructor, e.g. `Objects.requireNonNull` or a range check. Apart from exceptions, this is the only logic allowed in `domain`. Checks may only reject invalid values; they must not calculate or derive anything.

```java
public record Seed(long value) {

    public Seed {
        if (value < 0) {
            throw new InvalidSeedException(value);
        }
    }
}
```
- Make fields `final` wherever possible.
- Copy collections defensively and return them unmodifiable (`List.copyOf`, `Map.copyOf`).
- Represent fixed sets of values as `enum`s, e.g. `Role`, `RunStatus` and `PlanStatus`. Don't use strings or integers for them.
- Use typed ID records (`PlanId`) instead of raw `UUID`, `String` or `long` in signatures.

### Nulls
- Never return `null` from a port or a public method. Use `Optional<T>` for a value that may be missing, or an empty collection.
- Use `Optional` only as a return type, never for fields or parameters.

### Dependency injection
- Use constructor injection only. Never put `@Autowired` on fields or setters.
- Service constructors take port interfaces, never concrete adapter classes.

### Other
- Only use `var` when the type is obvious from the right-hand side.
- Don't use Lombok or other code-generation libraries, since records cover the same need.
- Write no business logic in controllers, adapters or `@Configuration` classes.

---

## 5. Domain behaviours

These come from the architecture document. Implement them the same way everywhere:

| Behaviour | Rule |
|---|---|
| **Partial results** | Missing or unavailable data is a status (Partial), not an error. Carry it as a value, e.g. an `isPartial` flag plus the list of missing items. Never throw an exception for it. |
| **Validation** | The Validator returns a `ValidationResult` value. It never throws for invalid input, and it never starts a run. |
| **Flagged results** | A Flagged result is stored but must never be used to justify a decision or to start a later scenario. Check this in `service`. |
| **Reproducibility** | Every simulation run gets an explicit `long` seed, which is saved with the run's inputs. Never use an unseeded random-number generator such as `new Random()` or `Math.random()` in run-related code. |
| **Time** | Get the current time from an injected `java.time.Clock`, e.g. `Instant.now(clock)`. Never call `Instant.now()`, `LocalDateTime.now()` or `System.currentTimeMillis()` without it. Services receive the `Clock` through their constructor, `config` provides a single `Clock.systemUTC()` bean, and tests pass a `Clock.fixed(...)`. This keeps audit timestamps server-based and makes tests deterministic. |
| **Audit** | Every change to a plan, every finalisation and every review records who did it and when. Audit records are never deleted or updated. |
| **Roles** | Use the `Role` enum: `PLANNER`, `EMERGENCY_SERVICES_MANAGER`, `AUDITOR`. The Auditor has read-only access. |

### Errors
- Exceptions are for unexpected failures and broken rules, not for Partial results or validation results.
- **Every exception class lives in the `domain.exception` package of the `domain` module, and nowhere else.** `port`, `service`, `adapter`, `config` and `application` must not define their own exception classes; they throw the ones from `domain.exception`.
- Exception classes are plain unchecked exceptions (`extends RuntimeException`) with no logic beyond building their message.
- Adapters catch technology-specific exceptions (JPA, HTTP client errors) and rethrow them as a `domain.exception` type, keeping the original as the cause. Technology exceptions must never reach `service`.
- `adapter.inbound.web` turns exceptions into HTTP responses in one central `@RestControllerAdvice`.
- Never catch and ignore an exception. Either handle it, or wrap it in another exception that keeps the original as its cause.

---

## 6. REST API

- All endpoints are under `/api`. Firebase Hosting forwards that path to the backend.
- Use JSON for request and response bodies, with `camelCase` field names.
- URLs use plural nouns for resources, e.g. `/api/plans/{planId}` and `/api/runs/{runId}`. Use verbs only for actions that aren't simple resource operations, e.g. `POST /api/plans/{planId}/finalise`.
- Starting a simulation is asynchronous. Return `202 Accepted` with the run ID, and let the UI poll `GET /api/runs/{runId}` for the status.
- Return errors as Problem Details (RFC 9457), using Spring's `ProblemDetail`.
- Controllers accept and return `*Request`/`*Response` DTOs (records), never `domain` objects or entities. Converting between DTOs and domain types happens in the adapter.
- Once security is added, every endpoint must check the caller's role, and none may be public by default.

---

## 7. Persistence

- JPA entities, Spring Data repositories and SQL must not leave `adapter.outbound.persistence`.
- Persistence adapters implement `port.out` interfaces and convert between entities and `domain` types.
- Never use `domain` types as JPA entities.
- Write all queries as parameterised queries. Never build SQL by joining strings.

---

## 8. Dependencies

- Never put a `<version>` in a module POM. Versions come from the Spring Boot parent POM or the root POM's `dependencyManagement` section.
- Add a dependency to the module that uses it, in the change that first uses it.
- `adapter` and `config` get plain Spring Framework libraries, such as `spring-webmvc` or `spring-data-jpa`. The matching Spring Boot starter goes only in `application`.
- `domain`, `port` and `service` get no Spring dependencies at all.
- Ask the team before adding any library that isn't in the architecture document.

---

## 9. Testing

The project uses test-driven development as part of its eXtreme Programming process.

| What | How |
|---|---|
| Service logic | Plain JUnit 5 + AssertJ, with hand-written fake ports or Mockito mocks. No Spring context. |
| Domain records | Test only the compact-constructor checks, if there are any. |
| Controllers | Spring MVC test support (`MockMvc`) against a mocked input port. |
| Persistence | Integration tests against real PostgreSQL + PostGIS once added. Not an in-memory database. |
| Whole application | A small number of `@SpringBootTest` tests, only in `application`. |

- Tests mirror the main source: same module, same package.
- Name test classes `<ClassUnderTest>Test`.
- Name test methods as a description of the behaviour, in camelCase, e.g. `marksResultPartialWhenMapDataIsMissing`.
- Use AssertJ (`assertThat`), not JUnit's `assertEquals`.
- Make tests deterministic: use a fixed `Clock`, fixed seeds, and no real network calls.
- Every change must leave `mvn test` passing for the whole project.

---

## 10. Documentation

- **README.md** is the single place for architecture documentation. Update it in the same change whenever the module structure, package layout or conventions change.
- Don't put documentation in POM files: no `<description>` elements and no explanatory comments.
- Write Javadoc for every `port` interface and its methods. Say which use cases use it (e.g. "Used in UC-01, UC-11"), and match the wording of the architecture document.
- Comments explain *why*, not *what*. Don't leave commented-out code.
- `package-info.java` files exist only to keep empty packages in git. Delete one in the same change that adds the first class to its package.

---

## 11. Checklist before finishing a change

- [ ] The code is in the right module and package (section 2), with no Spring in `domain`, `port` or `service`.
- [ ] `domain` has only records, POJOs, enums and exceptions, and its only logic is compact-constructor checks. `port` has only interfaces.
- [ ] Any new exception class is in `domain.exception`, and no other module defines one.
- [ ] Names follow section 3 and use the architecture document's British spelling.
- [ ] Indentation and formatting follow section 4: no tabs, 4-space Java and XML indents, 8-space continuation lines, 120-character lines.
- [ ] Current time comes from an injected `Clock`.
- [ ] No new library was added unless this change uses it; there are no versions in module POMs; any starter is only in `application`.
- [ ] Partial, seeds, `Clock` and audit rules are followed where relevant (section 5).
- [ ] Tests were written or updated, and `mvn test` passes.
- [ ] README.md is updated if the structure or conventions changed.
- [ ] Any `package-info.java` in a package that now has classes has been deleted.
