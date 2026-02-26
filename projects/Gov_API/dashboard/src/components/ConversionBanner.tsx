'use client';

import React from 'react';
import { ArrowRight, Mail } from 'lucide-react';

export default function ConversionBanner() {
    return (
        <section className="py-14 bg-stone-900">
            <div className="container mx-auto px-6 max-w-3xl text-center">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-3 leading-snug">
                    実際の売却価格を知りたいですか？<br className="hidden md:block" />
                    <span className="text-teal-400">営業電話なし・完全匿名の「机上査定」</span>で確認できます
                </h2>
                <p className="text-stone-400 text-sm mb-6 leading-relaxed max-w-lg mx-auto">
                    「まずは正確な価格だけ知りたい」という方に最適です。<br />
                    面倒な訪問査定なしで、複数社の査定額を比較できます。
                </p>

                <a
                    href="#" /* TODO: タウンライフのASPリンクに差し替え */
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-sm transition-colors"
                >
                    無料・匿名で査定してみる
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
