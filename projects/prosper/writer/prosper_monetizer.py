import os
import argparse
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), "../../.env")
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

class ProsperMonetizer:
    def __init__(self, model_name=None):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("API Key not found in .env")
        
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model_name or "models/gemini-2.5-flash"

    def _read_file(self, path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def monetarize_draft(self, draft_path, affiliate_links=None):
        draft_content = self._read_file(draft_path)
        
        print(f">>> [Prosper Monetizer] Analyzing draft for maximum revenue: {os.path.basename(draft_path)}")
        print(f"    Model: {self.model_name}")

        instructions = self._analyze_for_monetization(draft_content, affiliate_links)
        
        if not instructions:
            print("❌ Failed to analyze draft. Fallback to manual insertion.")
            return None

        print("    [Injecting] Applying Paywall and Affiliate links...")
        monetized_text = self._apply_instructions(draft_content, instructions)

        # Save
        base, ext = os.path.splitext(draft_path)
        output_path = f"{base}_Monetized{ext}"
        
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(monetized_text)
            
        print(f">>> 💰 Monetized draft saved to: {output_path}")
        return output_path

    def _analyze_for_monetization(self, content, affiliate_links_json):
        if not affiliate_links_json:
            affiliate_links_json = """[
                {"id": "biz_tool", "url": "https://example.com/b2b-saas", "context": "BtoBツール、コンサル、効率化の文脈"},
                {"id": "general_book", "url": "https://example.com/amazon-book", "context": "関連書籍や一般教養"}
            ]"""

        prompt = f"""
        あなたは最高峰の「ダイレクトレスポンス・コピーライター」兼「Note.comの収益化プロデューサー」です。
        以下の記事原稿を読み、**「どこに有料線(Paywall)を引くか」**と**「どこにアフィリエイトリンクを置くか」**を決定してください。

        【記事原稿】
        {content[:40000]}

        【ミッション】
        1. **Paywall (有料マガジンへの誘導)**:
           - 記事の中で「最も価値があり、読者がどうしても知りたいと思う核心部分（例えば、裏データ、非公開リスト、具体的な実装ステップなど）」の直前の見出し（H2）を見つけてください。
           - その見出しの直前に挿入する、読者を強烈に煽る「強力なフック（Lead-in text）」を考えてください。
        2. **Affiliate (高単価送客)**:
           - 記事の文脈に最も合うアフィリエイトリンクを以下の候補から選び、記事の結論部（ネクストアクション）に挿入するための説明文を書いてください。
           - 候補: {affiliate_links_json}

        【出力ルール (JSONのみ)】
        以下のJSON形式で出力してください。文字列の完全一致でPythonが置換(Replace)を行います。
        {{
            "paywall": {{
                "target_header_exact_match": "## 核心のインサイト（※例。原稿の中に実際に存在する見出しを正確にコピーして指定）",
                "lead_in_hook": "ここから先は、今回の調査で判明した未公開データと、具体的なアクションプランを公開します。競合に差をつけたい方のみお読みください。\\n\\n",
                "insert_type": "before"
            }},
            "affiliate": [
                {{
                    "target_paragraph_exact_match": "## 結論とネクストアクション（※例。原稿の中に実際に存在する見出しをコピー）",
                    "pitch_text": "\\n\\n本気でこの課題を解決したいなら、以下の公式ツールがもっとも費用対効果が高いです。\\n",
                    "url": "https://example.com/b2b-saas",
                    "insert_type": "after"
                }}
            ]
        }}
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2 # 確実なJSON出力とマッチングのため低めに
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error calling Gemini API for monetization: {e}")
            return None

    def _apply_instructions(self, content, instructions):
        new_content = content
        
        # 1. Apply Paywall
        try:
            pw = instructions["paywall"]
            target = pw["target_header_exact_match"]
            hook = pw["lead_in_hook"]
            
            if target in new_content:
                # Insert hook and <!-- PAYWALL --> before the target header
                injection = f"{hook}\n\n<!-- PAYWALL -->\n\n{target}"
                new_content = new_content.replace(target, injection, 1) # Replace only the first occurrence
            else:
                print(f"    [Warning] Paywall target header '{target}' not found. Skipping paywall.")
        except KeyError as e:
            print(f"    [Warning] Paywall instructions parsing failed: {e}")

        # 2. Apply Affiliate Links
        try:
            affiliates = instructions.get("affiliate", [])
            for aff in affiliates:
                target = aff["target_paragraph_exact_match"]
                pitch = aff["pitch_text"]
                url = aff["url"]
                
                # Note.com Publisher V10 renders plain URLs on a new line as cards.
                injection = f"{target}\n{pitch}\n\n{url}\n\n"
                
                if target in new_content:
                    if aff.get("insert_type") == "after":
                        new_content = new_content.replace(target, injection, 1)
                    else:
                        pass # Default handled above
                else:
                    print(f"    [Warning] Affiliate target '{target}' not found. Fallback to append at the end.")
                    new_content += f"\n\n---\n\n{pitch}\n\n{url}\n\n"
                    
        except KeyError as e:
            print(f"    [Warning] Affiliate instructions parsing failed: {e}")

        return new_content

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Prosper Monetizer (Auto Paywall & Affiliate Injection)")
    parser.add_argument("draft", help="Path to markdown draft")
    parser.add_argument("--affiliates", help="Path to JSON file containing affiliate links catalog (optional)", default=None)
    args = parser.parse_args()
    
    aff_links = None
    if args.affiliates and os.path.exists(args.affiliates):
        with open(args.affiliates, "r", encoding="utf-8") as f:
             aff_links = f.read()

    monetizer = ProsperMonetizer()
    monetizer.monetarize_draft(args.draft, affiliate_links=aff_links)
