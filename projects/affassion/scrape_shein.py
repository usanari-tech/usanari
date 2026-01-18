import asyncio
import random
import json
from playwright.async_api import async_playwright

# ターゲット検索ワードリスト
TARGET_ITEMS = [
    {"id": "pickup-1", "term": "polyresin vase", "category": "interior"},
    {"id": "pickup-2", "term": "strawberry vase", "category": "interior"},
    {"id": "article-1", "term": "geometric vase", "category": "architecture"},
    {"id": "article-2", "term": "bow ceramic vase", "category": "style"},
    {"id": "collection-1", "term": "pleated table lamp", "category": "collection"},
    {"id": "collection-2", "term": "irregular wavy mirror", "category": "collection"},
]

BASE_URL = "https://jp.shein.com/pdsearch/"

async def run():
    async with async_playwright() as p:
        print("🚀 ブラウザを起動します...")
        
        browser = await p.chromium.launch(
            headless=False, 
            args=['--disable-blink-features=AutomationControlled']
        )
        
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1280, 'height': 800},
            locale='ja-JP'
        )
        
        await context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        """)

        page = await context.new_page()

        # 初回アクセス（CAPTCHA対策のため、まずはトップページか適当な検索へ）
        print(f"🌐 初回アクセス: SHEIN Top...")
        await page.goto("https://jp.shein.com/", wait_until='domcontentloaded')
        
        print("\n" + "="*50)
        print("✋ 一時停止中: ブラウザを確認してください。")
        print("   - ポップアップが出ていれば閉じてください。")
        print("   - パズル認証(CAPTCHA)があれば手動で解いてください。")
        print("   準備ができたら、このターミナルで [Enterキー] を押してください。")
        print("="*50 + "\n")
        input(">> 準備完了したらEnterを押して続行: ")

        extracted_data = []

        for item in TARGET_ITEMS:
            term = item["term"]
            url = f"{BASE_URL}{term}"
            print(f"\n🔍 検索中: {term} -> {url}")
            
            try:
                await page.goto(url, wait_until='domcontentloaded')
                await page.wait_for_timeout(random.randint(2000, 4000))
                
                # スクロールして画像ロードを誘発
                await page.evaluate("window.scrollBy(0, 500)")
                await page.wait_for_timeout(1000)

                # 商品リスト待機
                # S-product-item__wrapper などを探す
                product = page.locator('.S-product-item, .product-card').first
                
                # タイムアウト付きで要素確認
                if await product.count() > 0:
                    print("   📦 商品検出")
                    
                    # データ取得 (Selectors fallbacks)
                    try:
                        name_el = product.locator('.S-product-item__name a, .goods-title-link').first
                        price_el = product.locator('.S-product-item__price, .product-price__value').first
                        img_el = product.locator('.S-product-item__img-container img, .product-card__img img').first
                        
                        name = await name_el.text_content()
                        price = await price_el.text_content()
                        # src属性だけでなく data-src も確認（LazyLoad対策）
                        img_src = await img_el.get_attribute('src')
                        if not img_src or "data:image" in img_src:
                             img_src = await img_el.get_attribute('data-src')

                        # Absolute URL for SHEIN usually needed? No, src usually full or protocol relative
                        if img_src and img_src.startswith('//'):
                            img_src = 'https:' + img_src

                        # Link to product
                        link_href = await name_el.get_attribute('href')
                        if link_href and link_href.startswith('/'):
                            link_href = 'https://jp.shein.com' + link_href

                        print(f"   ✅ 取得成功: {name.strip()[:20]}... / {price.strip()}")
                        
                        extracted_data.append({
                            "id": item["id"],
                            "name": name.strip(),
                            "price": price.strip(),
                            "image": img_src,
                            "category": item["category"],
                            "description": f"Extracted from search: {term}",
                            "sheinUrl": link_href
                        })

                    except Exception as e:
                        print(f"   ⚠️ データ抽出失敗: {e}")
                else:
                    print("   ❌ 商品が見つかりませんでした")
                    
            except Exception as e:
                print(f"   ⚠️ ページ遷移エラー: {e}")

        print("\n💾 データを保存します...")
        with open('src/data/scraped_raw.json', 'w', encoding='utf-8') as f:
            json.dump(extracted_data, f, indent=2, ensure_ascii=False)
        
        print("🎉 全処理完了。ブラウザを閉じます。")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
