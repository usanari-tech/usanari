import requests
import json

def debug_rizin():
    url = "https://query.wikidata.org/sparql"
    
    # 1. Find ID for "RIZIN Fighting Federation"
    query_id = """
    SELECT ?item ?itemLabel WHERE {
      ?item rdfs:label ?label.
      FILTER(CONTAINS(LCASE(?label), "rizin")).
      SERVICE wikibase:label { bd:serviceParam wikibase:language "ja,en". }
    }
    LIMIT 5
    """
    
    headers = {
        "User-Agent": "RizinGraphPrototype/Debug (mailto:your_email@example.com)"
    }
    
    try:
        print("Searching for RIZIN Entity ID...")
        r = requests.get(url, params={'query': query_id, 'format': 'json'}, headers=headers)
        r.raise_for_status()
        data = r.json()
        bindings = data['results']['bindings']
        print(f"Found entities: {len(bindings)}")
        for b in bindings:
            print(f"ID: {b['item']['value']} Label: {b['itemLabel']['value']}")
            
            # For each ID found, check incoming links
            rizin_id = b['item']['value'].split('/')[-1]
            check_incoming(rizin_id)

    except Exception as e:
        print(f"Error: {e}")

def check_incoming(entity_id):
    url = "https://query.wikidata.org/sparql"
    # Check what links to this entity
    query = f"""
    SELECT DISTINCT ?p ?pLabel ?item ?itemLabel WHERE {{
      ?item ?p wd:{entity_id}.
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "ja,en". }}
    }}
    LIMIT 20
    """
    
    headers = {"User-Agent": "RizinGraphBot/1.0"}
    
    try:
        print(f"Checking incoming links for {entity_id}...")
        r = requests.get(url, params={'query': query, 'format': 'json'}, headers=headers)
        data = r.json()
        bindings = data['results']['bindings']
        print(f"Incoming links count: {len(bindings)}")
        for b in bindings:
            print(f"  - [{b['itemLabel']['value']}] via property [{b['pLabel']['value']}]")
            
    except Exception as e:
        print(f"Error checking incoming: {e}")

if __name__ == "__main__":
    debug_rizin()
