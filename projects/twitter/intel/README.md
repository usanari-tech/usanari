# X Intelligence — 情報収集エンジン

Xから最新情報を無料で収集し、Markdownにまとめるツール群。
既存のログイン済みセッションを使用するため、API費用は0円。

---

## セットアップ

```bash
cd /Users/yukinari/Desktop/antigravity/projects/twitter/intel
npm install
```

**Gemini APIによるAI要約を使う場合（任意）:**
```bash
cp .env.example .env
# .env を開いて GEMINI_API_KEY を設定する
```

---

## 使い方

### 1. トレンドTOP10を収集する

```bash
node collect_trending.js
```

| オプション | 説明 |
|---|---|
| `--headless` | 画面なしで実行（バックグラウンド） |

**出力:** `reports/trending_YYYYMMDD_HHMM.md`

---

### 2. キーワードで検索してまとめる

```bash
node search_topic.js "AIエージェント"
node search_topic.js "AIエージェント" --limit 20
node search_topic.js "AIエージェント" --tab latest    # 最新順（デフォルト: 人気順）
node search_topic.js "AIエージェント" --summarize     # AI要約付き（Gemini APIキー必要）
```

| オプション | 説明 |
|---|---|
| `--limit N` | 収集件数（デフォルト: 10） |
| `--tab latest` | 最新順（デフォルト: top=人気順） |
| `--summarize` | Gemini APIでAI要約を追加 |
| `--headless` | 画面なしで実行 |

**出力:** `reports/search_[キーワード]_YYYYMMDD_HHMM.md`

---

### 3. 特定分野の最新情報を収集する

```bash
# プリセット分野を使う
node monitor_niche.js --niche ai
node monitor_niche.js --niche tech
node monitor_niche.js --niche web3
node monitor_niche.js --niche money

# 独自キーワードで収集する
node monitor_niche.js --custom "個人開発,副業,FIRE"

# オプション組み合わせ
node monitor_niche.js --niche ai --limit 10 --summarize
```

| オプション | 説明 |
|---|---|
| `--niche ai` | AIプリセット（AIエージェント/LLM/Gemini等） |
| `--niche tech` | テックプリセット（個人開発/SaaS等） |
| `--niche web3` | Web3プリセット（NFT/DeFi等） |
| `--niche money` | 資産形成プリセット（副業/NISA等） |
| `--custom "kw1,kw2"` | カスタムキーワード（カンマ区切り） |
| `--limit N` | 各キーワードの収集件数（デフォルト: 5） |
| `--summarize` | AI要約付き |
| `--headless` | 画面なし |

**出力:** `reports/niche_[分野]_YYYYMMDD_HHMM.md`

---

## 収集レポートの保存先

```
intel/reports/
├── trending_20260222_0400.md
├── search_AIエージェント_20260222_0401.md
└── niche_ai_20260222_0402.md
```

---

## ⚠️ 注意事項

- 初回実行時にブラウザが表示される。`automation/user_data` のセッションが使われる
- セッションが切れている場合はブラウザでログインすれば以降も継続される
- 連続実行はアカウント保護のため避けること（目安: 1回/30分以上の間隔）
- 個人利用を前提とした構成。大量収集は行わないこと

---

## ディレクトリ構成

```
intel/
├── package.json
├── .env.example / .env
├── README.md           ← このファイル
├── collect_trending.js  # TOP10収集
├── search_topic.js      # キーワード検索
├── monitor_niche.js     # 分野監視
├── lib/
│   ├── browser.js      # Puppeteer共通設定
│   └── summarize.js    # Gemini API要約
└── reports/             # Markdown出力先
```
