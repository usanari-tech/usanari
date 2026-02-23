/**
 * シンプルなインメモリ レート制限
 * Vercel Serverless Functions 向け（インスタンス単位で動作）
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// 古いエントリを定期的にクリーン（メモリリーク防止）
const CLEANUP_INTERVAL = 60_000; // 1分
let lastCleanup = Date.now();

function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const [key, entry] of store) {
        if (now > entry.resetAt) {
            store.delete(key);
        }
    }
}

interface RateLimitConfig {
    /** ウィンドウあたりの最大リクエスト数 */
    maxRequests: number;
    /** ウィンドウの長さ（ミリ秒） */
    windowMs: number;
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

export function rateLimit(
    ip: string,
    config: RateLimitConfig = { maxRequests: 20, windowMs: 60_000 }
): RateLimitResult {
    cleanup();

    const now = Date.now();
    const entry = store.get(ip);

    // 新規 or ウィンドウ期限切れ → リセット
    if (!entry || now > entry.resetAt) {
        const newEntry: RateLimitEntry = {
            count: 1,
            resetAt: now + config.windowMs,
        };
        store.set(ip, newEntry);
        return { allowed: true, remaining: config.maxRequests - 1, resetAt: newEntry.resetAt };
    }

    // ウィンドウ内 → カウント増加
    entry.count++;
    const remaining = Math.max(0, config.maxRequests - entry.count);

    if (entry.count > config.maxRequests) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    return { allowed: true, remaining, resetAt: entry.resetAt };
}

/**
 * リクエストからIPアドレスを取得
 * Vercelでは x-forwarded-for ヘッダーにクライアントIPが入る
 */
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIp = request.headers.get('x-real-ip');
    if (realIp) return realIp;
    return 'unknown';
}
