
import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface TrendData {
    period: string; // e.g. "2023"
    unitPrice: number; // e.g. 350000
    count: number;
}

interface DistrictTrendTableProps {
    data: TrendData[];
    districtName: string;
}

export default function DistrictTrendTable({ data, districtName }: DistrictTrendTableProps) {
    // Sort descending by year (newest first)
    const sortedData = [...data].sort((a, b) => parseInt(b.period) - parseInt(a.period));

    // Calculate YoY
    const processedData = sortedData.map((item, index) => {
        const nextItem = sortedData[index + 1]; // Previous year (since sorted desc)
        let yoy = 0;
        let isAvailable = false;

        if (nextItem && nextItem.unitPrice > 0) {
            yoy = ((item.unitPrice - nextItem.unitPrice) / nextItem.unitPrice) * 100;
            isAvailable = true;
        }

        return {
            ...item,
            prevUnitPrice: nextItem?.unitPrice,
            yoy,
            isAvailable
        };
    });

    return (
        <div className="h-full flex flex-col bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-stone-700 text-sm">変動率 (対前年比)</h3>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                    <thead className="bg-stone-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-stone-500 text-xs">年</th>
                            <th className="px-4 py-2 text-right font-medium text-stone-500 text-xs">平米単価</th>
                            <th className="px-4 py-2 text-right font-medium text-stone-500 text-xs">変動率</th>
                            <th className="px-4 py-2 text-center font-medium text-stone-500 text-xs">推移</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {processedData.map((row) => (
                            <tr key={row.period} className="hover:bg-stone-50/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-stone-700">{row.period}年</td>
                                <td className="px-4 py-3 text-right text-stone-600">
                                    {row.unitPrice.toLocaleString()} <span className="text-[10px] text-stone-400">円/m²</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {row.isAvailable ? (
                                        <span className={`font-bold ${row.yoy > 0 ? 'text-teal-600' : row.yoy < 0 ? 'text-stone-500' : 'text-stone-400'}`}>
                                            {row.yoy > 0 ? '+' : ''}{row.yoy.toFixed(1)}%
                                        </span>
                                    ) : (
                                        <span className="text-stone-300">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {row.isAvailable ? (
                                        row.yoy > 0 ? <ArrowUp className="w-4 h-4 text-teal-600 mx-auto" /> :
                                            row.yoy < 0 ? <ArrowDown className="w-4 h-4 text-stone-400 mx-auto" /> :
                                                <Minus className="w-4 h-4 text-stone-300 mx-auto" />
                                    ) : (
                                        <span className="text-[10px] text-stone-400">前年データなし</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {processedData.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-4 text-stone-400">データがありません</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
