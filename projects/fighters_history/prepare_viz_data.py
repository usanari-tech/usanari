import json
import os

def prepare_graph_data():
    input_file = "data/rizin_fighters_raw.json"
    output_file = "viz/graph_data.js"
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found.")
        return

    with open(input_file, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)

    nodes = {}
    edges = []
    
    # Track node types
    # Central nodes (scraped targets) get a special class
    
    for fighter in raw_data:
        f_name = fighter['name']
        f_gym = fighter.get('gym', 'Unknown')
        
        # Add Central Node
        if f_name not in nodes:
            nodes[f_name] = {"id": f_name, "type": "target", "gym": f_gym}
        else:
            # Upgrade existing node if it was previously just an opponent
            nodes[f_name]["type"] = "target" 
            nodes[f_name]["gym"] = f_gym

        # Process Opponents
        for opp in fighter['opponents']:
            o_name = opp['name']
            
            # Add Opponent Node (if not exists)
            if o_name not in nodes:
                nodes[o_name] = {"id": o_name, "type": "opponent", "gym": "Unknown"}
            
            # Add Edge (undirected, so sort names to avoid duplicates A-B vs B-A)
            # Fighters A and B
            pair = sorted([f_name, o_name])
            edge_id = f"{pair[0]}_{pair[1]}"
            edges.append({
                "data": { 
                    "id": edge_id, 
                    "source": pair[0], 
                    "target": pair[1] 
                }
            })

    # Deduplicate edges
    unique_edges = {e['data']['id']: e for e in edges}.values()
    
    # Format for Cytoscape.js
    cs_elements = {
        "nodes": [{"data": {"id": n["id"], "type": n["type"], "gym": n["gym"]}} for n in nodes.values()],
        "edges": list(unique_edges)
    }
    
    # Write to JS file
    js_content = f"const graphElements = {json.dumps(cs_elements, indent=2, ensure_ascii=False)};"
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(js_content)
        
    print(f"Graph data saved to {output_file}")
    print(f"Nodes: {len(nodes)}, Edges: {len(unique_edges)}")

if __name__ == "__main__":
    prepare_graph_data()
