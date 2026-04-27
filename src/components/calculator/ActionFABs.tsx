import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, History, Save, X } from 'lucide-react';
import { Tooltip } from '../Tooltip';
import { cn } from '@/lib/utils';
import { SemResult } from '@/types/calculator';

interface ActionFABsProps {
  results: any;
  currentSemRes: SemResult | undefined;
  expandedSem: string | null;
  downloadAsPDF: (id: string) => void;
  activeSessionId: string | null;
  setIsSaveModalOpen: (open: boolean) => void;
  isSaving: boolean;
  saveStatus: string;
}

export const ActionFABs: React.FC<ActionFABsProps> = ({
  results,
  currentSemRes,
  expandedSem,
  downloadAsPDF,
  activeSessionId,
  setIsSaveModalOpen,
  isSaving,
  saveStatus
}) => {
  return (
    <AnimatePresence>
      <motion.div
        key="sgpa-pill"
        initial={{ opacity: 0, x: -50, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -50, scale: 0.8 }}
        className="lg:hidden fixed bottom-8 left-3 sm:left-4 z-[90]"
      >
        <div className="bg-background/80 backdrop-blur-2xl border-2 border-primary/20 rounded-full py-2 px-6 shadow-2xl flex flex-col items-center gap-0.5 min-w-[100px]">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">SGPA</span>
          <span className="text-xl font-black text-foreground tracking-tighter leading-none">
            {currentSemRes ? currentSemRes.sgpa.toFixed(2) : "0.00"}
          </span>
        </div>
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
