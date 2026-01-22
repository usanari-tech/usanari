---
description: URLの内容を深くリサーチし、事実（表形式含む）と個人的感想（My Take）をセットでまとめる
---

# Smart URL Summary Workflow

URLが提示された際、単にページを読むだけでなく、周辺情報を含めた「使えるノート」を作成するフロー。

## ⚠️ 重要: 禁止事項 (Constraints)
*   **ブラウザ起動厳禁**: `browser_subagent` などのGUIブラウザ操作ツールは使用しないこと。ユーザーのPCでブラウザが立ち上がり、音が出たりして迷惑がかかる。
*   **Headless処理**: 必ず `read_url_content` (HTTPリクエスト) や `search_web` を使用し、バックグラウンドで静かに情報を取得すること。

## 1. 事前処理 (YouTubeの場合)
1.  **URL判定**: URLがYouTube (`youtube.com` or `youtu.be`) か確認する。
2.  **Video ID抽出**: URLからVideo IDを特定する (例: `v=XXXX` or `youtu.be/XXXX`)。
3.  **字幕取得 (Transcript)**:
    *   以下のコマンドを実行し、Pythonスクリプト経由で日本語字幕を取得する。
    *   Command: `/Users/yukinari/Desktop/antigravity/.venv/bin/python .agent/scripts/fetch_youtube_transcript.py <VideoID>`
    *   ※ エラーが出る場合（字幕なし等）は、下記「情報収集」の手順にフォールバックする。

## 2. 情報収集 (Deep Research)
1.  **URL読み込み**: `read_url_content` で対象ページの基本情報を取得。
    *   YouTubeの場合でも、タイトルや概要欄を取得するために実行する。

2.  **周辺リサーチ**: `search_web` を使用し、以下の情報を補完する。
    *   **価格・スペック**: 正確な数値。
    *   **競合比較**: 既存の定番サービス（例: Adobe, Notion等）との違い。
    *   **世間の評判**: SNSやニュースでの反応、株価への影響など。

## 3. コンテンツ生成 (Drafting)
以下の2部構成でアウトプットを作成する。

### Part 1: ファクト＆詳細 (Structured Facts)
*   **概要**: 3行程度でズバリ何なのか。
*   **主な機能/特徴**: 箇条書きで詳細に。AI機能や新機能は特に詳しく。
*   **比較表 (Comparison Table)**: 「これ vs 競合」の表を作成。価格、機能、ターゲット層を比較。
*   **結論・考察**: 客観的な市場へのインパクト。

### Part 2: 個人の雑感 (My Take)
*   **エンジニア/クリエイターとしての本音**:
    *   「高い/安い」「便利/使いにくい」を感情的に。
    *   「〇〇な人は乗り換えるべき」「これはスルーでOK」などの推奨アクション。
    *   文体は少し砕けてOK（「笑った」「神アプデ」など）。

## 4. 出力 (Output)
*   **ファイル保存**: 作成したコンテンツをMarkdownファイルとして保存する。
*   **保存先**: `obsidian_vault/` (プロジェクトルートのシンボリックリンク経由でObsidian保管庫直下に保存)
*   **ファイル名**: `YYYY-MM-DD_タイトル_Summary.md` (例: `2026-01-21_YouTube_Video_Summary.md`)
    *   スペースはアンダースコア `_` に置換する。
    *   日付は実行日を入れる。
*   **完了通知**: 保存完了後、ユーザーにファイルへのリンク (`file:///...`) を提示する。
