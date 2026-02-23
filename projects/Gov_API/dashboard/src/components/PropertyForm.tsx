'use client';

import React, { useState } from 'react';
import { Search, Home, Building2, LandPlot } from 'lucide-react';

export interface PropertyCondition {
    type: string;
    area: number;
    floorPlan: string;
    buildingAge: string;
}

interface PropertyFormProps {
    onSubmit: (condition: PropertyCondition) => void;
    loading?: boolean;
}

const PROPERTY_TYPES = [
    { value: '中古マンション等', label: 'マンション', Icon: Building2 },
    { value: '宅地(土地と建物)', label: '戸建て', Icon: Home },
    { value: '宅地(土地)', label: '土地', Icon: LandPlot },
];

const FLOOR_PLANS = [
    { value: '', label: '指定なし' },
    { value: '1K', label: '1K' },
    { value: '1LDK', label: '1LDK' },
    { value: '2LDK', label: '2LDK' },
    { value: '3LDK', label: '3LDK' },
    { value: '4LDK', label: '4LDK' },
    { value: '5LDK', label: '5LDK以上' },
];

const BUILDING_AGES = [
    { value: '', label: '指定なし' },
    { value: '0-5', label: '築5年以内' },
    { value: '5-10', label: '築5〜10年' },
    { value: '10-20', label: '築10〜20年' },
    { value: '20-30', label: '築20〜30年' },
    { value: '30+', label: '築30年以上' },
];

export default function PropertyForm({ onSubmit, loading }: PropertyFormProps) {
    const [type, setType] = useState('中古マンション等');
    const [area, setArea] = useState(60);
    const [floorPlan, setFloorPlan] = useState('');
    const [buildingAge, setBuildingAge] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ type, area, floorPlan, buildingAge });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Type */}
            <div>
                <label className="text-sm font-semibold text-stone-700 mb-3 block">物件の種類</label>
                <div className="grid grid-cols-3 gap-3">
                    {PROPERTY_TYPES.map((pt) => {
                        const Icon = pt.Icon;
                        return (
                            <button
                                key={pt.value}
                                type="button"
                                onClick={() => setType(pt.value)}
                                className={`px-3 py-4 rounded-lg border text-center transition-all ${type === pt.value
                                        ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600/20'
                                        : 'border-stone-200 bg-white hover:border-stone-300'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 mx-auto mb-2 ${type === pt.value ? 'text-teal-600' : 'text-stone-400'}`} />
                                <span className={`text-xs font-semibold ${type === pt.value ? 'text-teal-700' : 'text-stone-600'}`}>
                                    {pt.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Area Input */}
            <div>
                <div className="flex items-baseline justify-between mb-3">
                    <label className="text-sm font-semibold text-stone-700">
                        {type === '宅地(土地)' ? '土地面積' : '専有面積'}
                    </label>
                    <span className="text-sm font-bold text-stone-900 tabular-nums">{area} m²</span>
                </div>
                <input
                    type="range"
                    min={10}
                    max={200}
                    step={5}
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-1.5">
                    <span>10m²</span>
                    <span>100m²</span>
                    <span>200m²</span>
                </div>
            </div>

            {/* Floor Plan & Building Age */}
            {type !== '宅地(土地)' && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-semibold text-stone-700 mb-2 block">間取り</label>
                        <select
                            value={floorPlan}
                            onChange={(e) => setFloorPlan(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm text-stone-700 bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600/20 outline-none"
                        >
                            {FLOOR_PLANS.map((fp) => (
                                <option key={fp.value} value={fp.value}>{fp.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-stone-700 mb-2 block">築年数</label>
                        <select
                            value={buildingAge}
                            onChange={(e) => setBuildingAge(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm text-stone-700 bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600/20 outline-none"
                        >
                            {BUILDING_AGES.map((ba) => (
                                <option key={ba.value} value={ba.value}>{ba.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-stone-300 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        分析中...
                    </>
                ) : (
                    <>
                        <Search className="w-4 h-4" />
                        この条件で相場をチェック
                    </>
                )}
            </button>
        </form>
    );
}
