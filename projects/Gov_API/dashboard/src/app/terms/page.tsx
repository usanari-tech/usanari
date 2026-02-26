import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfUsePage() {
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
                    <h1 className="text-3xl font-bold tracking-tight mb-8">利用規約</h1>

                    <div className="space-y-8 text-stone-600 leading-relaxed text-sm">
                        <p>
                            この利用規約（以下、「本規約」といいます。）は、売るとき相場チェッカー（以下、「本サービス」といいます。）の利用条件を定めるものです。ユーザーの皆様（以下、「ユーザー」といいます。）には、本規約に従って本サービスをご利用いただきます。
                        </p>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900">第1条（適用）</h2>
                            <p>
                                1. 本規約は、ユーザーと運営者との間の本サービスの利用に関わる一切の関係に適用されるものとします。<br />
                                2. ユーザーは、本サービスを利用することにより、本規約に同意したものとみなされます。
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900">第2条（本サービスの内容と情報の非保証）</h2>
                            <p>
                                1. 本サービスは、国土交通省の提供する「不動産取引価格情報提供制度」に基づき、過去の不動産取引データを参考情報として提供するものです。<br />
                                2. 本サービスが提供する推定価格や各種データは、あくまで過去の事例に基づく概算・参考値であり、実際の成約価格や査定価格を保証するものではありません。<br />
                                3. 運営者は、本サービスで提供される情報の正確性、最新性、有用性、特定の目的への適合性等について、いかなる保証も行いません。
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900">第3条（禁止事項）</h2>
                            <p>
                                ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>法令または公序良俗に違反する行為</li>
                                <li>犯罪行為に関連する行為</li>
                                <li>本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為</li>
                                <li>運営者、他のユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                                <li>本サービスによって得られた情報を商業的に利用する行為（ただし運営者が事前に許諾した場合は除きます）</li>
                                <li>本サービスの運営を妨害するおそれのある行為</li>
                                <li>不正アクセス、クローリング、スクレイピング、その他これに類する行為</li>
                                <li>その他、運営者が不適切と判断する行為</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900">第4条（本サービスの提供の停止等）</h2>
                            <p>
                                運営者は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。<br />
                                1. 本サービスにかかるコンピュータシステムの保守点検または更新を行う場合<br />
                                2. 地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合<br />
                                3. コンピュータまたは通信回線等が事故により停止した場合<br />
                                4. データ提供元（国土交通省等）の仕様変更、停止、または制限等があった場合<br />
                                5. その他、運営者が本サービスの提供が困難と判断した場合<br />
                                運営者は、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900">第5条（免責と損害賠償の制限）</h2>
                            <p>
                                1. 運営者は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。<br />
                                2. 運営者は、ユーザーが本サービスを利用したこと、または利用できなかったことに関連して生じたあらゆる損害（直接損害、間接損害、特別損害、偶発的損害等）について、一切の責任を負いません。本サービスの情報を用いて行われた不動産取引等に関する最終的な決定は、ユーザーご自身の判断と責任において行ってください。
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900">第6条（利用規約の変更）</h2>
                            <p>
                                運営者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。なお、本規約の変更後、本サービスの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなします。
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900">第7条（準拠法・裁判管轄）</h2>
                            <p>
                                本規約の解釈にあたっては、日本法を準拠法とします。<br />
                                本サービスに関して紛争が生じた場合には、運営者の所在地を管轄する裁判所を専属的合意管轄とします。
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
