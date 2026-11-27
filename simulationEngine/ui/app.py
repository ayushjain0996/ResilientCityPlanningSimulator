"""Solara user interface for the city simulation."""

import sys
from pathlib import Path

import osmnx as ox
import solara

from matplotlib.figure import Figure
from mesa.visualization import SolaraViz
from mesa.visualization.utils import update_counter

# Add the simulationEngine root to Python's import path.
BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from simulation.city_model import CityModel


model = CityModel(
    map_file="new_delhi_drive.graphml",
    num_agents=20,
)


@solara.component
def CityMap(model):
    """Render the road network and current vehicle positions."""
    # Tell Solara to re-render this component whenever the Mesa model advances.
    update_counter.get()

    # Use Matplotlib's object-oriented API for thread-safe rendering.
    fig = Figure(figsize=(12, 10))
    ax = fig.subplots()

    ox.plot_graph(
        model.road_network.graph,
        ax=ax,
        show=False,
        close=False,
        node_size=0,
        edge_linewidth=0.5,
    )

    graph = model.road_network.graph

    for vehicle in model.vehicles:
        node = graph.nodes[vehicle.current_node]
        ax.scatter(
            node["x"],
            node["y"],
            s=60,
            marker="o",
        )

    ax.set_title(
        f"New Delhi Simulation — {len(model.vehicles)} vehicles"
    )
    ax.set_axis_off()
    solara.FigureMatplotlib(fig)


page = SolaraViz(
    model,
    components=[CityMap],
    name="New Delhi City Simulation",
)
