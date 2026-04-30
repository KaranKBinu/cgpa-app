import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, History, Save, X } from 'lucide-react';
import { Tooltip } from '../Tooltip';
import { cn } from '@/lib/utils';
import { SemResult } from '@/types/calculator';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { useEffect } from 'react';

interface ActionFABsProps {
  results: any;
  currentSemRes: SemResult | undefined;
  expandedSem: string | null;
  downloadAsPDF: (id: string) => void;
  activeSessionId: string | null;
  setIsSaveModalOpen: (open: boolean) => void;
  isSaving: boolean;
  saveStatus: string;
  programCode: string;
  triggerConfetti?: boolean;
  // New props for full PDF context
  program: any;
  grades: any;
  exclusions: any;
  customSubjects: any;
  selectedOptions: any;
  isLETMode: boolean;
  globalOpenElectives: any;
  studentName: string;
}

export const ActionFABs: React.FC<ActionFABsProps> = ({
  results,
  currentSemRes,
  expandedSem,
  downloadAsPDF,
  activeSessionId,
  setIsSaveModalOpen,
  isSaving,
  saveStatus,
  programCode,
  triggerConfetti,
  program,
  grades,
  exclusions,
  customSubjects,
  selectedOptions,
  isLETMode,
  globalOpenElectives,
  studentName
}) => {
  useEffect(() => {
    if (saveStatus === 'success' || triggerConfetti) {
      const duration = 1.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // Pop from bottom corners
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: 0.7 },
          colors: ['#10b981', '#3b82f6', '#ffffff'] 
        });
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: 0.7 },
          colors: ['#10b981', '#3b82f6', '#ffffff'] 
        });
      }, 400);
      
      return () => clearInterval(interval);
    }
  }, [saveStatus, triggerConfetti]);

  return (
    <AnimatePresence>
      <motion.div
        key="sgpa-pill"
        initial={{ opacity: 0, x: -50, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -50, scale: 0.8 }}
        className="lg:hidden fixed bottom-8 left-3 sm:left-4 z-[90]"
      >
        <Tooltip 
          content="View Detailed Summary" 
          position="top" 
          variant="emerald" 
          forceShow={results.cgpa > 0}
        >
          <Link 
            href={`/calculate/${programCode}/summary?session=${activeSessionId || 'draft'}`}
            onClick={() => {
              if (typeof window !== 'undefined') {
                const fullState = {
                  results,
                  program,
                  grades,
                  exclusions,
                  customSubjects,
                  selectedOptions,
                  isLETMode,
                  globalOpenElectives,
                  studentName
                };
                const sessionId = activeSessionId || 'draft';
                sessionStorage.setItem(`summary_context_${programCode}_${sessionId}`, JSON.stringify(fullState));
              }
            }}
            className="block active:scale-95 transition-transform"
          >
            <div className="bg-background/80 backdrop-blur-2xl border-2 border-primary/20 rounded-[2rem] py-3 px-6 shadow-2xl flex flex-col items-center gap-1 min-w-[110px] cursor-pointer hover:border-primary/50 transition-colors">
              {currentSemRes && currentSemRes.sgpa > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 mb-0.5">
                  <span className="text-[8px] font-black text-primary uppercase tracking-tighter leading-none whitespace-nowrap">
                    SEM {currentSemRes.number} SGPA: {currentSemRes.sgpa.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] leading-none mb-1">CGPA</span>
                <span className="text-2xl font-black text-foreground tracking-tighter leading-none glare-text">
                  {results.cgpa.toFixed(2)}
                </span>
              </div>
            </div>
          </Link>
        </Tooltip>
      </motion.div>
      <motion.div
        key="action-pills"
        initial={{ opacity: 0, x: 50, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.8 }}
        className="lg:hidden fixed bottom-8 right-3 sm:right-4 z-[90] flex flex-col items-end gap-3"
      >
        <Tooltip content="Semester Transcript" position="left" variant="emerald">
          <button
            onClick={() => expandedSem && downloadAsPDF(expandedSem)}
            disabled={!currentSemRes || currentSemRes.sgpa === 0}
            className="h-12 w-12 rounded-full bg-surface/80 backdrop-blur-xl border border-border/50 shadow-xl flex items-center justify-center text-foreground active:scale-90 transition-all hover:border-emerald-500 disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-5 w-5" />
          </button>
        </Tooltip>
        <Tooltip content={activeSessionId ? "Update History" : "Save Session"} position="left" variant="emerald">
          <button
            onClick={() => setIsSaveModalOpen(true)}
            disabled={isSaving}
            className={cn(
              "h-14 w-14 rounded-full flex items-center justify-center shadow-[0_15px_40px_-10px_rgba(16,185,129,0.5)] transition-all active:scale-90 border border-white/20 cursor-pointer",
              saveStatus === 'success'
                ? "bg-emerald-500 text-black"
                : "bg-emerald-500 text-black"
            )}
          >
            <div className="flex flex-col items-center gap-0.5">
              {activeSessionId ? <History className="h-5 w-5" /> : <Save className="h-5 w-5" />}
              <span className="text-[10px] font-black uppercase tracking-tighter">{activeSessionId ? "Update" : "Save"}</span>
            </div>
          </button>
        </Tooltip>
      </motion.div>
    </AnimatePresence>
  );
};
