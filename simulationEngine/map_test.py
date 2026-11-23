import time
from pathlib import Path

import osmnx as ox


BASE_DIR = Path(__file__).resolve().parent

MAP_DIR = BASE_DIR / "maps"
MAP_DIR.mkdir(exist_ok=True)

MAP_FILE = MAP_DIR / "new_delhi_drive.graphml"

PLACE = "New Delhi, India"


ox.settings.use_cache = True
ox.settings.requests_timeout = 300
ox.settings.overpass_url = (
    "https://overpass.kumi.systems/api/interpreter"
)

print(
    f"Using Overpass server: "
    f"{ox.settings.overpass_url}"
)

start_time = time.perf_counter()


if MAP_FILE.exists():

    print("Loading map from local GraphML file...")

    graph = ox.load_graphml(MAP_FILE)

else:

    print("Map file not found.")
    print("Downloading map from OpenStreetMap...")

    graph = ox.graph_from_place(
        PLACE,
        network_type="drive"
    )

    ox.save_graphml(
        graph,
        MAP_FILE
    )

    print(f"Saved map to: {MAP_FILE}")


end_time = time.perf_counter()

print()
print(graph)
print(f"Nodes: {len(graph.nodes)}")
print(f"Edges: {len(graph.edges)}")
print(
    f"Executed in: "
    f"{end_time - start_time:.4f} seconds"
)

ox.plot_graph(
    graph,
    node_size=0,
    edge_linewidth=0.5
)