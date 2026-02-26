"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, MessageSquare } from 'lucide-react';

export default function ContactPage() {
    const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScTXZSmAhIyFdI6_ekUs0J9Ft4834ybvjFRn_QpJXAf4hyz7w/viewform?usp=publish-editor";

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-stone-200">
            <main className="container mx-auto px-4 sm:px-6 py-12 max-w-2xl">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-stone-500 hover:text-stone-900 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    トップページへ戻る
                </Link>

                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-stone-900/5 p-8 sm:p-10 relative overflow-hidden">
                    <div className="flex items-center justify-center w-16 h-16 bg-stone-100 rounded-full mb-6 text-stone-600">
                        <MessageSquare className="w-8 h-8" />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight mb-4">お問い合わせ</h1>

                    <div className="space-y-4 text-stone-600 mb-10 leading-relaxed text-sm">
                        <p>
                            売るとき相場チェッカーをご利用いただきありがとうございます。
                        </p>
                        <p>
                            サービスに関するご質問や、運営へのお問い合わせなどにつきましては、以下の専用フォーム（Googleフォーム）よりお送りください。
                        </p>
                        <p className="text-stone-400 text-xs">
                            ※内容によってはお返事に数日かかる場合や、お答えできない場合がございます。あらかじめご了承ください。
                        </p>
                    </div>

                    <a
                        href={GOOGLE_FORM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-stone-900 text-white rounded-xl py-4 font-medium hover:bg-stone-800 transition-colors flex items-center justify-center group"
                    >
                        <span className="flex items-center">
                            お問い合わせフォームを開く
                            <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </a>
                </div>
            </main>
        </div>
    );
}
