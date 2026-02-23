import { TradeData } from '@/types/api';

export async function fetchTradeData(years: number[], area?: string, city?: string): Promise<TradeData[]> {
    const fetchYear = async (year: number) => {
        const params = new URLSearchParams({
            year: year.toString(),
            language: 'ja'
        });
        if (area) params.append('area', area);
        if (city) params.append('city', city);

        try {
            const response = await fetch(`/api/reins?${params.toString()}`);

            if (response.status === 404) {
                console.warn(`Data not found for year ${year} (404). Returning empty.`);
                return [];
            }

            if (!response.ok) {
                // Try to read error body if possible
                const errorText = await response.text();
                throw new Error(`API error: ${response.status} ${errorText}`);
            }

            const json = await response.json();
            if (json.status === 'OK' && Array.isArray(json.data)) {
                return json.data as TradeData[];
            } else {
                console.warn(`Unexpected API response structure for ${year}:`, json);
                return [];
            }
        } catch (error) {
            console.error(`Failed to fetch trade data for ${year}:`, error);
            // Return empty array to allow other years to succeed
            return [];
        }
    };

    const results = await Promise.all(years.map(y => fetchYear(y)));
    return results.flat();
}

