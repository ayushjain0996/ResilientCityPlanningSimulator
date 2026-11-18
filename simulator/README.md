# Simulation Module

## Overview

The `simulate` folder contains the initial Mesa-based simulation
component of the project. It currently uses **Conway's Game of Life** as
a reference implementation to establish the structure for agents, the
simulation model, configuration, and visualisation.

The current implementation is based on the Mesa documentation example:

https://mesa.readthedocs.io/latest/examples/basic/conways_game_of_life.html

The purpose of this implementation is to provide a starting point for
integrating an agent-based simulation into the wider project. The Game
of Life example is a proof of concept and is not the final simulation
scenario.

## Folder Structure

``` text
simulate/
├── agents.py
├── model.py
├── app.py
├── config.json
└── st_app.py
```

### `agents.py`

Defines the agents used by the simulation.

The current `Cell` agent represents an individual cell. It maintains an
`ALIVE` or `DEAD` state and can access its neighbouring agents.

Each cell determines its next state based on the number of alive
neighbours. The next state is calculated separately before all agents
update, which prevents an agent's newly changed state from affecting
another agent's calculation during the same simulation step.

### `model.py`

Defines the Mesa model and simulation environment.

The current `ConwaysGameOfLife` model:

-   Creates a two-dimensional grid.
-   Creates one `Cell` agent for each grid location.
-   Randomly initialises cells as alive or dead.
-   Advances the simulation through discrete steps.
-   Runs the agents' state calculation and state update phases.

The model uses Mesa's `OrthogonalMooreGrid` with wrapping edges
(`torus=True`).

### `app.py`

Provides the Mesa visualisation for the simulation.

It creates a `SpaceRenderer`, defines how agents should be displayed,
and launches the visualisation through `SolaraViz`.

The current visualisation represents dead and alive cells differently
and allows the simulation model parameters to be supplied from
`config.json`.

### `st_app.py`

`st_app.py` is intended to provide the application/UI entry point for
the simulation when integrating the Mesa simulation into the wider
project.

The exact integration between the Streamlit application and the Mesa
simulation can be extended as the project moves from the current Game of
Life proof of concept to the actual city/agent simulation.

### `config.json`

Contains configurable parameters exposed to the simulation UI.

The current configuration includes:

-   **Random Seed** -- controls reproducibility of the random
    initialisation.
-   **Width** -- width of the simulation grid.
-   **Height** -- height of the simulation grid.
-   **Cells initially alive** -- initial proportion of cells that are
    alive.

For example, the current configuration defines width and height controls
with values ranging from 5 to 60, and an initial alive fraction from 0
to 1.

## How the Simulation Works

The current implementation follows the standard Mesa agent-based
simulation pattern:

``` text
Configuration
     |
     v
Create Model
     |
     v
Create Agents
     |
     v
Initialise Agent State
     |
     v
Simulation Step
     |
     +--> Agents determine next state
     |
     +--> Agents assume next state
     |
     v
Visualisation
```

Each simulation step first asks every cell to calculate its next state.
The cells are then updated to those calculated states.

This two-stage update is implemented in `model.py`, while the decision
logic for an individual cell is implemented in `agents.py`. The current
cell agent explicitly calculates whether it should remain alive, die, or
become alive based on its neighbours. fileciteturn0file0L33-L54

## Running the Simulation

Install the required Python dependencies for the simulation environment,
including Mesa and the packages required by the selected UI.

From the `simulate` directory, the Mesa visualisation can be started
using the project's configured application entry point.

For the current Mesa visualisation, the code creates a model, configures
a renderer, and launches `SolaraViz`. fileciteturn0file1L25-L45

If `st_app.py` is being used as the Streamlit entry point, run it with:

``` bash
streamlit run st_app.py
```

The exact command can be adjusted depending on how the final project
integrates the simulator.

## Configuration

Simulation parameters are kept separately in `config.json` so that they
can be changed without modifying the simulation code.

The current configuration contains controls for the random seed, grid
width, grid height, and initial proportion of alive cells.
fileciteturn0file2L2-L29

This approach can later be extended to parameters relevant to the
project's actual simulation, such as:

-   Number of agents
-   Agent types
-   Starting locations
-   Traffic demand
-   Movement speed
-   Road/network parameters
-   Simulation duration
-   Behavioural parameters
-   Environmental conditions