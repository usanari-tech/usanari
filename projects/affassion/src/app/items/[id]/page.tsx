import Link from "next/link";
import { getItemById, items } from "@/data/items";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
    return items.map((item) => ({
        id: item.id,
    }));
}

export default async function ItemDetail({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const item = getItemById(id);

    if (!item) {
        // Fallback for safety, though generateStaticParams covers it
        return notFound();
    }

    return (
        <div className="max-w-lg mx-auto min-h-screen bg-white dark:bg-[#131516] text-[#131516] dark:text-white pb-32">
            {/* Header with Back Button */}
            <header className="fixed top-0 left-0 right-0 max-w-lg mx-auto z-50 flex items-center justify-between px-6 h-16 bg-white/80 dark:bg-[#131516]/80 backdrop-blur-md">
                <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/5 dark:bg-white/5 text-primary dark:text-white transition-colors hover:bg-primary/10">
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
                </Link>
                <div className="flex gap-4">
                    <button className="w-10 h-10 flex items-center justify-center text-primary dark:text-white">
                        <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>share</span>
                    </button>
                </div>
            </header>

            {/* Hero Image */}
            <div className="pt-20 px-6 mb-8">
                <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-xl bg-cover bg-center relative"
                    style={{ backgroundImage: `url('${item.image}')` }}
                >
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                        <p className="text-white/80 text-xs font-bold tracking-[0.2em] uppercase mb-2 shadow-sm">{item.category}</p>
                        <h1 className="serif-text text-white text-2xl font-bold leading-tight shadow-md">{item.name}</h1>
                    </div>
                </div>
            </div>

            {/* Product Details */}
            <section className="px-8">
                <div className="flex items-baseline justify-between mb-6 pb-6 border-b border-primary/10 dark:border-white/10">
                    <p className="serif-text text-2xl text-accent-gold">{item.price}</p>
                    {item.sheinUrl && (
                        <a href={item.sheinUrl} target="_blank" rel="noopener noreferrer" className="bg-primary text-white text-xs px-6 py-2 rounded-full font-bold tracking-wider hover:bg-primary/90 transition-colors">
                            SHEINで購入
                        </a>
                    )}
                </div>

                <div className="mb-12">
                    <p className="font-serif text-sm leading-8 text-primary/80 dark:text-white/80 tracking-wide text-justify">
                        {item.description}
                        <br /><br />
                        日常に溶け込む、洗練されたデザイン。シンプルながらも存在感があり、置くだけで空間の質を高めてくれます。
                        素材の持つ温かみと、光を受けた時の美しい陰影をお楽しみください。
                    </p>
                </div>
            </section>

            {/* Related Items (Random 3 from items) */}
            <section className="px-6">
                <h3 className="serif-text text-sm font-bold dark:text-white tracking-wider mb-4">こちらもおすすめ</h3>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                    {items.filter(i => i.id !== item.id).slice(0, 3).map((rel) => (
                        <Link key={rel.id} href={`/items/${rel.id}`} className="min-w-[140px] group">
                            <div className="aspect-[3/4] rounded-lg bg-cover bg-center mb-2 shadow-sm"
                                style={{ backgroundImage: `url('${rel.image}')` }}></div>
                            <p className="serif-text text-xs dark:text-white line-clamp-1">{rel.name}</p>
                            <p className="text-[10px] text-accent-gold">{rel.price}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Fixed Bottom Action */}
            <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-4 bg-white dark:bg-[#131516] border-t border-primary/5 dark:border-white/5 flex items-center justify-between gap-4 z-50">
                <button className="w-12 h-12 rounded-full border border-primary/10 dark:border-white/10 flex items-center justify-center text-primary dark:text-white">
                    <span className="material-symbols-outlined">favorite</span>
                </button>
                {item.sheinUrl ? (
                    <a href={item.sheinUrl} target="_blank" rel="noopener noreferrer" className="flex-1 h-12 bg-[#131516] dark:bg-white text-white dark:text-[#131516] rounded-full flex items-center justify-center text-sm font-bold tracking-widest uppercase">
                        SHEINで見る
                    </a>
                ) : (
                    <button className="flex-1 h-12 bg-[#131516] dark:bg-white text-white dark:text-[#131516] rounded-full flex items-center justify-center text-sm font-bold tracking-widest uppercase">
                        カートに入れる
                    </button>
                )}
            </div>
        </div>
    );
}
