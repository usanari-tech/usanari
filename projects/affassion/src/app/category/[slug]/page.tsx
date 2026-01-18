import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export async function generateStaticParams() {
    return [
        { slug: "all" },
        { slug: "art" },
        { slug: "culture" },
        { slug: "travel" },
        { slug: "lifestyle" },
        { slug: "fashion" },
        { slug: "art-architecture" },
        { slug: "living" },
        { slug: "collection" },
    ];
}

export default function CategoryPage({
    params,
}: {
    params: { slug: string };
}) {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl overflow-x-hidden bg-background-light dark:bg-background-dark transition-colors duration-300">
            <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-5 flex items-center justify-between">
                <div className="flex items-center justify-start w-10">
                    <Link href="/" className="cursor-pointer">
                        <span
                            className="material-symbols-outlined text-primary dark:text-accent-gold"
                            style={{ fontSize: "24px" }}
                        >
                            menu
                        </span>
                    </Link>
                </div>
                <h1 className="serif-text text-[#131516] dark:text-white text-xl font-bold tracking-[0.3em] uppercase">
                    L&apos;Édition
                </h1>
                <div className="flex items-center justify-end w-10">
                    <span
                        className="material-symbols-outlined text-primary dark:text-accent-gold cursor-pointer"
                        style={{ fontSize: "24px" }}
                    >
                        shopping_bag
                    </span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-24">
                <div className="pt-8 pb-4 text-center">
                    <p className="text-primary/60 dark:text-accent-gold/60 text-[10px] tracking-[0.4em] uppercase mb-2">
                        2024年 秋冬コレクション
                    </p>
                    <h2 className="serif-text text-[#131516] dark:text-white text-2xl font-light leading-tight px-8">
                        限定コレクション
                    </h2>
                </div>

                <div className="p-6">
                    <Link href="/items/winter-catalog" className="block relative group cursor-pointer overflow-hidden rounded-xl aspect-[16/10] bg-cover bg-center transition-transform duration-700 hover:scale-[1.02]"
                        style={{
                            backgroundImage:
                                "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 40%, transparent 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAIsP3W1PWVIgpakwvx8mCgFZNtyKmX4ux-zkVTfUcsM-N72YCoEVoiQbN5chXKWJOMbiemG6hzknI2Phjlf7_ZsKUlCPYak-2vYfEdyOtUhc7ByfsVKASpVx53idprTm552kRskwiqzkXEnBT_-tthax2WW7H9EwZwKXNVc3F6VSBTLLa5YPy7RhBYpJZiISrGVkkV20tKx8iOhRpg3sn3GnLDBb7AIOQEo7JXPQkKfTgyD2zhrF6GJzNXE3Tay5bWu6o2dhGJotFQ')",
                        }}
                    >
                        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
                            <h3 className="serif-text text-white text-xl font-medium tracking-[0.2em]">
                                冬の新作カタログ
                            </h3>
                            <div className="h-[1px] w-12 bg-white/60 mt-3 group-hover:w-20 transition-all duration-500"></div>
                            <p className="text-white/80 text-[10px] tracking-[0.3em] uppercase mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                詳細を見る
                            </p>
                        </div>
                    </Link>
                </div>

                <div className="px-6 pt-4 pb-2 flex items-center justify-between">
                    <span className="h-[1px] flex-1 bg-primary/10 dark:bg-white/10"></span>
                    <h4 className="serif-text text-primary/40 dark:text-accent-gold/40 text-[10px] font-bold tracking-[0.4em] uppercase px-4">
                        カテゴリーから探す
                    </h4>
                    <span className="h-[1px] flex-1 bg-primary/10 dark:bg-white/10"></span>
                </div>

                <div className="grid grid-cols-2 gap-4 p-6">
                    <Link href="/category/lifestyle" className="flex flex-col gap-3">
                        <div
                            className="bg-cover bg-center flex flex-col items-center justify-center rounded-lg aspect-[3/4] transition-all duration-500 grayscale hover:grayscale-0"
                            style={{
                                backgroundImage:
                                    'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.1) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDsRDvD0dRuSMaXiGnSIc4MOyPdOKDmoBn8Jw-Nln5TUDmU6OFDUxXBMF32ZZqNI2O6MJl67JgSoaEs_8gFcfCMvrsWxI5EE_HBKOy9o2-8df34kilKvnRzJfTBMl_6v6w4Gk-mScaaNbwoRXE-X6gC6sfEkm4K0dYjYKZTUKNgCU20vZ297QdzC9WTxeEVKS5u4__3YNLdQtlPI2isgVFOcZYTGlJB8fSqHXORhsNAn9QpBW5UwUgtVqW88RZSeAF4gAJ_ECPcPa1x")',
                            }}
                        >
                            <p className="serif-text text-white text-xs font-medium tracking-[0.25em] text-center px-2">
                                ライフスタイル
                            </p>
                        </div>
                    </Link>
                    <Link href="/category/fashion" className="flex flex-col gap-3 mt-6">
                        <div
                            className="bg-cover bg-center flex flex-col items-center justify-center rounded-lg aspect-[3/4] transition-all duration-500 grayscale hover:grayscale-0"
                            style={{
                                backgroundImage:
                                    'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.1) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuD9K7x0RnMgw2Jal1s-D7qFDGOWMZX5HYuEBnJvjhJSRHQaky59dZwT2K8oFXuWE0QGH59BhytrR9sUyAeO-NtKHlLQHF1UTZImgcqsye6UJr2o4HQwpQgTUhPig-yYHgw60_lGZtWuJrcPKditsgeDZgH0lLWd6z5jy1GRCNx946JjYxBZz0X-N_ZM3ltggWolnUiI01SoSrdacUDA6LwmMqtwea3KjOZy9NudWr8F-MbDwyeSr7zQ-FrRG_0HOzPHaCaNesP5eACu")',
                            }}
                        >
                            <p className="serif-text text-white text-xs font-medium tracking-[0.25em] text-center px-2">
                                ファッション
                            </p>
                        </div>
                    </Link>
                    <Link href="/category/art-architecture" className="flex flex-col gap-3 -mt-6">
                        <div
                            className="bg-cover bg-center flex flex-col items-center justify-center rounded-lg aspect-[3/4] transition-all duration-500 grayscale hover:grayscale-0"
                            style={{
                                backgroundImage:
                                    'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.1) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAY0Kc5mlECdtXrv0qlL-Qpeig4IvPHXYWigJXkSXSc0eZe5wdZn_GjLRZtlbdpoC7Qp-bnHE4_XGUPHrCaD1aPsumDf3lA-ExVYNzbxRb-mVT21TcDZMNDEfnRaNkxDwk4-DBgMxlCcMEeW3FQYO7i21rhcL-uQunRcyMl_4hLouBzcmh6t87W2s5RUTPsd4mLD6CaRP9hI4Xmhlp7dIulKQ1KybCOCPwU2uo9cvKLjWtSnHcPQsXr-O_YpmW2AbQkoWhH_-rApOyZ")',
                            }}
                        >
                            <p className="serif-text text-white text-xs font-medium tracking-[0.25em] text-center px-2">
                                アート・建築
                            </p>
                        </div>
                    </Link>
                    <Link href="/category/living" className="flex flex-col gap-3">
                        <div
                            className="bg-cover bg-center flex flex-col items-center justify-center rounded-lg aspect-[3/4] transition-all duration-500 grayscale hover:grayscale-0"
                            style={{
                                backgroundImage:
                                    'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.1) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuC2_wMINqFcb2PLi9cqnIX3m-EYc0uk_Hfeie3S6OKMOdjNjTjXkPNgJH4IHHe4Yhg_73BjRVltXzN0z_3zU5JwyYEtxaIIaCQr_FrOu1SZh18Fvu1l0ajo5y6e9U8-YQd4q3VRtC83_QH4DZrQ0I7-gBDL6vkb3aFFrZ2UcYdyAhOpDidlvVEoNNxI7nZ-zXXHe5jRV0BzPWEpI0Ob-B8CNNFS011O07j2OEtZGhpU9OLgfJ_QumTBYOPWsafJI7rK6w7JLyfUFrVo")',
                            }}
                        >
                            <p className="serif-text text-white text-xs font-medium tracking-[0.25em] text-center px-2">
                                暮らしの美学
                            </p>
                        </div>
                    </Link>
                </div>

                <div className="py-12 px-12 text-center opacity-40">
                    <p className="serif-text text-primary dark:text-accent-gold text-xs leading-relaxed tracking-widest">
                        「優雅さこそが、決して色あせることのない唯一の美しさである。」
                    </p>
                    <div className="w-1 bg-primary/20 h-8 mx-auto mt-6 rounded-full"></div>
                </div>
            </main>
            <BottomNav />
        </div>
    );
}
