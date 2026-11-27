# Resilient City Planning Simulator

The Resilient City Planning Simulator, built by CS7CS3 Group 11. This repository holds the backend and the frontend; the Python Simulation Engine will join them later.

## Repository layout

| Folder | What it is | Docs |
|---|---|---|
| `backend/` | Spring Boot modular monolith (Java 25, Maven multi-module, hexagonal architecture) | [backend/README.md](backend/README.md) |
| `frontend/` | React UI (Vite + TypeScript + npm), served by Firebase Hosting | [frontend/README.md](frontend/README.md) |
| `simulation-engine/` *(planned)* | Python Simulation Engine (Mesa + FastAPI) | Added when the engine is started |
| `docs/` | Coding standards, review instructions and the pull request template | See below |

## Contributing

- [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md): the coding standards for the whole repository, followed by developers and AI agents.
- [docs/REVIEW.md](docs/REVIEW.md): how to review a branch, written for AI agents and also usable as a checklist by developers.
- [docs/PULL_REQUEST_TEMPLATE.md](docs/PULL_REQUEST_TEMPLATE.md): the pull request description. GitHub fills new pull requests with it.
- [AGENTS.md](AGENTS.md): the entry point for AI agents, pointing to the documents above.

## How the pieces talk

```
React UI ──/api──▶ Backend ──HTTP/JSON──▶ Python Simulation Engine ──▶ five external services
(Firebase Hosting)  (Cloud Run)                                        (Map Data, Knowledge Base,
                       │                                                Shelter Data, Sensor/Data,
                       ▼                                                Inventory/Staff)
              PostgreSQL + PostGIS
```

- The UI calls the backend only through `/api`. In production Firebase Hosting forwards `/api` to the backend; locally the Vite dev server proxies it to `http://localhost:8080`.
- Firebase Authentication issues the tokens that identify users and their roles.
- Only the Simulation Engine calls the external services. The UI also fetches Map Data directly.

## Quick start

Backend (Java 25, Maven, Docker running), from `backend/`:

```bash
mvn test
docker compose up -d --wait                                  # PostgreSQL + PostGIS on localhost:5432
mvn package -DskipTests                                      # build the runnable jar
java -jar application/target/application-0.0.1-SNAPSHOT.jar  # http://localhost:8080
```

Frontend (Node 22, see `frontend/.nvmrc`), from `frontend/`:

```bash
npm install
npm run dev      # http://localhost:5173, /api proxied to the backend on :8080
npm test
```

See each part's README for the full set of commands.
