import Link from "next/link";

export default function CategoryNav() {
    return (
        <div className="flex gap-4 p-6 overflow-x-auto no-scrollbar">
            <Link href="/category/all" className="flex h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-6 shadow-sm">
                <p className="text-white text-sm font-medium">すべて</p>
            </Link>
            <Link href="/category/art" className="flex h-10 shrink-0 items-center justify-center rounded-lg bg-card-white dark:bg-white/10 border border-primary/10 px-6">
                <p className="text-primary dark:text-white/80 text-sm font-medium">
                    アート
                </p>
            </Link>
            <Link href="/category/culture" className="flex h-10 shrink-0 items-center justify-center rounded-lg bg-card-white dark:bg-white/10 border border-primary/10 px-6">
                <p className="text-primary dark:text-white/80 text-sm font-medium">
                    カルチャー
                </p>
            </Link>
            <Link href="/category/travel" className="flex h-10 shrink-0 items-center justify-center rounded-lg bg-card-white dark:bg-white/10 border border-primary/10 px-6">
                <p className="text-primary dark:text-white/80 text-sm font-medium">
                    トラベル
                </p>
            </Link>
        </div>
    );
}
