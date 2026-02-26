/**
 * collect_trending.js
 * X（Twitter）のトレンドTOP10を収集してMarkdownに保存する
 *
 * 使い方:
 *   node collect_trending.js
 *   node collect_trending.js --headless   # ヘッドレスモード（画面表示なし）
 */

const { launchBrowser, ensureLoggedIn, humanDelay, saveReport, getNow, getTimestamp } = require('./lib/browser');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, 'reports');
const HEADLESS = process.argv.includes('--headless');

async function collectTrending() {
    const { browser, page } = await launchBrowser({ headless: HEADLESS });

    try {
        // ログイン確認
        const loggedIn = await ensureLoggedIn(page);
        if (!loggedIn) return;

        console.log('📊 トレンドページに移動中...');
        await page.goto('https://x.com/explore/tabs/trending', {
            waitUntil: 'networkidle2',
            timeout: 30000,
        });

        await humanDelay(2000, 4000);

        console.log('🔍 トレンドデータを取得中...');

        // トレンドアイテムを取得
        const trends = await page.evaluate(() => {
            const results = [];
            const trendCells = document.querySelectorAll('[data-testid="trend"]');

            trendCells.forEach((cell, idx) => {
                if (idx >= 10) return;

                // XのDOM構造:
                //   div[data-testid="trend"]
                //     > div（ラッパー）
                //       > div:nth-child(1) ← ランク番号 + "Trending in Japan" など
                //       > div:nth-child(2) ← トレンドワード（#タグ or ワード）
                //       > div:nth-child(3) ← 件数（任意）

                const innerWrapper = cell.querySelector('div');
                const children = innerWrapper ? Array.from(innerWrapper.children) : [];

                // 2番目の子がトレンドワード
                const trendName = (children[1]?.innerText || '').trim();

                // 3番目以降から件数を探す
                const countLine = children
                    .slice(2)
                    .map((c) => c.innerText?.trim() || '')
                    .find((t) => /件|posts?/i.test(t)) || '';

                results.push({
                    rank: idx + 1,
                    name: trendName || '（取得失敗）',
                    count: countLine,
                });
            });

            return results;
        });

        if (trends.length === 0) {
            // フォールバック: テキストベースで取得
            console.log('⚠️  標準セレクタで取得できず、フォールバック方式を試みます...');

            await page.waitForSelector('[data-testid="cellInnerDiv"]', { timeout: 10000 }).catch(() => { });

            const fallbackTrends = await page.evaluate(() => {
                const cells = document.querySelectorAll('[data-testid="cellInnerDiv"]');
                const results = [];
                let rank = 1;

                cells.forEach((cell) => {
                    const text = cell.textContent.trim();
                    // トレンドっぽい行を抽出（「何万件」「Trending」を含む）
                    if (
                        (text.includes('万件') || text.includes('posts') || text.length < 150) &&
                        !text.includes('おすすめ') &&
                        !text.includes('フォロー') &&
                        rank <= 10
                    ) {
                        const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
                        if (lines.length >= 1) {
                            results.push({
                                rank,
                                name: lines.find((l) => l.length > 1 && !l.includes('万件') && !l.includes('posts')) || lines[0],
                                count: lines.find((l) => l.includes('万件') || l.includes('posts') || l.includes('件')) || '',
                                raw: text.slice(0, 150),
                            });
                            rank++;
                        }
                    }
                });

                return results;
            });

            trends.push(...fallbackTrends);
        }

        console.log(`📋 ${trends.length}件のトレンドを取得しました`);

        // Markdown生成
        const now = getNow();
        const timestamp = getTimestamp();

        let md = `# X トレンド TOP10\n`;
        md += `> 収集日時: ${now}\n\n`;
        md += `---\n\n`;

        if (trends.length === 0) {
            md += `⚠️ トレンドデータの取得に失敗しました。Xのページ構造が変更された可能性があります。\n`;
        } else {
            trends.slice(0, 10).forEach((t) => {
                md += `## ${t.rank}. ${t.name || '（取得失敗）'}\n`;
                if (t.category) md += `- **カテゴリ**: ${t.category}\n`;
                if (t.count) md += `- **投稿数**: ${t.count}\n`;
                md += `\n`;
            });
        }

        md += `---\n\n`;
        md += `*このレポートは自動収集により生成されました。*\n`;

        const filename = `trending_${timestamp}`;
        const filepath = saveReport(filename, md, REPORTS_DIR);

        // ターミナルにも表示
        console.log('\n' + '='.repeat(50));
        console.log('📊 トレンド一覧:');
        trends.slice(0, 10).forEach((t) => {
            console.log(`  ${t.rank}. ${t.name} ${t.count ? `(${t.count})` : ''}`);
        });
        console.log('='.repeat(50));

        return filepath;
    } catch (err) {
        console.error('❌ エラー:', err.message);
    } finally {
        await browser.close();
    }
}

collectTrending();
