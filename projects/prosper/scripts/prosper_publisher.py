"""
Prosper Publisher V10 - Final Edition
=====================================
Note自動投稿スクリプトの完成形。
- テキスト入力: insert_textでIME回避
- 機能適用: +メニューを直接操作（見出し、リスト、引用、区切り線）
- 画像: [IMAGE]: path で本文挿入
- バナー: [BANNER]: path で見出し画像設定
- 拡張: [TOC], <!-- PAYWALL -->, URL埋め込み対応
"""

import os
import re
import asyncio
from playwright.async_api import async_playwright

# ---------------------------------------------------------
# 設定
# ---------------------------------------------------------
ARTICLE_PATH = "/Users/yukinari/Desktop/antigravity/projects/prosper/article_001_fight_club_marketing.md"
USER_DATA_DIR = "/Users/yukinari/Desktop/antigravity/projects/prosper/.note_user_data"

class ProsperPublisherV10:
    def __init__(self, article_path):
        self.article_path = article_path
        self.title = ""
        self.banner_path = None # バナー画像パス
        self.lines = []
        self.page = None

    def parse_markdown(self):
        """Markdownを読み込み、内部形式に変換する"""
        if not os.path.exists(self.article_path):
            print(f"エラー: ファイルが見つかりません: {self.article_path}", flush=True)
            return False

        with open(self.article_path, "r", encoding="utf-8") as f:
            raw_lines = f.readlines()

        self.lines = []
        base_dir = os.path.dirname(self.article_path)

        for line in raw_lines:
            line = line.rstrip('\r\n')
            
            # バナー画像: [BANNER]: path
            if line.startswith("[BANNER]:"):
                rel_path = line.replace("[BANNER]:", "").strip()
                self.banner_path = os.path.abspath(os.path.join(base_dir, rel_path))
                continue

            # タイトル（H1）は別扱い（最初の#のみ）
            if line.startswith('# ') and not line.startswith('## '):
                self.title = line[2:].strip()
                continue
            
            # 画像行: ![alt](path) -> [IMAGE]: absolute_path
            img_match = re.match(r'!\[.*?\]\((.*?)\)', line)
            if img_match:
                rel_path = img_match.group(1)
                # 絶対パスに変換
                abs_path = os.path.abspath(os.path.join(base_dir, rel_path))
                self.lines.append(f"[IMAGE]: {abs_path}")
                continue
            
            self.lines.append(line)

        print(f"パース完了: タイトル='{self.title}', バナー={'あり' if self.banner_path else 'なし'}", flush=True)
        return True

    async def paste_text(self, text: str):
        """
        テキストを直接挿入する（最も安全な方法）。
        クリップボードもIMEも経由せず、ブラウザにテキストイベントを送信する。
        """
        await self.page.keyboard.insert_text(text)
        await asyncio.sleep(0.1)

    async def click_plus_menu(self, menu_item_text: str):
        """+メニューを開いて指定の項目をクリックするヘルパー"""
        plus_button = await self.page.query_selector('button[aria-label="メニューを開く"]')
        if plus_button:
            await plus_button.click()
            await asyncio.sleep(0.5) # メニュー展開待ち
            
            menu_btn = await self.page.query_selector(f'button:has-text("{menu_item_text}")')
            if menu_btn:
                await menu_btn.click()
                await asyncio.sleep(1.0) # 実行待ち
                return True
        return False

    async def publish(self):
        async with async_playwright() as p:
            print(">>> Prosper Publisher V10 起動 (Final Edition)", flush=True)
            
            context = await p.chromium.launch_persistent_context(
                user_data_dir=USER_DATA_DIR,
                headless=False,
                args=["--start-maximized"]
            )
            self.page = await context.new_page()
            await self.page.goto("https://note.com/notes/new")

            # エディタ準備待機
            print(">>> エディタの準備を待機中...", flush=True)
            try:
                await self.page.wait_for_selector(
                    'textarea[placeholder*="タイトル"], div[contenteditable="true"]',
                    timeout=300000
                )
            except:
                print(">>> タイムアウト: エディタが見つかりませんでした", flush=True)
                return

            await asyncio.sleep(2)

            # バナー画像設定 (タイトル入力の前に行う)
            if self.banner_path:
                print(f">>> バナー画像設定: {self.banner_path}", flush=True)
                
                # ユーザー情報により 'aria-label="画像を追加"' が正解と判明。
                # ただし複数ある可能性があるため、query_selector_allで取得し、
                # 最初の方（ヘッダー付近）にあるものを対象にする。
                buttons = await self.page.query_selector_all('button[aria-label="画像を追加"]')
                target_btn = None
                
                if buttons:
                    # 一番上のボタンを採用
                    target_btn = buttons[0]
                    print("   >>> '画像を追加' ボタンを発見しました。", flush=True)
                
                if target_btn:
                    await target_btn.click()
                    await asyncio.sleep(1.0)
                    
                    # メニューが開いたと仮定
                    async with self.page.expect_file_chooser() as fc_info:
                        # "画像をアップロード" というテキストを持つ要素を探す
                        # 親がbuttonである可能性が高いので、buttonを優先的に探す
                        upload_btn = await self.page.query_selector('button:has-text("画像をアップロード")')
                        
                        if not upload_btn:
                            # なければdivで探す
                             upload_btn = await self.page.query_selector('div:has-text("画像をアップロード")')
                        
                        if upload_btn:
                            print("   >>> '画像をアップロード' メニューをクリックします。", flush=True)
                            await upload_btn.click()
                            
                            file_chooser = await fc_info.value
                            await file_chooser.set_files(self.banner_path)
                            print("   >>> 画像ファイルを選択しました。保存ボタンの表示を待ちます...", flush=True)
                            await asyncio.sleep(2.0) # モーダル表示待ち
                            
                            # トリミング/確認画面の「保存」ボタンを押す
                            # セレクタが効かないため、全ボタンを走査してテキストマッチで探す物理的アプローチ
                            # 注意: ヘッダーの「下書き保存」を誤クリックしないよう、逆順（DOMの後ろから）かつ完全一致で探す
                            
                            await asyncio.sleep(2.0)
                            print("   >>> 保存ボタン全検索（逆順）開始...", flush=True)

                            buttons = await self.page.query_selector_all('button')
                            clicked = False
                            
                            # 逆順にループ
                            for btn in reversed(buttons):
                                # inner_textを取得して判定
                                text = await btn.inner_text()
                                # 空白削除して完全一致確認
                                if text.strip() == "保存":
                                    print(f"   >>> '保存' ボタンを発見 (Text: {text})。クリックします。", flush=True)
                                    await btn.click(force=True)
                                    clicked = True
                                    break
                            
                            if not clicked:
                                print("   >>> エラー: '保存' ボタンが見つかりませんでした。", flush=True)

                            await asyncio.sleep(5.0) # 適用待ち

                        else:
                            print("   >>> エラー: 「画像をアップロード」メニューが見つかりません。", flush=True)
                else:
                    print("   >>> エラー: '画像を追加' ボタンが見つかりません。", flush=True)

            # タイトル入力
            if self.title:
                print(f">>> タイトル設定: {self.title[:30]}...", flush=True)
                title_area = await self.page.query_selector('textarea[placeholder*="タイトル"]')
                if title_area:
                    await title_area.fill(self.title)
                    await self.page.keyboard.press("Tab")
                    await asyncio.sleep(1)

            # 本文エリアにフォーカス
            editor_selector = 'div[contenteditable="true"][role="textbox"]'
            await self.page.click(editor_selector)
            await asyncio.sleep(0.5)

            # 行を順番に入力
            total = len(self.lines)
            in_list_mode = False # リストモード管理

            for i, line in enumerate(self.lines):
                progress = int((i + 1) / total * 100)
                # ログ表示用
                log_line = line[:30] + "..." if len(line) > 30 else line
                print(f"[{progress:3d}%] 行 {i+1}/{total}: {log_line} (ListMode: {in_list_mode})", flush=True)

                stripped_line = line.strip()

                # --- 1. 空行処理 ---
                if stripped_line == "":
                    if in_list_mode:
                        # リストモード中に空行 → リスト終了（Enter x 2）
                        await self.page.keyboard.press("Enter")
                        in_list_mode = False
                    else:
                        await self.page.keyboard.press("Enter")
                    await asyncio.sleep(0.3)
                    continue

                # --- 2. 機能ブロック検出 & 適用 ---

                # [IMAGE] 画像アップロード
                if stripped_line.startswith("[IMAGE]:"):
                    if in_list_mode:
                        await self.page.keyboard.press("Enter")
                        in_list_mode = False
                    
                    image_path = stripped_line.replace("[IMAGE]:", "").strip()
                    print(f"   >>> 画像アップロード開始: {image_path}", flush=True)
                    
                    if not os.path.exists(image_path):
                        print(f"   >>> エラー: 画像ファイルが見つかりません: {image_path}", flush=True)
                        continue

                    # ファイル選択ダイアログを待ち受ける
                    async with self.page.expect_file_chooser() as fc_info:
                        # +メニュー -> 画像 をクリック
                        await self.click_plus_menu("画像")
                    
                    file_chooser = await fc_info.value
                    await file_chooser.set_files(image_path)
                    
                    # アップロードと表示待ち (少し長めに)
                    await asyncio.sleep(5.0)
                    
                    # 画像後はカーソルが画像の右または下にあるはず。Enterで次へ
                    await self.page.keyboard.press("Enter")
                    continue

                # [TOC] 目次
                if stripped_line == "[TOC]":
                    if in_list_mode:
                        await self.page.keyboard.press("Enter")
                        in_list_mode = False
                    
                    await self.click_plus_menu("目次")
                    await self.page.keyboard.press("Enter")
                    await asyncio.sleep(0.5)
                    continue

                # <!-- PAYWALL --> 有料エリア
                if "<!-- PAYWALL -->" in stripped_line:
                    if in_list_mode:
                        await self.page.keyboard.press("Enter")
                        in_list_mode = False
                    
                    await self.click_plus_menu("有料エリア指定")
                    await asyncio.sleep(1.0)
                    continue

                # --- 区切り線 (---) ---
                if stripped_line in ['---', '***', '___']:
                    if in_list_mode:
                        await self.page.keyboard.press("Enter")
                        in_list_mode = False
                    
                    # 区切り線メニューをクリック
                    await self.click_plus_menu("区切り線")
                    await asyncio.sleep(0.5)
                    await self.page.keyboard.press("Enter")
                    continue

                # --- 見出し (H2: ##, H3: ###) ---
                # insert_textでは自動変換が効かないため、メニューから指定
                if stripped_line.startswith('## '):
                    if in_list_mode:
                        await self.page.keyboard.press("Enter")
                        in_list_mode = False
                    
                    content = stripped_line[3:] # "## " 除去
                    await self.click_plus_menu("大見出し")
                    await self.paste_text(content)
                    await self.page.keyboard.press("Enter")
                    await asyncio.sleep(0.5)
                    continue
                
                if stripped_line.startswith('### '):
                    if in_list_mode:
                        await self.page.keyboard.press("Enter")
                        in_list_mode = False
                    
                    content = stripped_line[4:] # "### " 除去
                    await self.click_plus_menu("小見出し")
                    await self.paste_text(content)
                    await self.page.keyboard.press("Enter")
                    await asyncio.sleep(0.5)
                    continue

                # --- 引用 (> ) ---
                if stripped_line.startswith('> '):
                    if in_list_mode:
                        await self.page.keyboard.press("Enter")
                        in_list_mode = False
                    
                    content = stripped_line[2:] # "> " 除去
                    await self.click_plus_menu("引用")
                    await self.paste_text(content)
                    await self.page.keyboard.press("Enter")
                    await asyncio.sleep(0.5)
                    continue

                # --- 箇条書きリスト (- / *) ---
                if stripped_line.startswith(('- ', '* ')):
                    content = stripped_line[2:] # "- " 除去
                    
                    if in_list_mode:
                        await self.paste_text(content)
                    else:
                        await self.click_plus_menu("箇条書きリスト")
                        await self.paste_text(content)
                        in_list_mode = True # モードON
                    
                    await self.page.keyboard.press("Enter")
                    await asyncio.sleep(0.5)
                    continue

                # --- 番号付きリスト (1. ) ---
                if re.match(r'^\d+\.\s', stripped_line):
                    content = re.sub(r'^\d+\.\s', '', stripped_line) # "1. " 除去
                    
                    if in_list_mode:
                         await self.paste_text(content)
                    else:
                        await self.click_plus_menu("番号付きリスト")
                        await self.paste_text(content)
                        in_list_mode = True
                        
                    await self.page.keyboard.press("Enter")
                    await asyncio.sleep(0.5)
                    continue

                # --- 通常テキスト・埋め込み ---
                if in_list_mode:
                    # リストモード終了
                    await self.page.keyboard.press("Enter")
                    in_list_mode = False
                    await asyncio.sleep(0.2)
                
                # 太字行の処理 (**text**)
                # NoteはMarkdownの太字を自動変換しないため、手動でCmd+Bを入れる
                bold_match = re.match(r'^\*\*(.+?)\*\*$', stripped_line)
                if bold_match:
                    content = bold_match.group(1)
                    # 1. テキスト入力
                    await self.paste_text(content)
                    await asyncio.sleep(0.2)
                    
                    # 2. 全選択 (行末にいるのでShift+Cmd+Left)
                    await self.page.keyboard.down("Shift")
                    await self.page.keyboard.down("Meta")
                    await self.page.keyboard.press("ArrowLeft")
                    await self.page.keyboard.up("Meta")
                    await self.page.keyboard.up("Shift")
                    await asyncio.sleep(0.2)

                    # 3. 太字ショートカット (Cmd+B) -> 選択範囲が太字になる
                    await self.page.keyboard.press("Meta+b")
                    await asyncio.sleep(0.2)

                    # 4. 選択解除 (右矢印) -> カーソルはまだ「太字モード」のまま
                    await self.page.keyboard.press("ArrowRight")
                    await asyncio.sleep(0.2)

                    # 5. 太字モード解除 (ここでもう一度Cmd+Bし、以降の入力をRegularに戻す)
                    await self.page.keyboard.press("Meta+b")
                    await asyncio.sleep(0.2)
                    
                    # 6. 改行
                    await self.page.keyboard.press("Enter")
                    await asyncio.sleep(0.5)
                    continue

                # 埋め込み(URL)の場合
                if stripped_line.startswith("http"):
                     await self.paste_text(stripped_line)
                     await self.page.keyboard.press("Enter")
                     await asyncio.sleep(2.0) # カード化待機
                else:
                     await self.paste_text(line) # stripせず元のインデント等を維持しても良いが、今回は基本strip
                     await self.page.keyboard.press("Enter")

                await asyncio.sleep(0.5)
            
            print(">>> 完了！下書きを確認してください。", flush=True)
            print(">>> 30秒後にブラウザを閉じます...", flush=True)
            
            try:
                await asyncio.sleep(30)
            except asyncio.CancelledError:
                pass
            
            print(">>> ブラウザを閉じています...", flush=True)
            await context.close()
            print(">>> 正常終了しました。", flush=True)

if __name__ == "__main__":
    publisher = ProsperPublisherV10(ARTICLE_PATH)
    if publisher.parse_markdown():
        try:
            asyncio.run(publisher.publish())
        except KeyboardInterrupt:
            print("\n>>> ユーザーによる中断。", flush=True)
