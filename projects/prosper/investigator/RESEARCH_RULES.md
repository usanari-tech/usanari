# Prosper Investigation Standard (v2.0)

Prosperの調査モジュールにおける「絶対的基準」です。
AIは、調査計画（Planning）および実調査（Execution）において、以下の**8つの次元（Dimensions）**を網羅しなければなりません。

## 0. User Hypothesis (ユーザー仮説の検証) **[最重要]**
*   **Definition**: ユーザーが調査を依頼した「動機」や「疑問」に対する直接的な回答。
*   **Action**: ユーザー入力（例：「ラスト10秒のCMは嘘か？」「なぜ失敗したか？」）を特定し、その真偽をファクトベースで検証する。
*   **Requirement**: これが欠けている場合、他の調査がどれほど完璧でも「失敗」と見なす。

## 1. Essentials (基本情報とコンテキスト)
*   **Overview**: 作品/トピックの「正確な」概要。
*   **Production Context**: 制作年、スタッフ、キャスト、予算。
*   **Intent**: クリエイター（監督・作者）が込めたかった「本来の意図」。

## 2. Commercial Reality (ビジネスと市場の現実)
*   **Marketing Strategy**: 「どのように売ろうとしたか？」。キャッチコピー、ポスターのビジュアル、ターゲット層の定義。
*   **Performance Data**:
    *   Budget (制作費 + 宣伝費) vs Box Office (国内/北米/全世界)。
    *   ROI (投資対効果)。
*   **The "Gap"**: スタジオの販売戦略と、実際の作品内容/観客の期待との間に生じた「ズレ」。

## 3. Social Dynamics (社会・時代との摩擦)
*   **Zeitgeist**: その時代（公開年）特有の空気感（不況、世紀末、政治的不安など）と作品のリンク。
*   **Reaction Analysis**:
    *   **Then**: 公開当時、世間はどう反応したか？（無視、酷評、熱狂？）
    *   **Now**: 現在、その評価はどう変化したか？（再評価、古典化、キャンセル？）
*   **Impact**: 社会現象、ミーム、模倣犯、ファッションへの影響。

## 4. Evaluation & Experience (評価と体験)
*   **Professional Critique (プロの批評)**: 専門家、評論家によるレビュー。権威あるレビューサイト（Rotten Tomatoes, Metacritic, TechRadar等）のスコアと具体的な批評内容。
*   **User Voice (ユーザーの生の声)**: 個人のブログ、SNS、口コミ。統計処理されていない「主観的な体験談」。「実際に使ってみて/見てどう感じたか」。
*   **The Consensus Gap**: プロとアマチュア（一般層）の評価の乖離。

## 5. Themes & Analysis (深層分析)
*   **Core Message**: 作品が持つ哲学的・倫理的メッセージ。
*   **Visual/Tech**: 映像技術、演出、音楽の使用法などの技術的特異点。
*   **Structure**: 伏線、トリック、信頼できない語り手などの構造的ギミック。

## 6. Controversies (論争と影)
*   **Issues**: 暴力描写、差別表現、政治的偏向などによる炎上。
*   **Censorship/Legal**: 検閲（中国版改変など）、訴訟、権利問題。

## 7. Legacy (結論と遺産)
*   **Long-term Value**: 10年後、20年後に何を残したか。
*   **Conclusion**: 上記の全データを統合し、「なぜ今これを語る価値があるのか」という結論。

---

## [Execution Rules] (AIへの指示)
1.  **Raw Data over Summary**: 綺麗な要約文（Summary）は不要。具体的な数字、日付、固有名詞、引用（Quotes）という「生の素材」を集めること。
2.  **Conflict is Good**: 評価が分かれている場合、両方の意見を併記する。「賛否両論ある」で終わらせず、「誰が賛成し、誰が反対したか」を特定する。
3.  **Source Diversity**: 作品公式サイトだけでなく、当時のニュース記事、Box Office Mojo、批評サイト、フォーラムの議論を参照する。
