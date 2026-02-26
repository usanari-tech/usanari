import requests
from bs4 import BeautifulSoup
import json
import sys
import time

def scrape_tapology_prototype(fighter_name):
    # Search URL
    base_url = "https://www.tapology.com"
    search_url = f"{base_url}/search?term={fighter_name.replace(' ', '+')}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    print(f"Searching for {fighter_name}...")
    try:
        # Step 1: Search
        r = requests.get(search_url, headers=headers)
        r.raise_for_status()
        
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Find the first result in the search (results are usually in a table or list)
        # Inspecting standard Tapology search structure (heuristic)
        # Look for links containing /fightcenter/fighters/
        
        profile_link = None
        results = soup.find_all('a', href=True)
        for link in results:
            href = link['href']
            if '/fightcenter/fighters/' in href:
                profile_link = href
                break
        
        if not profile_link:
            print("No profile found in search results.")
            return

        full_profile_url = f"{base_url}{profile_link}"
        print(f"Found profile URL: {full_profile_url}")
        
        # Step 2: Extract Profile Data
        time.sleep(1) # Be polite
        r_profile = requests.get(full_profile_url, headers=headers)
        soup_profile = BeautifulSoup(r_profile.text, 'html.parser')
        
        # Extract Gym
        gym = "Unknown"
        # Heuristic: Find 'Gym:' or 'Affiliation:' label
        gym_header = soup_profile.find(lambda tag: tag.name == "strong" and "Affiliation" in tag.text)
        if gym_header:
            gym_link = gym_header.find_next('a')
            if gym_link:
                gym = gym_link.text.strip()
        
        # Extract Opponents from Fight History
        # Look for the fight record table
        opponents = []
        # Finding the 'Fight History' section
        # Usually it's a table with specific classes or ID
        
        # Debug: Find headers to locate the section
        headers = soup_profile.find_all(['h3', 'h4', 'h2'])
        print("Debug: Headers found:", [h.text.strip() for h in headers])

        # Attempt to find the "Pro Results" section
        # Look for a unique element ID or class often used in Tapology
        # Common structure: <div id="fighter_fight_history"> or similar
        
        # New Strategy: Find the header 'Pro Results' and find the next table/ul
        results_header = None
        for h in headers:
            if "Pro Results" in h.text or "Fight History" in h.text:
                results_header = h
                break
        
        if results_header:
            # The record is usually in a div or ul following this
            # Try to find all links in the container following the header
            container = results_header.find_next_sibling(['div', 'ul', 'table'])
            if container:
                opponent_links = container.find_all('a', href=True)
                for link in opponent_links:
                    href = link['href']
                    if '/fightcenter/fighters/' in href and link.text.strip() != fighter_name:
                         opponents.append({
                            "name": link.text.strip(),
                            "url": href
                        })
        # Save HTML for inspection
        with open("profile_debug.html", "w", encoding="utf-8") as f:
            f.write(soup_profile.prettify())
        print("Debug: Saved profile_debug.html")

        # Refined Strategy: Use 'title' attribute which seems unique to main record links
        # Selector: a[href*="/fightcenter/fighters/"][title$="Fighter Page"]
        print("Debug: Using refined selector based on title attribute...")
        opponent_links = soup_profile.select('a[href*="/fightcenter/fighters/"][title$=" Fighter Page"]')
        
        for link in opponent_links:
            href = link['href']
            name = link.text.strip()
            
            # Simple deduping and self-check
            if name and '/19983-kyoji-horiguchi' not in href:
                 if not any(o['url'] == href for o in opponents):
                    opponents.append({
                        "name": name,
                        "url": href
                    })



        
        result = {
            "name": fighter_name,
            "url": full_profile_url,
            "gym": gym,
            "opponents_count": len(opponents),
            "sample_opponents": opponents[:5] # Show first 5
        }
        
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        # Validate data quality
        if gym != "Unknown" and len(opponents) > 0:
            print("\nSUCCESS: Extracted both Gym and Opponents.")
        else:
            print("\nWARNING: Missing some data.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    scrape_tapology_prototype("Kyoji Horiguchi")
