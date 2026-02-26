import requests
import json
import time

def fetch_rizin_fighters():
    url = "https://query.wikidata.org/sparql"
    # RIZIN Fighting Federation ID: Q21666497
    
    # Query logic:
    # Find humans (P31: Q5)
    # Who are affiliated with RIZIN (Q21666497) via:
    # - P54 (member of sports team) - uncommon for leagues but possible
    # - P108 (employer)
    # - P1412 (languages spoken, written or signed) - NO
    # - P1344 (participant in) - linked to specific events, might be hard to get all
    # - P118 (league)
    # 
    # Also fetch:
    # - Label (Name)
    # - P2002 (Twitter)
    # - P2003 (Instagram)
    # - P2397 (YouTube)
    # - P54 (Gym/Team)
    
    query = """
    SELECT DISTINCT ?p ?pLabel ?o ?oLabel WHERE {
      wd:Q6451952 ?p ?o.
      SERVICE wikibase:label { bd:serviceParam wikibase:language "ja,en". }
    }
    LIMIT 200
    """
    
    # Note: If P118 doesn't yield enough, we might need to broaden the search to "participated in RIZIN events".
    # But let's start with P118 (League).

    headers = {
        "User-Agent": "RizinGraphPrototype/1.0 (mailto:your_email@example.com)"
    }

    try:
        print("Sending SPARQL query to Wikidata...")
        response = requests.get(url, params={'query': query, 'format': 'json'}, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        bindings = data['results']['bindings']
        print(f"Found {len(bindings)} entries.")
        
        fighters = []
        for entry in bindings:
            fighter = {
                "name": entry.get('itemLabel', {}).get('value', 'Unknown'),
                "id": entry.get('item', {}).get('value', '').split('/')[-1],
                "twitter": entry.get('twitter', {}).get('value'),
                "instagram": entry.get('instagram', {}).get('value'),
                "youtube": entry.get('youtube', {}).get('value'),
                "gym": entry.get('gymLabel', {}).get('value')
            }
            fighters.append(fighter)
            
        # Deduplicate based on ID (because one fighter might have multiple gym entries -> multiple rows)
        unique_fighters = {}
        for f in fighters:
            fid = f['id']
            if fid not in unique_fighters:
                unique_fighters[fid] = f
            else:
                # Merge gym info if needed, or list it
                if f['gym'] and unique_fighters[fid]['gym'] and f['gym'] != unique_fighters[fid]['gym']:
                     unique_fighters[fid]['gym'] += f", {f['gym']}"
        
        result_list = list(unique_fighters.values())
        print(f"Unique fighters found: {len(result_list)}")
        
        with open("rizin_fighters_wikitdata.json", "w", encoding="utf-8") as f:
            json.dump(result_list, f, indent=2, ensure_ascii=False)
            
        print("Saved to rizin_fighters_wikitdata.json")
        return result_list

    except Exception as e:
        print(f"Error: {e}")
        return []

if __name__ == "__main__":
    fetch_rizin_fighters()
