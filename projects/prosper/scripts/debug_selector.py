
import asyncio
from playwright.async_api import async_playwright

USER_DATA_DIR = "/Users/yukinari/Desktop/antigravity/projects/prosper/.note_user_data"

async def inspect():
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=USER_DATA_DIR,
            headless=False, # 目視もできるように
            args=["--start-maximized"]
        )
        page = await context.new_page()
        await page.goto("https://note.com/notes/new")
        
        # エディタ待機
        try:
            await page.wait_for_selector('textarea[placeholder*="タイトル"]', timeout=30000)
        except:
            print("timeout")
            return

        print(">>> 調査開始: タイトル周辺のHTMLをダンプします")
        
        # タイトルの親要素などを取得して表示
        # 一般的に記事エディタのヘッダー部分にあるはず
        
        # main要素の中身を少し探る
        buttons = await page.query_selector_all('button')
        print(f"Total buttons: {len(buttons)}")
        
        for i, btn in enumerate(buttons):
            label = await btn.get_attribute("aria-label")
            text = await btn.inner_text()
            print(f"Button {i}: Label='{label}', Text='{text}'")

        # iconっぽいものを探す
        images = await page.query_selector_all('img, svg')
        print(f"Images/SVGs found: {len(images)}")
        
        # o-noteEYecatch を含む要素を探す
        eyecatch = await page.query_selector('.o-noteEYecatch')
        if eyecatch:
            print("Found .o-noteEYecatch class!")
            html = await eyecatch.inner_html()
            print(html[:200])
        else:
            print("Not found .o-noteEYecatch")
            
        # タイトルエリアの前の要素を探る
        title_area = await page.query_selector('textarea[placeholder*="タイトル"]')
        
        # 30秒待機（手動確認用）
        await asyncio.sleep(30)
        await context.close()

if __name__ == "__main__":
    asyncio.run(inspect())
