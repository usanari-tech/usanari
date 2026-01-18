import Link from "next/link";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryNav from "@/components/CategoryNav";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { items, getItemById } from "@/data/items";

export default function Home() {
  const pickup1 = getItemById("pickup-1")!;
  const pickup2 = getItemById("pickup-2")!; // Strawberry Vase

  // Helper to find other items
  const article1 = getItemById("article-1")!;
  const article2 = getItemById("article-2")!;
  const collection1 = getItemById("collection-1")!;
  const collection2 = getItemById("collection-2")!;

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

        {/* New Articles (Reading from Data) */}
        <div className="flex items-center justify-between px-6 mb-6">
          <h3 className="serif-text text-[#131516] dark:text-white text-lg font-bold tracking-widest">
            新着記事
          </h3>
          <div className="h-px flex-1 mx-4 bg-primary/10 dark:bg-white/10"></div>
        </div>
        <section className="px-6 mb-12">
          <div className="grid grid-cols-2 gap-4">
            <Link href={`/items/${article1.id}`} className="flex flex-col gap-3 group">
              <div
                className="aspect-[3/4] rounded-lg overflow-hidden bg-cover bg-center shadow-md transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `url('${article1.image}')`,
                }}
              ></div>
              <div>
                <p className="text-accent-gold text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                  Architecture
                </p>
                <h4 className="serif-text text-sm font-bold leading-tight dark:text-white">
                  {article1.name}
                </h4>
              </div>
            </Link>
            <Link href={`/items/${article2.id}`} className="flex flex-col gap-3 group mt-8">
              <div
                className="aspect-[3/4] rounded-lg overflow-hidden bg-cover bg-center shadow-md transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `url('${article2.image}')`,
                }}
              ></div>
              <div>
                <p className="text-accent-gold text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                  Style
                </p>
                <h4 className="serif-text text-sm font-bold leading-tight dark:text-white">
                  {article2.name}
                </h4>
              </div>
            </Link>
          </div>
        </section>

        {/* Pickup Items (Reading from Data) */}
        <div className="flex items-center justify-between px-6 mb-6">
          <h3 className="serif-text text-[#131516] dark:text-white text-lg font-bold tracking-widest">
            ピックアップ・アイテム
          </h3>
        </div>
        <section className="px-6 mb-12">
          <div className="grid grid-cols-2 gap-6">
            <ProductCard
              image={pickup1.image}
              name={pickup1.name}
              price={pickup1.price}
              id={pickup1.id}
            />
            <ProductCard
              image={pickup2.image}
              name={pickup2.name}
              price={pickup2.price}
              delay={100}
              id={pickup2.id}
            />
          </div>
        </section>

        {/* Collection (Reading from Data) */}
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
            <Link href={`/items/${collection1.id}`}
              className="min-w-[220px] aspect-[2/3] rounded-lg bg-cover bg-center shadow-lg"
              style={{
                backgroundImage: `url('${collection1.image}')`,
              }}
            ></Link>
            <Link href={`/items/${collection2.id}`}
              className="min-w-[220px] aspect-[2/3] rounded-lg bg-cover bg-center shadow-lg"
              style={{
                backgroundImage: `url('${collection2.image}')`,
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
            {items.slice(0, 3).map((item) => (
              <Link key={item.id} href={`/items/${item.id}`} className="flex-none w-32 group">
                <div className="aspect-square rounded-lg border border-primary/10 dark:border-white/10 overflow-hidden mb-2">
                  <img className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all" src={item.image} alt={item.name} />
                </div>
                <p className="serif-text text-[10px] leading-tight dark:text-white/80 line-clamp-2">{item.name}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
