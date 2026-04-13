"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RecentItem {
    id: string;
    code: string;
    name: string;
    timestamp: number;
    sessionId?: string;
}

export default function RecentCalculatorLink({ 
    programs, 
    latestCalculation 
}: { 
    programs: { id: string, name: string, code: string }[],
    latestCalculation: any
}) {
    const [lastProgram, setLastProgram] = useState<RecentItem | null>(null);
    const [isHistory, setIsHistory] = useState(false);

    useEffect(() => {
        // 1. Check if we have a latest calculation from the server (Database)
        if (latestCalculation) {
            setLastProgram({
                id: latestCalculation.program.id,
                code: latestCalculation.program.code,
                name: latestCalculation.program.name,
                timestamp: new Date(latestCalculation.createdAt).getTime(),
                sessionId: latestCalculation.id
            });
            setIsHistory(true);
            return;
        }

        // 2. Fallback to localStorage
        const items: RecentItem[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('poly-cgpa-') && !key.includes('index')) {
                const progId = key.replace('poly-cgpa-', '');
                const program = programs.find(p => p.id === progId);
                if (program) {
                    // We don't have a timestamp in the current localStorage schema, 
                    // but we can at least show the first one we find or the one that has most data.
                    items.push({
                        id: program.id,
                        code: program.code,
                        name: program.name,
                        timestamp: Date.now() // Placeholder
                    });
                }
            }
        }
        
        if (items.length > 0) {
            setLastProgram(items[0]);
        }
    }, [programs]);

    if (!lastProgram) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="fixed lg:absolute top-24 lg:top-12 right-4 lg:right-12 z-[50] max-w-[280px] w-full"
            >
                <Link 
                    href={lastProgram.sessionId 
                        ? `/calculate/${lastProgram.code}?session=${lastProgram.sessionId}` 
                        : `/calculate/${lastProgram.code}`
                    }
                    className="group relative flex items-center gap-3 p-3 rounded-2xl bg-card border border-border shadow-2xl hover:border-primary/50 transition-all duration-500 overflow-hidden"
                >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform flex-shrink-0">
                        <Clock className="h-5 w-5" />
                    </div>
                    
                    <div className="text-left overflow-hidden flex-1">
                        <p className="text-[8px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 truncate">
                            {isHistory ? "Resume Academic Journey" : "Continue Draft"}
                        </p>
                        <h4 className="text-sm lg:text-lg font-black text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
                            {isHistory ? (latestCalculation.label || lastProgram.name) : lastProgram.name} 
                            <span className="text-muted-foreground/30 ml-2 font-bold text-xs lg:text-sm">{lastProgram.code}</span>
                        </h4>
                        
                        {isHistory && (
                            <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <span className="text-[10px] font-black text-foreground/70 uppercase tracking-tighter">CGPA: {latestCalculation.cgpa.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">{latestCalculation.semesters?.length || 0} Terms Recorded</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="ml-auto flex items-center justify-center h-8 w-8 rounded-full hover:bg-primary/10 transition-colors">
                        <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                    
                    {/* Animated pulse indicator */}
                    <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                </Link>
            </motion.div>
        </AnimatePresence>
    );
}
