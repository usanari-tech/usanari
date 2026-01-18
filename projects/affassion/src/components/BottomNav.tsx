export default function BottomNav() {
    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-primary/95 dark:bg-zinc-900/95 backdrop-blur-lg rounded-full shadow-2xl z-50 px-8 py-3">
            <div className="flex items-center justify-between">
                <div className="flex flex-col items-center gap-1 group cursor-pointer">
                    <span
                        className="material-symbols-outlined text-white"
                        style={{ fontSize: "24px" }}
                    >
                        home
                    </span>
                    <span className="serif-text text-[9px] text-white/70 group-hover:text-white transition-colors">
                        ホーム
                    </span>
                </div>
                <div className="flex flex-col items-center gap-1 group cursor-pointer">
                    <span
                        className="material-symbols-outlined text-white/50 group-hover:text-white transition-colors"
                        style={{ fontSize: "24px" }}
                    >
                        auto_stories
                    </span>
                    <span className="serif-text text-[9px] text-white/50 group-hover:text-white transition-colors">
                        ジャーナル
                    </span>
                </div>
                <div className="flex flex-col items-center gap-1 group cursor-pointer">
                    <span
                        className="material-symbols-outlined text-white/50 group-hover:text-white transition-colors"
                        style={{ fontSize: "24px" }}
                    >
                        bookmark
                    </span>
                    <span className="serif-text text-[9px] text-white/50 group-hover:text-white transition-colors">
                        保存
                    </span>
                </div>
                <div className="flex flex-col items-center gap-1 group cursor-pointer">
                    <span
                        className="material-symbols-outlined text-white/50 group-hover:text-white transition-colors"
                        style={{ fontSize: "24px" }}
                    >
                        person_outline
                    </span>
                    <span className="serif-text text-[9px] text-white/50 group-hover:text-white transition-colors">
                        プロフ
                    </span>
                </div>
            </div>
        </nav>
    );
}
