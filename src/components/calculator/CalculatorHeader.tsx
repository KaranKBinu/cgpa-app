import React from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FileUp, Download, Loader2, CheckCircle2, Save, Check } from 'lucide-react';
import { Tooltip } from '../Tooltip';
import { Program, CalculatorResults } from '@/types/calculator';

interface CalculatorHeaderProps {
  program: Program;
  isLETMode: boolean;
  setIsLETMode: (mode: boolean) => void;
  results: CalculatorResults;
  isProcessingPdf: boolean;
  isSaving: boolean;
  saveStatus: string;
  activeSessionId: string | null;
  session: any;
  handleSave: () => void;
  downloadAsPDF: () => void;
  onImportClick: () => void;
  displayedSemesters: any[];
  expandedSem: string | null;
  setExpandedSem: (id: string | null) => void;
  groupedSemesters: any[];
}

export const CalculatorHeader: React.FC<CalculatorHeaderProps> = ({
  program,
  isLETMode,
  setIsLETMode,
  results,
  isProcessingPdf,
  isSaving,
  saveStatus,
  activeSessionId,
  session,
  handleSave,
  downloadAsPDF,
  onImportClick,
  displayedSemesters,
  expandedSem,
  setExpandedSem,
  groupedSemesters
}) => {
  return (
    <header className="sticky top-0 z-[60] bg-background/80 backdrop-blur-3xl border-b border-border/50 py-2 lg:py-5 px-3 sm:px-4 lg:px-12 shadow-sm">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-2 lg:gap-4">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Program Identity */}
          <div className="flex items-center gap-2 lg:gap-4 min-w-0">
            <div className="h-8 w-8 lg:h-12 lg:w-12 rounded-lg lg:rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-black shadow-lg shadow-emerald-500/20 shrink-0">
              <LayoutDashboard className="h-4 w-4 lg:h-6 lg:w-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <Tooltip content={program.name} position="bottom" variant="emerald">
                <h1 className="text-[11px] lg:text-xl font-black tracking-tight text-foreground sm:truncate max-w-[120px] sm:max-w-none leading-none cursor-help hover:text-emerald-500 transition-colors">
                  {program.name}
                </h1>
              </Tooltip>
              <span className="text-[8px] lg:text-[10px] font-black text-primary/60 uppercase tracking-widest mt-1">{(activeSessionId ? "Sync Active" : "Local Engine")}</span>
            </div>
          </div>

          {/* Unified CGPA + % pill — visible on all screen sizes */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-card/60 border border-border/50 rounded-2xl overflow-hidden shadow-lg shadow-black/10 backdrop-blur-md">
              {/* CGPA */}
              <div className="flex flex-col items-center px-3 lg:px-8 py-1.5 lg:py-2 border-r border-border/50">
                <span className="text-[7px] lg:text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-0.5 lg:mb-1">CGPA</span>
                <span className="text-sm lg:text-2xl font-black text-primary tracking-tighter leading-none">{results.cgpa.toFixed(2)}</span>
              </div>
              {/* Percentage */}
              <div className="flex flex-col items-center px-3 lg:px-8 py-1.5 lg:py-2">
                <span className="text-[7px] lg:text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-0.5 lg:mb-1">Equiv %</span>
                <span className="text-sm lg:text-2xl font-black text-foreground tracking-tighter leading-none">{results.totalPercentage.toFixed(0)}%</span>
              </div>
            </div>

            {/* Mobile-only action buttons beside the pill */}
            <div className="lg:hidden flex items-center gap-1.5">
              <Tooltip content="Import Transcripts" position="bottom" variant="emerald">
                <button
                  onClick={onImportClick}
                  disabled={isProcessingPdf}
                  className="h-9 w-9 flex items-center justify-center rounded-xl bg-primary text-black shadow-lg shadow-primary/20 active:scale-90 transition-transform"
                >
                  {isProcessingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                </button>
              </Tooltip>

              <Tooltip content="Full Report (PDF)" position="bottom" variant="emerald">
                <button
                  onClick={downloadAsPDF}
                  disabled={results.cgpa === 0}
                  className="h-9 w-9 flex items-center justify-center rounded-xl bg-surface border border-border/50 text-foreground shadow-lg active:scale-90 transition-transform disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="flex items-center gap-2 lg:gap-3 lg:flex-1 justify-end">
            {/* Mobile LET Toggle Checkbox */}
            <div
              onClick={() => {
                const nextMode = !isLETMode;
                setIsLETMode(nextMode);
                if (nextMode && expandedSem) {
                  const sem = (groupedSemesters as any).find((s: any) => s.id === expandedSem);
                  if (sem && sem.number <= 2) {
                    setExpandedSem(groupedSemesters[2]?.id || null);
                  }
                }
              }}
              className={cn(
                "lg:hidden relative flex items-center border rounded-lg px-2.5 py-2.5 transition-all cursor-pointer select-none active:scale-95 shadow-sm",
                isLETMode ? "border-emerald-500 bg-emerald-500/5" : "border-muted-foreground/30 bg-surface/30"
              )}
            >
              <span className={cn(
                "absolute -top-1.5 left-1.5 bg-background px-1 text-[9px] font-black tracking-[0.1em] transition-colors leading-none",
                isLETMode ? "text-emerald-500" : "text-muted-foreground"
              )}>
                LET
              </span>
              <div className={cn(
                "relative h-[12px] w-[24px] rounded-full transition-all duration-300 ease-out flex items-center px-0.5",
                isLETMode ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-muted-foreground/20"
              )}>
                <div className={cn(
                  "h-[8px] w-[8px] rounded-full transition-all duration-300 ease-out shadow-sm",
                  isLETMode ? "translate-x-[12px] bg-black" : "translate-x-0 bg-white"
                )} />
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <Tooltip content={isLETMode ? "Normal Curriculum" : "Lateral Entry Mode"} variant="emerald">
                <div
                  onClick={() => {
                    const nextMode = !isLETMode;
                    setIsLETMode(nextMode);
                    if (nextMode && expandedSem) {
                      const sem = groupedSemesters.find(s => s.id === expandedSem);
                      if (sem && sem.number <= 2) {
                        setExpandedSem(groupedSemesters[2]?.id || null);
                      }
                    }
                  }}
                  className={cn(
                    "relative flex items-center border rounded-xl px-4 py-3 transition-all cursor-pointer select-none active:scale-95 shadow-sm",
                    isLETMode ? "border-emerald-500 bg-emerald-500/5" : "border-muted-foreground/20 bg-card/10"
                  )}
                >
                  <span className={cn(
                    "absolute -top-2 left-2.5 bg-background px-1 text-[8px] font-black tracking-[0.15em] transition-colors leading-none",
                    isLETMode ? "text-emerald-500" : "text-muted-foreground"
                  )}>
                    LET MODE
                  </span>

                  <div className={cn(
                    "relative h-[16px] w-[32px] rounded-full transition-all duration-300 ease-out flex items-center px-0.5",
                    isLETMode ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" : "bg-muted-foreground/20"
                  )}>
                    <div className={cn(
                      "h-[12px] w-[12px] rounded-full transition-all duration-300 ease-out shadow-lg",
                      isLETMode ? "translate-x-[16px] bg-black" : "translate-x-0 bg-muted-foreground/50"
                    )} />
                  </div>
                </div>
              </Tooltip>

              <button
                onClick={onImportClick}
                disabled={isProcessingPdf}
                className="h-10 px-5 rounded-xl bg-surface border border-border/50 text-foreground hover:border-primary transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest active:scale-95"
              >
                {isProcessingPdf ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileUp className="h-3 w-3 text-primary" />}
                <span>Import PDF</span>
              </button>

              {results.semResults.filter(s => s.sgpa > 0).length > 1 && (
                <Tooltip content="Download Full Report" variant="emerald">
                  <button
                    onClick={downloadAsPDF}
                    className="h-10 w-10 rounded-xl bg-surface border border-border/50 text-foreground hover:border-emerald-500 transition-all flex items-center justify-center active:scale-95"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || results.cgpa === 0}
              className={cn(
                "hidden lg:flex h-12 px-8 rounded-2xl transition-all items-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-95",
                saveStatus === 'success'
                  ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                  : "bg-emerald-500 text-black shadow-xl shadow-emerald-500/30"
              )}
            >
              <div className="flex items-center gap-2">
                {activeSessionId ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                <span>{activeSessionId ? "Update History" : "Save Progress"}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Row: Mobile Semester Tab Bar */}
        <div className="lg:hidden w-full border-t border-border/30 pt-3">
          <div className="flex items-end gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
            <div className="flex items-end gap-2 min-w-max px-3 sm:px-4">
              {(() => {
                const groups: any[][] = [];
                displayedSemesters.forEach(sem => {
                  const lastGroup = groups[groups.length - 1];
                  if (lastGroup && lastGroup[0].number === sem.number) {
                    lastGroup.push(sem);
                  } else {
                    groups.push([sem]);
                  }
                });

                return groups.map((group, idx) => {
                  const isShared = group.length > 1;
                  const content = group.map((sem) => {
                    const isActive = sem.id === expandedSem;
                    const res = results.semResults.find(r => r.id === sem.id);
                    return (
                      <button
                        key={sem.id}
                        onClick={() => setExpandedSem(sem.id)}
                        className={cn(
                          "whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-90",
                          isActive
                            ? "bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                            : "bg-surface border-border/50 text-muted-foreground"
                        )}
                      >
                        {sem.displayName} {res && res.sgpa > 0 && <span className="ml-1 opacity-70 font-black">({res.sgpa.toFixed(1)})</span>}
                      </button>
                    );
                  });

                  if (isShared) {
                    return (
                      <div key={`mob-group-${group[0].number}`} className="flex items-center gap-1.5 p-1 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 min-w-max">
                        {content}
                      </div>
                    );
                  }
                  return <React.Fragment key={`mob-single-${group[0].id}`}>{content}</React.Fragment>;
                });
              })()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
