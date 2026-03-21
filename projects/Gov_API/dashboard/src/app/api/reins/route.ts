export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const API_BASE_URL = 'https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001';

export async function GET(request: Request) {
    // レート制限チェック（1分あたり20リクエスト/IP）
    const clientIp = getClientIp(request);
    const { allowed, remaining, resetAt } = rateLimit(clientIp, { maxRequests: 20, windowMs: 60_000 });

    if (!allowed) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: {
                    'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
                    'X-RateLimit-Remaining': '0',
                },
            }
        );
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const area = searchParams.get('area');
    const city = searchParams.get('city');

    // パラメータバリデーション
    if (!year || (!area && !city)) {
        return NextResponse.json(
            { error: 'Missing required parameters: year, and either area or city' },
            { status: 400 }
        );
    }

    if (!/^\d{4}$/.test(year)) {
        return NextResponse.json({ error: 'Invalid year format' }, { status: 400 });
    }
    if (area && !/^\d{2}$/.test(area)) {
        return NextResponse.json({ error: 'Invalid area format' }, { status: 400 });
    }
    if (city && !/^\d{5}$/.test(city)) {
        return NextResponse.json({ error: 'Invalid city format' }, { status: 400 });
    }

    const apiKey = process.env.REINS_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'API configuration error' },
            { status: 500 }
        );
    }

    // Construct the external API URL
    const apiUrl = new URL(API_BASE_URL);
    apiUrl.searchParams.set('year', year);
    if (area) apiUrl.searchParams.set('area', area);
    if (city) apiUrl.searchParams.set('city', city);
    // Default to Japanese
    apiUrl.searchParams.set('language', 'ja');

    try {
        const response = await fetch(apiUrl.toString(), {
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey,
            },
        });

        if (!response.ok) {
            console.error('Upstream API error:', response.status);
            return NextResponse.json(
                { error: 'Data fetch failed' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Proxy Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
