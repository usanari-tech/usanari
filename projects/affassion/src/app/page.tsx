import Link from "next/link";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryNav from "@/components/CategoryNav";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  return (
    <>
      <Header />
      <main className="max-w-lg mx-auto pb-32">
        <CategoryNav />
        <Hero />

        {/* Quote Section */}
        <section className="px-6 mb-12">
          <div className="bg-card-white dark:bg-zinc-900 p-10 rounded-xl border border-accent-gold/20 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-px bg-accent-gold"></div>
            <span
              className="material-symbols-outlined text-accent-gold/30 mb-4 block"
              style={{ fontSize: "40px" }}
            >
              format_quote
            </span>
            <p className="serif-text text-lg italic text-[#131516] dark:text-white/90 leading-relaxed">
              &quot;シンプルであることは、究極の洗練である。&quot;
            </p>
            <div className="mt-4 text-[10px] font-semibold tracking-widest uppercase text-accent-gold">
              — レオナルド・ダ・ヴィンチ
            </div>
          </div>
        </section>

        {/* New Articles */}
        <div className="flex items-center justify-between px-6 mb-6">
          <h3 className="serif-text text-[#131516] dark:text-white text-lg font-bold tracking-widest">
            新着記事
          </h3>
          <div className="h-px flex-1 mx-4 bg-primary/10 dark:bg-white/10"></div>
        </div>
        <section className="px-6 mb-12">
          <div className="grid grid-cols-2 gap-4">
            <Link href="/items/article-1" className="flex flex-col gap-3 group">
              <div
                className="aspect-[3/4] rounded-lg overflow-hidden bg-cover bg-center shadow-md transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuArg1tOoSSuc_L5XVmsno_KLA8qXLK__S3TfhpB61O76CJImOk5KDOh2r9bvFYxqgH_PfLmrHruGg-diOotiJ8nPER0sTiqR5IexPuUrSbkxPuLvu0S1PpYH-Moe7Mq3DTGxOuEUq-uigR3747NOi106RgUbqBhLP2aadpNQWOzDdhBn1fbCila7Bsj16ZtuaWFaf3a2zl-tWEQkMQizct3AvQ0RACitB8JXsfLK4K5TR27c4WkqXr2KBFCgqnCEN_9tS1sH3DQ3ZRb')",
                }}
              ></div>
              <div>
                <p className="text-accent-gold text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                  Architecture
                </p>
                <h4 className="serif-text text-sm font-bold leading-tight dark:text-white">
                  ミニマリストの書斎：美しき調和
                </h4>
              </div>
            </Link>
            <Link href="/items/article-2" className="flex flex-col gap-3 group mt-8">
              <div
                className="aspect-[3/4] rounded-lg overflow-hidden bg-cover bg-center shadow-md transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC1OUPSr9UyKwwCcY-jsrzvzvbSjI4mY4lpVur8KOJt_eXfpZDkGnzRD8ppZnXuhrkoOGHdCRvHknZFztICcRtpKapDXVqXJwVF80oXXO-G0-U5fjd7Pq4BJMe4fLxb1gKPn4MxCRTdoaR8vu9reueyltJpzaeV5gIr5yoBXyEWQiHTbAt_u0cXPJOfR1bhNOmfuFwRb_I_UVLZ3hf8PESf_3XB0ZmSnUpJGxJtF4kmgtKxAi9yrh4zPwzwXjCTSSCOyK1LDPwmtA7n')",
                }}
              ></div>
              <div>
                <p className="text-accent-gold text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                  Style
                </p>
                <h4 className="serif-text text-sm font-bold leading-tight dark:text-white">
                  春のパレット：アースカラーの誘い
                </h4>
              </div>
            </Link>
          </div>
        </section>

        {/* Pickup Items */}
        <div className="flex items-center justify-between px-6 mb-6">
          <h3 className="serif-text text-[#131516] dark:text-white text-lg font-bold tracking-widest">
            ピックアップ・アイテム
          </h3>
        </div>
        <section className="px-6 mb-12">
          <div className="grid grid-cols-2 gap-6">
            <ProductCard
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuAQrCAkpRlxp2iCIIKaEq8q6xPXt38UIzLdSSUA_XR-79MRFi2u0_Zh1K_YQLEHWnm8PtQFbVp2jhTbBywyu9tgCwJZtS2QuYV5QzKduXBldizYtv12aT5KvyhtBuM430eIrCbwRa45ZCaeGFegGd360YKrarJlMYVkXN5LYZFRJjl7HYTViwFS2DyQC1oZVokxn21p6PKs5jaj_Ghq9eJRNlvxY7OnKQrF8F8PcDGasfWz_cenfC_mq9Qz8W7cXqpngWV0_SANQnRF"
              name="クラシック・レザーケース"
              price="¥48,000"
              id="pickup-1"
            />
            <ProductCard
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuC_H_0XXDOKq4V5IpGeqG7jlB22WukSHzZBbW6qgUvlz65vwK_jQYjhjY6yCvAcCNEL4VNSOJgcIgA7Ley30mrKML_ip4t1FWoaPszLZ5LZTcl2np99uHcG4lgRrFGp7cEhm7dszkHKL9G2yNmRlfTn7RDtho0SHOZeafTEQHFVCBZeUOlHcKGBrB4NqkCj_5e0JOaA50WrdCSBPelv6HRQ39xCj6X1fmakI58RWaDSRaVUEYDJuNJR4fAr34_4gBclEhMTx1epneDH"
              name="シルク・フローラルスカーフ"
              price="¥32,000"
              delay={100}
              id="pickup-2"
            />
          </div>
        </section>

        {/* Collection */}
        <section className="mb-12">
          <div className="px-6 mb-4 flex justify-between items-end">
            <div>
              <h3 className="serif-text text-lg font-bold dark:text-white tracking-widest leading-none">
                厳選コレクション
              </h3>
              <p className="text-[10px] text-primary/60 dark:text-white/40 mt-1 uppercase tracking-widest">
                Fashion Editorial 2024
              </p>
            </div>
            <Link href="/category/collection" className="text-xs text-primary dark:text-accent-gold font-bold">
              すべて見る
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-6">
            <Link href="/items/collection-1"
              className="min-w-[220px] aspect-[2/3] rounded-lg bg-cover bg-center shadow-lg"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCv3N51lY2MpIDkJff95aeBs3i6t6DZJozw4QebLQThMemNcVrCFu44mPCpLa5ciL6oOWtkG-kfkOAFX-L2zRS4_1jxV45r9obOKww2SkF66Qu7xRs3ZCGGRbm4y923rSdji4uaX0FZriD2xnK5kyLRil7NVqLqa7gGlW0l2tOLRTm8LOICmaeCgk_SvW4J9GLp_R4Uy_4be66jIzEOxXn5Ytt9QkbhSW0sCDImNbkIaBGScvbOeHI8T2SJT2Yrm1Xr7VEDukhATMQf')",
              }}
            ></Link>
            <Link href="/items/collection-2"
              className="min-w-[220px] aspect-[2/3] rounded-lg bg-cover bg-center shadow-lg"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC1OUPSr9UyKwwCcY-jsrzvzvbSjI4mY4lpVur8KOJt_eXfpZDkGnzRD8ppZnXuhrkoOGHdCRvHknZFztICcRtpKapDXVqXJwVF80oXXO-G0-U5fjd7Pq4BJMe4fLxb1gKPn4MxCRTdoaR8vu9reueyltJpzaeV5gIr5yoBXyEWQiHTbAt_u0cXPJOfR1bhNOmfuFwRb_I_UVLZ3hf8PESf_3XB0ZmSnUpJGxJtF4kmgtKxAi9yrh4zPwzwXjCTSSCOyK1LDPwmtA7n')",
              }}
            ></Link>
          </div>
        </section>

        {/* Recommended */}
        <section className="mb-8">
          <div className="px-6 mb-4">
            <h3 className="serif-text text-sm font-bold dark:text-white tracking-wider border-b border-primary/10 pb-2">あなたへのおすすめ</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-6 pb-4">
            <Link href="/items/rec-1" className="flex-none w-32 group">
              <div className="aspect-square rounded-lg border border-primary/10 dark:border-white/10 overflow-hidden mb-2">
                <img className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArg1tOoSSuc_L5XVmsno_KLA8qXLK__S3TfhpB61O76CJImOk5KDOh2r9bvFYxqgH_PfLmrHruGg-diOotiJ8nPER0sTiqR5IexPuUrSbkxPuLvu0S1PpYH-Moe7Mq3DTGxOuEUq-uigR3747NOi106RgUbqBhLP2aadpNQWOzDdhBn1fbCila7Bsj16ZtuaWFaf3a2zl-tWEQkMQizct3AvQ0RACitB8JXsfLK4K5TR27c4WkqXr2KBFCgqnCEN_9tS1sH3DQ3ZRb" alt="aroma" />
              </div>
              <p className="serif-text text-[10px] leading-tight dark:text-white/80 line-clamp-2">アロマキャンドル <br />No.05</p>
            </Link>
            <Link href="/items/rec-2" className="flex-none w-32 group">
              <div className="aspect-square rounded-lg border border-primary/10 dark:border-white/10 overflow-hidden mb-2">
                <img className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQrCAkpRlxp2iCIIKaEq8q6xPXt38UIzLdSSUA_XR-79MRFi2u0_Zh1K_YQLEHWnm8PtQFbVp2jhTbBywyu9tgCwJZtS2QuYV5QzKduXBldizYtv12aT5KvyhtBuM430eIrCbwRa45ZCaeGFegGd360YKrarJlMYVkXN5LYZFRJjl7HYTViwFS2DyQC1oZVokxn21p6PKs5jaj_Ghq9eJRNlvxY7OnKQrF8F8PcDGasfWz_cenfC_mq9Qz8W7cXqpngWV0_SANQnRF" alt="wallet" />
              </div>
              <p className="serif-text text-[10px] leading-tight dark:text-white/80 line-clamp-2">ウォレット <br />テラコッタ</p>
            </Link>
            <Link href="/items/rec-3" className="flex-none w-32 group">
              <div className="aspect-square rounded-lg border border-primary/10 dark:border-white/10 overflow-hidden mb-2">
                <img className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_H_0XXDOKq4V5IpGeqG7jlB22WukSHzZBbW6qgUvlz65vwK_jQYjhjY6yCvAcCNEL4VNSOJgcIgA7Ley30mrKML_ip4t1FWoaPszLZ5LZTcl2np99uHcG4lgRrFGp7cEhm7dszkHKL9G2yNmRlfTn7RDtho0SHOZeafTEQHFVCBZeUOlHcKGBrB4NqkCj_5e0JOaA50WrdCSBPelv6HRQ39xCj6X1fmakI58RWaDSRaVUEYDJuNJR4fAr34_4gBclEhMTx1epneDH" alt="silk" />
              </div>
              <p className="serif-text text-[10px] leading-tight dark:text-white/80 line-clamp-2">シルクバンド <br />ボタニカル</p>
            </Link>
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
