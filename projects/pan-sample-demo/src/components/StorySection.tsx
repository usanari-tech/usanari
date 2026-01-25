import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Hourglass, Wheat, HandMetal } from 'lucide-react';

const StorySection: React.FC = () => {
    return (
        <section className="relative py-32 px-6 md:px-20 lg:px-40 overflow-hidden bg-bakery-beige/30 dark:bg-background-dark/30">
            {/* Decorative background elements */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-bakery-wheat rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-bakery-toast rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
                {/* Image Side */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2 }}
                    className="w-full lg:w-1/2 relative"
                >
                    <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-bakery-toast/40 rounded-tl-xl" />
                    <div className="relative aspect-[3/4] w-full max-w-[500px] mx-auto overflow-hidden rounded-xl shadow-2xl">
                        <img
                            alt="Baker's hands"
                            className="w-full h-full object-cover sepia-[20%] hover:scale-105 transition-transform duration-1000"
                            src="https://images.unsplash.com/photo-1544333346-6dec8650393c?auto=format&fit=crop&q=80&w=1000"
                        />
                    </div>
                    <div className="absolute -bottom-12 -right-6 hidden lg:block">
                        <p className="[writing-mode:vertical-rl] text-bakery-toast text-[10px] font-medium tracking-[0.5em] opacity-80 uppercase">
                            TRADITIONAL METHOD SINCE 1984
                        </p>
                    </div>
                </motion.div>

                {/* Content Side */}
                <div className="w-full lg:w-1/2 flex flex-col gap-8 p-8 md:p-12 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm">
                    <div className="flex items-start gap-8">
                        <div className="hidden sm:block">
                            <h3 className="[writing-mode:vertical-rl] text-primary text-sm font-bold tracking-[0.3em] py-4 border-r border-primary/20 pr-6 mr-2">
                                手仕事の哲学
                            </h3>
                        </div>
                        <div className="flex flex-col gap-6">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-primary dark:text-white tracking-[0.2em] text-4xl md:text-5xl font-display leading-[1.4]"
                            >
                                素材への祈り、<br />
                                手仕事の温度
                            </motion.h2>
                            <div className="h-0.5 w-16 bg-bakery-toast/40 rounded-full" />
                            <p className="text-primary/70 dark:text-white/60 text-lg font-light font-sans leading-relaxed">
                                私たちのパン作りは、素材への対話から始まります。24時間の長時間低温発酵が、厳選された国産オーガニック小麦本来の甘みと香りを最大限に引き出します。
                            </p>
                            <motion.button
                                whileHover={{ x: 5 }}
                                className="group flex items-center gap-3 text-primary dark:text-white font-bold text-xs tracking-[0.2em] uppercase"
                            >
                                Explore Our Process
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 mt-32 border-t border-primary/10 pt-16">
                <FeatureItem
                    icon={<Hourglass size={20} />}
                    title="24h Fermentation"
                    desc="A slow rise develops a complex flavor profile that quick-bake breads simply cannot achieve."
                />
                <FeatureItem
                    icon={<Wheat size={20} />}
                    title="Organic Wheat"
                    desc="Locally sourced, pesticide-free grains chosen for their superior nutritional value."
                />
                <FeatureItem
                    icon={<HandMetal size={20} />}
                    title="Handcrafted"
                    desc="No massive machinery. Every loaf is shaped by the warmth and intuition of a master baker."
                />
            </div>
        </section>
    );
};

const FeatureItem: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col gap-4"
    >
        <div className="flex items-center gap-3 text-bakery-toast">
            {icon}
            <h4 className="font-bold text-xs uppercase tracking-widest">{title}</h4>
        </div>
        <p className="text-sm text-primary/60 dark:text-white/40 leading-relaxed font-sans">
            {desc}
        </p>
    </motion.div>
);

export default StorySection;
