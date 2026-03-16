'use client';

import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight, BarChart3, Minus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { TradeData } from '@/types/api';

export interface EstimateData {
    lowPrice: number;
    highPrice: number;
    medianPrice: number;
    matchCount: number;
    yoyChange: number;
    similarTrades: TradeData[];
    areaName: string;
    trendData?: { period: string; price: number }[];
}

interface EstimateResultProps {
    data: EstimateData;
}

function formatPrice(yen: number): string {
    if (yen >= 100000000) {
        return `${(yen / 100000000).toFixed(1)}億`;
    }
    return `${Math.round(yen / 10000).toLocaleString()}万`;
}

export default function EstimateResult({ data }: EstimateResultProps) {
    const { lowPrice, highPrice, medianPrice, matchCount, yoyChange, similarTrades, areaName, trendData } = data;

    // Filter out years with 0 price (e.g. 2026 with no data yet)
    const validTrendData = trendData?.filter(d => d.price > 0);

    let nudgeText = '';
    let nudgeBg = '';
    let NudgeIcon = Minus;
    if (yoyChange > 3) {
        nudgeText = `${areaName}は上昇傾向（前年比+${yoyChange.toFixed(1)}%）。売却の好機かもしれません。`;
        nudgeBg = 'bg-teal-50 text-teal-800 border-teal-100';
        NudgeIcon = TrendingUp;
    } else if (yoyChange > 0) {
        nudgeText = `${areaName}は安定〜やや上昇（前年比+${yoyChange.toFixed(1)}%）の傾向です。`;
        nudgeBg = 'bg-teal-50 text-teal-800 border-teal-100';
        NudgeIcon = TrendingUp;
    } else if (yoyChange < -3) {
        nudgeText = `${areaName}はやや下降傾向（前年比${yoyChange.toFixed(1)}%）。早めの検討が有利です。`;
        nudgeBg = 'bg-stone-100 text-stone-700 border-stone-200';
        NudgeIcon = TrendingDown;
    } else {
        nudgeText = `${areaName}は横ばい傾向です。市況を見ながらのご判断をおすすめします。`;
        nudgeBg = 'bg-stone-50 text-stone-600 border-stone-200';
        NudgeIcon = Minus;
    }

    return (
        <div className="space-y-5">
            {/* Main Price Range */}
            <div className="bg-white rounded-xl shadow-card border border-stone-200 p-6 md:p-8">
                <p className="text-[10px] font-medium text-stone-400 mb-5 tracking-wider uppercase">過去の取引データに基づく推定価格</p>

                <div className="text-center py-6">
                    <p className="text-xs text-stone-500 mb-3">推定売却価格レンジ</p>
                    <div className="flex items-baseline justify-center gap-3">
                        <span className="text-3xl md:text-5xl font-extrabold text-stone-800 tabular-nums">{formatPrice(lowPrice)}</span>
                        <span className="text-xl text-stone-300">〜</span>
                        <span className="text-3xl md:text-5xl font-extrabold text-teal-600 tabular-nums">{formatPrice(highPrice)}</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-4 text-sm text-stone-500">
                        <span>中央値 <strong className="text-stone-700">{formatPrice(medianPrice)}</strong></span>
                        <span className="w-px h-4 bg-stone-200" />
                        <span>類似取引 <strong className="text-stone-700">{matchCount}件</strong></span>
                    </div>
                </div>

                {/* Price Range Bar */}
                <div className="mt-4 mx-auto max-w-sm">
                    <div className="h-2 bg-stone-100 rounded-full relative overflow-hidden">
                        <div
                            className="absolute top-0 bottom-0 bg-gradient-to-r from-stone-600 to-teal-500 rounded-full"
                            style={{ left: '20%', right: '20%' }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-stone-400 mt-1.5">
                        <span>低</span>
                        <span>あなたの推定レンジ</span>
                        <span>高</span>
                    </div>
                </div>
            </div>

            {/* Trend Chart */}
            {validTrendData && validTrendData.length > 1 && (
                <div className="bg-white rounded-xl shadow-card border border-stone-200 p-6">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-5">
                        <BarChart3 className="w-4 h-4 text-teal-600" />
                        この条件の価格推移（年別平均）
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={validTrendData} margin={{ top: 10, right: 15, left: 15, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                                <XAxis
                                    dataKey="period"
                                    tick={{ fontSize: 12, fill: '#78716c' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#78716c' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v: number) => `${Math.round(v / 10000).toLocaleString()}万`}
                                    width={60}
                                />
                                <Tooltip
                                    formatter={(value: number | undefined) => [`${Math.round((value ?? 0) / 10000).toLocaleString()}万円`, '平均取引価格']}
                                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #d6d3d1', boxShadow: 'none' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#0d9488"
                                    strokeWidth={2}
                                    fill="url(#priceGradient)"
                                    dot={{ r: 4, fill: '#0d9488', strokeWidth: 0 }}
                                    activeDot={{ r: 6, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Emotional Nudge */}
            <div className={`flex items-start gap-3 px-5 py-4 rounded-lg border ${nudgeBg}`}>
                <NudgeIcon className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">{nudgeText}</p>
            </div>



            {/* CTA */}
            <div className="bg-stone-900 rounded-xl p-8 text-center">
                <p className="text-[10px] text-stone-500 mb-2 tracking-wider uppercase">上記は過去データに基づく参考値です</p>
                <h3 className="text-lg md:text-xl font-bold text-white mb-3 leading-snug">
                    「情報の透明性」で高く売る。<br className="hidden md:block" />
                    <span className="text-teal-400">ミライアス</span>の無料査定で最終確認
                </h3>
                <p className="text-stone-400 text-sm mb-6">
                    「囲い込み」なしの公平な仲介が、最高値での売却をサポート。<br />
                    1都3県（東京・神奈川・千葉・埼玉）に対応。
                </p>
                <a
                    href="https://px.a8.net/svt/ejp?a8mat=4AZGC6+DYHWW2+4I6M+5ZU29"
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-sm transition-colors"
                >
                    ミライアスで査定を申し込む
                    <ArrowRight className="w-5 h-5" />
                </a>
                <p className="text-[10px] text-stone-500 mt-4 italic">
                    ※備考欄に「メール連絡希望」と記載することで、電話連絡を最小限に抑えられます。
                </p>
                {/* A8.net Tracking Pixel */}
                <img border="0" width="1" height="1" src="https://www16.a8.net/0.gif?a8mat=4AZGC6+DYHWW2+4I6M+5ZU29" alt="" />
            </div>
        </div>
    );
}
