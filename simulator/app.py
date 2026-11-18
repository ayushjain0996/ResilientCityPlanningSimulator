import json

from mesa.examples.basic.conways_game_of_life.model import ConwaysGameOfLife
from mesa.visualization import (
    SolaraViz,
    SpaceRenderer,
)
from mesa.visualization.components import AgentPortrayalStyle


def agent_portrayal(agent):
    return AgentPortrayalStyle(
        color="white" if agent.state == 0 else "black",
        marker="s",
        size=30,
    )


def post_process(ax):
    ax.set_aspect("equal")
    ax.set_xticks([])
    ax.set_yticks([])


# Load simulation configuration
with open("config.json", "r") as f:
    model_params = json.load(f)


# Create initial model instance
model1 = ConwaysGameOfLife()

renderer = SpaceRenderer(
    model1,
    backend="matplotlib"
).setup_agents(agent_portrayal)

renderer.render()
renderer.post_process = post_process


page = SolaraViz(
    model1,
    renderer,
    model_params=model_params,
    name="Game of Life",
)

page