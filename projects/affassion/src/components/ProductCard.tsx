import Link from "next/link";

interface ProductCardProps {
    image: string;
    name: string;
    price: string;
    delay?: number;
    id?: string;
}

export default function ProductCard({
    image,
    name,
    price,
    delay = 0,
    id = "1",
}: ProductCardProps) {
    return (
        <Link
            href={`/items/${id}`}
            className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards opacity-0 group"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="aspect-square rounded-xl bg-white dark:bg-white/5 p-4 mb-3 flex items-center justify-center border border-primary/5 transition-colors group-hover:border-primary/20">
                <img
                    alt={name}
                    className="w-full h-full object-cover rounded-lg shadow-sm"
                    src={image}
                />
            </div>
            <p className="serif-text text-sm font-medium dark:text-white mb-1">
                {name}
            </p>
            <p className="serif-text text-xs text-accent-gold font-light">{price}</p>
        </Link>
    );
}
