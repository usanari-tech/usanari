import asyncio
import os
import time
from datetime import datetime
from google import genai
from google.genai import types

import sys
from dotenv import load_dotenv

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRAFTS_DIR = os.path.join(PROJECT_ROOT, "writer", "drafts")
RULES_FILE = os.path.join(PROJECT_ROOT, "RULES.md")

env_path = os.path.join(PROJECT_ROOT, ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

class NarrativeWriter:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.client = genai.Client(api_key=self.api_key)
        self.rules_text = self._load_rules()

    def _load_rules(self):
        with open(RULES_FILE, 'r', encoding='utf-8') as f:
            return f.read()

    def draft_essay(self):
        prompt = f"""
        [指示]
        あなたは「全自動AIメディア」の開発に心血を注いできた、泥臭いエンジニア兼クリエイターです。
        以下の【執筆テーマと実際の苦労話】をもとに、読者の心を打ち、最後には「このコードが欲しい！」と思わせる1万字相当の**超大作ディープエッセイ＆技術解説記事**を執筆してください。

        【執筆テーマと実際の苦労話】
        タイトル案：Note完全自動化の果てに見た「AIとDOMの格闘」。画像を強制クロップし、謎のフリーズをJSでぶん殴るまでの全記録
        
        内容に絶対に含めるべき「私たちのリアルな死闘」：
        1. **「ただAIに書かせれば終わる」というインフルエンサー的な幻想の破壊。** 実際はAPI制限、マークダウンの崩れ、プラットフォームの仕様という壁の連続だったこと。
        2. **第1の絶望：画像のアスペクト比問題。**
           - DALL-EやMidjourney(今回はGoogle Imagen)で生成した1024x1024の正方形画像が、Noteのヘッダー画像（1280x670の16:9）に設定されると、中心がズレて「見切れた悲惨な画像」になる絶望感。
           - 解決策として、`sips` コマンドを使った強制1280x670への切り抜き（Crop）の自動化パイプラインを組んだ泥臭い話。
        3. **第2の絶望：Noteの独自マークダウンの罠**
           - 良かれと思ってAIが使う `**`（太字）や `####`（H4）が、Noteのエディタ上ではパースされず、そのままの文字列で露出してしまう恥ずかしさ。
           - 解決策：生成AIのプロンプトレベルで特定マークダウンを「禁止」し、文脈だけで強調表現をする運用へのパラダイムシフト。
        4. **最大の絶望：収益化（Paywall）直後のフォーカス消失バグ**
           - Playwrightで一番肝心な `<!-- PAYWALL -->` を挿入した直後、NoteのDOMがカーソルを見失いフリーズ。一番売りたい「有料部分の超重要コンテンツ」が一切書き込まれないという最悪のバグ。
           - 解決策：JSの強制発火（`document.querySelector('div[contenteditable="true"]').focus()`からSelectionオブジェクトを使った激しいDOMハック）による強引な復帰処理。
        
        [記事の構成と有料化への誘導]
        - 前半は完全にエッセイ調。「あぁ、エンジニアあるあるだ...」「自動化ってそんなに辛いのか」と読者を強烈に共感させる。
        - 記事の途中に必ず `<!-- PAYWALL -->` を挿入すること。
        - 有料部分（Paywall以降）では、「全てを解決し、今この瞬間も全自動でNoteを生成・投稿し続けている『prosper_publisher.py』の完全なソースコード」を提供するというテイストで、熱狂的な価値を提供する。（※実際のコードはダミーでもいいので、コードブロックを用意して「ここに全てがある」と語ること）。

        [Reference Rules]
        {self.rules_text}
        
        生成AIの定型文（「まとめると...」「〜と言えるでしょう」）を一切排除し、血の通った、泥臭く、しかし最後には技術でねじ伏せるカタルシスを感じる文章で構成してください。
        必ずMarkdown形式で出力してください。
        """
        
        print(f"[Narrative Writer] Drafting real-experience essay on Note Automation...")
        try:
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                )
            )
            return response.text
        except Exception as e:
            print(f"Error generating essay: {e}")
            return None

    def save_draft(self, content):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_Note_Automation_Struggle_Essay.md"
        filepath = os.path.join(DRAFTS_DIR, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"[Narrative Writer] Saved intense essay draft to: {filename}")
        return filepath

async def main():
    writer = NarrativeWriter()
    content = writer.draft_essay()
    if content:
         writer.save_draft(content)

if __name__ == "__main__":
    asyncio.run(main())
