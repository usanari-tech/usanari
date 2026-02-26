/**
 * intel/auto_post.js
 * 収集 → Gemini AIでツイート生成 → 自動投稿 の一発パイプライン（v2）
 *
 * 使い方:
 *   node auto_post.js                        # 時刻に応じてカテゴリを自動選択
 *   node auto_post.js --niche ai             # カテゴリ指定
 *   node auto_post.js --headless             # ヘッドレスモード
 *   node auto_post.js --dry-run              # 投稿せず確認のみ
 *   node auto_post.js --niche tech --headless --dry-run
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const { launchBrowser, ensureLoggedIn, humanDelay, getNow, getTimestamp } = require('./lib/browser');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// ---- 設定 ----
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const POST_SCRIPT = path.resolve(__dirname, '../automation/post_tweet.js');

// ---- 引数解析 ----
const args = process.argv.slice(2);
const NICHE_KEY = args.includes('--niche') ? args[args.indexOf('--niche') + 1] : null;
const KEYWORD = args.includes('--keyword') ? args[args.indexOf('--keyword') + 1] : null;
const HEADLESS = args.includes('--headless');
const DRY_RUN = args.includes('--dry-run');

// ---- 9カテゴリ定義 ----
// en/jaミックスで世界からも収集
const NICHE_PRESETS = {
    ai: {
        label: 'AI・テクノロジー',
        keywords: ['AIエージェント', 'LLM latest', '生成AI', 'Claude Gemini', 'AI automation'],
        persona: 'AIオタクのエンジニア',
    },
    tech: {
        label: 'テック・個人開発',
        keywords: ['個人開発', 'SaaS indie hacker', 'プログラミング tips', 'developer productivity'],
        persona: 'バリバリの個人開発者',
    },
    trend: {
        label: 'トレンド・バズ',
        keywords: ['今話題', 'viral 2025', 'バズ投稿', 'trending global'],
        persona: 'トレンドハンター',
    },
    lifestyle: {
        label: 'ライフスタイル・健康',
        keywords: ['ライフスタイル', 'wellness habits', '健康習慣', 'morning routine'],
        persona: 'ウェルネス探求者',
    },
    news: {
        label: 'ニュース・時事',
        keywords: ['breaking news', '速報', 'world news today', 'global update'],
        persona: '世界情勢ウォッチャー',
    },
    mindset: {
        label: 'マインドセット・成長',
        keywords: ['マインドセット', 'growth mindset', '成長思考', 'success habits'],
        persona: '成長マニア',
    },
    psychology: {
        label: '心理学・行動科学',
        keywords: ['心理学', 'behavioral psychology', '認知バイアス', 'human behavior science'],
        persona: '行動科学オタク',
    },
    tips: {
        label: 'TIPS・ライフハック',
        keywords: ['ライフハック', 'life tips', '時短テク', 'productivity hacks 2025'],
        persona: 'ライフハックマスター',
    },
    global: {
        label: 'グローバル・世界ネタ',
        keywords: ['world culture', '海外面白話', 'global trends', 'interesting facts'],
        persona: '世界を旅する情報収集家',
    },
};

// 時刻に基づいてカテゴリを順番に選択（24時間で9カテゴリをローテーション）
const ROTATION_ORDER = ['ai', 'tips', 'tech', 'psychology', 'mindset', 'lifestyle', 'trend', 'news', 'global'];

function selectNiche() {
    if (NICHE_KEY && NICHE_PRESETS[NICHE_KEY]) return NICHE_KEY;
    const hour = new Date().getHours();
    return ROTATION_ORDER[hour % ROTATION_ORDER.length];
}

// ---- Step1: Xからツイートを収集 ----
async function collectTopTweets(nicheKey) {
    const niche = NICHE_PRESETS[nicheKey];
    // 最大3キーワードに絞る（負荷軽減）
    const keywords = niche.keywords.slice(0, 3);

    console.log(`\n📡 Step1: 情報収集「${niche.label}」(${keywords.join(' / ')})`);

    const { browser, page } = await launchBrowser({ headless: HEADLESS });

    try {
        const loggedIn = await ensureLoggedIn(page);
        if (!loggedIn) throw new Error('ログイン失敗');

        let allTweets = [];

        for (const keyword of keywords) {
            const encodedQ = encodeURIComponent(keyword);
            // enキーワードはlatest（最新）タブで、日本語はtop（注目）タブで
            const tab = /[a-zA-Z]/.test(keyword) ? 'live' : 'top';
            const url = `https://x.com/search?q=${encodedQ}&src=typed_query&f=${tab}`;

            console.log(`  🔍 "${keyword}" ...`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            await humanDelay(1800, 2800);
            await page.waitForSelector('[data-testid="tweet"]', { timeout: 12000 }).catch(() => { });

            const tweets = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('[data-testid="tweet"]'))
                    .slice(0, 3)
                    .map((el) => {
                        const text = el.querySelector('[data-testid="tweetText"]')?.innerText?.trim() || '';
                        const likes = el.querySelector('[data-testid="like"] span')?.innerText?.trim() || '0';
                        const rts = el.querySelector('[data-testid="retweet"] span')?.innerText?.trim() || '0';
                        const nameSpans = el.querySelectorAll('[data-testid="User-Name"] span');
                        const handle = Array.from(nameSpans).find((s) => s.innerText?.startsWith('@'))?.innerText?.trim() || '';
                        const linkEl = el.querySelector('a[href*="/status/"]');
                        const tweetUrl = linkEl ? 'https://x.com' + linkEl.getAttribute('href') : '';
                        return { text, likes, rts, handle, url: tweetUrl };
                    })
                    .filter((t) => t.text.length > 10);
            });

            allTweets.push(...tweets.map((t) => ({ ...t, keyword })));
            console.log(`    ✅ ${tweets.length}件取得`);
            await humanDelay(1500, 2500);
        }

        return allTweets;
    } finally {
        await browser.close();
    }
}

// ---- Step2: GeminiにツイートJSON → 投稿文生成 ----
async function generateTweet(tweets, nicheKey) {
    console.log('\n🤖 Step2: Gemini APIでツイート文を生成中...');

    if (!API_KEY || API_KEY === 'your_api_key_here') {
        throw new Error('GEMINI_API_KEY が設定されていません。.env を確認してください。');
    }

    const niche = NICHE_PRESETS[nicheKey];

    // エンゲージメント上位を引用元として抽出
    const sortedTweets = [...tweets].sort((a, b) => {
        const likesA = parseFloat(a.likes.replace('K', '000').replace('万', '0000')) || 0;
        const likesB = parseFloat(b.likes.replace('K', '000').replace('万', '0000')) || 0;
        return likesB - likesA;
    });

    const topTweets = sortedTweets.slice(0, 5);
    const tweetSummary = topTweets
        .map((t, i) => `[${i + 1}] ${t.handle} (❤️${t.likes} 🔁${t.rts}): ${t.text.slice(0, 120)}${t.url ? ` | ${t.url}` : ''}`)
        .join('\n');

    const prompt = `あなたは「${niche.persona}」として発信するXアカウントです。
コンセプト: 「何もしないために、なんでもやる。」
——自動化、テクノロジー、人生最適化を探求する個人開発者の視点で日々発信している。

━━ 今日の収集ネタ（${niche.label}）━━
${tweetSummary}

━━ ツイート作成指示 ━━
上記のネタをもとに、140文字以内のツイートを1件作成してください。

【文体・トーン】
- フランクで親しみやすい（タメ口OK、「〜だよ」「〜じゃん」「〜すぎ」「笑」なども自然に使う）
- ユーモアがあること（クスッとくるか、「わかる！」と共感できる切り口）
- でも中身はしっかり役立つ情報 or 新しい気づきを含む
- 発見した「へえ〜」な事実を伝える感じ

【構成ルール】
1. 最初の1〜2文：読者が「え、なにそれ？」と止まるような一言or事実
2. 中盤：さらっと本題（情報or気づき）
3. 最後：自分の感想 / 問いかけ / オチ（短く）
4. 出典: 必ず「via @ハンドル名」or「▶ URL」の形で1件引用源を明記
5. ハッシュタグ: 1〜2個

【禁止事項】
- 説明文・前置き・コード記号（\`\`\`）は不要
- 「このツイートは〜」のような説明不要
- URLは引用元のみ使用可（自分でURLを作らない）
- 140文字を超えない

ツイート本文のみを出力してください。`;

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.9, maxOutputTokens: 1024 },
            }),
        }
    );

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API エラー: ${err}`);
    }

    const data = await res.json();
    const generated = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!generated) throw new Error('Gemini APIから空の応答が返りました');

    // コードブロックの除去
    const cleaned = generated.replace(/```[^\n]*\n?/g, '').trim();

    console.log(`✅ 生成完了 (${cleaned.length}文字)`);
    return cleaned;
}

// ---- Step3: 投稿 ----
async function postTweet(tweetText) {
    console.log('\n📮 Step3: Xに投稿中...');

    if (DRY_RUN) {
        console.log('🔍 [DRY RUN] 実際には投稿しません。');
        return;
    }

    const headlessFlag = HEADLESS ? ' --headless' : '';
    const escaped = tweetText.replace(/"/g, '\\"').replace(/\n/g, ' ');
    const cmd = `node "${POST_SCRIPT}" "${escaped}"${headlessFlag}`;

    execSync(cmd, { stdio: 'inherit' });
}

// ---- メイン ----
(async () => {
    const selectedNiche = selectNiche();
    const niche = NICHE_PRESETS[selectedNiche];

    console.log('='.repeat(55));
    console.log('🚀 X Auto Post Pipeline v2');
    console.log(`   カテゴリ: ${niche.label}（${selectedNiche}）`);
    console.log(`   モード: ${HEADLESS ? 'Headless' : '画面あり'} / ${DRY_RUN ? 'DRY RUN' : '実投稿'}`);
    console.log(`   実行: ${getNow()}`);
    console.log('='.repeat(55));

    try {
        // Step1: 収集
        const tweets = await collectTopTweets(selectedNiche);
        if (tweets.length === 0) throw new Error('ツイートが1件も取得できませんでした');
        console.log(`\n📊 収集完了: ${tweets.length}件`);

        // Step2: 生成
        const generatedTweet = await generateTweet(tweets, selectedNiche);

        console.log('\n' + '─'.repeat(55));
        console.log('📝 生成されたツイート:');
        console.log(generatedTweet);
        console.log('─'.repeat(55));

        // ログ保存
        const logDir = path.join(__dirname, 'reports');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        const logFile = path.join(logDir, `autopost_${getTimestamp()}.md`);
        const logContent = [
            `# 自動投稿ログ - ${getNow()}`,
            `## カテゴリ: ${niche.label}`,
            `## 生成ツイート（${generatedTweet.length}文字）`,
            generatedTweet,
            `## 収集元ツイート`,
            tweets.map((t, i) => `${i + 1}. ${t.handle}: ${t.text.slice(0, 80)}... (❤️${t.likes})`).join('\n'),
        ].join('\n\n');
        fs.writeFileSync(logFile, logContent, 'utf-8');
        console.log(`\n💾 ログ保存: ${logFile}`);

        // Step3: 投稿
        await postTweet(generatedTweet);

        console.log('\n✅ パイプライン完了！');
    } catch (err) {
        console.error('\n❌ パイプラインエラー:', err.message);
        process.exit(1);
    }
})();
