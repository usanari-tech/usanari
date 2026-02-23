'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

interface YearSelectorProps {
    selectedYears: number[];
    onChange: (years: number[]) => void;
}

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

export default function YearSelector({ selectedYears, onChange }: YearSelectorProps) {
    const toggleYear = (year: number) => {
        if (selectedYears.includes(year)) {
            // Prevent deselecting all if only one is selected
            if (selectedYears.length === 1) return;
            onChange(selectedYears.filter(y => y !== year).sort((a, b) => b - a));
        } else {
            onChange([...selectedYears, year].sort((a, b) => b - a));
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm mb-4">
            <h3 className="text-sm font-semibold text-stone-700 flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-teal-500" />
                対象年度
            </h3>
            <div className="flex flex-wrap gap-2">
                {YEARS.map((year) => (
                    <button
                        key={year}
                        onClick={() => toggleYear(year)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${selectedYears.includes(year)
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-100'
                            }`}
                    >
                        {year}
                    </button>
                ))}
            </div>
        </div>
    );
}
