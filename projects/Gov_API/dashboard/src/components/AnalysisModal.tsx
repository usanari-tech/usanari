'use client';

import React, { useState } from 'react';
import { X, Calendar, Building, ListFilter } from 'lucide-react';

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (years: number[], quarter?: string, type?: string) => void;
}

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
const PROPERTY_TYPES = [
    { id: '01', name: '宅地(土地と建物)' },
    { id: '02', name: '中古マンション等' },
    { id: '03', name: '農地' },
    { id: '04', name: '林地' },
];

export default function AnalysisModal({ isOpen, onClose, onApply }: AnalysisModalProps) {
    const [selectedYears, setSelectedYears] = useState<number[]>([2023]);
    const [selectedType, setSelectedType] = useState<string>('01');

    if (!isOpen) return null;

    const toggleYear = (year: number) => {
        setSelectedYears(prev => {
            if (prev.includes(year)) {
                // Prevent deselecting all if only one is selected
                if (prev.length === 1) return prev;
                return prev.filter(y => y !== year);
            } else {
                return [...prev, year].sort((a, b) => b - a);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-stone-800">新規分析設定</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Year Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-teal-500" />
                            対象年度 (複数選択可)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {YEARS.map((year) => (
                                <button
                                    key={year}
                                    onClick={() => toggleYear(year)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${selectedYears.includes(year)
                                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                                        }`}
                                >
                                    {year}年
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Type Selection */}
                    {/* Note: Specific API types might need adjustment based on XIT001 spec, simplified here */}
                    {/* Actually XIT001 doesn't exactly filter by type in request params cleanly without post-filtering or correct code usage. 
             We'll omit passing type to API if it's not a direct param, or implement filtering client-side.
             For now, let's just show the UI for "future" implementation of type filtering.
          */}
                    <div className="space-y-3">
                        <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600">
                            ※ 現在は選択された年度の全取引データを取得します。
                            物件種別による絞り込みは今後のアップデートで提供予定です。
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 hover:text-stone-900 transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={() => onApply(selectedYears)}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm shadow-teal-200 transition-all hover:translate-y-[-1px]"
                    >
                        分析を開始
                    </button>
                </div>
            </div>
        </div>
    );
}
