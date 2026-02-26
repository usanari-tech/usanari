# Note投稿システム "Prosper" 稼働仕様書 (Fact Sheet)

現在のコードベースに基づく、実際の仕様と連携フローです。

## 1. System Architecture
- **Language**: Python 3.x
- **Core Model**: `gemini-2.5-flash` (Investigation & Writing), `gemini-2.0-flash` (Editing)
- **Browser Automation**: Playwright (Async)
- **Data Source**: Google Search Grounding (via Google GenAI SDK)

## 2. Workflow & Linkage
各モジュールは独立しており、ファイル(Markdown)を介して連携する「パイプライン型」です。

### Phase 1: Investigation (調査)
- **Script**: `projects/prosper/investigator/investigator.py`
- **Input**: テーマ (e.g., "Webデザイン 2026")
- **Mechanism**:
    1. **Planning**: `gemini-2.5-flash` が7つの視点（商用、社会、技術等）で調査トピックを分解。
    2. **Execution**: トピックごとに `Google Search Grounding` (Tool) を呼び出し、検索結果から事実を抽出。
    3. **Aggregation**: 各トピックの調査結果を結合し、1つのMarkdownレポート (`..._DEEP.md`) を生成。
- **Note**: Tavily等の外部検索APIは使用せず、Googleのグラウンディング機能に一本化されている。

### Phase 2: Writing (執筆)
- **Script**: `projects/prosper/writer/writer.py`
- **Input**: Phase 1で生成された調査レポート (`..._DEEP.md`)
- **Mechanism**:
    1. **Outline**: レポートを読み、Note記事用の構成案 (H1, H2, H3) をJSONで生成。
    2. **Writing**: 構成案と調査レポート(事実)を元に、`gemini-2.5-flash` が記事本文を執筆。
    3. **Rule-based**: `RULES.md` に基づくフォーマット（H4禁止、強調の扱い等）を適用。
- **Output**: ドラフトファイル (`..._Draft.md`)

### Phase 3: Editing (推敲・最適化)
- **Script**: `projects/prosper/writer/editor.py`
- **Input**: Phase 2で生成されたドラフト (`..._Draft.md`)
- **Mechanism**:
    1. **Analysis**: 記事を読み、クリック率を高める「タイトル案(5つ)」「ハッシュタグ」「リード文の書き直し」を提案。
    2. **Selection**: ユーザーがタイトルを選択（または自動決定）。
    3. **Injection**: 選択されたタイトルとタグをドラフトに埋め込む。
- **Output**: 最適化済みドラフト (`..._Optimized.md`)

### Phase 4: Publishing (投稿)
- **Script**: `projects/prosper/scripts/prosper_publisher.py` (V10 Final Edition)
- **Input**: 最適化済みドラフト (`..._Optimized.md`)
- **Mechanism**:
    1. **Playwright**: ユーザープロファイル (`.note_user_data`) を読み込み、ログイン済みの状態でブラウザを起動。
    2. **Parsing**: Markdown独自のタグ (`[BANNER]`, `[IMAGE]`, `[TOC]`) を解析。
    3. **UI Automation**:
        - **Body**: `insert_text` でIMEを回避しつつ高速入力。
        - **Formatting**: Noteの「+メニュー」を物理的にクリックし、見出し・引用・リスト等を適用。
        - **Images**: ファイルチューザーを操作してアップロード。
    4. **Bold Trick**: Noteのエディタ仕様に合わせ、`Cmd+B` ショートカットを送信して太字を適用。
- **Status**: 「下書き保存」までを自動化（公開ボタンは押さない）。

## 3. Key Features
- **Speed Focus**: 重厚な `1.5 Pro` ではなく、高速な `2.5 Flash` を全面採用。
- **Google Ecosystem**: 検索もモデルもGoogleのエコシステムで完結させ、APIコストとレイテンシを最小化。
- **Human-in-the-Loop**: 全自動ではなく、各フェーズでファイルを確認・修正できる「半自動」設計。
