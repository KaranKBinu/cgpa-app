import React from 'react';
import { cn } from '@/lib/utils';
import { Settings, CheckCircle2 } from 'lucide-react';
import { Tooltip } from '../Tooltip';
import { Semester, SemResult } from '@/types/calculator';

interface SemesterHUDProps {
  currentSem: Semester | undefined;
  expandedSem: string | null;
  manualSgpas: Record<string, { sgpa: number; credits: number } | null>;
  setManualSgpas: React.Dispatch<React.SetStateAction<Record<string, { sgpa: number; credits: number } | null>>>;
  currentSemRes: SemResult | undefined;
}

export const SemesterHUD: React.FC<SemesterHUDProps> = ({
  currentSem,
  expandedSem,
  manualSgpas,
  setManualSgpas,
  currentSemRes
}) => {
  return (
    <div className="flex items-center justify-between gap-4 pb-6 lg:pb-12 border-b-2 border-border/50 relative">
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="h-10 lg:h-12 w-1.5 bg-primary rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
        <div className="space-y-0.5 lg:space-y-1">
          <span className="text-xl lg:text-4xl font-black tracking-tighter text-foreground uppercase">{currentSem?.name}</span>
          <p className="text-[8px] lg:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Academic Core</p>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-8">
        {/* Manual Entry Toggle (Justified Right) */}
        <Tooltip content={manualSgpas[expandedSem!] ? "Switch to Interactive Grid" : "Set results manually"} position="left">
            <button 
              onClick={() => {
                if (manualSgpas[expandedSem!]) {
                  setManualSgpas(prev => {
                    const next = { ...prev };
                    delete next[expandedSem!];
                    return next;
                  });
                } else {
                  setManualSgpas(prev => ({ ...prev, [expandedSem!]: { sgpa: 0, credits: 0 } }));
                }
              }}
              className={cn(
                "h-10 w-10 lg:h-12 lg:w-12 rounded-2xl flex items-center justify-center transition-all border-2",
                manualSgpas[expandedSem!] 
                  ? "bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-105" 
                  : "bg-surface border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {manualSgpas[expandedSem!] ? <CheckCircle2 className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
            </button>
        </Tooltip>

        {currentSemRes && (
          <div className="flex items-center bg-card/50 border-2 border-primary/20 rounded-2xl lg:rounded-3xl p-1 lg:p-2 lg:pr-6 gap-2 lg:gap-6 lg:shadow-[0_20px_40px_rgba(16,185,129,0.1)] lg:backdrop-blur-xl group hover:border-primary/40 transition-all duration-500">
            {currentSemRes.sgpa > 0 ? (
              <div className="flex items-center gap-2 lg:gap-4 p-2 lg:p-4 rounded-xl lg:rounded-2xl bg-primary/10 border border-primary/20">
                <div className="text-left">
                  <p className="text-[6px] lg:text-[9px] font-black text-primary uppercase tracking-widest mb-0.5">SGPA</p>
                  <p className="text-base lg:text-3xl font-black text-foreground tracking-tighter leading-none">{currentSemRes.sgpa.toFixed(2)}</p>
                </div>
                <div className="h-4 lg:h-8 w-px bg-primary/20" />
                <div className="text-right">
                  <p className="text-[6px] lg:text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 whitespace-nowrap">%</p>
                  <p className="text-base lg:text-3xl font-black text-foreground tracking-tighter leading-none">{currentSemRes.percentage.toFixed(0)}</p>
                </div>
              </div>
            ) : (
              <div className="hidden sm:block px-3 lg:px-6 py-2 lg:py-4 text-[7px] lg:text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest animate-pulse">Waiting</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
