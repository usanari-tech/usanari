import asyncio
import csv
import os
from playwright.async_api import async_playwright

async def extract_sns_links(page, user_url):
    """
    Extracts SNS links from a user's profile page.
    """
    try:
        await page.goto(user_url, wait_until="networkidle")
        
        # Selectors for SNS links
        # User-specific SNS container found via investigation: .css-1hyr0v9
        sns_links = {
            "twitter": "",
            "instagram": "",
            "tiktok": "",
            "youtube": "",
            "other": []
        }
        
        # Target the specific container for user SNS links
        container = await page.query_selector('.css-1hyr0v9')
        if container:
            links = await container.query_selector_all('a.chakra-link')
            for link in links:
                href = await link.get_attribute('href')
                if not href:
                    continue
                
                if 'twitter.com' in href or 'x.com' in href:
                    sns_links["twitter"] = href
                elif 'instagram.com' in href:
                    sns_links["instagram"] = href
                elif 'tiktok.com' in href:
                    sns_links["tiktok"] = href
                elif 'youtube.com' in href:
                    sns_links["youtube"] = href
                elif any(domain in href for domain in ['lit.link', 'linktr.ee']):
                    sns_links["other"].append(href)
        
        # Extract user name (consistent selector for name: .css-1tfct9s)
        name_elem = await page.query_selector('.css-1tfct9s')
        name = await name_elem.inner_text() if name_elem else "Unknown"
        
        return {
            "name": name.strip(),
            "url": user_url,
            "twitter": sns_links["twitter"],
            "instagram": sns_links["instagram"],
            "tiktok": sns_links["tiktok"],
            "youtube": sns_links["youtube"],
            "other": ", ".join(sns_links["other"])
        }
    except Exception as e:
        print(f"Error processing {user_url}: {e}")
        return None

async def main():
    base_url = "https://lipscosme.com/project_lips"
    user_urls = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        # Phase 1: Collect User URLs from all pages
        print("Collecting user URLs...")
        current_page = 1
        while True:
            url = f"{base_url}?page={current_page}"
            print(f"Scanning page {current_page}: {url}")
            await page.goto(url, wait_until="networkidle")
            
            user_links = await page.query_selector_all('a.UsersListLarge__link')
            if not user_links:
                break
                
            for link in user_links:
                href = await link.get_attribute('href')
                if href:
                    full_url = f"https://lipscosme.com{href}" if href.startswith('/') else href
                    if full_url not in user_urls:
                        user_urls.append(full_url)
            
            # Check if there's a next page
            next_button = await page.query_selector('a.lips-pagination__next')
            if not next_button:
                break
            current_page += 1
            
        print(f"Total users found: {len(user_urls)}")
        
        # Phase 2: Extract SNS links from each user profile
        results = []
        for i, user_url in enumerate(user_urls):
            print(f"[{i+1}/{len(user_urls)}] Processing: {user_url}")
            data = await extract_sns_links(page, user_url)
            if data:
                results.append(data)
            
            # Simple rate limiting/politeness
            await asyncio.sleep(1)
            
        # Phase 3: Save results to CSV
        output_file = "lips_users_sns.csv"
        keys = ["name", "url", "twitter", "instagram", "tiktok", "youtube", "other"]
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            dict_writer = csv.DictWriter(f, fieldnames=keys)
            dict_writer.writeheader()
            dict_writer.writerows(results)
            
        print(f"Extraction complete. Results saved to {output_file}")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
