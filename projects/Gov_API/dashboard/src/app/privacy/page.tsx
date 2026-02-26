import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-stone-200">
            <main className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-stone-500 hover:text-stone-900 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    トップページへ戻る
                </Link>

                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-stone-900/5 p-8 sm:p-12">
                    <h1 className="text-3xl font-bold tracking-tight mb-8">プライバシーポリシー</h1>

                    <div className="space-y-8 text-stone-600 leading-relaxed text-sm">
                        <p>
                            売るとき相場チェッカー（以下、「当サイト」といいます。）は、ユーザーの皆様の個人情報の保護を最も重要な責務と認識し、以下のプライバシーポリシー（以下、「本ポリシー」といいます。）を定めます。
                        </p>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900">1. 個人情報の収集について</h2>
                            <p>
                                当サイトでは、以下の方法により情報を収集する場合があります。
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>お問い合わせ:</strong> お問い合わせフォームご利用時にお名前、メールアドレス等の個人情報をご提供いただく場合があります。これらの情報は、ご質問に対する回答や必要なご連絡のためにのみ利用し、それ以外の目的では利用いたしません。</li>
                                <li><strong>Cookie（クッキー）の利用:</strong> 当サイトでは、アクセス解析やアフィリエイトプログラムの成果発生の目的でCookieを使用しています。Cookieによりブラウザを識別することはできますが、お名前やご住所などの個人を特定できる情報は含まれません。</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900">2. アクセス解析ツールについて</h2>
                            <p>
                                当サイトでは、サイトの利用状況を把握するためにGoogleによるアクセス解析ツール「Googleアナリティクス」を利用する場合があります。このGoogleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。この機能はCookieを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900">3. アフィリエイトプログラムについて</h2>
                            <p>
                                当サイトは、適格販売により紹介料を獲得できるアフィリエイトプログラム（タウンライフアフィリエイト等）に参加しています。紹介先サービスで個人情報等を登録・入力される場合は、リンク先のプライバシーポリシーや利用規約等をご確認ください。当サイトでは、リンク先における個人情報の取り扱いやトラブルについて、一切の責任を負いかねます。
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900">4. 第三者への開示・提供について</h2>
                            <p>
                                当サイトは、ユーザーよりお預かりした個人情報を適切に管理し、次のいずれかに該当する場合を除き、個人情報を第三者に開示いたしません。
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>ユーザーの同意がある場合</li>
                                <li>法令に基づき開示することが必要である場合</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900">5. 免責事項</h2>
                            <p>
                                当サイトからリンクやバナーなどによって他のサイトに移動された場合、移動先サイトで提供される情報、サービス等について一切の責任を負いません。また、当サイトのコンテンツや情報につきまして、可能な限り正確な情報を掲載するよう努めておりますが、誤情報が入り込んだり、情報が古くなっていることもございます。当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますのでご了承ください。
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900">6. 本ポリシーの変更</h2>
                            <p>
                                当サイトは、法令の制定、改正等により、本ポリシーを適宜見直し、予告なく変更する場合があります。本ポリシーの変更は、変更後の本ポリシーが当サイトに掲載された時点、またはその他の方法により変更後の本ポリシーが閲覧可能となった時点で有効になります。
                            </p>
                        </section>

                        <div className="pt-8 text-right text-stone-500">
                            制定日：2026年2月27日<br />
                            売るとき相場チェッカー 運営
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
