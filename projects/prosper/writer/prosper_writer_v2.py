import os
import argparse
import re
import datetime
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), "../../.env")
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

class ProsperWriterV2:
    def __init__(self, model_name=None):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("API Key not found in .env")
        
        self.client = genai.Client(api_key=self.api_key)
        # Default to 2.5 flash which is fast, has a large context, and 8k output limit (sufficient for long articles)
        self.model_name = model_name or "models/gemini-2.5-flash"

    def _read_file(self, path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def generate_article(self, report_path, output_dir=None):
        report_content = self._read_file(report_path)
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Extract theme from filename
        basename = os.path.basename(report_path)
        theme_match = re.search(r'\d{8}_\d{6}_(.+)_DEEP\.md', basename)
        theme = theme_match.group(1) if theme_match else "Untitled"
        
        print(f">>> [Prosper Writer V2] Starting Data-Driven Writer for: {theme}")
        print(f"    Model: {self.model_name}")

        print("    [Processing] Analyzing research and drafting the ultimate premium article...")
        article_text = self._draft_premium_article(report_content, theme)
        
        if not article_text:
            print("❌ Failed to generate article.")
            return None

        # Add Metadata
        final_text = f"[BANNER]: PLACEHOLDER\n\n{article_text}"

        # Save
        if not output_dir:
            output_dir = os.path.join(os.path.dirname(__file__), "drafts")
        os.makedirs(output_dir, exist_ok=True)
        
        filename = f"{timestamp}_{theme}_Draft.md"
        output_path = os.path.join(output_dir, filename)
        
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(final_text)
            
        print(f">>> ✨ Draft successfully saved to: {output_path}")
        return output_path

    def _draft_premium_article(self, report, theme):
        print(f"    [Processing] Analyzing report intent for template selection...")
        
        # --- Step 1: Classify Topic (Free vs Paid vs Factual) ---
        classifier_prompt = f"""
        以下の調査レポートのテーマを判定し、「FREE」「PAID」「FACTUAL」のどれか1つの単語のみを出力してください。
        
        【判定基準】
        - FREE: エンタメ、ニュース、映画やアニメ等の作品レビュー、一般的なトレンド考察など。（直接的なお金稼ぎに直結しないもの）
        - PAID: ビジネスノウハウ、収益化手法、専門技術スキル、投資、AIによる業務効率化、実践的なプロンプト・チートシートの提供など。（お金を払ってでも買いたい「実益」があるもの）
        - FACTUAL: 単純な機能比較、APIモデル一覧、料金表解説など、客観的な情報の整理のみを目的としたもの。（事実ベースのカタログ・リスト型）
        
        【テーマ】
        {theme}
        
        【レポート内容（冒頭部分）】
        {report[:2000]}
        """
        
        # 429対策
        time.sleep(5)
        
        try:
            classification_response = self.client.models.generate_content(
                model="models/gemini-2.5-flash-lite", # Classification is simple, use lite
                contents=classifier_prompt,
                config=types.GenerateContentConfig(temperature=0.1)
            )
            intent = classification_response.text.strip().upper()
        except BaseException as e:
            print(f"    [Warning] Classification failed, defaulting to PAID. error: {e}")
            intent = "PAID"

        if "FREE" in intent:
            print("    [Template] Selected: FREE (Viral/Traffic-Gen) Template")
            template_instruction = """
        【集客用（完全無料版）テンプレート】
        ※このテンプレートは、最後まで読ませてSNS等での拡散（バズ）を狙うためのものです。`<!-- PAYWALL -->`（有料線）は絶対に含めないでください。

        # [読者の興味を強烈に惹きつける、キャッチーなタイトル]
        [TOC]

        ## 1. [導入と現状の要約見出し]
        （レポートの事実やデータを基に、短く鋭い断定形の文章で現状を解説する）

        ■ DATA INSIGHT
        - [数字データ1]
        - [数字データ2]
        - [数字データ3]

        [IMAGE]: PLACEHOLDER

        ## 2. [メインコンテンツ：深掘り考察または詳細解説の見出し]
        （一番面白いポイントや、新しい発見を具体例を交えて短く解説する）

        ## 3. [今後の展望・読者への問いかけの見出し]
        （これからのトレンドや、読者がどうあるべきかを短く提示する）

        [IMAGE]: PLACEHOLDER

        ## 4. まとめ
        （全体の結論を短くまとめる）
        （※無料版のためここで終了）
            """
        elif "FACTUAL" in intent:
            print("    [Template] Selected: FACTUAL (Listicle/Comparison) Template")
            template_instruction = """
        【客観的比較（ファクト）用テンプレート】
        ※このテンプレートは、煽り文句や過剰な演出を完全に排除し、事実を淡々と整理してカタログや辞書のように見せるためのものです。`<!-- PAYWALL -->`（有料線）は絶対に含めないでください。

        # [事実を正確に伝える、シンプルで分かりやすいタイトル]
        [TOC]

        ## 1. 概要と全体像
        （本記事の目的と、比較対象の全体像を冷静かつ端的にまとめる。余計な前置きはしない）

        [IMAGE]: PLACEHOLDER

        ## 2. 【無料枠あり】モデル一覧と特徴
        （無料で使えるモデルを列挙し、それぞれの「使用量上限」「得意分野」「用途イメージ」を淡々と並べる）
        - **[モデル名1]**: [詳細な特徴・用途を箇条書き等で端的に]
        - **[モデル名2]**: [詳細な特徴・用途を箇条書き等で端的に]

        [IMAGE]: PLACEHOLDER

        ## 3. 【有料枠のみ / エンタープライズ向け】モデル一覧と特徴
        （課金が必須、あるいは高コストなモデルを列挙し、特徴を淡々と並べる。該当なしの場合はその旨を記載する）

        [IMAGE]: PLACEHOLDER

        ## 4. 結局、メインで使うべきモデルはどれか？（結論）
        （読者が迷わないよう、最もおすすめできる汎用的なモデルを「とりあえずメインで使うのはこれ」という形でズバリ1つ挙げ、その理由をロジカルに解説して締めくくる）
            """
        else:
            print("    [Template] Selected: PAID (Sales/Monetization) Template")
            template_instruction = """
        【収益化用（有料版）V5.1 テンプレート（Brain/Tips高単価・爆売れ型）】
        ※このテンプレートは、読者に強烈な危機感を与え、圧倒的な実績を示し、具体的なノウハウを高単価で販売するための最強の型（PASTORフォーミュラ）です。必ず `<!-- PAYWALL -->` を含めてください。

        # [具体的な数字・即効性・限定感を盛り込んだ、クリックせざるを得ない最強のタイトル]

        （※注意：タイトルの次には必ず以下の文字列をそのまま出力してください。目次生成のトリガーになります）
        [TOC]

        ## 1. 【Problem & Amplify】このままではヤバい。あなたが抱える「致命的な問題点」
        （開始数行で読者の心を掴み、放置した場合の「最悪の未来」を突きつけて危機感を強烈に煽る。断定形で言い切る）
        - 従来のやり方が通用しなくなっている現実（パラダイムシフトの提示）

        ■ DATA INSIGHT（危機感を裏付ける残酷な数字データ）
        - [驚愕の数字データ1]
        - [数字データ2]

        [IMAGE]: PLACEHOLDER

        ## 2. 【Story & Testimony】なぜ私がこの記事を書いたのか（成功の証明）
        （実績やBefore/Afterストーリーを断定形式で短く語り、「この記事のノウハウは本物だ」という圧倒的な信頼（権威性）を構築する）
        > [過去の失敗やドン底の体験など、読者の共感を呼ぶ強烈なエピソードを「引用(> )」を用いて語る]
        - この手法で行き着いた「具体的な成果・数字」の提示

        ## 3. 【Offer & Anchoring】この記事を購入して得られる「圧倒的チート能力」と価格の罠
        （有料部分で何が得られるかを120%魅力的に語り、「買わない理由」を完全に無くす）
        - 有料部分で手に入る「具体的なフレームワークやツール・テンプレート」の目録（チラ見せ）
        - 「自分でゼロから生み出せば数百時間と数十万円が飛ぶ」という機会費用の提示
        - 「本来ならコンサル費30万円の価値があるが、今回は…」という価格のアンカリングを必ず入れる

        <!-- PAYWALL -->

        （※注意：ここから下は絶対に「単なるレポートの続き・考察」を書かないこと。読者が迷わずに行動できる「超・具体的な手順」と「実用的なツール」にする）

        ## 4. 【Solution】完全模倣OK。結果を出すための[具体的な数字]のステップ
        （抽象論は排除し、読者が明日からそのままマネできる超・具体的な手順を「番号付きリスト(1. 2. 3.)」を用いてロジカルに解説する）
        1. [具体的な行動]（なぜそれが必要か、どうやるか）
        2. [具体的な行動]
        3. [具体的な行動]

        [IMAGE]: PLACEHOLDER

        ## 5. 【Bonus / Templates】明日からコピペで使える「実用チートシート＆プロンプト」
        （読者の「難しそう」という不安を払拭し、買った瞬間に価値を感じさせる実務ツールを提供する）

        ■ 目的を達成するための絶対確認チェックリスト
        - 【確認1】[具体的なチェック項目]
        - 【確認2】[具体的なチェック項目]
        - 【確認3】[具体的なチェック項目]

        ```text
        （ここに実践的なプロンプトや、そのまま実務に使えるコピペ用テンプレート・スクリプトを「コードブロック( ``` )」内に具体的に記述）
        ```

        ## 6. おわりに（行動喚起：Call to Action）
        （読者の背中を強く押し、今すぐ最初のアクションを取らせる短い結びの言葉）
            """

        # --- Step 2: Main Generation ---
        prompt = f"""
        あなたは、BtoBおよび高単価コンシューマー向けに、圧倒的に有益で権威のあるレポートを作成する**「トップクラスのアナリスト兼Web編集長」**です。
        提供された調査レポートを元に、読者を唸らせ、最終的に行動（ツール導入や有料購読）へと駆り立てる**Note.com向けの超高品質な長文記事（目安: 5,000〜8,000文字）**を執筆してください。

        【ターゲットテーマ】
        {theme}

        【提供された調査レポート（生データ）】
        {report[:60000]} # Limit to roughly 60k chars to ensure it fits comfortably in prompt

        【執筆の絶対ルール (Strict Guidelines)】
        1. あなたの仕事は、与えられたレポートを情報商材・ブログ記事として「再構築する」ことです。
        2. 「〜と言えるでしょう」「〜と考えられます」といった推測表現、回りくどい言い回しは一切禁止。すべて**断定形（短い言い切り）**で記載し、スマホで読みやすいテンポを作ること。
        3. 出力は、以下の指定テンプレートのMarkdown構造に**一言一句違わず従うこと**。指定された見出し、箇条書きの構成を決して崩さないでください。H4(####)以上の見出し、ネストリストは絶対使用禁止。
        4. 【超重要】文章中および箇条書きの中で、Markdownの太字表現（`**` または `__`）は**絶対に使用しないでください**。リストの項目名などを強調したい場合は、太字ではなく【隅付き括弧】などを使用し、絶対に `**テキスト**:` のようなAI特有の出力を避けてください。
        5. 【超重要】プロンプト例やテンプレート例を作成する際にも、絶対に `[ここに◯◯を記述]` や `[購入ボタンへの誘導]` のような「読者に埋めさせるプレースホルダー（括弧書き）」を出力しないでください。必ず**具体的な架空の事例や文章**で完全に穴埋めされた完成形で出力すること。
        6. 【超重要】劇中や付録で画像生成AI（Midjourney等）のプロンプト例を提示する際は、必ず「Japanese fashion magazine FUDGE style illustration, minimalist black and white line art drawing, clean distinct elegant strokes, no shading, solid white background, NO photorealism, strictly monochrome (one accent color allowed)」といった、雑誌FUDGEのような「一切の塗りと影を排除した洗練されたモノクロミニマル線画（差し色1色まで）」のデザイン指定を含有させ、AI特有の不自然なリアルさや過剰な光沢を徹底的に排除するよう指示してください。また、アスペクト比指定（例: `--ar 16:9`）も必ず加えてください。

        [悪い例1] - **ターゲット設定**: ターゲットを明確にする。
        [良い例1] - 【ターゲット設定】ターゲットを明確にする。
        [悪い例2] - [ここに商品名を入力]の魅力を伝える。
        [良い例2] - AIライティングツール「AI-Writer Pro」の魅力を伝える。

        {template_instruction}

        =================
        それでは、上記の【指定テンプレート】の構造に厳密に従い、Markdown形式で出力してください。
        """
        
        # 429対策
        time.sleep(10)
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7 # 少し創造性をもたせるが論理破綻しない程度
                )
            )
            return response.text
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Prosper Writer V2 (High-Ticket Data-Driven Content)")
    parser.add_argument("report", help="Path to investigator report")
    parser.add_argument("--model", help="Model override", default="models/gemini-2.5-flash")
    args = parser.parse_args()
    
    writer = ProsperWriterV2(model_name=args.model)
    writer.generate_article(args.report)
