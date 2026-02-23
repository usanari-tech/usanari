import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const area = searchParams.get('area');
    const city = searchParams.get('city');

    if (!year || (!area && !city)) {
        return NextResponse.json(
            { error: 'Missing required parameters: year, and either area or city' },
            { status: 400 }
        );
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
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: 'Upstream API error', details: errorData },
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
