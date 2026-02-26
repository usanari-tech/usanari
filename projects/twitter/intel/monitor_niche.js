/**
 * monitor_niche.js
 * 特定分野の最新情報を複数キーワードで収集し、エンゲージメント順にランキングしてMarkdownに保存
 *
 * 使い方:
 *   node monitor_niche.js --niche ai
 *   node monitor_niche.js --niche tech
 *   node monitor_niche.js --niche web3
 *   node monitor_niche.js --custom "個人開発,副業,FIRE" --hours 48
 *   node monitor_niche.js --niche ai --hours 48 --limit 5 --headless
 */

const { launchBrowser, ensureLoggedIn, humanDelay, saveReport, getNow, getTimestamp } = require('./lib/browser');
const { summarizeTweets } = require('./lib/summarize');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, 'reports');

// 分野プリセット（キーワード定義）
const NICHE_PRESETS = {
    ai: {
        label: 'AI・生成AI',
        keywords: ['AIエージェント', 'LLM', '生成AI', 'Gemini', 'Claude', 'GPT', 'ChatGPT'],
    },
    tech: {
        label: 'テック・個人開発',
        keywords: ['個人開発', 'Indie Hacker', 'エンジニア転職', 'SaaS', 'プログラミング学習'],
    },
    web3: {
        label: 'Web3・暗号資産',
        keywords: ['NFT', 'DeFi', 'ビットコイン', 'イーサリアム', 'ブロックチェーン'],
    },
    money: {
        label: '資産形成・副業',
        keywords: ['副業', 'FIRE', '配当投資', '新NISA', '資産運用'],
    },
};

// コマンドライン引数を解析
const args = process.argv.slice(2);
const NICHE_KEY = args.includes('--niche') ? args[args.indexOf('--niche') + 1] : null;
const CUSTOM_KEYWORDS = args.includes('--custom')
    ? args[args.indexOf('--custom') + 1].split(',').map((k) => k.trim())
    : null;
const HOURS = parseInt((args.find((a) => a.startsWith('--hours=')) || '--hours=24').split('=')[1]) ||
    (args.includes('--hours') ? parseInt(args[args.indexOf('--hours') + 1]) : 24);
const LIMIT_PER_KW = parseInt((args.find((a) => a.startsWith('--limit=')) || '--limit=5').split('=')[1]) ||
    (args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 5);
const DO_SUMMARIZE = args.includes('--summarize');
const HEADLESS = args.includes('--headless');

// 使用するキーワードと分野名を決定
let keywords, nicheLabel;
if (CUSTOM_KEYWORDS) {
    keywords = CUSTOM_KEYWORDS;
    nicheLabel = 'カスタム';
} else if (NICHE_KEY && NICHE_PRESETS[NICHE_KEY]) {
    keywords = NICHE_PRESETS[NICHE_KEY].keywords;
    nicheLabel = NICHE_PRESETS[NICHE_KEY].label;
} else {
    console.error('❌ 分野を指定してください。');
    console.error('   使用可能なプリセット: --niche ai / tech / web3 / money');
    console.error('   カスタム: --custom "キーワード1,キーワード2"');
    console.log('\n📋 使用可能なプリセット:');
    Object.entries(NICHE_PRESETS).forEach(([key, val]) => {
        console.log(`  --niche ${key}: ${val.label}`);
        console.log(`    キーワード: ${val.keywords.join(' / ')}`);
    });
    process.exit(1);
}

/**
 * 1キーワードのツイートを収集する
 */
async function collectByKeyword(page, keyword, limit) {
    const encodedQuery = encodeURIComponent(keyword);
    const url = `https://x.com/search?q=${encodedQuery}&src=typed_query&f=top`;

    console.log(`  🔍 "${keyword}" を検索中...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await humanDelay(2000, 3500);

    await page.waitForSelector('[data-testid="tweet"]', { timeout: 15000 }).catch(() => { });

    const tweets = await page.evaluate((maxItems) => {
        const tweetEls = document.querySelectorAll('[data-testid="tweet"]');
        return Array.from(tweetEls)
            .slice(0, maxItems)
            .map((el) => {
                const authorEl = el.querySelector('[data-testid="User-Name"]');
                const displayName = authorEl?.querySelector('span')?.textContent?.trim() || '';
                const handleEls = authorEl?.querySelectorAll('span');
                const handle = handleEls?.[3]?.textContent?.trim() || '';

                const textEl = el.querySelector('[data-testid="tweetText"]');
                const text = textEl?.textContent?.trim() || '';

                const likeEl = el.querySelector('[data-testid="like"] span');
                const likesRaw = likeEl?.textContent?.trim() || '0';

                const rtEl = el.querySelector('[data-testid="retweet"] span');
                const retweetsRaw = rtEl?.textContent?.trim() || '0';

                const replyEl = el.querySelector('[data-testid="reply"] span');
                const replies = replyEl?.textContent?.trim() || '0';

                const timeEl = el.querySelector('time');
                const timeDisplay = timeEl?.textContent?.trim() || '';

                const linkEl = el.querySelector('a[href*="/status/"]');
                const tweetUrl = linkEl ? `https://x.com${linkEl.getAttribute('href')}` : '';

                // 数値変換（「1.2万」→12000）
                const toNumber = (s) => {
                    if (!s || s === '') return 0;
                    const n = s.replace(/,/g, '');
                    if (n.includes('万')) return Math.round(parseFloat(n) * 10000);
                    if (n.includes('K') || n.includes('k')) return Math.round(parseFloat(n) * 1000);
                    return parseInt(n) || 0;
                };

                const likes = toNumber(likesRaw);
                const retweets = toNumber(retweetsRaw);
                const engagement = likes + retweets * 3; // RTは3倍重み

                return { displayName, handle, text, likes, likesRaw, retweets, retweetsRaw, replies, timeDisplay, tweetUrl, engagement };
            })
            .filter((t) => t.text && t.tweetUrl);
    }, limit);

    console.log(`    ✅ ${tweets.length}件取得`);
    return tweets.map((t) => ({ ...t, keyword }));
}

async function monitorNiche() {
    console.log(`📡 分野監視モード: ${nicheLabel}`);
    console.log(`📋 キーワード: ${keywords.join(' / ')}`);
    console.log(`📋 各キーワード: ${LIMIT_PER_KW}件 / 過去${HOURS}時間`);

    const { browser, page } = await launchBrowser({ headless: HEADLESS });

    try {
        const loggedIn = await ensureLoggedIn(page);
        if (!loggedIn) return;

        // 全キーワードでツイートを収集
        let allTweets = [];

        for (const keyword of keywords) {
            const tweets = await collectByKeyword(page, keyword, LIMIT_PER_KW);
            allTweets.push(...tweets);
            await humanDelay(1500, 2500); // キーワード間の待機
        }

        // 重複除去（tweetUrlをキーに）
        const seen = new Set();
        allTweets = allTweets.filter((t) => {
            if (seen.has(t.tweetUrl)) return false;
            seen.add(t.tweetUrl);
            return true;
        });

        // エンゲージメントスコア順にソート
        allTweets.sort((a, b) => b.engagement - a.engagement);

        console.log(`\n📊 合計 ${allTweets.length}件（重複除去済み）`);

        // AI要約（オプション）
        let aiSummary = null;
        if (DO_SUMMARIZE) {
            aiSummary = await summarizeTweets(
                allTweets.slice(0, 20),
                `「${nicheLabel}」分野の最新Xトレンド情報`
            );
        }

        // Markdown生成
        const now = getNow();
        const timestamp = getTimestamp();

        let md = `# 分野監視レポート: ${nicheLabel}\n`;
        md += `> 収集日時: ${now} / キーワード: ${keywords.join(' / ')} / 合計: ${allTweets.length}件\n\n`;
        md += `---\n\n`;

        if (aiSummary) {
            md += aiSummary + '\n\n---\n\n';
        }

        md += `## 🏆 エンゲージメントランキング\n\n`;
        md += `> いいね数 + RT数×3 でスコア計算\n\n`;

        if (allTweets.length === 0) {
            md += `⚠️ ツイートが取得できませんでした。\n`;
        } else {
            allTweets.forEach((t, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                md += `### ${medal} @${t.handle || t.displayName}\n`;
                md += `> 🏷️ キーワード: \`${t.keyword}\`\n\n`;
                md += `${t.text}\n\n`;
                md += `> ❤️ ${t.likesRaw} &nbsp; 🔁 ${t.retweetsRaw} &nbsp; 💬 ${t.replies}`;
                if (t.timeDisplay) md += ` &nbsp; 🕐 ${t.timeDisplay}`;
                if (t.tweetUrl) md += ` &nbsp; [🔗 元ツイート](${t.tweetUrl})`;
                md += `\n\n`;
            });
        }

        // キーワード別サマリー
        md += `---\n\n## 📋 キーワード別収集数\n\n`;
        keywords.forEach((kw) => {
            const count = allTweets.filter((t) => t.keyword === kw).length;
            md += `- **${kw}**: ${count}件\n`;
        });

        md += `\n---\n\n`;
        md += `*このレポートは自動収集により生成されました。*\n`;

        const safeLabel = nicheLabel.replace(/[^\w\u3040-\u9FFF]/g, '_');
        const filename = `niche_${NICHE_KEY || 'custom'}_${timestamp}`;
        const filepath = saveReport(filename, md, REPORTS_DIR);

        // ターミナルにもTOP5を表示
        console.log('\n' + '='.repeat(50));
        console.log(`📡 ${nicheLabel} - エンゲージメントTOP:`);
        allTweets.slice(0, 5).forEach((t, i) => {
            console.log(`  ${i + 1}. @${t.handle}: ${t.text.slice(0, 55)}...`);
            console.log(`     ❤️${t.likesRaw} 🔁${t.retweetsRaw} [${t.keyword}]`);
        });
        console.log('='.repeat(50));

        return filepath;
    } catch (err) {
        console.error('❌ エラー:', err.message);
    } finally {
        await browser.close();
    }
}

monitorNiche();
