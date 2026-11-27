"""Vehicle agents used by the city simulation."""

import random

from mesa import Agent


class Vehicle(Agent):
    """A vehicle that moves between connected road-network nodes."""

    def __init__(self, model, starting_node):
        """Initialise a vehicle at the supplied road-network node."""
        super().__init__(model)
        self.current_node = starting_node

    def move(self):
        """Move the vehicle to a randomly selected neighbouring node."""
        neighbours = list(
            self.model.road_network.get_neighbours(self.current_node)
        )

        if neighbours:
            self.current_node = random.choice(neighbours)
