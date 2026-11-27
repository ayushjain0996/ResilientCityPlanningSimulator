"""Road-network abstraction built on top of OSMnx."""

import osmnx as ox


class RoadNetwork:
    """Provide access to a directed OpenStreetMap road network."""

    def __init__(self, map_file):
        """Load a GraphML road network from ``map_file``."""
        print(f"Loading road network from {map_file}")
        self.graph = ox.load_graphml(map_file)
        print(
            f"Loaded {len(self.graph.nodes)} nodes "
            f"and {len(self.graph.edges)} edges"
        )

    def get_nodes(self):
        """Return all node identifiers in the road network."""
        return list(self.graph.nodes)

    def get_neighbours(self, node_id):
        """Return successor nodes reachable from ``node_id``."""
        return list(self.graph.successors(node_id))

    def get_node(self, node_id):
        """Return the attributes associated with a road-network node."""
        return self.graph.nodes[node_id]
