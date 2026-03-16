'use client';

import React from 'react';
import { ArrowRight, Mail } from 'lucide-react';

export default function ConversionBanner() {
    return (
        <section className="py-14 bg-stone-900">
            <div className="container mx-auto px-6 max-w-3xl text-center">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-3 leading-snug">
                    ご自身の物件の<span className="text-teal-400">適正な売却価格</span>を知りたくなりましたか？
                </h2>
                <p className="text-stone-400 text-sm mb-6 leading-relaxed max-w-lg mx-auto">
                    相場チェックで売却のイメージが湧いたら、次は「情報の透明性」を重視したプロの査定へ。<br />
                    「囲い込み」を一切行わない公平な仲介が、あなたの利益を最大化します。
                </p>

                <div className="flex flex-col items-center gap-4">
                    <a
                        href="https://px.a8.net/svt/ejp?a8mat=4AZGC6+DYHWW2+4I6M+5ZU29"
                        target="_blank"
                        rel="noopener noreferrer nofollow sponsored"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-sm sm:text-base transition-colors shadow-lg shadow-teal-600/20 w-full sm:w-auto"
                    >
                        ミライアスの無料査定を申し込む
                        <ArrowRight className="w-4 h-4" />
                    </a>
                    
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-center gap-2 text-stone-500">
                            <span className="text-xs">※対応エリア：東京・神奈川・千葉・埼玉</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-stone-500">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="text-xs">備考欄に「メール連絡希望」と記載するのがおすすめです</span>
                        </div>
                    </div>
                </div>

                <p className="text-[10px] text-stone-600 mt-8 max-w-md mx-auto leading-relaxed">
                    ※当サイトは情報の透明性を重視する「ミライアス」の公式パートナーです。紹介はアフィリエイトプログラムに基づいており、利用は完全に無料です。
                </p>
                {/* A8.net Tracking Pixel */}
                <img border="0" width="1" height="1" src="https://www16.a8.net/0.gif?a8mat=4AZGC6+DYHWW2+4I6M+5ZU29" alt="" />
            </div>
        </section>
    );
}
