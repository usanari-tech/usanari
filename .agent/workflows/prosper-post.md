---
description: Prosper Auto Post - 指定テーマについて調査・執筆・画像生成・収益化・投稿までを完全自動化（Agentic）で行う (V2)
---

ユーザーが「○○についてNOTE投稿して」「○○の記事を投稿までやって」と依頼した場合、または `/prosper-post [テーマ]` が呼ばれた場合、このワークフローを使用します。

### Step 1: 調査 (Investigator)
指定されたテーマについて詳細な調査レポートを作成します。

1. 以下のコマンドを実行してください。
// turbo
projects/prosper/.venv/bin/python projects/prosper/investigator/investigator.py "{Theme}" --ai-plan

2.  コマンド出力の最後にあるレポートパス（`projects/prosper/investigator/reports/...`）を確認してください。

### Step 2: 執筆 (The Data-Driven Writer)
レポートを元に、権威と有益性に満ちた高単価向けの記事（ドラフト）を自動生成します。

1. 以下のコマンドを実行してください。
// turbo
projects/prosper/.venv/bin/python projects/prosper/writer/prosper_writer_v2.py "{ReportPath}"

2. 生成されたドラフトファイルパス（`projects/prosper/writer/drafts/...`）を確認してください。

### Step 3: 画像生成と最適化 (The Hook Artist & Formatter)
記事の世界観に合わせた画像をエージェント自身が生成し、専用スクリプトで16:9（1280x670）に完璧にトリミングしてドラフトに埋め込みます。

1.  **AIによる画像生成**:
    *   `generate_image` ツールを使用して、ドラフトに必要な枚数（バナー用1枚 ＋ 本文用数枚）の画像を生成します。
    *   **【超重要】統一感のある洗練された画像スタイル指定**: 全ての画像生成プロンプトに必ず以下のトーン＆マナー指示を含め、「いかにもAIが描いたような嘘くさい画像」を徹底排除してください。
        *   `Japanese fashion magazine FUDGE style illustration, minimalist black and white line art drawing, clean distinct elegant strokes, no shading, solid white background, NO 3D rendering, NO photorealism, strictly monochrome (one accent color allowed)`
    *   **【超重要】アスペクト比の絶対指定**: プロンプトの末尾には必ず `--ar 16:9` を付け、横長で生成させてください。
    *   生成された画像のローカルパス（`~/.gemini/antigravity/artifacts/...` 等）をメモします。
2.  **専用スクリプトでトリミング＆結合**:
    *   以下のコマンドを実行して、画像を完璧な1280x670サイズにクロップ（中央切り抜き）し、ドラフトに挿入します。パスは実際に生成した数だけ末尾に繋げてください（最初のパスがバナー用になります）。
// turbo
projects/prosper/.venv/bin/python projects/prosper/writer/prosper_image_formatter.py "{DraftPath}" "{PathToBannerImg}" "{PathToBodyImg1}" "{PathToBodyImg2}"

3.  実行後、生成されたファイル（ファイル名に `_Illustrated` がつくもの）のパスを確認してください。

### Step 4: 収益化最適化 (The Monetizer)
ドラフトとアフィリエイトリスト（JSON）を読み込み、記事の文脈に最も関連性の高いアフィリエイトリンクをAIが自動選択し、有料線（Paywall）と共に最適な位置へ自動挿入します。

1. 以下のコマンドを実行してください。
// turbo
projects/prosper/.venv/bin/python projects/prosper/writer/prosper_monetizer.py "{DraftPath_Illustrated}" --affiliates "projects/prosper/writer/affiliates.json"

2. 生成されたファイル（ファイル名に `_Monetized` がつくもの）を、次のStep 5で使用してください。

### Step 5: 投稿 (Publisher)
検証・収益化が完了したドラフトをNote.comへ投稿します。

1. 以下のコマンドを実行してください。
// turbo
projects/prosper/.venv/bin/python projects/prosper/scripts/prosper_publisher.py "{DraftPath_Monetized}"

2.  実行完了後、ユーザーに「投稿が完了しました」と報告し、Note.comの下書きリンク（あれば）または確認を促してください。
