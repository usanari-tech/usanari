export default function Header() {
    return (
        <header className="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-[#131516]/5 dark:border-white/5">
            <div className="flex items-center p-4 justify-between max-w-lg mx-auto">
                <div className="flex items-center size-10">
                    <span
                        className="material-symbols-outlined text-primary dark:text-white cursor-pointer"
                        style={{ fontSize: "28px" }}
                    >
                        menu
                    </span>
                </div>
                <h1 className="serif-text text-[#131516] dark:text-white text-xl font-bold leading-tight tracking-[0.2em] text-center uppercase">
                    L&apos;Éditorial
                </h1>
                <div className="flex size-10 items-center justify-end">
                    <span
                        className="material-symbols-outlined text-primary dark:text-white cursor-pointer"
                        style={{ fontSize: "28px" }}
                    >
                        search
                    </span>
                </div>
            </div>
        </header>
    );
}
