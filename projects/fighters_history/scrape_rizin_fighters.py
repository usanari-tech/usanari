import requests
from bs4 import BeautifulSoup
import json
import time
import os

def check_existing_data(file_path):
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def scrape_fighter(fighter_name):
    base_url = "https://www.tapology.com"
    search_url = f"{base_url}/search?term={fighter_name.replace(' ', '+')}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    print(f"\n--- Processing: {fighter_name} ---")
    
    try:
        # Step 1: Search
        print(f"Searching...")
        r = requests.get(search_url, headers=headers)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')
        
        profile_link = None
        results = soup.find_all('a', href=True)
        for link in results:
            href = link['href']
            # Simple heuristic: find first link to fightcenter
            if '/fightcenter/fighters/' in href:
                profile_link = href
                break
        
        if not profile_link:
            print(f"Skipping {fighter_name}: Profile not found.")
            return None

        full_profile_url = f"{base_url}{profile_link}"
        print(f"Found URL: {full_profile_url}")
        
        # Step 2: Extract Data
        time.sleep(2) # Politeness delay
        r_profile = requests.get(full_profile_url, headers=headers)
        soup_profile = BeautifulSoup(r_profile.text, 'html.parser')
        
        # Gym
        gym = "Unknown"
        gym_header = soup_profile.find(lambda tag: tag.name == "strong" and "Affiliation" in tag.text)
        if gym_header:
            gym_link = gym_header.find_next('a')
            if gym_link:
                gym = gym_link.text.strip()
        
        # Opponents
        opponents = []
        # Selector based on prototype findings: links to fighters with title '... Fighter Page'
        opponent_links = soup_profile.select('a[href*="/fightcenter/fighters/"][title$=" Fighter Page"]')
        
        for link in opponent_links:
            href = link['href']
            name = link.text.strip()
            
            # exclude self (current fighter)
            if name and profile_link not in href:
                 # dedup
                 if not any(o['url'] == href for o in opponents):
                    opponents.append({
                        "name": name,
                        "url": href
                    })

        data = {
            "name": fighter_name,
            "url": full_profile_url,
            "gym": gym,
            "opponents_count": len(opponents),
            "opponents": opponents
        }
        
        print(f"Success: Found {len(opponents)} opponents. Gym: {gym}")
        return data

    except Exception as e:
        print(f"Error scraping {fighter_name}: {e}")
        return None

def main():
    target_fighters = [
        "Kyoji Horiguchi",
        "Mikuru Asakura", 
        "Kai Asakura", 
        "Kleber Koike Erbst", 
        "Yutaka Saito", 
        "Ren Hiramoto"
    ]
    
    output_dir = "data"
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "rizin_fighters_raw.json")
    
    results = check_existing_data(output_file)
    existing_names = [f['name'] for f in results]
    
    for fighter in target_fighters:
        if fighter in existing_names:
            print(f"Skipping {fighter}: Already scraped.")
            continue
            
        data = scrape_fighter(fighter)
        if data:
            results.append(data)
            # Save incrementally
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
        
        time.sleep(2) # Delay between fighters

    print(f"\nCompleted. Saved {len(results)} fighters to {output_file}")

if __name__ == "__main__":
    main()
