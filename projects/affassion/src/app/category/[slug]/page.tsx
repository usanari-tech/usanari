import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { items, getItemsByCategory } from "@/data/items";

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
    // If slug is 'all' or 'collection', return all items, otherwise filter
    // For now, we only have a few items, so mapping logic is simple
    const categoryName = params.slug.toUpperCase();
    const displayItems = params.slug === 'all' || params.slug === 'collection'
        ? items
        : getItemsByCategory(params.slug);

    // If no items found (e.g. empty category), just show all for demo
    const finalItems = displayItems.length > 0 ? displayItems : items;

    return (
        <div className="max-w-lg mx-auto min-h-screen bg-white dark:bg-[#131516] pb-32">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#131516]/80 backdrop-blur-md border-b border-primary/5 dark:border-white/5">
                <div className="flex items-center justify-between px-6 h-16">
                    <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/5 dark:bg-white/5 text-primary dark:text-white">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
                    </Link>
                    <h1 className="serif-text text-lg font-bold tracking-widest dark:text-white">
                        {categoryName}
                    </h1>
                    <div className="w-10"></div>{/* Spacer */}
                </div>
            </header>

            {/* Filter Tabs (Horizontal) */}
            <div className="px-6 py-4 overflow-x-auto no-scrollbar flex gap-2">
                {['ALL', 'INTERIOR', 'FASHION', 'LIVING'].map((tab) => (
                    <button key={tab} className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider border transition-colors ${tab === 'ALL' ? 'bg-[#131516] text-white border-[#131516] dark:bg-white dark:text-[#131516]' : 'text-primary/60 border-primary/10 dark:text-white/60 dark:border-white/10'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="px-6 mt-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                    {finalItems.map((item) => (
                        <Link key={item.id} href={`/items/${item.id}`} className="group block">
                            <div className="aspect-[3/4] rounded-lg bg-gray-100 dark:bg-zinc-800 overflow-hidden mb-3 relative">
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url('${item.image}')` }}></div>
                                <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase">
                                    {item.category}
                                </div>
                            </div>
                            <h3 className="serif-text text-sm font-medium dark:text-white leading-tight mb-1">
                                {item.name}
                            </h3>
                            <p className="text-xs text-accent-gold font-bold">
                                {item.price}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
