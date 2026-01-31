import os
import argparse
import json
import time
import datetime
from google import genai
from google.genai import types
from dotenv import load_dotenv

# 環境変数の読み込み
env_path = os.path.join(os.path.dirname(__file__), "../../../.env")
print(f"DEBUG: Looking for .env at: {os.path.abspath(env_path)}")
print(f"DEBUG: Exists? {os.path.exists(env_path)}")

if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv() # Fallback to default

class ProsperInvestigator:
    def __init__(self, model_name=None):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("API Key not found in .env (GEMINI_API_KEY or GOOGLE_API_KEY)")
        
        self.client = genai.Client(api_key=self.api_key)
        
        # モデル優先順位リスト
        # ユーザー指定があればそれを最優先、なければデフォルト順
        if model_name:
            primary = f"models/{model_name}" if not model_name.startswith("models/") else model_name
            self.model_candidates = [primary, "models/gemini-2.5-flash", "models/gemini-2.5-flash-lite"]
            # 重複削除 (順序保持)
            self.model_candidates = list(dict.fromkeys(self.model_candidates))
        else:
            self.model_candidates = ["models/gemini-2.5-flash", "models/gemini-2.5-flash-lite"]
            
        self.current_model_index = 0
        self.model_name = self.model_candidates[0]
            
        print(f"DEBUG: Initialized with model priority: {self.model_candidates}")
        self.research_rules = self._load_rules()
        self.dry_run = False # Default

    def _switch_model(self):
        """次のモデルに切り替える。切り替え不可ならFalseを返す"""
        if self.current_model_index + 1 < len(self.model_candidates):
            self.current_model_index += 1
            self.model_name = self.model_candidates[self.current_model_index]
            print(f"   [System] ⚠️ Quota Exceeded. Switching to fallback model: {self.model_name}")
            return True
        return False

    def _generate_with_fallback(self, contents, config=None, use_tools=False):
        """API呼び出しのラッパー。429エラー時にモデルを切り替えてリトライする"""
        while True:
            try:
                # Tool指定がある場合のConfig構築
                # 引数 config があればそれを使うが、use_tools=Trueなら強制的にSearchツールを入れる
                # (既存コードの整合性のため、config引数を優先しつつ、toolsが必要な場合は専用に作る)
                
                final_config = config
                if use_tools:
                     final_config = types.GenerateContentConfig(
                        tools=[types.Tool(google_search=types.GoogleSearch())]
                    )

                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=contents,
                    config=final_config
                )
                return response
                
            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    print(f"   [Quota] Limit reached for {self.model_name}.")
                    if self._switch_model():
                        print("   [Retry] Retrying with new model in 5s...")
                        time.sleep(5)
                        continue # Retry loop
                    else:
                        print("   [Quota] All models exhausted. Giving up.")
                        raise e # そのまま例外を投げて上位で保存処理させる
                else:
                    raise e # その他のエラーは即座に投げる

    def _load_rules(self):
        """RESEARCH_RULES.mdを読み込む"""
        try:
            with open("projects/prosper/investigator/RESEARCH_RULES.md", "r", encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            return "No specific rules found."

    def plan_research(self, theme, use_ai=False):
        """Phase 1: 調査計画の立案 (トピック分解)"""
        print(f"   [Planning] Analyzing theme: '{theme}'...")
        
        # Default: Use Golden Template (0 API calls)
        if not use_ai:
            print("   [Planning] Using 'Golden Template' (API-free).")
            return [
                f"{theme}の概要、基本情報、および歴史的背景",
                f"{theme}の主要な機能、技術的特徴、または核心的な要素",
                f"{theme}の市場評価、競合との比較、および独自の強み",
                f"{theme}の社会的・文化的影響、およびユーザーコミュニティの反応",
                f"{theme}に関する批判、課題、論争、または法的問題",
                f"{theme}の将来展望、長期的な遺産、および今後の予測"
            ]

        if self.dry_run:
            print("   [Dry Run] Returning mock topics.")
            return ["Mock Topic 1", "Mock Topic 2", "Mock Topic 3", "Mock Topic 4", "Mock Topic 5"]

        prompt = f"""
        あなたはプロの調査プランナーです。以下のテーマについて、徹底的な調査を行うための「調査トピックリスト」を作成してください。
        
        Theme: {theme}
        
        [Reference Rules]
        {self.research_rules}
        
        [INSTRUCTIONS]
        1. create a list of 8-10 essential research topics to cover the theme comprehensively.
        2. Ensure you cover all dimensions defined in the Rules.
        3. Output MUST be a valid JSON list of strings. Example: ["Topic 1", "Topic 2", ...]
        4. Do NOT include generic topics. Be specific to the theme.
        """
        
        response = self._generate_with_fallback(
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        try:
            topics = json.loads(response.text)
            print(f"   [Planning] Generated {len(topics)} topics.")
            for t in topics:
                print(f"      - {t}")
            return topics
        except json.JSONDecodeError:
            print("   [Error] Failed to parse planning JSON. Fallback to default topics.")
            return [f"{theme} Overview", f"{theme} History", f"{theme} Impact"]

    def conduct_deep_research(self, topic):
        """Phase 2: 個別トピックの深掘り調査 (Search Grounding)"""
        print(f"   [Researching] Digging into: '{topic}'...")
        
        prompt = f"""
        あなたは執筆者のために「生の素材」を集める調査員です。
        以下のトピックについて、Google検索を行い、**可能な限り詳細で具体的な事実**を集めてください。
        
        Topic: {topic}
        
        [INSTRUCTIONS]
        1. Use Google Search Grounding to find detailed facts, numbers, quotes, and episodes.
        2. **DO NOT SUMMARIZE.** Do not condense information. We need RAW details.
        3. If there are conflicting views, capture both.
        4. Include specific dates, names of key figures, and technical specs.
        5. Output format: Markdown (Bullet points or paragraphs).
        6. Language: Japanese (but keep English terms where appropriate).
        """
        
        # APIレート制限対策 (Free Tier/Flash RPM 5 = 12s/req -> 安全マージンで15s)
        print("      [Rate Limit] Waiting 15s...")
        time.sleep(15) 
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    tools=[types.Tool(google_search=types.GoogleSearch())]
                )
            )
            
            # Debug metadata
            if response.candidates and response.candidates[0].grounding_metadata:
                metadata = response.candidates[0].grounding_metadata
                if hasattr(metadata, 'search_entry_point') and metadata.search_entry_point:
                     # print(f"      [Debug] Search used: {metadata.search_entry_point.rendered_content[:50]}...")
                     pass

            return response.text
        except Exception as e:
            print(f"      [Error] Failed to research topic '{topic}': {e}")
            return f"Error researching {topic}: {str(e)}"

    def aggregate_report(self, theme, results):
        """Phase 3: レポート集約 (Simple Concatenation - API-free)"""
        print("   [Aggregation] Compiling final report (Concatenation)...")
        
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        report = f"# Deep Research Report: {theme}\n"
        report += f"Generated: {timestamp}\n"
        report += f"Model: {self.model_name}\n\n"
        report += "---\n\n"
        
        for topic, content in results.items():
            if content == "See above (Bundled)":
                continue
            report += f"## {topic}\n\n{content}\n\n---\n\n"
            
        return report

    def run(self, theme, output_path=None, use_ai_plan=False):
        print(f"\n>>> Starting Deep Investigation for: '{theme}'\n")
        
        # Resume Manager Init
        safe_theme = "".join([c for c in theme if c.isalnum() or c in (' ', '-', '_')]).strip().replace(' ', '_')
        timestamp = datetime.datetime.now().strftime("%Y%m%d") # 日付単位でセッション管理
        session_id = f"{timestamp}_{safe_theme}"
        resume_file = f"projects/prosper/investigator/state/{session_id}.json"
        
        state = self._load_state(resume_file)
        if state:
            print(f"   [Resume] Found saved state from {state['last_updated']}")
            topics = state['topics']
            results = state['results']
        else:
            # 1. Plan
            if use_ai_plan:
                print("   [Rate Limit] Waiting 15s before Planning (RPM limit 5)...")
                time.sleep(15)
            topics = self.plan_research(theme, use_ai=use_ai_plan)
            results = {} # バンドル単位で保存するため、keyは "Batch X" などになる可能性、あるいは展開して保存
            
            # 初期状態保存
            self._save_state(resume_file, theme, topics, results)

        # 2. Execute Loop (Bundled)
        # 未完了のトピックを特定
        # resultsのキーにトピックが含まれているかで判定...したいがバンドル化するとキーが変わる？
        # Simplify: resultsには "Topic Name": "Content" で保存し、バンドル処理時に展開して埋める。
        
        pending_topics = [t for t in topics if t not in results]
        
        if not pending_topics:
            print("   [Resume] All topics properly researched.")
        else:
            print(f"   [Progress] {len(results)}/{len(topics)} done. {len(pending_topics)} to go.")
            
            # Bundle into chunks of 5 (Aggressive Bundling)
            BUNDLE_SIZE = 5
            topic_batches = [pending_topics[i:i + BUNDLE_SIZE] for i in range(0, len(pending_topics), BUNDLE_SIZE)]
            
            total_batches = len(topic_batches)
            
            for i, batch in enumerate(topic_batches):
                print(f"   [Batch {i+1}/{total_batches}] Processing {len(batch)} topics: {batch[0][:20]}...")
                
                try:
                    batch_content = self.conduct_bundled_research(batch)
                    
                    # Split content or save as is?
                    # 簡易化のため、バッチ内の各トピックに対して同じ内容(または分割)を割り当てる
                    # ここではAIに分割出力させるが、パース失敗リスクを避けるため
                    # 「Batch Content」としてresultsには個別に保存せず、
                    # results["_BATCH_CONTENT_" + str(uuid)] みたいにするか、
                    # 単に batch[0] のキーにまとめて入れるか...
                    # Userへのレポート出力時は results.values() を結合するだけなので、
                    # results[batch[0]] = batch_content (他のキーは空) とするのがシンプル。
                    
                    results[batch[0]] = batch_content 
                    for other_topic in batch[1:]:
                        results[other_topic] = "See above (Bundled)" # マーカー
                        
                    # Save State
                    self._save_state(resume_file, theme, topics, results)
                    
                except Exception as e:
                    print(f"   [Error] Batch failed: {e}")
                    # 429 Errorならここで終了
                    if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                        print("   [Quota] API Limit Reached. Progress saved. Exiting.")
                        return None
                    # 他のエラーなら次へ
        
        # 3. Aggregate
        final_report = self.aggregate_report(theme, results)
        
        # Save Report
        if not output_path:
            timestamp_full = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = f"projects/prosper/investigator/reports/{timestamp_full}_{safe_theme}_DEEP.md"
            
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(final_report)
            
        print(f"\n>>> Investigation Complete!")
        print(f">>> Report saved to: {output_path}")
        return output_path

    def _load_state(self, path):
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None

    def _save_state(self, path, theme, topics, results):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        state = {
            "theme": theme,
            "last_updated": datetime.datetime.now().isoformat(),
            "topics": topics,
            "results": results
        }
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(state, f, ensure_ascii=False, indent=2)

    def conduct_bundled_research(self, topics):
        """3つのトピックをまとめて調査"""
        topics_str = "\n".join([f"- {t}" for t in topics])
        print(f"   [Researching] Bundled bundle...")
        
        if self.dry_run:
            print("      [Dry Run] Skipping API call. Returning mock content.")
            return f"# Bundled Content for {topics[0]}...\n(Mock Data)\n\n# {topics[1] if len(topics)>1 else 'T2'}...\n(Mock Data)"

        prompt = f"""
        あなたは執筆者のために「生の素材」を集める調査員です。
        以下の複数のトピックについて、まとめてGoogle検索を行い、詳細情報を収集してください。
        
        Target Topics:
        {topics_str}
        
        [INSTRUCTIONS]
        1. Use Google Search to find detailed facts for EACH topic.
        2. Output Format:
           # {topics[0]}
           (Details...)
           
           # {topics[1] if len(topics)>1 else ""}
           (Details...)
           ...
        3. Do NOT Summarize. Raw data needed.
        """
        
        # Rate Limit
        print("      [Rate Limit] Waiting 15s...")
        time.sleep(15)
        
        try:
            response = self._generate_with_fallback(
                contents=prompt,
                use_tools=True
            )
            return response.text
        except Exception as e:
            raise e

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Prosper Investigator V3 (Deep Dive Mode)")
    parser.add_argument("theme", nargs="?", help="Theme to investigate")
    parser.add_argument("--output", help="Output file path (optional)")
    parser.add_argument("--list-models", action="store_true", help="List available models")
    parser.add_argument("--dry-run", action="store_true", help="Run without calling API")
    parser.add_argument("--model", help="Specify model name (e.g. gemini-2.5-flash-lite)")
    parser.add_argument("--ai-plan", action="store_true", help="Use AI for planning topics (consumes API quota)")
    args = parser.parse_args()
    
    investigator = ProsperInvestigator(model_name=args.model)

    if args.list_models:
        print(">>> Listing available models...")
        for m in investigator.client.models.list():
            print(f" - {m.name}")
        exit(0)

    if not args.theme:
        print("Error: Theme is required unless --list-models is used.")
        exit(1)

    # Dry Run設定の注入
    investigator.dry_run = args.dry_run
    investigator.run(args.theme, args.output, use_ai_plan=args.ai_plan)
