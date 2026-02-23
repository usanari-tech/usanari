import { TradeData, MonthlyPrice } from '@/types/api';
import sampleData from '@/data/mock/sample_prices.json';

// モックデータを型付きで返す
export const getMockTradeData = (): TradeData[] => {
    return sampleData as TradeData[];
};

// グラフ用にデータを集計する (四半期ごとの平均単価など)
export const getAggregatedPriceData = (): MonthlyPrice[] => {
    const data = getMockTradeData();
    const aggregated: Record<string, { totalUnitPrice: number; count: number }> = {};

    data.forEach((item) => {
        // Period: "2023年第3四半期" -> "2023-Q3"
        const period = item.Period.replace('年第', '-Q').replace('四半期', '');
        const unitPrice = parseInt(item.UnitPrice || '0', 10);

        if (unitPrice > 0) {
            if (!aggregated[period]) {
                aggregated[period] = { totalUnitPrice: 0, count: 0 };
            }
            aggregated[period].totalUnitPrice += unitPrice;
            aggregated[period].count += 1;
        }
    });

    return Object.entries(aggregated).map(([period, val]) => ({
        period,
        price: Math.round(val.totalUnitPrice / val.count), // 平均平米単価
        unitPrice: Math.round(val.totalUnitPrice / val.count),
        count: val.count,
    })).sort((a, b) => a.period.localeCompare(b.period));
};
