/**
 * lib/browser.js
 * Puppeteer共通設定モジュール
 * - puppeteer-extra-plugin-stealth でbot検出を回避
 * - x_cookies.json が存在する場合はクッキー注入でログイン（推奨）
 * - なければ user_data セッションにフォールバック
 *
 * 【クッキーの取得方法】
 * 1. 通常のChromeでx.comにログインする
 * 2. Chrome拡張「EditThisCookie」などでクッキーをJSONエクスポート
 * 3. intel/x_cookies.json として保存する
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');

// stealth プラグインを適用（bot検出回避）
puppeteer.use(StealthPlugin());

// クッキーJSONファイルのパス（優先）
const COOKIES_FILE = path.resolve(__dirname, '../x_cookies.json');
// user_dataセッションのパス（フォールバック）
const USER_DATA_DIR = path.resolve(__dirname, '../../automation/user_data');

/**
 * ブラウザを起動してページを返す
 * @param {object} options
 * @param {boolean} options.headless - trueでヘッドレス（デフォルト: false）
 * @returns {Promise<{browser, page}>}
 */
async function launchBrowser({ headless = false } = {}) {
    console.log('🚀 ブラウザを起動中...');

    const hasCookies = fs.existsSync(COOKIES_FILE);

    const launchOptions = {
        headless,
        defaultViewport: null,
        args: [
            '--start-maximized',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
        ],
    };

    // クッキーファイルがない場合のみ user_data を使用
    if (!hasCookies) {
        launchOptions.userDataDir = USER_DATA_DIR;
        console.log(`📁 セッション方式: user_data`);
    } else {
        console.log(`🍪 セッション方式: クッキー注入 (${COOKIES_FILE})`);
    }

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // User-Agentを一般的なChrome相当に設定
    await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );

    // クッキーを注入する場合
    if (hasCookies) {
        await injectCookies(page);
    }

    return { browser, page };
}

/**
 * x_cookies.json からクッキーを読み込んでページに注入する
 * EditThisCookie / Get cookies.txt LOCALLY などのエクスポート形式に対応
 */
async function injectCookies(page) {
    try {
        const raw = fs.readFileSync(COOKIES_FILE, 'utf-8');
        let cookies = JSON.parse(raw);

        // EditThisCookie形式 → Puppeteer形式に変換
        const normalized = cookies.map((c) => {
            const cookie = {
                name: c.name,
                value: c.value,
                domain: c.domain || '.x.com',
                path: c.path || '/',
                httpOnly: c.httpOnly || false,
                secure: c.secure || false,
            };
            // sameSite の正規化
            if (c.sameSite) {
                const ss = c.sameSite.toLowerCase();
                if (ss === 'no_restriction' || ss === 'none') cookie.sameSite = 'None';
                else if (ss === 'lax') cookie.sameSite = 'Lax';
                else if (ss === 'strict') cookie.sameSite = 'Strict';
            }
            // expires の変換
            if (c.expirationDate) cookie.expires = Math.floor(c.expirationDate);
            return cookie;
        });

        // まずx.comに移動してからクッキーをセット
        await page.goto('https://x.com', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.setCookie(...normalized);
        console.log(`✅ クッキー注入完了 (${normalized.length}件)`);
    } catch (e) {
        console.error('❌ クッキー読み込みエラー:', e.message);
    }
}

/**
 * ログイン状態を確認し、未ログインなら待機する
 * @param {object} page - Puppeteer ページオブジェクト
 * @returns {Promise<boolean>} - ログイン成功: true
 */
async function ensureLoggedIn(page) {
    await page.goto('https://x.com/home', { waitUntil: 'networkidle2', timeout: 30000 });

    const isLoggedIn = await page.$('[data-testid="SideNav_AccountSwitcher_Button"]');

    if (!isLoggedIn) {
        const hasCookies = fs.existsSync(COOKIES_FILE);
        if (hasCookies) {
            console.log('⚠️  クッキーが失効している可能性があります。');
            console.log('   Chromeでx.comにログインし、クッキーを再エクスポートしてください。');
            console.log(`   保存先: ${COOKIES_FILE}`);
            return false;
        }

        console.log('⚠️  未ログイン状態です。ブラウザでログインしてください...');
        console.log('⏳ ログイン完了まで最大5分待機します...');

        try {
            await page.waitForSelector('[data-testid="SideNav_AccountSwitcher_Button"]', {
                timeout: 300000,
            });
            console.log('✅ ログイン確認！');
        } catch (e) {
            console.error('❌ ログインタイムアウト。再度実行してください。');
            return false;
        }
    } else {
        console.log('✅ ログイン済み');
    }

    return true;
}

/**
 * ランダムな待機時間（人間らしい操作をエミュレート）
 * @param {number} minMs - 最小待機(ms)
 * @param {number} maxMs - 最大待機(ms)
 */
async function humanDelay(minMs = 1000, maxMs = 3000) {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    await new Promise((r) => setTimeout(r, delay));
}

/**
 * Markdownファイルを reports/ フォルダに保存
 * @param {string} filename - ファイル名（拡張子なし）
 * @param {string} content - Markdown内容
 * @param {string} reportsDir - 保存先ディレクトリ
 */
function saveReport(filename, content, reportsDir) {
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }
    const filepath = path.join(reportsDir, `${filename}.md`);
    fs.writeFileSync(filepath, content, 'utf-8');
    console.log(`\n✅ レポート保存: ${filepath}`);
    return filepath;
}

/**
 * 現在時刻のフォーマット済み文字列を返す
 * @returns {string} YYYY/MM/DD HH:MM
 */
function getNow() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * ファイル名用タイムスタンプ
 * @returns {string} YYYYMMDD_HHMM
 */
function getTimestamp() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

module.exports = { launchBrowser, ensureLoggedIn, humanDelay, saveReport, getNow, getTimestamp };
