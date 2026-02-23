import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const API_BASE_URL = 'https://www.reinfolib.mlit.go.jp/ex-api/external';

// Static list of prefectures since API doesn't provide one
const PREFECTURES = [
    { code: '01', name: '北海道' }, { code: '02', name: '青森県' }, { code: '03', name: '岩手県' },
    { code: '04', name: '宮城県' }, { code: '05', name: '秋田県' }, { code: '06', name: '山形県' },
    { code: '07', name: '福島県' }, { code: '08', name: '茨城県' }, { code: '09', name: '栃木県' },
    { code: '10', name: '群馬県' }, { code: '11', name: '埼玉県' }, { code: '12', name: '千葉県' },
    { code: '13', name: '東京都' }, { code: '14', name: '神奈川県' }, { code: '15', name: '新潟県' },
    { code: '16', name: '富山県' }, { code: '17', name: '石川県' }, { code: '18', name: '福井県' },
    { code: '19', name: '山梨県' }, { code: '20', name: '長野県' }, { code: '21', name: '岐阜県' },
    { code: '22', name: '静岡県' }, { code: '23', name: '愛知県' }, { code: '24', name: '三重県' },
    { code: '25', name: '滋賀県' }, { code: '26', name: '京都府' }, { code: '27', name: '大阪府' },
    { code: '28', name: '兵庫県' }, { code: '29', name: '奈良県' }, { code: '30', name: '和歌山県' },
    { code: '31', name: '鳥取県' }, { code: '32', name: '島根県' }, { code: '33', name: '岡山県' },
    { code: '34', name: '広島県' }, { code: '35', name: '山口県' }, { code: '36', name: '徳島県' },
    { code: '37', name: '香川県' }, { code: '38', name: '愛媛県' }, { code: '39', name: '高知県' },
    { code: '40', name: '福岡県' }, { code: '41', name: '佐賀県' }, { code: '42', name: '長崎県' },
    { code: '43', name: '熊本県' }, { code: '44', name: '大分県' }, { code: '45', name: '宮崎県' },
    { code: '46', name: '鹿児島県' }, { code: '47', name: '沖縄県' }
];

export async function GET(request: Request) {
    // レート制限チェック（1分あたり30リクエスト/IP - エリア選択は連続操作が多いため緩め）
    const clientIp = getClientIp(request);
    const { allowed } = rateLimit(clientIp, { maxRequests: 30, windowMs: 60_000 });

    if (!allowed) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
        );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'prefecture' | 'city'
    const areaCode = searchParams.get('area'); // Prefecture code (needed for city list)

    // パラメータバリデーション
    if (type && !['prefecture', 'city'].includes(type)) {
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
    if (areaCode && !/^\d{2}$/.test(areaCode)) {
        return NextResponse.json({ error: 'Invalid area code format' }, { status: 400 });
    }

    const apiKey = process.env.REINS_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    // Handle Prefecture List (Static)
    if (type === 'prefecture') {
        return NextResponse.json({
            status: 'OK',
            data: PREFECTURES
        });
    }

    // Handle City List (XIT002)
    if (type === 'city' && areaCode) {
        const endpoint = '/XIT002';
        const queryParams = new URLSearchParams();
        queryParams.set('area', areaCode);
        queryParams.set('language', 'ja');

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}?${queryParams.toString()}`, {
                headers: {
                    'Ocp-Apim-Subscription-Key': apiKey,
                },
            });

            if (!response.ok) {
                const text = await response.text();
                console.error(`API Error (${endpoint}):`, response.status, text);
                return NextResponse.json(
                    { error: 'Upstream API error' },
                    { status: response.status }
                );
            }

            const data = await response.json();
            // XIT002 returns { status: "OK", data: [ { id: "13101", name: "千代田区" }, ... ] }
            // We map id -> code to match our internal interface
            if (data.status === 'OK' && Array.isArray(data.data)) {
                const mappedData = data.data.map((item: any) => ({
                    code: item.id,
                    name: item.name
                }));
                return NextResponse.json({ status: 'OK', data: mappedData });
            }

            return NextResponse.json(data);
        } catch (error) {
            console.error('API Proxy Error:', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
}
