'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, ChevronDown } from 'lucide-react';

interface AreaSelectorProps {
    onSelect: (prefectureCode: string, cityCode?: string, prefName?: string, cityName?: string) => void;
    className?: string;
}

interface Area {
    code: string;
    name: string;
}

interface Prefecture extends Area {
    region?: string;
}

const REGIONS = [
    { name: '北海道・東北', prefs: ['01', '02', '03', '04', '05', '06', '07'] },
    { name: '関東', prefs: ['08', '09', '10', '11', '12', '13', '14'] },
    { name: '甲信越・北陸', prefs: ['15', '16', '17', '18', '19', '20'] },
    { name: '東海', prefs: ['21', '22', '23', '24'] },
    { name: '関西', prefs: ['25', '26', '27', '28', '29', '30'] },
    { name: '中国', prefs: ['31', '32', '33', '34', '35'] },
    { name: '四国', prefs: ['36', '37', '38', '39'] },
    { name: '九州・沖縄', prefs: ['40', '41', '42', '43', '44', '45', '46', '47'] },
];

export function cn(...inputs: (string | undefined | null | false)[]) {
    return inputs.filter(Boolean).join(' ');
}

const AreaSelector: React.FC<AreaSelectorProps> = ({ onSelect, className }) => {
    const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
    const [loadingPrefs, setLoadingPrefs] = useState(true);

    // Selection state
    const [selectedRegion, setSelectedRegion] = useState<string>('関東');
    const [selectedPref, setSelectedPref] = useState<string>('13'); // Tokyo default
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [cities, setCities] = useState<Record<string, Area[]>>({});
    const [loadingCities, setLoadingCities] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrefectures = async () => {
            try {
                const res = await fetch('/api/areas?type=prefecture');
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'OK') {
                        setPrefectures(data.data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch prefectures:', error);
            } finally {
                setLoadingPrefs(false);
            }
        };
        fetchPrefectures();
    }, []);

    // Fetch cities when prefecture changes
    useEffect(() => {
        if (!selectedPref) return;
        if (cities[selectedPref]) return; // Already cached

        const fetchCities = async () => {
            setLoadingCities(selectedPref);
            try {
                const res = await fetch(`/api/areas?type=city&area=${selectedPref}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'OK') {
                        setCities(prev => ({ ...prev, [selectedPref]: data.data }));
                    }
                }
            } catch (error) {
                console.error(`Failed to fetch cities for ${selectedPref}:`, error);
            } finally {
                setLoadingCities(null);
            }
        };
        fetchCities();
    }, [selectedPref, cities]);

    const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const region = e.target.value;
        setSelectedRegion(region);
        setSelectedPref('');
        setSelectedCity('');
    };

    const handlePrefChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        setSelectedPref(code);
        setSelectedCity('');
        const prefItem = prefectures.find(p => p.code === code);
        if (prefItem) {
            onSelect(code, undefined, prefItem.name);
        }
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cityCode = e.target.value;
        setSelectedCity(cityCode);
        const prefItem = prefectures.find(p => p.code === selectedPref);
        if (cityCode === '') {
            // (全域) selected
            onSelect(selectedPref, undefined, prefItem?.name);
        } else {
            const city = cities[selectedPref]?.find(c => c.code === cityCode);
            onSelect(selectedPref, cityCode, prefItem?.name, city?.name);
        }
    };

    // Helper to get prefs for a region
    const getPrefsInRegion = (regionName: string) => {
        const region = REGIONS.find(r => r.name === regionName);
        if (!region) return [];
        return prefectures.filter(p => region.prefs.includes(p.code));
    };

    const currentPrefs = selectedRegion ? getPrefsInRegion(selectedRegion) : [];
    const currentCities = selectedPref ? (cities[selectedPref] || []) : [];
    const selectedPrefName = prefectures.find(p => p.code === selectedPref)?.name || '';
    const selectedCityName = currentCities.find(c => c.code === selectedCity)?.name || '';

    // Display label
    const displayLabel = selectedPrefName
        ? `${selectedPrefName}${selectedCityName ? ` ${selectedCityName}` : ''}`
        : 'エリアを選択';

    return (
        <div className={cn("space-y-3", className)}>
            {/* Header with current selection */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-500" />
                    <span className="text-sm font-bold text-stone-700">エリアを選択</span>
                </div>
                {selectedPrefName && (
                    <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">
                        {displayLabel}
                    </span>
                )}
            </div>

            {loadingPrefs ? (
                <div className="flex justify-center p-4 text-stone-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2">
                    {/* Region select */}
                    <div className="relative">
                        <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wide mb-1 block">地域</label>
                        <div className="relative">
                            <select
                                value={selectedRegion}
                                onChange={handleRegionChange}
                                className="w-full appearance-none bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 cursor-pointer hover:border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-colors"
                            >
                                <option value="">地域を選択</option>
                                {REGIONS.map(r => (
                                    <option key={r.name} value={r.name}>{r.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    {/* Prefecture select */}
                    {selectedRegion && (
                        <div className="relative">
                            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wide mb-1 block">都道府県</label>
                            <div className="relative">
                                <select
                                    value={selectedPref}
                                    onChange={handlePrefChange}
                                    className="w-full appearance-none bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 cursor-pointer hover:border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-colors"
                                >
                                    <option value="">都道府県を選択</option>
                                    {currentPrefs.map(p => (
                                        <option key={p.code} value={p.code}>{p.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {/* City select */}
                    {selectedPref && (
                        <div className="relative">
                            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wide mb-1 block">市区町村</label>
                            <div className="relative">
                                {loadingCities === selectedPref ? (
                                    <div className="flex items-center gap-2 px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg">
                                        <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                                        <span className="text-sm text-stone-400">読み込み中...</span>
                                    </div>
                                ) : (
                                    <>
                                        <select
                                            value={selectedCity}
                                            onChange={handleCityChange}
                                            className="w-full appearance-none bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 cursor-pointer hover:border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-colors"
                                        >
                                            <option value="">（全域）</option>
                                            {currentCities.map(c => (
                                                <option key={c.code} value={c.code}>{c.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AreaSelector;
