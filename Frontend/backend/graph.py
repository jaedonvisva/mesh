import networkx as nx
import plotly.graph_objects as go
import random
import json

def generate_network_graph():
    # Create the graph
    G = nx.Graph()

    # Generate 20 random nodes (users + skills)
    nodes = [f"Node_{i}" for i in range(1, 21)]

    # Add nodes to the graph with random colors (green, yellow, red)
    node_colors = {node: random.choice(["#32a852", "#f1c40f", "#e63946"]) for node in nodes}
    G.add_nodes_from(nodes)

    # Connect each node to at least 4 other nodes randomly
    for node in nodes:
        connections = random.sample([n for n in nodes if n != node], k=4)
        for target in connections:
            G.add_edge(node, target)

    # Get fixed node positions in 3D
    pos = nx.spring_layout(G, dim=3, seed=42)

    # Create 3D scatter plot for nodes
    x_nodes = [pos[node][0] for node in G.nodes]
    y_nodes = [pos[node][1] for node in G.nodes]
    z_nodes = [pos[node][2] for node in G.nodes]

    # Create 3D lines for edges
    edge_x = []
    edge_y = []
    edge_z = []

    for edge in G.edges():
        x0, y0, z0 = pos[edge[0]]
        x1, y1, z1 = pos[edge[1]]
        edge_x.extend([x0, x1, None])
        edge_y.extend([y0, y1, None])
        edge_z.extend([z0, z1, None])

    # Create the Plotly figure
    fig = go.Figure()

    # Add edges
    fig.add_trace(
        go.Scatter3d(
            x=edge_x,
            y=edge_y,
            z=edge_z,
            mode="lines",
            line=dict(color="#bb86fc", width=6),
            hoverinfo="none"
        )
    )

    # Add nodes
    fig.add_trace(
        go.Scatter3d(
            x=x_nodes,
            y=y_nodes,
            z=z_nodes,
            mode="markers+text",
            marker=dict(size=16, color=[node_colors[node] for node in G.nodes], opacity=0.95),
            text=list(G.nodes),
            textposition="top center",
            textfont=dict(size=16, color="white")
        )
    )

    # Update layout
    fig.update_layout(
        scene=dict(
            xaxis=dict(visible=False),
            yaxis=dict(visible=False),
            zaxis=dict(visible=False)
        ),
        paper_bgcolor="#303d4e",
        plot_bgcolor="#303d4e",
        title=dict(text="3D User-Skill Network (Aesthetic)", font=dict(size=24, color="white")),
        margin=dict(l=0, r=0, b=0, t=40)
    )

    # Return the figure as JSON
    return json.loads(fig.to_json())
