import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface TransactionTableProps {
    data: any[];
}

const ITEMS_PER_PAGE = 50;

type SortKey = 'Period' | 'TradePrice' | 'Area' | 'FloorPlan';
type SortDirection = 'asc' | 'desc';

export default function TransactionTable({ data }: TransactionTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);

    // Sorting Logic
    const sortedData = useMemo(() => {
        if (!sortConfig) return data;

        return [...data].sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            // Numeric handling
            if (sortConfig.key === 'TradePrice') {
                aValue = parseInt(a.TradePrice || '0');
                bValue = parseInt(b.TradePrice || '0');
            } else if (sortConfig.key === 'Area') {
                aValue = parseInt(a.Area || '0');
                bValue = parseInt(b.Area || '0');
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortConfig]);

    // Pagination Logic (applied to sorted data)
    const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
    const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

    // Sort Handler
    const handleSort = (key: SortKey) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'desc' }; // Default to desc for new sort
        });
        setCurrentPage(1); // Reset to page 1 on sort
    };

    const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
        if (sortConfig?.key !== columnKey) return <ArrowUpDown className="w-4 h-4 text-stone-300" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="w-4 h-4 text-teal-600" />
            : <ArrowDown className="w-4 h-4 text-teal-600" />;
    };

    // Reset page when data length changes significantly
    useEffect(() => {
        setCurrentPage(1);
    }, [data.length]);


    return (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100/60 overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white shrink-0">
                <h3 className="font-semibold text-stone-700 flex items-center gap-2">
                    最新の取引データ一覧
                </h3>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-stone-500">
                        {sortedData.length}件中 {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedData.length)}件を表示
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            className="p-1 rounded hover:bg-stone-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-stone-600" />
                        </button>
                        <span className="text-sm font-medium text-stone-600 min-w-[3rem] text-center">
                            {currentPage} / {totalPages || 1}
                        </span>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-1 rounded hover:bg-stone-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-stone-600" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-auto min-h-[500px]">
                <table className="w-full text-left text-sm text-stone-600">
                    <thead className="bg-stone-50 text-xs uppercase text-stone-500 font-semibold sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th
                                className="px-6 py-4 bg-stone-50 cursor-pointer hover:bg-stone-100 transition-colors group select-none"
                                onClick={() => handleSort('Period')}
                            >
                                <div className="flex items-center gap-1">
                                    取引時期
                                    <SortIcon columnKey="Period" />
                                </div>
                            </th>
                            <th className="px-6 py-4 bg-stone-50">種類</th>
                            <th className="px-6 py-4 bg-stone-50">エリア</th>
                            <th
                                className="px-6 py-4 bg-stone-50 cursor-pointer hover:bg-stone-100 transition-colors group select-none"
                                onClick={() => handleSort('TradePrice')}
                            >
                                <div className="flex items-center gap-1">
                                    価格
                                    <SortIcon columnKey="TradePrice" />
                                </div>
                            </th>
                            <th
                                className="px-6 py-4 bg-stone-50 cursor-pointer hover:bg-stone-100 transition-colors group select-none"
                                onClick={() => handleSort('Area')}
                            >
                                <div className="flex items-center gap-1">
                                    面積
                                    <SortIcon columnKey="Area" />
                                </div>
                            </th>
                            <th
                                className="px-6 py-4 bg-stone-50 cursor-pointer hover:bg-stone-100 transition-colors group select-none"
                                onClick={() => handleSort('FloorPlan')}
                            >
                                <div className="flex items-center gap-1">
                                    間取り
                                    <SortIcon columnKey="FloorPlan" />
                                </div>
                            </th>
                            <th className="px-6 py-4 bg-stone-50">築年数</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {currentData.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-stone-400">
                                    データが見つかりません
                                </td>
                            </tr>
                        ) : (
                            currentData.map((item, index) => (
                                <tr key={index} className="hover:bg-stone-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">{item.Period}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.Type.includes('マンション')
                                            ? 'bg-teal-50 text-teal-700'
                                            : item.Type.includes('宅地')
                                                ? 'bg-stone-100 text-stone-700'
                                                : 'bg-stone-50 text-stone-600'
                                            }`}>
                                            {item.Type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.Municipality} {item.DistrictName}</td>
                                    <td className="px-6 py-4 font-medium text-stone-900 whitespace-nowrap">
                                        ¥{(parseInt(item.TradePrice) / 10000).toLocaleString()}万
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.Area}m²</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.FloorPlan || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-stone-500">
                                        {(() => {
                                            if (!item.BuildingYear) return '-';
                                            const match = item.BuildingYear.match(/(\d{4})/);
                                            if (!match) return item.BuildingYear;
                                            const age = new Date().getFullYear() - parseInt(match[1]);
                                            return age >= 0 ? `築${age}年` : '-';
                                        })()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
