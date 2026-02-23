'use client';

import React from 'react';
import { ArrowRight, Mail } from 'lucide-react';

export default function ConversionBanner() {
    return (
        <section className="py-14 bg-stone-900">
            <div className="container mx-auto px-6 max-w-3xl text-center">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-3 leading-snug">
                    過去の相場がわかったら、<br className="hidden md:block" />
                    次は<span className="text-teal-400">プロの無料査定</span>で正確な最高値を
                </h2>
                <p className="text-stone-400 text-sm mb-6 leading-relaxed max-w-lg mx-auto">
                    メール連絡を希望できるため、しつこい電話はありません。<br />
                    厳選された提携査定サービスを無料でご利用いただけます。
                </p>

                <a
                    href="https://ieul.jp/" /* TODO: ASPリンクに差し替え */
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-sm transition-colors"
                >
                    無料査定で最高値を調べる
                    <ArrowRight className="w-4 h-4" />
                </a>

                <div className="flex items-center justify-center gap-2 mt-4 text-stone-500">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="text-xs">メール連絡を優先的に選択可能</span>
                </div>

                <p className="text-[10px] text-stone-600 mt-8 max-w-md mx-auto leading-relaxed">
                    ※当サイトは厳選された提携査定サービスを紹介するアフィリエイトプログラムに参加しています。利用は完全に無料です。
                </p>
            </div>
        </section>
    );
}
