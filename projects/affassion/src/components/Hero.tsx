export default function Hero() {
    return (
        <section className="px-6 mb-8">
            <div className="relative rounded-xl overflow-hidden shadow-xl bg-card-white dark:bg-zinc-900 group">
                <div
                    className="aspect-[4/5] w-full bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCtL9QSVHks8od9EiYNrHOAnJl47CltiKDf7DRn4lMsE6atlVY9Ld-6nBMs7Zze_A6drg7DwHKfzDMb3M1BicFhYBNxbeIw3XwXJl_lobRApTaIGwNDR6FzNJt35_U9NIiVPnrjpApkLBBm_gJ1o1aKKI97uhSgF3xUEWhdnYd4SqKpkmE1tpQ9EGoSH_esGDnDTXh-3La1H7ilwlkQu4-2WhOGsMKY6msIhT9Ba2vQZ7GdZ3vAdmZrNYmNDCeBHP6blvDISUayg7KP')",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 p-8 w-full">
                    <span className="serif-text text-accent-gold italic text-sm mb-2 block tracking-widest uppercase">
                        Édition Limitée
                    </span>
                    <h2 className="serif-text text-white text-2xl font-bold leading-snug mb-4 tracking-tight">
                        プロヴァンスで愉しむ
                        <br />
                        スローライフの芸術
                    </h2>
                    <div className="flex items-center justify-between">
                        <p className="text-white/80 text-xs font-light leading-relaxed max-w-[220px]">
                            ラベンダーの香りと、歴史ある石造りの村々を巡る旅。
                        </p>
                        <button className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6 py-2.5 text-xs font-medium transition-all">
                            読む
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
