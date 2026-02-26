import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DisclaimerPage() {
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
                    <h1 className="text-3xl font-bold tracking-tight mb-8">免責事項</h1>

                    <div className="space-y-8 text-stone-600 leading-relaxed text-sm">
                        <p>
                            売るとき相場チェッカー（以下、「当サイト」といいます。）をご利用いただくにあたり、以下の免責事項にご同意いただいたものとみなします。
                        </p>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900">1. 提供データに関する非保証</h2>
                            <p>
                                当サイトで提供する不動産の過去取引相場データ等は、国土交通省が提供する「不動産取引価格情報提供制度」のAPIを利用して取得した過去の事例データに基づく概算・参考値です。<br />
                                当サイトは、これらのデータの正確性、完全性、最新性、および特定の目的（売却査定、購入検討など）への適合性について、いかなる明示的または黙示的な保証も行いません。<br />
                                実際の不動産の取引価格は、個別の物件の状態、市場動向、売主・買主の事情などにより大きく変動するものであり、当サイトの表示価格を保証するものではありません。
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900">2. 投資・取引に関する最終決定の責任</h2>
                            <p>
                                当サイトの情報は参考として提供されるものであり、投資勧誘や不動産取引を目的としたものではありません。<br />
                                ユーザーが当サイトの情報を元に不動産の売却、購入、またはその他の意思決定を行い、その結果生じたいかなる損害（直接損害、間接損害、特別損害、偶発的損害等）についても、当サイト運営者は一切の責任を負いかねます。<br />
                                最終的な不動産取引等に関する決定は、必ずご自身の判断と責任において行っていただき、正確な査定等は専門の不動産業者へご相談ください。
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900">3. アフィリエイトリンクおよび外部サイトについて</h2>
                            <p>
                                当サイトは、適格販売により紹介料を獲得できるアフィリエイトプログラムに参加しており、外部サイト（不動産一括査定サイト等）へのリンクを含んでいます。<br />
                                リンク先の外部サイトで提供される情報やサービス、およびリンク先での個人情報の取り扱い等については、当サイトの管理下にはなく、当サイトは一切の責任を負いません。リンク先サイトの利用規約やプライバシーポリシーを必ずご確認ください。
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900">4. サービスの停止・中断・内容変更</h2>
                            <p>
                                当サイトは、システムの保守、データ連携元の仕様変更、天災、その他の不可抗力などの理由により、事前の通知なくサービスの一部または全部を停止、中断、あるいは内容を変更することがあります。<br />
                                これによりユーザーに生じたいかなる不利益または損害についても、当サイト運営者は一切の責任を負いません。
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
