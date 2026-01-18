import Link from "next/link";

export async function generateStaticParams() {
    return [
        { id: "pickup-1" },
        { id: "pickup-2" },
        { id: "article-1" },
        { id: "article-2" },
        { id: "collection-1" },
        { id: "collection-2" },
        { id: "rec-1" },
        { id: "rec-2" },
        { id: "rec-3" },
        { id: "winter-catalog" },
        { id: "related-1" },
        { id: "related-2" },
    ];
}

export default function ItemDetail({
    params,
}: {
    params: { id: string };
}) {
    return (
        <div className="relative flex h-auto w-full flex-col overflow-x-hidden min-h-screen bg-background-light dark:bg-background-dark text-[#131616] dark:text-gray-200">
            {/* TopAppBar */}
            <nav className="sticky top-0 z-50 flex items-center bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-6 py-4 justify-between border-b border-white/20">
                <Link href="/" className="text-primary dark:text-white flex items-center cursor-pointer">
                    <span className="material-symbols-outlined text-[24px]">
                        arrow_back_ios
                    </span>
                </Link>
                <div className="text-xs font-light tracking-[0.3em] uppercase opacity-60 editorial-spacing">
                    Editorial No. 042
                </div>
                <div className="flex items-center justify-end">
                    <button className="flex items-center justify-center rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <span className="material-symbols-outlined text-primary dark:text-white text-[24px]">
                            share
                        </span>
                    </button>
                </div>
            </nav>

            {/* Hero Image */}
            <div className="px-6 py-4 @container">
                <div
                    className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-lg min-h-[500px] shadow-sm"
                    style={{
                        backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBkPqUfufIrcArR2mYFPROsGZ2cL7qxBcHCkwuw6Xtup1Was4Ea7M2AOkniAPpGqAkQgMpeSemQwCtQk3OYzqAdf7R6qeX3a69NA8rJQY9M2qox2EFY2lAzDr7wn0vgaTlExCN0edbgoSC5cGBZ6oDIONG6p1h6UpZhcyuh6kLtnDP7vjovSDY9brRYVm6uzva0q8p5aVCuXhUyTZ0YkRc99B3kYSzSlJ7aMYv-rqs2Ctn87B-tZ-MLpbGvj3cmN9WFJ6dAWEu_vQTo")',
                    }}
                ></div>
            </div>

            {/* Headline & Meta */}
            <div className="px-6 pt-10 pb-6">
                <h1 className="text-[#131616] dark:text-white serif-text text-[32px] md:text-[40px] font-bold leading-tight mb-4">
                    備前焼の静寂：
                    <br />
                    土と炎が織りなす詩
                </h1>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-[1px] bg-primary"></div>
                    <p className="text-primary dark:text-primary/80 text-sm font-medium leading-normal editorial-spacing">
                        岡山県 / 備前焼作家 山田太郎
                    </p>
                </div>
            </div>

            {/* Main Narrative Section */}
            <section className="px-6 py-12">
                <h2 className="text-xs uppercase tracking-[0.4em] text-primary/60 dark:text-primary/40 mb-8 border-l-2 border-primary pl-4 font-bold">
                    Story
                </h2>
                <div className="space-y-8 max-w-2xl">
                    <p className="text-lg leading-relaxed font-light opacity-90">
                        一千年の歴史を誇る備前焼。釉薬を一切使わず、土と炎の力だけで生まれるその独特な模様は、二つとして同じものは存在しません。山田太郎氏の手によって生み出されるこの器は、静寂の中にも力強い生命力を宿しています。
                    </p>
                    <p className="text-lg leading-relaxed font-light opacity-90">
                        登り窯の中で十日間、昼夜を問わず薪を焚き続ける。灰が舞い、炎が器を撫でる。その瞬間の偶然が、土の肌に「火色」や「胡麻」といった豊かな表情を描き出します。それは、自然と人間が対話を重ねた果ての、究極の形なのです。
                    </p>
                </div>
            </section>

            {/* Detail Image Section */}
            <div className="px-6 py-6 grid grid-cols-2 gap-4">
                <div
                    className="aspect-[3/4] rounded-lg bg-cover bg-center"
                    style={{
                        backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAzGxy6SwJwFo_WQzIjJeRoSmekzjpQrbCVKzZI4gAyghUdGw6rzV7VcyvOChC7qCbbpEDVfiBd8qmO8T70ByDndovZbBGogRtHygWE10UcrXjwRlE3nd1w8Gel4Q8V_XLscV8w8wKeCLQ_mhx8YwsjpONOOVsPgKjKuojn00lKsbuppli8l4KeJm-3-vJtYNrRww8mhA0TyusOek47qNY3FTCmALPF0_gHD6-lAMAhuim0T15INaXT02ADThSDliBBuVxVeE9awqdu")',
                    }}
                ></div>
                <div
                    className="aspect-[3/4] rounded-lg bg-cover bg-center"
                    style={{
                        backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAbTs1hRd6P4cjFBCEHUMG2ig0UONCSn__HMhNVbmfvbpOm6xq_2LI159FRmlOUwbrOxjSxGdJQugknmXXvBpZVVTwV3ipcBD5KpXrFMyCp4IR3RRgv6I3yuATOHHtAZ9clmH6INkF_f3JUk8b1NYEKt_FmiETLa6UtDjAnr8wgdk-chtiCZVPTroWF_FyvnIAcxHq2n6RT5WExraDEes58QiianBKNB1unfmSaRRqRclWlwig0noPRX2RGb9KtosJgsEDVmNyEzgR_")',
                    }}
                ></div>
            </div>

            {/* Craftsmanship Section */}
            <section className="px-6 py-12 bg-white/40 dark:bg-black/20 my-8">
                <h2 className="text-xs uppercase tracking-[0.4em] text-primary/60 dark:text-primary/40 mb-8 border-l-2 border-primary pl-4 font-bold">
                    Craftsmanship
                </h2>
                <h3 className="text-2xl font-bold mb-6 editorial-spacing">
                    職人のこだわり
                </h3>
                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-primary font-bold text-sm">
                            01. 独自の土作り
                        </span>
                        <p className="text-base leading-relaxed font-light opacity-80">
                            田土と呼ばれる粘土を、何年も寝かせて熟成させます。土本来の持つ密度と粘り気が、焼き上がりの繊細な質感を決定づけます。
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-primary font-bold text-sm">
                            02. 自然の摂理
                        </span>
                        <p className="text-base leading-relaxed font-light opacity-80">
                            窯の温度変化、酸素の量、そして薪の種類。すべてが計算されつつも、最終的には火の神に委ねる。その謙虚な姿勢が作品に宿ります。
                        </p>
                    </div>
                </div>
            </section>

            {/* Related Items Section */}
            <section className="px-6 py-12">
                <h2 className="text-xs uppercase tracking-[0.4em] text-primary/60 dark:text-primary/40 mb-10 text-center font-bold">
                    Related Masterpieces
                </h2>
                <div className="grid grid-cols-2 gap-6">
                    {/* Related Item Card 1 */}
                    <Link href="/items/related-1" className="flex flex-col gap-3 group">
                        <div className="aspect-square bg-white border border-white/30 rounded-lg overflow-hidden relative">
                            <div
                                className="absolute inset-0 bg-center bg-cover transition-transform duration-700 group-hover:scale-105"
                                style={{
                                    backgroundImage:
                                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC4mQUAlOa0Q_x5D45xYe1pY7Ri_LmmE0dXuYl3Tfh5kwsAJJ5xUrxS1WlxdFrUwoIbk6IV5E3bdotsgPQvWFoSDSnZAEa30lv0BzjJRza2Rv79npoOdPYQ8-L4vYggIFxZGF5FExy1k8-I_4o_zftk8r6t4kadq2ii3zq4jYwiDPUsIkdtBOPoZvdBz7YpYDklW0O1j19r73LJXDde7K5qsuqLJfhG0vU0w8YMsGspqfn1-89ULhnwcSgra5oljuv_AN_SkYN0UOrf")',
                                }}
                            ></div>
                        </div>
                        <div>
                            <p className="text-xs font-light opacity-60 mb-1">Tea Ware</p>
                            <h4 className="text-sm font-bold editorial-spacing">
                                緋襷の茶碗
                            </h4>
                            <p className="text-xs text-primary mt-1">¥18,000</p>
                        </div>
                    </Link>
                    {/* Related Item Card 2 */}
                    <Link href="/items/related-2" className="flex flex-col gap-3 group">
                        <div className="aspect-square bg-white border border-white/30 rounded-lg overflow-hidden relative">
                            <div
                                className="absolute inset-0 bg-center bg-cover transition-transform duration-700 group-hover:scale-105"
                                style={{
                                    backgroundImage:
                                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCSM1nofNW4mXDKggeiKNqSwWsNPTbZULpi8GDlenY3CChdGjDHHQto17Oyu0gYB_O5zhkz3xO5a_lWoM6wStznFSnx2pDFoFZAQlYqO0vI0IAr85seqdWYQ2DzA2sKau1dZ2f1OcFhiv-yt6N05DrbVixuoSANMlzR3Zl5gv0k03VwooDkEzqVEIC60PL7HXRz9_RzGSiwL820e4-BTaHmmMWqFpt8_9FLRdB6omt_AjSWuhmkLHYYk4L6qYiSg_Lv32KJqbbAdSMP")',
                                }}
                            ></div>
                        </div>
                        <div>
                            <p className="text-xs font-light opacity-60 mb-1">Plate</p>
                            <h4 className="text-sm font-bold editorial-spacing">
                                胡麻の平皿
                            </h4>
                            <p className="text-xs text-primary mt-1">¥12,000</p>
                        </div>
                    </Link>
                </div>
            </section>
            <div className="h-32"></div>

            {/* Floating Action Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/95 to-transparent z-50">
                <div className="flex items-center justify-between gap-6 max-w-xl mx-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest opacity-60">
                            Price
                        </span>
                        <span className="text-xl font-bold font-sans">
                            ¥45,000 <span className="text-xs font-light opacity-50">tax incl.</span>
                        </span>
                    </div>
                    <button className="flex-1 bg-primary text-white h-14 rounded-lg font-bold text-sm tracking-[0.2em] shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        手に入れる
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "18px" }}
                        >
                            shopping_cart
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
