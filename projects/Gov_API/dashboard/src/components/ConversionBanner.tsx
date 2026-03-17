'use client';

import React from 'react';
import { ArrowRight, Mail } from 'lucide-react';

export default function ConversionBanner() {
    return (
        <section className="py-14 bg-gradient-to-b from-stone-900 to-stone-800">
            <div className="container mx-auto px-6 max-w-3xl text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold mb-6 border border-teal-500/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                    高く早く売却したい方へ
                </div>
                
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-tight">
                    情報の「<span className="text-teal-400">透明性</span>」が、<br className="md:hidden" />納得の売却価格に繋がる。
                </h2>
                
                <p className="text-stone-300 text-sm md:text-base mb-8 leading-relaxed max-w-xl mx-auto">
                    相場チェックの次はプロの査定へ。<br />
                    「囲い込み」を一切行わない公平な仲介と、平均33日でのスピード成約。<br />
                    あなたの利益を最大化する「スマート仲介」を体験してください。
                </p>

                {/* A8.net Banner Area */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-2xl mb-6 flex flex-col items-center">
                    <p className="text-xs text-stone-400 mb-4 tracking-widest uppercase">Sponsored by ミライアス</p>
                    
                    {/* A8 Banner Image Link */}
                    <a href="https://px.a8.net/svt/ejp?a8mat=4AZGC6+DYHWW2+4I6M+5ZU29" rel="nofollow" className="block transform transition-transform hover:scale-105 hover:shadow-teal-500/20 hover:shadow-2xl rounded-lg overflow-hidden">
                        <img border="0" width="468" height="120" alt="" src="https://www27.a8.net/svt/bgt?aid=260314998844&wid=003&eno=01&mid=s00000021019001007000&mc=1" className="max-w-full h-auto" />
                    </a>
                    <img border="0" width="1" height="1" src="https://www16.a8.net/0.gif?a8mat=4AZGC6+DYHWW2+4I6M+5ZU29" alt="" className="hidden" />

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6">
                        <div className="flex items-center gap-1.5 text-stone-300 bg-stone-800/50 px-3 py-1.5 rounded-full border border-stone-700">
                            <span className="text-teal-400 font-bold">✓</span>
                            <span className="text-xs">東京・神奈川・千葉・埼玉エリア限定</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-stone-300 bg-stone-800/50 px-3 py-1.5 rounded-full border border-stone-700">
                            <Mail className="w-3.5 h-3.5 text-teal-400" />
                            <span className="text-xs">備考欄「メール連絡希望」で電話なし</span>
                        </div>
                    </div>
                </div>

                <p className="text-[10px] text-stone-500 max-w-lg mx-auto leading-relaxed">
                    ※当サイトはミライアス株式会社の公式パートナーです。上記の査定サービス利用は無料であり、当サイトが手数料を請求することはありません。
                </p>
            </div>
        </section>
    );
}
