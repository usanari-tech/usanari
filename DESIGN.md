# Design System: KAI Bakery (pan_sample)
**Project ID:** 7798153179858074356

## 1. Visual Theme & Atmosphere
「香りと食感で、朝をいろどる。」をコンセプトにした、職人技と温かみを感じさせるプレミアムなデザインです。
静寂の中に「切れ味（一閃）」を感じさせる直線的なアクセントと、パンの柔らかさを象徴する浮遊感のあるボケ（Blur）が共存する、モダン・アルチザンな雰囲気を持っています。

## 2. Color Palette & Roles
* **Deep Espresso Brown (#3D2B1F)**: 
    * 文字（Primary Text）およびブランドロゴに使用。安心感と品質を象徴する深い茶色。
* **Soft Warm Cream (#F5F2ED)**: 
    * 背景のベースカラー（Bakery Beige）。パン生地の柔らかさと清潔感を表現。
* **Toasted Brown (#C4A484)**: 
    * アクセントカラーおよびホバー状態に使用。パンの焼き色（Toast）をイメージ。
* **Subtle Golden Wheat (#E3C9A6)**: 
    * 背景の装飾要素（背景の線やボケ）に使用。実りの小麦を思わせる落ち着いたゴールド。

## 3. Typography Rules
* **Display Font (Headers):** `Shippori Mincho`
    * 見出しに使用。伝統的かつ洗練された印象を与え、広いレタースペーシング（`0.25em`以上）で余裕と品格を演出。
* **Sans Font (Body/Serif JP):** `Noto Serif JP`
    * 日本語の明朝体として、可読性と美しさを両立。

## 4. Component Stylings
* **Buttons & Navigation:**
    * 罫線や背景を抑え、文字のトラッキングと色変化（Toast色への遷移）で機能性を表現。
* **SVG Accents:**
    * サイト全体に「一閃」をイメージした鋭い曲線（`line-accent`）を配置。これらは描画アニメーション（Path drawing）を伴い、貝印らしい「切れ味」を暗示。
* **Decorative Blurs:**
    * 背面に配置された大きく丸いボケ要素。アニメーション（`float`）によってゆっくりと動き、有機的な生命感を演出。

## 5. Layout Principles
* **Whitespace Strategy:**
    * 非常に大胆な余白を用意し、各要素に「呼吸」をさせる配置。
* **Writing Mode:**
    * 一部の要素に「縦書き」を採用し、日本の職人文化とモダンなWebデザインを融合。
