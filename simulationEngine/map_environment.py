import osmnx as ox


class RoadNetwork:

    def __init__(self, map_file):

        print(f"Loading road network from {map_file}")

        self.graph = ox.load_graphml(map_file)

        print(
            f"Loaded {len(self.graph.nodes)} nodes "
            f"and {len(self.graph.edges)} edges"
        )

    def get_nodes(self):
        return list(self.graph.nodes)

    def get_neighbours(self, node_id):
        return list(
            self.graph.successors(node_id)
        )

    def get_node(self, node_id):
        return self.graph.nodes[node_id]