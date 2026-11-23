from pathlib import Path
import random

from mesa import Model
from mesa.datacollection import DataCollector

from map_environment import RoadNetwork
from agents import Vehicle


BASE_DIR = Path(__file__).resolve().parent


class CityModel(Model):

    def __init__(
        self,
        map_file="new_delhi_drive.graphml",
        num_agents=20
    ):
        super().__init__()

        # Load map
        map_path = BASE_DIR / "maps" / map_file

        self.road_network = RoadNetwork(map_path)

        # Get all road nodes
        nodes = self.road_network.get_nodes()

        # Store our vehicles
        self.vehicles = []

        # Create vehicles
        for _ in range(num_agents):

            starting_node = random.choice(nodes)

            vehicle = Vehicle(
                model=self,
                starting_node=starting_node
            )

            self.vehicles.append(vehicle)

        # Collect basic simulation metrics
        self.datacollector = DataCollector(
            model_reporters={
                "Vehicle Count": lambda model: len(model.vehicles)
            }
        )

        self.datacollector.collect(self)

    def step(self):

        # Move every vehicle
        for vehicle in self.vehicles:
            vehicle.move()

        # Collect metrics
        self.datacollector.collect(self)