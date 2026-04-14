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
    metadata?: {
        cgpa: number;
        semesters: number;
    };
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
                const rawData = localStorage.getItem(key);
                
                if (program && rawData) {
                    try {
                        const data = JSON.parse(rawData);
                        // Check if there is actual content in the draft
                        const hasGrades = Object.values(data.grades || {}).some(g => !!g);
                        const hasManual = Object.values(data.manualSgpas || {}).some(m => !!m);
                        const hasCustomSubjects = Object.values(data.customSubjects || {}).some((subs: any) => subs && subs.length > 0);
                        
                        if (hasGrades || hasManual || hasCustomSubjects) {
                            // Accurate metadata calculation for drafts
                            const manualSemIds = Object.keys(data.manualSgpas || {}).filter(k => !!data.manualSgpas[k]);
                            const gradesCount = Object.keys(data.grades || {}).length;
                            const customCount = Object.values(data.customSubjects || {}).flat().length;
                            
                            // If it's an interactive draft, calculate how many semesters have grades or custom subjects
                            const activeInteractiveSems = new Set<string>();
                            if (gradesCount > 0 || customCount > 0) {
                                Object.keys(data.customSubjects || {}).forEach(sid => {
                                    if (data.customSubjects[sid]?.length > 0) activeInteractiveSems.add(sid);
                                });
                            }
                            
                            const totalActiveSems = new Set([...manualSemIds, ...activeInteractiveSems]);
                            const semestersCount = Math.max(totalActiveSems.size, (gradesCount > 0 || customCount > 0) ? 1 : 0);

                            items.push({
                                id: program.id,
                                code: program.code,
                                name: program.name,
                                timestamp: data.updatedAt || 0,
                                metadata: {
                                    cgpa: 0, 
                                    semesters: semestersCount
                                }
                            });
                        }
                    } catch (e) {
                        console.error("Failed to parse local draft", e);
                    }
                }
            }
        }
        
        if (items.length > 0) {
            // Sort by most recent
            items.sort((a, b) => b.timestamp - a.timestamp);
            setLastProgram(items[0]);
        }
    }, [programs, latestCalculation]);

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
                        <p className="text-[10px] lg:text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 truncate">
                            {isHistory ? "Resume Academic Journey" : "Continue Draft"}
                        </p>
                        <h4 className="text-base lg:text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
                            {isHistory ? (latestCalculation.label || lastProgram.name) : lastProgram.name} 
                            <span className="text-muted-foreground/30 ml-2 font-bold text-sm lg:text-base">{lastProgram.code}</span>
                        </h4>
                        
                        {(isHistory || lastProgram.metadata) && (
                            <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <span className="text-[10px] font-black text-foreground/70 uppercase tracking-tighter">
                                        CGPA: {isHistory ? latestCalculation.cgpa.toFixed(2) : (lastProgram.metadata?.cgpa?.toFixed(2) || "0.00")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                                        {isHistory ? (latestCalculation._count?.semesters || 0) : (lastProgram.metadata?.semesters || 0)} Terms Recorded
                                    </span>
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
