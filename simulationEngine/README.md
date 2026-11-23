# Simulation Engine

The Simulation Engine is the Python/Mesa component of the **Resilient City Planning Simulator**. It provides the environment for running agent-based city simulations using real-world road-network data obtained from OpenStreetMap.

The current implementation is a prototype demonstrating:

- Loading a real city road network using OSMnx.
- Storing the road network locally as a GraphML file.
- Representing vehicles as Mesa agents.
- Moving agents between connected road-network nodes.
- Visualising the road network and agents through Mesa/Solara.
- Running the simulation interactively using the Solara controls.

> **Current status:** Prototype / proof of concept. The current vehicle behaviour is intentionally simple and uses random movement between connected road-network nodes.

---

## Project Structure

```text
simulationEngine/
│
├── maps/
│   └── new_delhi_drive.graphml
│
├── agents.py
├── app.py
├── map_environment.py
├── map_test.py
├── model.py
├── requirements.txt
└── README.md
```

### Files

| File | Purpose |
|---|---|
| `agents.py` | Defines simulation agents and their behaviour. |
| `model.py` | Defines the Mesa simulation model and manages agents and simulation steps. |
| `map_environment.py` | Provides an abstraction over the OSMnx road network. |
| `map_test.py` | Downloads the OpenStreetMap road network and stores it as GraphML. |
| `app.py` | Provides the Solara/Mesa visualisation interface. |
| `requirements.txt` | Lists the Python dependencies required by the simulation engine. |
| `maps/` | Stores locally generated road-network files. |

---

## Technologies

- Python
- Mesa
- OSMnx
- NetworkX
- Matplotlib
- Solara
- OpenStreetMap / Overpass API

---

## Installation

### 1. Create a virtual environment

From the `simulationEngine` directory:

```bash
python3 -m venv .venv
```

Activate it on macOS/Linux:

```bash
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

---

## Generating a Map

The simulator currently uses OpenStreetMap road-network data.

Run:

```bash
python3 map_test.py
```

The script checks whether the required GraphML map already exists.

If the map exists:

```text
maps/new_delhi_drive.graphml
```

it is loaded locally.

If it does not exist, the script downloads the road network from OpenStreetMap through the configured Overpass API and saves it as a GraphML file.

The workflow is therefore:

```text
OpenStreetMap
      ↓
Overpass API
      ↓
OSMnx
      ↓
GraphML
      ↓
maps/
```

Subsequent runs use the locally stored GraphML file instead of downloading the map again.

---

## Running the Simulation

After the map has been generated:

```bash
solara run app.py
```

Solara will start a local web server, normally at:

```text
http://localhost:8765
```

Open the address in a browser.

The interface provides controls for:

- Resetting the simulation.
- Starting/stopping the simulation.
- Advancing the simulation by one step.
- Controlling the playback interval.
- Controlling the rendering interval.

The visualisation displays the OpenStreetMap road network together with the simulated vehicles.

---

## Current Simulation Behaviour

Each vehicle is represented as a Mesa agent.

A vehicle stores its current road-network node:

```text
Vehicle
   ↓
Current OSM node
   ↓
Connected road nodes
   ↓
Select neighbouring node
   ↓
Move
```

At each simulation step, every vehicle selects one of the connected road-network nodes and moves to it.

The current movement model is intentionally random and is used only to verify that Mesa agents can interact with a real road network.

---

## Map Representation

OSMnx represents the road network as a NetworkX `MultiDiGraph`.

The graph contains:

- **Nodes** representing locations/intersections in the road network.
- **Edges** representing road connections.
- Directed edges representing the direction of travel.
- Geographic coordinates associated with nodes.

The GraphML file preserves this network structure so that the simulation can load the map without repeatedly querying OpenStreetMap.

---

## Caching

OSMnx uses a local cache when:

```python
ox.settings.use_cache = True
```

is enabled.

The cache stores responses from external OSM/Overpass requests to avoid repeatedly downloading the same data.

The cache is a runtime optimisation and is not part of the simulation's persistent map data.

The following directories are therefore excluded from Git:

```text
cache/
__pycache__/
```

---

## Map Storage and Deployment

For local development, maps are stored in:

```text
maps/
```

For the future cloud deployment, map files are expected to be stored in persistent cloud object storage, such as Azure Blob Storage.

A future deployment architecture can therefore use:

```text
Azure Blob Storage
        │
        │ map download
        ▼
Simulation Worker
        │
        ▼
OSMnx / Mesa
        │
        ▼
Simulation State
        │
        ▼
Backend / Frontend
```

The OSMnx cache should remain a local runtime cache rather than being treated as the application's persistent storage.

---

## Current Limitations

The current implementation is a prototype and does not yet implement:

- Realistic vehicle routing.
- Traffic congestion.
- Road capacity.
- Travel-time modelling.
- Traffic signals.
- Multiple transport modes.
- Scenario configuration from the frontend.
- Persistent simulation state.
- Multi-user simulation management.
- Cloud execution.
- React integration.
- Firebase/Azure integration.
- Real-time simulation updates through an API.

---

## Planned Development

The simulation engine will be extended incrementally.

### Stage 1 — Current prototype

```text
OSM map
   ↓
GraphML
   ↓
Mesa
   ↓
Vehicle agents
   ↓
Solara visualisation
```

### Stage 2 — Realistic movement

Introduce:

- Destination nodes.
- Route calculation.
- Network distances.
- Travel time.
- Vehicle routing.
- Road characteristics.

### Stage 3 — City simulation

Introduce additional agent types and city-level behaviours such as:

- Vehicles.
- Pedestrians.
- Emergency services.
- Traffic congestion.
- Road closures.
- Infrastructure changes.

### Stage 4 — Backend integration

Connect the simulation engine to the Spring Boot backend so that simulation parameters can be supplied by the application.

```text
React
  ↓
Spring Boot
  ↓
Simulation Engine
  ↓
Mesa
```

### Stage 5 — Cloud execution

Deploy simulation workers to the cloud and use persistent storage for:

- Map data.
- Simulation configurations.
- Simulation results.

A queue-based architecture can subsequently be introduced to manage multiple simulation requests.

---

## Development Notes

The simulation engine is currently intended to run independently while the simulator architecture is being developed.

The main milestone is to establish a reliable connection between:

```text
Real-world geographic data
        ↓
Agent-based simulation
        ↓
Simulation results
        ↓
Web visualisation
```

The current New Delhi simulation is a proof of concept for this architecture rather than the final city simulation.