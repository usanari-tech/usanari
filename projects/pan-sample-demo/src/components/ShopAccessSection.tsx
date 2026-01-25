import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Share2, Mail } from 'lucide-react';

const ShopAccessSection: React.FC = () => {
    return (
        <section className="py-32 px-6 md:px-20 lg:px-40 bg-bakery-beige dark:bg-background-dark overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-start">
                {/* Map Side */}
                <div className="w-full lg:w-1/2 flex flex-col gap-8">
                    <div className="mb-8">
                        <h1 className="text-primary dark:text-white tracking-tight text-4xl md:text-5xl font-bold flex flex-col gap-4">
                            <span className="text-xs uppercase tracking-[0.5em] text-bakery-toast font-bold">Location</span>
                            Shop Information <span className="text-2xl font-normal opacity-40 font-display">/ 店舗情報</span>
                        </h1>
                        <div className="h-1 w-12 bg-bakery-toast mt-8 rounded-full" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative group"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-bakery-toast/30 to-transparent rounded-2xl blur-lg p-2 opacity-50" />
                        <div className="relative bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-2xl border border-primary/10">
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-bakery-beige/50">
                                {/* Map Placeholder */}
                                <div className="absolute inset-0 flex items-center justify-center bg-bakery-wheat/10">
                                    <MapPin className="text-bakery-toast w-16 h-16 drop-shadow-lg" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
                            </div>
                        </div>
                    </motion.div>

                    <button className="flex items-center justify-center gap-3 w-fit px-10 py-5 bg-white dark:bg-white/5 hover:bg-primary hover:text-white transition-all rounded-xl text-primary dark:text-white text-[10px] font-bold tracking-[0.2em] border border-primary/10 shadow-sm uppercase group">
                        <MapPin size={16} className="text-bakery-toast group-hover:text-white transition-colors" />
                        View on Google Maps
                    </button>
                </div>

                {/* Details Side */}
                <div className="w-full lg:w-1/2 flex flex-col gap-12 mt-12 lg:mt-32">
                    <div className="space-y-0 divide-y divide-primary/10">
                        <InfoRow
                            label="Address"
                            icon={<MapPin size={16} />}
                            content="1-2-3 Minato-ku, Tokyo / 東京都港区1-2-3"
                            subContent="Crafted in the heart of the city."
                        />
                        <InfoRow
                            label="Hours"
                            icon={<Clock size={16} />}
                            content={
                                <div className="space-y-2 mt-2">
                                    <div className="flex justify-between max-w-[280px]">
                                        <span className="opacity-50 text-xs">Mon - Fri</span>
                                        <span className="font-bold text-xs uppercase tracking-widest">8:00 AM - 7:00 PM</span>
                                    </div>
                                    <div className="flex justify-between max-w-[280px]">
                                        <span className="opacity-50 text-xs">Sat - Sun</span>
                                        <span className="font-bold text-xs uppercase tracking-widest">9:00 AM - 6:00 PM</span>
                                    </div>
                                </div>
                            }
                        />
                        <InfoRow
                            label="Contact"
                            icon={<Phone size={16} />}
                            content="+81 03-1234-5678"
                        />
                    </div>

                    <div className="flex items-center gap-10 pt-4 text-primary/60">
                        <a className="hover:text-primary transition-colors flex items-center gap-3 text-[10px] uppercase font-bold tracking-[0.2em]" href="#">
                            <Share2 size={14} className="text-bakery-toast" /> Instagram
                        </a>
                        <a className="hover:text-primary transition-colors flex items-center gap-3 text-[10px] uppercase font-bold tracking-[0.2em]" href="#">
                            <Mail size={14} className="text-bakery-toast" /> Newsletter
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

const InfoRow: React.FC<{ label: string, icon: React.ReactNode, content: React.ReactNode, subContent?: string }> = ({ label, icon, content, subContent }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-[120px_1fr] py-10 group"
    >
        <div className="flex items-center gap-2 text-bakery-toast opacity-80 uppercase text-[10px] font-bold tracking-widest">
            {icon} {label}
        </div>
        <div className="space-y-2">
            <div className="text-primary dark:text-white text-xl font-medium font-display leading-relaxed">
                {content}
            </div>
            {subContent && <p className="text-xs opacity-40 font-sans tracking-wide italic leading-relaxed">{subContent}</p>}
        </div>
    </motion.div>
);

export default ShopAccessSection;
