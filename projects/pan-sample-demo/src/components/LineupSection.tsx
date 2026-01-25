import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const products = [
    {
        title: "Artisan Shokupan",
        desc: "Soft, pillowy clouds made with premium Hokkaido milk.",
        img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600",
        tag: "Signature"
    },
    {
        title: "Golden Croissant",
        desc: "72 layers of fermented butter, baked to a perfect amber shatter.",
        img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600",
        tag: "Classic"
    },
    {
        title: "Seasonal Danish",
        desc: "Hand-selected local fruits atop a crisp, buttery nest.",
        img: "https://images.unsplash.com/photo-1626803791423-47e3c634ad84?auto=format&fit=crop&q=80&w=600",
        tag: "Seasonal"
    }
];

const LineupSection: React.FC = () => {
    return (
        <section className="py-32 px-6 md:px-20 lg:px-40 bg-white dark:bg-background-dark/50">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col items-center text-center mb-24">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-bakery-toast text-xs font-bold tracking-[0.3em] uppercase mb-4"
                    >
                        Seasonal Selection
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-primary dark:text-white text-4xl md:text-5xl font-display italic tracking-wide"
                    >
                        Our Daily Lineup
                    </motion.h2>
                    <div className="w-12 h-px bg-bakery-toast/30 mt-8" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    {products.map((product, idx) => (
                        <motion.div
                            key={product.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            className="group cursor-pointer"
                        >
                            <div className="relative overflow-hidden rounded-xl aspect-[4/5] shadow-lg mb-8">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.6 }}
                                    className="w-full h-full bg-cover bg-center"
                                    style={{ backgroundImage: `url(${product.img})` }}
                                />
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute top-4 right-4">
                                    <span className="bg-white/90 backdrop-blur px-3 py-1 text-[9px] tracking-widest uppercase font-bold text-primary rounded-full">
                                        {product.tag}
                                    </span>
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-primary dark:text-white text-xl font-bold mb-3 tracking-wide">{product.title}</h3>
                                <p className="text-primary/60 dark:text-white/40 text-sm font-display italic leading-relaxed px-4">
                                    {product.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="flex justify-center mt-24">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group flex items-center gap-4 px-10 py-5 rounded-full border border-bakery-toast/30 bg-bakery-beige/50 dark:bg-white/5 text-primary dark:text-white text-[10px] font-bold tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-500"
                    >
                        VIEW ALL COLLECTIONS
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </div>
            </div>
        </section>
    );
};

export default LineupSection;
