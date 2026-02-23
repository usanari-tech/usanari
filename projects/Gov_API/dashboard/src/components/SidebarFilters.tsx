'use client';

import React from 'react';
import { Filter } from 'lucide-react';

export interface FilterState {
    types: string[];
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    layouts: string[];
}

interface SidebarFiltersProps {
    filters: FilterState;
    onChange: (filters: FilterState) => void;
}

const PROPERTY_TYPES = ['中古マンション等', '宅地(土地と建物)', '宅地(土地)'];
const LAYOUT_TYPES = ['1R', '1K', '1DK', '1LDK', '2K', '2DK', '2LDK', '3K', '3DK', '3LDK', '4LDK'];

export default function SidebarFilters({ filters, onChange }: SidebarFiltersProps) {

    const handleTypeToggle = (type: string) => {
        const newTypes = filters.types.includes(type)
            ? filters.types.filter(t => t !== type)
            : [...filters.types, type];
        onChange({ ...filters, types: newTypes });
    };

    const handleLayoutToggle = (layout: string) => {
        const newLayouts = filters.layouts.includes(layout)
            ? filters.layouts.filter(l => l !== layout)
            : [...filters.layouts, layout];
        onChange({ ...filters, layouts: newLayouts });
    };

    const handleNumberChange = (field: keyof FilterState, value: string) => {
        const num = value === '' ? undefined : parseInt(value, 10);
        onChange({ ...filters, [field]: num });
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm mb-4">
            <h3 className="text-sm font-semibold text-stone-700 flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-teal-500" />
                絞り込み条件
            </h3>

            {/* Property Type */}
            <div className="mb-4">
                <label className="text-xs font-semibold text-stone-500 mb-2 block">種類</label>
                <div className="space-y-1">
                    {PROPERTY_TYPES.map(type => (
                        <label key={type} className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer hover:text-stone-900">
                            <input
                                type="checkbox"
                                checked={filters.types.includes(type)}
                                onChange={() => handleTypeToggle(type)}
                                className="rounded text-teal-600 focus:ring-teal-500 border-stone-300"
                            />
                            {type}
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-4">
                <label className="text-xs font-semibold text-stone-500 mb-2 block">価格 (万円)</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="下限"
                        value={filters.minPrice || ''}
                        onChange={(e) => handleNumberChange('minPrice', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-teal-500"
                    />
                    <span className="text-stone-400">~</span>
                    <input
                        type="number"
                        placeholder="上限"
                        value={filters.maxPrice || ''}
                        onChange={(e) => handleNumberChange('maxPrice', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-teal-500"
                    />
                </div>
            </div>

            {/* Area Size */}
            <div className="mb-4">
                <label className="text-xs font-semibold text-stone-500 mb-2 block">面積 (㎡)</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="下限"
                        value={filters.minArea || ''}
                        onChange={(e) => handleNumberChange('minArea', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-teal-500"
                    />
                    <span className="text-stone-400">~</span>
                    <input
                        type="number"
                        placeholder="上限"
                        value={filters.maxArea || ''}
                        onChange={(e) => handleNumberChange('maxArea', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-teal-500"
                    />
                </div>
            </div>

            {/* Layout */}
            <div>
                <label className="text-xs font-semibold text-stone-500 mb-2 block">間取り</label>
                <div className="flex flex-wrap gap-1">
                    {LAYOUT_TYPES.map(layout => (
                        <button
                            key={layout}
                            onClick={() => handleLayoutToggle(layout)}
                            className={`px-2 py-1 text-[10px] rounded border transition-colors ${filters.layouts.includes(layout)
                                ? 'bg-teal-50 text-teal-600 border-teal-200 font-medium'
                                : 'bg-white text-stone-500 border-stone-100 hover:border-stone-300'
                                }`}
                        >
                            {layout}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
