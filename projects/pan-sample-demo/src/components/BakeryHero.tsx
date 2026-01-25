import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, MapPin, Info, Sun } from 'lucide-react';

const BakeryHero: React.FC = () => {
    return (
        <div className="relative min-h-screen bg-bakery-beige dark:bg-background-dark text-primary transition-colors duration-1000 overflow-hidden font-sans">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {/* SVG Accents - "One Slash" lines */}
                <svg className="absolute top-0 right-0 w-1/2 h-1/2 opacity-40 dark:opacity-20 text-bakery-wheat" viewBox="0 0 400 400">
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 3, ease: "easeOut" }}
                        d="M400,0 Q300,50 350,150 T250,300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                    />
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 4, ease: "easeOut", delay: 0.5 }}
                        d="M400,50 Q320,100 380,200 T300,350"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.3"
                        strokeDasharray="2 4"
                    />
                </svg>

                <svg className="absolute bottom-0 left-0 w-1/2 h-1/2 opacity-40 dark:opacity-20 text-bakery-wheat" viewBox="0 0 400 400">
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 3, ease: "easeOut", delay: 1 }}
                        d="M0,400 Q100,350 50,250 T150,100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                    />
                </svg>

                {/* Floating Blurs */}
                <motion.div
                    animate={{
                        x: [0, 15, 0],
                        y: [0, -15, 0],
                        rotate: [0, 2, 0]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-bakery-wheat/10 dark:bg-bakery-wheat/5 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        x: [0, -20, 0],
                        y: [0, 20, 0],
                        rotate: [0, -3, 0]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-bakery-toast/20 dark:bg-bakery-toast/10 rounded-full blur-[80px]"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-bakery-beige/80 dark:to-background-dark/90" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-50">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1 }}
                    className="flex items-center gap-2"
                >
                    <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 100 100">
                        <path d="M20 20 L45 50 L20 80 H35 L60 50 L35 20 H20Z" fill="currentColor" />
                        <path d="M65 20 H80 V80 H65 V20Z" fill="currentColor" />
                    </svg>
                    <span className="text-xs tracking-[0.3em] font-medium hidden sm:block uppercase">KAI Bakery</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1 }}
                    className="flex gap-10 text-[10px] tracking-[0.2em] font-medium uppercase items-center"
                >
                    <a className="hover:text-bakery-toast transition-colors flex items-center gap-2" href="#"><Info size={12} /> Concept</a>
                    <a className="hover:text-bakery-toast transition-colors flex items-center gap-2" href="#"><ShoppingBag size={12} /> Menu</a>
                    <a className="hover:text-bakery-toast transition-colors flex items-center gap-2" href="#"><MapPin size={12} /> Access</a>
                    <button
                        className="hover:opacity-50 transition-opacity"
                        onClick={() => document.documentElement.classList.toggle('dark')}
                    >
                        <Sun size={14} />
                    </button>
                </motion.div>
            </nav>

            {/* Main Content */}
            <main className="relative h-screen flex flex-col items-center justify-center z-10 px-6">
                <div className="text-center space-y-8 max-w-4xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="font-display text-4xl md:text-6xl lg:text-7xl leading-relaxed md:leading-loose tracking-[0.3em] text-primary drop-shadow-sm"
                    >
                        香りと食感で、<br className="md:hidden" />朝をいろどる。
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 2, delay: 1 }}
                        className="text-[10px] md:text-xs tracking-[0.4em] text-primary/60 font-light"
                    >
                        CRAFTED MOMENTS WITH ARTISAN BREAD
                    </motion.p>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2.5 }}
                    className="absolute bottom-10 flex flex-col items-center gap-3"
                >
                    <span className="text-[9px] tracking-[0.3em] text-primary/40 uppercase">Scroll</span>
                    <motion.div
                        animate={{ scaleY: [0, 1, 0], originY: 0 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-px h-16 bg-gradient-to-b from-primary/40 to-transparent"
                    />
                </motion.div>
            </main>

            {/* Vertical Text Sidebars */}
            <div className="fixed right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-12 pointer-events-none opacity-60 text-primary">
                <motion.span
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 }}
                    className="[writing-mode:vertical-rl] text-[9px] tracking-[0.6em] font-light"
                >
                    職人の手仕事
                </motion.span>
                <motion.span
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.7 }}
                    className="[writing-mode:vertical-rl] text-[9px] tracking-[0.6em] font-light"
                >
                    厳選された素材
                </motion.span>
            </div>

            {/* Decorative Image */}
            <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.15, scale: 1 }}
                transition={{ duration: 3, delay: 0.5 }}
                className="fixed left-12 bottom-12 w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden z-0 pointer-events-none sepia contrast-125 grayscale"
            >
                <img
                    alt="Artisan bread texture"
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1000"
                />
            </motion.div>
        </div>
    );
};

export default BakeryHero;
