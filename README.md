# Resilient City Planning Simulator: Backend

This is the backend service of the Resilient City Planning Simulator, built by CS7CS3 Group 11. It is a Spring Boot modular monolith, organised as a hexagonal architecture.

In the overall system:

- A **React UI** on Firebase Hosting calls this backend over REST/JSON, through `/api`.
- **Firebase Authentication** issues the tokens that identify users and their roles.
- **Records** are stored in PostgreSQL with PostGIS.
- Simulations run in a separate **Python Simulation Engine** (Mesa + FastAPI), which the backend calls over HTTP/JSON.
- The five external services (Map Data, Knowledge Base, Shelter Data, Sensor/Data and Inventory/Staff) are called only by the Simulation Engine, never by this backend.

## Tech stack

| | |
|---|---|
| Language | Java 25 |
| Build | Maven, multi-module |
| Framework | Spring Boot 4.0 (the parent POM manages the versions of all Spring and test libraries and plugins) |
| Tests | JUnit 5, AssertJ, Mockito |

Libraries are added when the feature that needs them is implemented, not in advance.

## Build and run

```bash
mvn test                                  # build all modules and run the tests
mvn spring-boot:run -pl application -am   # start the backend on http://localhost:8080
mvn package                               # runnable jar: application/target/application-0.0.1-SNAPSHOT.jar
```

---

## Hexagonal architecture

### The idea

The **hexagon** is the inside of the application: the domain model, the ports, and the services that hold the business rules and coordinate planning and simulation. It doesn't know about HTTP, databases, Spring or the Python engine.

Everything outside, such as the UI, the database and the Simulation Engine, connects to the hexagon through **ports** and **adapters**:

- A **port** is an interface that the hexagon owns. It describes, in business terms, something the hexagon offers or something it needs.
- An **adapter** is the technology-specific code that connects one port to the outside world, such as a REST controller or a JPA repository.

There are two kinds of each:

| | Input (driving) side | Output (driven) side |
|---|---|---|
| Who starts the call | The outside world calls the hexagon | The hexagon calls the outside world |
| Port | `port.in`: what the backend offers, e.g. `startRun`, `savePlanVersion` | `port.out`: what the backend needs, e.g. `saveRunRecords`, `runSimulation` |
| Implemented by | Services in the `service` module | Adapters in `adapter.outbound` |
| Called by | Adapters in `adapter.inbound`, e.g. REST controllers | Services in the `service` module |
| Examples | REST API for the UI, the run worker | Records (PostgreSQL), Simulation Engine client |

### The dependency rule

All dependencies point **inwards**, towards the domain. The domain depends on nothing, the ports depend only on the domain, and nothing in the core depends on an adapter.

```
                      domain        records, POJOs, enums
                        ▲
                        │
                       port         interfaces only
                      ▲    ▲
                      │    │
                service    adapter
                   ▲          ▲
                config ───────┤  runtime scope only
                   ▲          │
             application ─────┘  runtime scope only
```

On the output side this works by **dependency inversion**. A service needs Records, but it doesn't depend on the Records code. Instead:

1. The `port` module defines an interface such as `SaveRunRecordsPort` in `port.out`.
2. The service only uses that interface.
3. The persistence adapter implements the interface.
4. At runtime, Spring passes the adapter in as the implementation.

So the database code depends on the core, not the other way round.

### Why we structure it this way

- **We can replace technologies.** The database, the simulation engine or the API style can change without touching the business rules.
- **The core is easy to test.** `domain`, `port` and `service` are plain Java, so their tests run in milliseconds with fake ports, without Spring, a database or the Python service.
- **The architecture document maps directly onto the code.** Each functional component (Plan Manager, Validator, Orchestrator, Analyser, Records and so on) has one obvious home.
- **Mistakes are caught by the compiler, not code review.** See the next section.

### How Maven enforces the rules

Each layer is a separate Maven module, so a dependency that breaks the rule fails to compile:

| Module | Compile-time dependencies | Spring? | What it can't do |
|---|---|---|---|
| `domain` | none | No | Import Spring, ports, adapters or anything else in the project |
| `port` | `domain` | No | Import Spring, services or adapters |
| `service` | `domain`, `port` | No | Import Spring or adapter classes |
| `adapter` | `domain`, `port` | Yes | Import services; it goes through ports instead |
| `config` | `domain`, `port`, `service` (plus `adapter` at **runtime** only) | Yes | Reference adapter classes; beans are wired against port interfaces |
| `application` | `config` (plus `adapter` at **runtime** only) | Yes | Not applicable; it only starts the app |

**Runtime scope:** `config` and `application` depend on `adapter` with `<scope>runtime</scope>`. The adapters are on the classpath when the app runs, so Spring finds and wires them, but they're absent at compile time, so no code there can import an adapter class.

### What each core module may contain

Maven controls which modules can see each other, but not what kind of type goes in each one. These two rules are conventions that code review must check:

| Module | Allowed | Not allowed |
|---|---|---|
| `domain` | `record`s, POJOs (fields, constructors, getters/setters, `equals`/`hashCode`/`toString`) and `enum`s | Business logic, calculations, interfaces, framework annotations (Spring, JPA, Jackson) |
| `port` | `interface`s only, whose method signatures use `domain` types | Classes, records, enums, default methods containing logic |

Business rules, such as resilience scoring, fairness measures, shortfall detection and deciding when a result is Partial or Flagged, belong in `service`, not `domain`.

### Design decisions

- **The ports are a separate module, not part of `service`.** The adapters need the ports and the application needs the adapters, so ports inside `service` would create a circular dependency between Maven modules. Keeping them apart from `domain` also separates the data (`domain`) from the contracts (`port`).
- **`domain` holds data only.** All behaviour lives in `service`, so the model stays simple to create, compare and pass between layers.
- **All adapters are in one module, split into `adapter.inbound` and `adapter.outbound`.** The names avoid `in` and `out` because `in` is a reserved word in Java.
- **Services have no Spring annotations.** `config` registers them as `@Bean`s, so the service code stays plain Java.
- **The main class is in the root package `ie.tcd.resilientcity`,** even though it lives in the `application` module. Spring only scans the main class's package and the ones below it, so this lets it find `config.*` and `adapter.*` automatically.

---

## Modules

The root package is `ie.tcd.resilientcity`.

### `domain`: the data model

Package: `ie.tcd.resilientcity.domain`

Records, POJOs and enums only. They describe plans and plan versions, scenarios and their inputs, simulation runs with their seeds, run results, evaluations, reviews, and the user roles (Planner, Emergency Services Manager, Auditor). No business logic.

### `port`: the contracts of the hexagon

Package: `ie.tcd.resilientcity.port`

Interfaces only, using `domain` types in their signatures.

| Package | Contents |
|---|---|
| `port.in` | **Input ports.** Plan Manager operations (`setScenarioInputs`, `savePlanVersion`, `recordFinalisation`, `saveReview`, `markFlagged`), the Simulation Orchestrator's `startRun`, and the `startAssessment` interface shared by every use-case manager |
| `port.out` | **Output ports.** Records (`saveRunRecords`, `saveMapData`, `loadMapData`, plan versions, audit log), the run queue, and the Simulation Engine's `runSimulation` |

The five external services have no ports here because the Simulation Engine calls them, not the backend.

### `service`: the backend's functional components

Package: `ie.tcd.resilientcity.service`

These classes implement the input ports and contain all the business rules, working on `domain` objects. They reach the outside world only through output ports.

| Component | Responsibility |
|---|---|
| **Plan Manager** | Stores scenario inputs and plan versions, records finalisations and reviews, and is the single entry point for simulation requests |
| **Validator** | Checks inputs before any run starts and marks missing data as Partial. It never starts a run itself |
| **Simulation Orchestrator** | Routes validated requests to the right use-case manager, sends runs to the Simulation Engine, saves them with their seeds in Records, and passes results to the Analyser |
| **Analyser** | Evaluates run results, calculates KPIs and finds shortfalls |
| **Use-case managers** | One sub-package per use case (UC-01, UC-02 and UC-04 to UC-12), each implementing the common `startAssessment` interface |

### `adapter`: connections to the outside world

Package: `ie.tcd.resilientcity.adapter`

| Package | Role |
|---|---|
| `adapter.inbound.web` | The REST/JSON API that the React UI calls through Firebase Hosting. It exposes the UI's requests (`submitGrowthRequest`, `submitScoringRequest`, `revisePlan`, `finalisePlan`, `submitReview`, …) and the run-status endpoint the UI polls. It also holds the backend part of the **Authenticator**, which checks the Firebase token and the user's role on every request. Controllers call input ports only, never outbound adapters directly |
| `adapter.inbound.worker` *(planned)* | The run worker. It takes QUEUED runs from the run table and drives them through the Orchestrator |
| `adapter.outbound.persistence` | The **Records** component on PostgreSQL + PostGIS. It stores plans and plan versions, scenario inputs, runs with their inputs, seeds and results, map data saved by the UI, reviews, and the audit log. The run table also serves as the job queue. It converts between domain objects and storage models, and storage-specific types such as JPA entities must not leak outside this package |
| `adapter.outbound.simulation` *(planned)* | The HTTP/JSON client for the Python Simulation Engine |

### `config`: Spring wiring

Package: `ie.tcd.resilientcity.config`

`@Configuration` classes that register the plain-Java services as Spring beans. Each service's dependencies are declared as output-port interfaces, and Spring injects the matching adapter at runtime. This is also where cross-cutting setup goes, such as the security and role rules for the Authenticator, CORS and JSON settings.

### `application`: entry point

Package: `ie.tcd.resilientcity`

The `@SpringBootApplication` class and `application.properties`. This module builds the runnable jar that is deployed as the backend container on Cloud Run.

---

## Adding a feature

For example, to add a use case:

1. **Domain:** add the records, POJOs or enums the use case needs. No logic.
2. **Port:** add an input port interface for the operation in `port.in`, and output port interfaces in `port.out` for anything the use case needs from outside.
3. **Service:** implement the input port in `service.usecase.<name>`, putting the business rules here and using only output ports. Unit-test it with fake ports.
4. **Adapter:** add a controller in `adapter.inbound.web` that calls the input port. Implement any new output ports in `adapter.outbound.*`, annotated with `@Component` or `@Repository`.
5. **Config:** register the service as a `@Bean`, taking its output ports as parameters.
6. **Dependencies:** add a library to the module that needs it, at the point you need it.
