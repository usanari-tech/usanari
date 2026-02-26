/**
 * automation/post_tweet.js
 * X（Twitter）にツイートを投稿するスクリプト
 *
 * 使い方:
 *   node post_tweet.js "ツイート内容"
 *   node post_tweet.js "ツイート内容" --headless
 *
 * ※ x_cookies.json は intel/ フォルダにあるものを共有して使用
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');

puppeteer.use(StealthPlugin());

const COOKIES_FILE = path.resolve(__dirname, '../intel/x_cookies.json');
const USER_DATA_DIR = path.resolve(__dirname, 'user_data');
const HEADLESS = process.argv.includes('--headless');

// 投稿内容（引数から取得）
const tweetContent = process.argv.find((a) => !a.startsWith('--') && a !== process.argv[0] && a !== process.argv[1]) || '';

if (!tweetContent) {
    console.error('❌ ツイート内容を引数で指定してください。');
    console.error('   例: node post_tweet.js "投稿したい内容"');
    process.exit(1);
}

async function injectCookies(page) {
    try {
        const raw = fs.readFileSync(COOKIES_FILE, 'utf-8');
        const cookies = JSON.parse(raw);

        const normalized = cookies.map((c) => {
            const cookie = {
                name: c.name,
                value: c.value,
                domain: c.domain || '.x.com',
                path: c.path || '/',
                httpOnly: c.httpOnly || false,
                secure: c.secure || false,
            };
            if (c.sameSite) {
                const ss = c.sameSite.toLowerCase();
                if (ss === 'no_restriction' || ss === 'none') cookie.sameSite = 'None';
                else if (ss === 'lax') cookie.sameSite = 'Lax';
                else if (ss === 'strict') cookie.sameSite = 'Strict';
            }
            if (c.expirationDate) cookie.expires = Math.floor(c.expirationDate);
            return cookie;
        });

        await page.goto('https://x.com', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.setCookie(...normalized);
        console.log(`✅ クッキー注入完了 (${normalized.length}件)`);
    } catch (e) {
        console.error('❌ クッキー読み込みエラー:', e.message);
    }
}

(async () => {
    console.log('🚀 ブラウザ起動中...');
    console.log(`📝 投稿内容 (${tweetContent.length}文字):\n${tweetContent}\n`);

    const hasCookies = fs.existsSync(COOKIES_FILE);

    const launchOptions = {
        headless: HEADLESS,
        defaultViewport: HEADLESS ? { width: 1280, height: 900 } : null,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            ...(HEADLESS ? [] : ['--start-maximized']),
        ],
    };

    if (!hasCookies) {
        launchOptions.userDataDir = USER_DATA_DIR;
    }

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );

    try {
        // クッキー注入
        if (hasCookies) {
            await injectCookies(page);
        }

        // ログイン確認
        console.log('🔐 ログイン確認中...');
        await page.goto('https://x.com/home', { waitUntil: 'networkidle2', timeout: 30000 });

        const isLoggedIn = await page.$('[data-testid="SideNav_AccountSwitcher_Button"]');
        if (!isLoggedIn) {
            console.error('❌ ログインできません。x_cookies.json を確認してください。');
            await browser.close();
            return;
        }
        console.log('✅ ログイン済み');

        // 投稿画面へ
        console.log('✍️  投稿画面へ移動中...');
        await page.goto('https://x.com/compose/post', { waitUntil: 'networkidle2', timeout: 30000 });

        // テキストエリア待機
        const selector = '[data-testid="tweetTextarea_0"]';
        await page.waitForSelector(selector, { timeout: 15000 });

        // テキスト入力
        await page.click(selector);
        await page.keyboard.type(tweetContent, { delay: 30 });

        // 文字数確認
        const charCount = tweetContent.length;
        console.log(`📏 文字数: ${charCount}/280`);

        // 少し待機（人間らしく）
        await new Promise((r) => setTimeout(r, 1500));

        // 投稿ボタンクリック
        console.log('👆 投稿ボタンをクリック中...');
        const postButtonSelector = '[data-testid="tweetButton"]';
        await page.waitForSelector(postButtonSelector, { timeout: 10000 });
        await page.click(postButtonSelector);

        // 投稿完了待機
        await new Promise((r) => setTimeout(r, 4000));

        // 成功確認（ホームに戻るか投稿一覧に遷移するか）
        const currentUrl = page.url();
        if (currentUrl.includes('compose')) {
            console.log('⚠️  投稿が完了しなかった可能性があります。確認してください。');
        } else {
            console.log('🎉 投稿完了！');
        }

    } catch (err) {
        console.error('❌ エラー:', err.message);
    } finally {
        await browser.close();
    }
})();
