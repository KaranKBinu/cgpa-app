"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

interface RecentItem {
    id: string;
    code: string;
    name: string;
    timestamp: number;
    sessionId?: string;
    metadata?: {
        cgpa: number;
        semesters: number;
        label?: string;
        isDraft?: boolean;
    };
}

export default function RecentCalculatorLink({
    programs,
    recentCalculations
}: {
    programs: { id: string, name: string, code: string }[],
    recentCalculations: any[]
}) {
    const { data: session } = useSession();
    const [items, setItems] = useState<RecentItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isHinting, setIsHinting] = useState(false);

    useEffect(() => {
        const allItems: RecentItem[] = [];

        // 1. Add database calculations (History)
        if (recentCalculations && recentCalculations.length > 0) {
            recentCalculations.forEach(calc => {
                allItems.push({
                    id: calc.program.id,
                    code: calc.program.code,
                    name: calc.program.name,
                    timestamp: new Date(calc.updatedAt).getTime(),
                    sessionId: calc.id,
                    metadata: {
                        cgpa: calc.cgpa,
                        semesters: calc.semestersCount || calc._count?.semesters || 0,
                        label: calc.label
                    }
                });
            });
        }

        // 2. Add localStorage items (Drafts)
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('poly-cgpa-') && !key.includes('index')) {
                const progId = key.replace('poly-cgpa-', '');
                const program = programs.find(p => p.id === progId);
                const rawData = localStorage.getItem(key);

                if (program && rawData) {
                    try {
                        const data = JSON.parse(rawData);
                        const hasGrades = Object.values(data.grades || {}).some(g => !!g);
                        const hasManual = Object.values(data.manualSgpas || {}).some(m => !!m);
                        const hasCustom = Object.values(data.customSubjects || {}).some((subs: any) => subs && subs.length > 0);

                        if (hasGrades || hasManual || hasCustom) {
                            const isAlreadyInHistory = allItems.some(h => h.id === program.id && h.sessionId);

                            if (!isAlreadyInHistory || !session) {
                                const manualSemIds = Object.keys(data.manualSgpas || {}).filter(k => !!data.manualSgpas[k]);
                                const gradesCount = Object.keys(data.grades || {}).length;
                                const customCount = Object.values(data.customSubjects || {}).flat().length;
                                const semestersCount = Math.max(manualSemIds.length, (gradesCount > 0 || customCount > 0) ? 1 : 0);

                                allItems.push({
                                    id: program.id,
                                    code: program.code,
                                    name: program.name,
                                    timestamp: data.updatedAt || 0,
                                    metadata: {
                                        cgpa: 0,
                                        semesters: semestersCount,
                                        isDraft: true
                                    }
                                });
                            }
                        }
                    } catch (e) { }
                }
            }
        }

        if (allItems.length > 0) {
            allItems.sort((a, b) => b.timestamp - a.timestamp);
            setItems(allItems);

            // Trigger "Peek" hint on load
            const timer = setTimeout(() => {
                setIsHinting(true);
                setTimeout(() => setIsHinting(false), 2500);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [programs, recentCalculations, session]);

    const handleNext = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const handlePrev = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    if (items.length === 0) return null;

    const currentItem = items[currentIndex];

    return (
        <motion.div 
            initial={false}
            animate={{ 
                x: isOpen ? 0 : (isHinting ? 150 : 320)
            }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="fixed top-32 lg:top-40 right-0 z-[100] flex items-start"
        >
            {/* Sticky Tab Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-32 w-10 flex flex-col items-center justify-center gap-3 rounded-l-2xl border-2 border-r-0 transition-all duration-500 shadow-2xl",
                    isOpen 
                        ? "bg-primary border-primary text-black" 
                        : "bg-background/80 backdrop-blur-2xl border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50"
                )}
            >
                <div className="relative">
                    <Clock className="h-5 w-5" />
                    {!isOpen && items.length > 0 && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background ring-1 ring-red-500/20" />
                    )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] [writing-mode:vertical-lr] rotate-180">
                    {isOpen ? "Close" : "Drafts"}
                </span>
            </button>

            {/* Container */}
            <div className="w-[320px] pr-4 lg:pr-8">
                <AnimatePresence mode="popLayout" custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction < 0 ? 50 : -50 }}
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="group"
                    >
                        <div className="relative p-1 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-border/50 to-emerald-500/10 backdrop-blur-3xl border border-border/50 shadow-2xl">
                            <Link
                                href={currentItem.sessionId
                                    ? `/calculate/${currentItem.code}?session=${currentItem.sessionId}`
                                    : `/calculate/${currentItem.code}`
                                }
                                className="flex items-center gap-4 p-4 rounded-[1.25rem] bg-card hover:bg-emerald-500/5 transition-all duration-500"
                            >
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0 group-hover:rotate-6 transition-transform">
                                    {currentItem.metadata?.isDraft ? <Clock className="h-6 w-6" /> : <Clock className="h-6 w-6 fill-current opacity-20" />}
                                </div>

                                <div className="text-left overflow-hidden flex-1">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            currentItem.metadata?.isDraft ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                                        )}>
                                            {currentItem.metadata?.isDraft ? "Draft" : "Previous Session"}
                                        </span>
                                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                            {new Date(currentItem.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h4 className="text-base lg:text-xl font-black text-foreground tracking-tight truncate leading-none mb-3">
                                        {currentItem.metadata?.label || currentItem.name}
                                    </h4>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-1 w-1 rounded-full bg-primary" />
                                            <span className="text-[10px] font-black text-foreground/70 uppercase tracking-tighter">
                                                {currentItem.metadata?.cgpa ? `CGPA: ${currentItem.metadata.cgpa.toFixed(2)}` : "In Progress"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                                                {Math.min(currentItem.metadata?.semesters || 0, 6)} Terms
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-surface border border-border group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all">
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </Link>

                            {/* Carousel Controls */}
                            {items.length > 1 && (
                                <div className="mt-1 px-4 py-2 flex items-center justify-between border-t border-border/20 bg-card/30">
                                    <div className="flex items-center gap-1">
                                        {items.map((_, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "h-1 transition-all rounded-full",
                                                    i === currentIndex ? "w-4 bg-primary" : "w-1 bg-border"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={(e) => { e.preventDefault(); handlePrev(); }} className="p-1 hover:text-primary transition-colors">
                                            <span className="sr-only">Previous</span>
                                            <ArrowRight className="h-3 w-3 rotate-180" />
                                        </button>
                                        <button onClick={(e) => { e.preventDefault(); handleNext(); }} className="p-1 hover:text-primary transition-colors">
                                            <span className="sr-only">Next</span>
                                            <ArrowRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
