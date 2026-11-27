"""Mesa model coordinating the city simulation."""

import random
from pathlib import Path

from mesa import Model
from mesa.datacollection import DataCollector

from agents.vehicle import Vehicle
from environment.road_network import RoadNetwork


BASE_DIR = Path(__file__).resolve().parents[1]


class CityModel(Model):
    """Mesa model containing vehicles operating on a road network."""

    def __init__(
        self,
        map_file="new_delhi_drive.graphml",
        num_agents=20,
    ):
        """Initialise the road network, vehicles, and data collection."""
        super().__init__()

        map_path = BASE_DIR / "maps" / map_file
        self.road_network = RoadNetwork(map_path)

        nodes = self.road_network.get_nodes()
        if not nodes:
            raise ValueError("The road network contains no nodes.")

        self.vehicles = []
        for _ in range(num_agents):
            starting_node = random.choice(nodes)
            vehicle = Vehicle(model=self, starting_node=starting_node)
            self.vehicles.append(vehicle)

        self.datacollector = DataCollector(
            model_reporters={
                "Vehicle Count": lambda model: len(model.vehicles),
            }
        )
        self.datacollector.collect(self)

    def step(self):
        """Advance the simulation by moving every vehicle once."""
        for vehicle in self.vehicles:
            vehicle.move()

        self.datacollector.collect(self)
