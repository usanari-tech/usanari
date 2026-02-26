import requests
from bs4 import BeautifulSoup
import json
import time
import random
import re

# Target Fighters (Same list as before)
TARGETS = [
    {"name": "Kyoji Horiguchi", "url": "https://www.tapology.com/fightcenter/fighters/19983-kyoji-horiguchi"},
    {"name": "Kai Asakura", "url": "https://www.tapology.com/fightcenter/fighters/124700-kai-asakura"},
    {"name": "Mikuru Asakura", "url": "https://www.tapology.com/fightcenter/fighters/58498-mikuru-asakura"},
    {"name": "Ren Hiramoto", "url": "https://www.tapology.com/fightcenter/fighters/151280-ren-hiramoto"},
    {"name": "Kleber Koike Erbst", "url": "https://www.tapology.com/fightcenter/fighters/45686-kleber-koike-erbst"},
    {"name": "Juan Archuleta", "url": "https://www.tapology.com/fightcenter/fighters/69480-juan-archuleta"},
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.google.com/",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "cross-site",
    "Upgrade-Insecure-Requests": "1"
}

def search_fighter_url(name):
    print(f"  Searching for {name}...")
    search_url = "https://www.tapology.com/search"
    params = {"term": name, "mainSearchFilter": "fighters"}
    try:
        resp = requests.get(search_url, params=params, headers=HEADERS)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.content, 'html.parser')
            # Look for first result
            # .searchResult a
            # Structure might be simpler in search results
            # Results are usually in a table or list
            results = soup.select('.searchResults .searchResult a') 
            # Or just check links containing /fightcenter/fighters/
            
            # Find the first link that looks like a fighter profile
            for a in soup.find_all('a', href=True):
                if '/fightcenter/fighters/' in a['href']:
                    return "https://www.tapology.com" + a['href']
                    
        print(f"  Search failed for {name}")
    except Exception as e:
        print(f"  Search error: {e}")
    return None


def clean_text(text):
    if text:
        return text.strip()
    return ""

def parse_bout(bout_el):
    data = {}
    
    # Bout ID
    data['id'] = bout_el.get('data-bout-id')
    
    # Result (Win/Loss/Draw/NC/Upcoming)
    # usually in the first div of .result
    result_div = bout_el.select_one('.result > div:nth-child(1)')
    if result_div:
        data['result'] = clean_text(result_div.text)
    
    # Use href matching for reliability
    
    # Opponent
    opponent_a = bout_el.select_one('a[href*="/fightcenter/fighters/"]')
    # Note: The first fighter link might be the fighter themselves if the structure is weird, 
    # but usually "Opponent" is in the main list.
    # Actually, in the bout list row, the fighter's own name is NOT a link in the row, only the opponent is.
    # But wait, sometimes both are links in 'Compact' view?
    # In 'proResults' > 'bout', the structure is:
    # Div 1: Result
    # Div 2: ?
    # Div 3: Names. Opponent is the link. The name of the profile owner is usually not linked or implied.
    # In `profile_debug.html` line 3331: Opponent link exists. 
    # Let's stick to the previous selector for Opponent but verify it's not self? No, self is not linked in their own profile usually.
    # Safe selector: .result .link-primary-red (if class exists) or specific path.
    # Previous path: .result > div:nth-child(3) > div:nth-child(1) a  <- This was extracting correct names.
    # Let's keep it but maybe refine.
    if not opponent_a: # Fallback
         opponent_a = bout_el.select_one('.result > div:nth-child(3) > div:nth-child(1) a')
    
    if opponent_a:
        data['opponent'] = clean_text(opponent_a.text)
        data['opponent_url'] = "https://www.tapology.com" + opponent_a['href']
    else:
        data['opponent'] = "Unknown"

    # Event
    # Find link with /events/ in href
    event_a = bout_el.select_one('a[href*="/fightcenter/events/"]')
    if event_a:
        data['event'] = clean_text(event_a.text)
    
    # Date
    # Still use the path as it's distinct (Right side)
    date_div = bout_el.select_one('.result > div:nth-child(3) > div:nth-child(3) a div')
    if date_div:
        data['date'] = clean_text(date_div.text.replace('\n', ' '))

    # Method / Round / Time
    # Find link with /bouts/ in href (The Method link)
    method_a = bout_el.select_one('a[href*="/fightcenter/bouts/"]')
    if method_a:
        method_text = clean_text(method_a.text)
        data['method_summary'] = method_text
        
        parts = [p.strip() for p in method_text.split('·')]
        
        data['method'] = parts[0]
        if len(parts) > 1:
            for p in parts[1:]:
                if ':' in p:
                    data['time'] = p
                elif p.startswith('R'):
                    data['round'] = p
                else:
                    data['method_detail'] = p
    
    # Extract Details from hidden div
    # #detail-rows-{id}
    details_div = bout_el.select_one(f'#detail-rows-{data["id"]}')
    if details_div:
        rows = details_div.find_all('div', recursive=False) # Direct children divs are rows
        for row in rows:
            label_span = row.select_one('span.font-bold')
            if label_span:
                label = clean_text(label_span.text).replace(':', '')
                # Value is the text following the label label_span.next_sibling or separate span
                # Usually: <span class="font-bold">Label:</span> <span>Value</span>
                value_span = row.select_one('span:not(.font-bold)')
                if value_span:
                    value = clean_text(value_span.text)
                    if label == 'Billing':
                        data['billing'] = value
                    elif label == 'Weight':
                        data['weight_class'] = value
                    elif label == 'Title Bout':
                        data['title_bout'] = value
                    elif label == 'Duration':
                        data['duration'] = value
    
    return data

def scrape_fighter(url):
    print(f"Scraping {url}...")
    try:
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code != 200:
            print(f"Failed to fetch {url}: {resp.status_code}")
            return None
        
        soup = BeautifulSoup(resp.content, 'html.parser')
        
        # Name
        name_h1 = soup.select_one('div.fighterBoutInfo h1')
        # If not standard header, try page title or other parse
        name = "Unknown"
        if soup.select_one('title'):
            name = soup.select_one('title').text.split('|')[0].strip()

        # Fight History
        # section.fighterFightResults #proResults
        pro_results = soup.select('#proResults > div[data-fighter-bout-target="bout"]')
        
        fights = []
        for bout in pro_results:
            fight_data = parse_bout(bout)
            fights.append(fight_data)
            
        print(f"  Found {len(fights)} fights.")
        
        # Gym/Affiliation (from top stats)
        gym = "Unknown"
        # Often in ul.check-list or similar stats area. Leaving simple for now or scraping if easy.
        # Tapology header stats are tricky.
        
        return {
            "name": name,
            "url": url,
            "fights": fights
        }

    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return None

def main():
    all_data = []
    
    for target in TARGETS:
        url = target['url']
        data = scrape_fighter(url)
        
        # If scraping failed (likely 302 or 404), try searching
        if not data or not data.get('fights'):
            print(f"Direct fetch failed or empty for {target['name']}. Trying search fallback...")
            new_url = search_fighter_url(target['name'])
            if new_url and new_url != url:
                print(f"  Found new URL: {new_url}")
                time.sleep(random.uniform(2.0, 4.0))
                data = scrape_fighter(new_url)
        
        if data and data.get('fights'):
            all_data.append(data)
        else:
            print(f"Failed to get data for {target['name']}")
            
        time.sleep(random.uniform(3.0, 6.0)) # Be polite
        
    output_file = "data/rizin_fighters_rich.json"
    with open(output_file, "w", encoding='utf-8') as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
        
    print(f"Done. Saved rich data to {output_file}")

if __name__ == "__main__":
    main()
