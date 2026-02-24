'use client';

import React from 'react';
import { Search, Shield } from 'lucide-react';

export default function Hero() {
    const scrollToForm = () => {
        document.getElementById('property-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative min-h-[520px] flex items-center overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(/hero-bg.jpg)' }}
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-900/75 via-stone-900/65 to-stone-900/80" />

            <div className="relative z-10 container mx-auto px-6 max-w-4xl text-center py-16">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-8 border border-white/10 backdrop-blur-sm">
                    <Shield className="w-3.5 h-3.5" />
                    <span>登録不要・営業電話なし</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-5 tracking-tight leading-[1.25] drop-shadow-lg">
                    あなたの不動産、<br />
                    <span className="text-teal-300">本当の売値</span>を知りませんか？
                </h1>

                <p className="text-white/70 text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                    一括査定で電話攻勢に遭う前に。<br className="hidden md:block" />
                    国交省の公式取引データから、30秒で相場をセルフチェック。
                </p>

                <button
                    onClick={scrollToForm}
                    className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-sm transition-colors inline-flex items-center gap-2 shadow-lg shadow-teal-600/20"
                >
                    <Search className="w-4 h-4" />
                    無料で相場をチェック
                </button>

                <p className="text-xs text-white/40 mt-4">※氏名・電話番号の入力は不要です</p>

                {/* Stats - prominent white cards */}
                <div className="mt-14 grid grid-cols-3 gap-3">
                    {[
                        { num: '47', unit: '都道府県', desc: '全国対応' },
                        { num: '0', unit: '円', desc: '利用料金' },
                        { num: '30', unit: '秒', desc: '結果表示まで' },
                    ].map((item, i) => (
                        <div key={i} className="glass-card rounded-xl py-5 px-4 shadow-xl relative overflow-hidden group">
                            <p className="text-2xl font-extrabold text-stone-800 tabular-nums">
                                {item.num}<span className="text-sm font-bold text-teal-600 ml-1">{item.unit}</span>
                            </p>
                            <p className="text-[11px] text-stone-400 mt-1 font-medium">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
