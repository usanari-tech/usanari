/**
 * lib/summarize.js
 * Gemini API を使ってツイート群をAI要約するモジュール
 * GEMINI_API_KEY 環境変数が必要（未設定の場合はスキップ）
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';

/**
 * ツイートリストをGemini APIで要約する
 * @param {Array<{author, text, likes, retweets}>} tweets
 * @param {string} context - 要約のコンテキスト（例: "AIに関するツイートのまとめ"）
 * @returns {Promise<string>} - 要約Markdown文字列
 */
async function summarizeTweets(tweets, context = '収集したツイートのまとめ') {
    if (!API_KEY || API_KEY === 'your_api_key_here') {
        console.log('ℹ️  GEMINI_API_KEY 未設定のためAI要約をスキップします。');
        return null;
    }

    const tweetsText = tweets
        .map(
            (t, i) =>
                `[${i + 1}] @${t.author}: ${t.text} (❤️${t.likes} 🔁${t.retweets})`
        )
        .join('\n');

    const prompt = `以下は「${context}」として収集したX（Twitter）のツイート一覧です。
この内容を日本語で要約してください。

要件：
- 全体のトレンドや主要なテーマを3〜5点に整理する
- 特に注目度が高いツイート（いいね・RT数が多いもの）を★マークで強調する
- 箇条書きで読みやすく記述する
- 最後に「編集後記」として1〜2文の総括コメントを付ける

ツイート一覧：
${tweetsText}

出力形式：
## 📊 AI要約

### 主要トレンド
- （要約内容）

### ★ 注目ツイート
- （内容）

### 📝 編集後記
（総括）`;

    try {
        console.log('🤖 Gemini APIで要約中...');
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
                }),
            }
        );

        if (!res.ok) {
            const err = await res.text();
            console.error('❌ Gemini API エラー:', err);
            return null;
        }

        const data = await res.json();
        const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
        if (summary) {
            console.log('✅ AI要約完了');
        }
        return summary;
    } catch (e) {
        console.error('❌ Gemini API 呼び出し失敗:', e.message);
        return null;
    }
}

module.exports = { summarizeTweets };
