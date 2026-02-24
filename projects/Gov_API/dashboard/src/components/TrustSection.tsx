'use client';

import React from 'react';
import { Database, ShieldCheck, CheckCircle2, Building2 } from 'lucide-react';

export default function TrustSection() {
    return (
        <section className="py-12 bg-transparent border-b border-stone-200/50">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Main trust badge */}
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 text-white text-xs font-bold mb-4">
                        <Building2 className="w-3.5 h-3.5" />
                        国土交通省 不動産取引価格情報API 利用
                    </div>
                    <p className="text-sm text-stone-500 max-w-lg">
                        当サービスは国土交通省が提供する不動産取引価格情報（土地総合情報システム）の
                        公式APIを通じて、実際の成約データを取得・分析しています。
                    </p>
                </div>

                {/* Three pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl glass-card border border-stone-200/50">
                        <div className="shrink-0 w-9 h-9 rounded-lg bg-stone-900 flex items-center justify-center">
                            <Database className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-stone-800 mb-1">公式データソース</h3>
                            <p className="text-xs text-stone-500 leading-relaxed">
                                不動産取引価格情報の正規APIから取得した実績データ。推測値ではありません。
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl glass-card border border-stone-200/50">
                        <div className="shrink-0 w-9 h-9 rounded-lg bg-stone-900 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-stone-800 mb-1">個人情報の入力不要</h3>
                            <p className="text-xs text-stone-500 leading-relaxed">
                                氏名・住所・電話番号の登録は一切なし。匿名で何度でも利用できます。
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl glass-card border border-stone-200/50">
                        <div className="shrink-0 w-9 h-9 rounded-lg bg-stone-900 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-stone-800 mb-1">成約価格ベース</h3>
                            <p className="text-xs text-stone-500 leading-relaxed">
                                売り出し価格ではなく、実際の取引成立金額を基に算出しています。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
