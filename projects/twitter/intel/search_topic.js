/**
 * search_topic.js
 * 指定キーワードでXを検索し、ツイートをリスト化してMarkdownに保存する
 *
 * 使い方:
 *   node search_topic.js "AIエージェント"
 *   node search_topic.js "AIエージェント" --limit 20
 *   node search_topic.js "AIエージェント" --summarize
 *   node search_topic.js "AIエージェント" --tab latest   # 最新順（デフォルト: top）
 *   node search_topic.js "AIエージェント" --headless
 */

const { launchBrowser, ensureLoggedIn, humanDelay, saveReport, getNow, getTimestamp } = require('./lib/browser');
const { summarizeTweets } = require('./lib/summarize');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, 'reports');

// コマンドライン引数を解析
const args = process.argv.slice(2);
const QUERY = args.find((a) => !a.startsWith('--')) || '';
const LIMIT = parseInt((args.find((a) => a.startsWith('--limit=')) || '--limit=10').split('=')[1]);
const DO_SUMMARIZE = args.includes('--summarize');
const HEADLESS = args.includes('--headless');
const TAB = args.includes('--tab') ? args[args.indexOf('--tab') + 1] : 'top';

if (!QUERY) {
    console.error('❌ 検索キーワードを指定してください。');
    console.error('   例: node search_topic.js "AIエージェント"');
    process.exit(1);
}

async function searchTopic() {
    console.log(`🔍 検索キーワード: "${QUERY}"`);
    console.log(`📋 取得件数: ${LIMIT}件 / タブ: ${TAB}`);

    const { browser, page } = await launchBrowser({ headless: HEADLESS });

    try {
        // ログイン確認
        const loggedIn = await ensureLoggedIn(page);
        if (!loggedIn) return;

        // 検索URLへ移動
        const encodedQuery = encodeURIComponent(QUERY);
        const tabParam = TAB === 'latest' ? 'live' : 'top';
        const searchUrl = `https://x.com/search?q=${encodedQuery}&src=typed_query&f=${tabParam}`;

        console.log(`🌐 検索ページへ移動: ${searchUrl}`);
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await humanDelay(2000, 4000);

        // ツイートコンテナの読み込み待ち
        await page.waitForSelector('[data-testid="tweet"]', { timeout: 15000 }).catch(() => {
            console.log('⚠️  ツイートの読み込みに時間がかかっています...');
        });

        // スクロールしてツイートをLIMIT件まで収集
        let tweets = [];
        let scrollCount = 0;
        const MAX_SCROLLS = Math.ceil(LIMIT / 3) + 3;

        while (tweets.length < LIMIT && scrollCount < MAX_SCROLLS) {
            const newTweets = await page.evaluate(() => {
                const tweetEls = document.querySelectorAll('[data-testid="tweet"]');
                return Array.from(tweetEls).map((el) => {
                    // 著者名
                    const authorEl = el.querySelector('[data-testid="User-Name"]');
                    const displayName = authorEl?.querySelector('span')?.textContent?.trim() || '';
                    const handleEl = authorEl?.querySelectorAll('span')[3];
                    const handle = handleEl?.textContent?.trim() || '';

                    // ツイート本文
                    const textEl = el.querySelector('[data-testid="tweetText"]');
                    const text = textEl?.textContent?.trim() || '';

                    // いいね数
                    const likeEl = el.querySelector('[data-testid="like"] span');
                    const likes = likeEl?.textContent?.trim() || '0';

                    // RT数
                    const rtEl = el.querySelector('[data-testid="retweet"] span');
                    const retweets = rtEl?.textContent?.trim() || '0';

                    // 返信数
                    const replyEl = el.querySelector('[data-testid="reply"] span');
                    const replies = replyEl?.textContent?.trim() || '0';

                    // 投稿日時
                    const timeEl = el.querySelector('time');
                    const time = timeEl?.getAttribute('datetime') || '';
                    const timeDisplay = timeEl?.textContent?.trim() || '';

                    // ツイートURL
                    const linkEl = el.querySelector('a[href*="/status/"]');
                    const tweetUrl = linkEl ? `https://x.com${linkEl.getAttribute('href')}` : '';

                    return { displayName, handle, text, likes, retweets, replies, time, timeDisplay, tweetUrl };
                });
            });

            // 重複除去（tweetUrlをキーに）
            const existing = new Set(tweets.map((t) => t.tweetUrl));
            const unique = newTweets.filter((t) => t.tweetUrl && !existing.has(t.tweetUrl) && t.text);
            tweets.push(...unique);

            if (tweets.length >= LIMIT) break;

            // スクロールダウン
            await page.evaluate(() => window.scrollBy(0, 1200));
            await humanDelay(1500, 2500);
            scrollCount++;
        }

        tweets = tweets.slice(0, LIMIT);
        console.log(`📋 ${tweets.length}件のツイートを収集しました`);

        // AI要約（オプション）
        let aiSummary = null;
        if (DO_SUMMARIZE) {
            aiSummary = await summarizeTweets(tweets, `「${QUERY}」に関するXの最新ツイート`);
        }

        // Markdown生成
        const now = getNow();
        const timestamp = getTimestamp();
        const safeQuery = QUERY.replace(/[^\w\u3040-\u9FFF]/g, '_').slice(0, 30);

        let md = `# 検索レポート: "${QUERY}"\n`;
        md += `> 収集日時: ${now} / 件数: ${tweets.length}件 / タブ: ${TAB}\n\n`;
        md += `---\n\n`;

        if (aiSummary) {
            md += aiSummary + '\n\n---\n\n';
        }

        md += `## 📋 ツイート一覧\n\n`;

        if (tweets.length === 0) {
            md += `⚠️ ツイートが取得できませんでした。キーワードを変えて再試行してください。\n`;
        } else {
            tweets.forEach((t, i) => {
                md += `### ${i + 1}. @${t.handle || t.displayName}\n`;
                md += `${t.text}\n\n`;
                md += `> ❤️ ${t.likes} &nbsp; 🔁 ${t.retweets} &nbsp; 💬 ${t.replies}`;
                if (t.timeDisplay) md += ` &nbsp; 🕐 ${t.timeDisplay}`;
                if (t.tweetUrl) md += ` &nbsp; [🔗 元ツイート](${t.tweetUrl})`;
                md += `\n\n`;
            });
        }

        md += `---\n\n`;
        md += `*このレポートは自動収集により生成されました。*\n`;

        const filename = `search_${safeQuery}_${timestamp}`;
        const filepath = saveReport(filename, md, REPORTS_DIR);

        // ターミナルにも表示
        console.log('\n' + '='.repeat(50));
        console.log(`🔍 "${QUERY}" の検索結果 TOP${tweets.length}:`);
        tweets.forEach((t, i) => {
            console.log(`  ${i + 1}. @${t.handle}: ${t.text.slice(0, 60)}...`);
            console.log(`     ❤️${t.likes} 🔁${t.retweets}`);
        });
        console.log('='.repeat(50));

        return filepath;
    } catch (err) {
        console.error('❌ エラー:', err.message);
    } finally {
        await browser.close();
    }
}

searchTopic();
