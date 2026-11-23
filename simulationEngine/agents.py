import random

from mesa import Agent


class Vehicle(Agent):

    def __init__(self, model, starting_node):
        super().__init__(model)

        self.current_node = starting_node

    def move(self):

        neighbours = list(
            self.model.road_network.get_neighbours(
                self.current_node
            )
        )

        if neighbours:
            self.current_node = random.choice(neighbours)