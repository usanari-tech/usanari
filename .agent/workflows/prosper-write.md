---
description: Prosper Writer - 既存の調査レポートを元に記事執筆と画像生成のみを行う（投稿はしない）
---

ユーザーが「このレポートを記事にして」「記事のドラフトを書いて」と依頼した場合（投稿までは求めていない場合）、このワークフローを使用します。

### Step 1: 執筆 (Writer)
1.  **対象レポートの特定**:
    元となる調査レポート（`projects/prosper/investigator/reports/xxxx.md`）を特定して読み込んでください。
2.  **ドラフト作成**:
    レポートの内容を元に、Note.com形式で記事を執筆します。
    *   **保存先**: `projects/prosper/writer/drafts/YYYYMMDD_{Theme}.md`

### Step 2: 画像生成 (Artist)
**以下のルールを厳守して**画像を作成・挿入してください。

1.  **枚数**: バナー1枚 + 本文用1-3枚。
2.  **Styleルール（統一感・都会的な抜け感の徹底）**: 
    - 雑誌『FUDGE』の挿絵のような、**「ミニマルなモノクロ線画（Minimalist black and white line art drawing, clean distinct elegant strokes, no shading）」**をプロンプトのベースとする。
    - **色は原則使わないか、使うとしても「差し色（Accent color）1色のみ」**に限定する（赤、青など）。
    - いかにもAIが描いたような過剰な光沢、リアルすぎる3D、不気味な造形（AIっぽさ・嘘くささ）を一切排除する。`NO 3D rendering, NO photorealism`。
3.  **Rule**: **NO FRAME / NO BORDER** (枠線や余白禁止を確認し、あれば再生成)。
4.  **Size & Aspect Ratio**: 
    - プロンプトで必ず `--ar 16:9` と指定して「横長」で生成させること。
    - その後、専用スクリプト（または`sips`コマンド）を用いて正確に **1280x670px** にリサイズ・クロップを必ず行うこと。比率の破綻は許されない。
5.  **Integration**: `[BANNER]: path` および `[IMAGE]: path` でドラフトに埋め込む。

### Step 3: 検証 (Validator)
最後にフォーマットチェックを行いますが、**投稿はしません**。

```bash
python3 projects/prosper/writer/check_draft.py "{DraftPath}" --source "{ReportPath}"
```

完了後、「記事の下書きが完成しました（投稿はしていません）」と報告してください。
