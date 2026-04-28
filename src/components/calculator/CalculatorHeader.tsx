import React from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FileUp, Download, Loader2, CheckCircle2, Save, Check, RotateCcw, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
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
  resetCalculator: () => void;
  // Full context for summary page
  grades: any;
  exclusions: any;
  customSubjects: any;
  selectedOptions: any;
  globalOpenElectives: any;
  studentName: string;
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
  groupedSemesters,
  resetCalculator,
  grades,
  exclusions,
  customSubjects,
  selectedOptions,
  globalOpenElectives,
  studentName
}) => {
  const saveSummaryContext = () => {
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
      sessionStorage.setItem('summary_context', JSON.stringify(fullState));
    }
  };

  return (
    <header className="sticky top-0 z-[60] bg-background/80 backdrop-blur-3xl border-b border-border/50 py-2 lg:py-5 px-3 sm:px-4 lg:px-12 shadow-sm">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-2 lg:gap-4">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Program Identity & CGPA (Mobile Optimized) */}
          <div className="flex items-center gap-2 lg:gap-4 min-w-0">
            <div className="h-8 w-8 lg:h-12 lg:w-12 rounded-lg lg:rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-black shadow-lg shadow-emerald-500/20 shrink-0 border border-white/20 transition-all duration-500">
              {activeSessionId ? (
                <CheckCircle2 className="h-4 w-4 lg:h-6 lg:w-6" />
              ) : (
                <Save className="h-4 w-4 lg:h-6 lg:w-6" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <Tooltip content={program.name} position="bottom" variant="emerald">
                  <h1 className="text-sm lg:text-xl font-black tracking-tighter text-foreground truncate max-w-[70px] lg:max-w-none uppercase lg:normal-case cursor-help">
                    {program.code}
                  </h1>
                </Tooltip>
                <div className="lg:hidden flex items-center whitespace-nowrap font-black">
                  <div className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="text-[12px] text-primary leading-none">{results.cgpa.toFixed(2)}</span>
                    <div className="w-px h-2 bg-primary/20" />
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 leading-none">{results.totalPercentage.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-1 lg:mt-0.5 group">
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full animate-pulse",
                  activeSessionId ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-primary/40"
                )} />
                <span className="text-[9px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] truncate max-w-[120px] lg:max-w-[200px]">
                  {program.name}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions & Stats */}
          <div className="flex items-center gap-2 lg:gap-3 flex-1 justify-end">
            {/* Desktop CGPA Pill */}
            <Tooltip 
              content="View Detailed Summary" 
              position="bottom" 
              className="hidden lg:inline-flex"
              forceShow={results.cgpa > 0}
            >
              <Link 
                href={`/calculate/${program.code}/summary`}
                onClick={saveSummaryContext}
                className="flex items-center bg-card/60 border border-border/50 rounded-2xl overflow-hidden shadow-lg shadow-black/10 backdrop-blur-md hover:border-primary/50 transition-colors group active:scale-95"
              >
                <div className="flex flex-col items-center justify-center w-[100px] py-2.5 border-r border-border/50 group-hover:bg-primary/5 transition-colors">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">CGPA</span>
                  <span className="text-2xl font-black text-primary tracking-tighter leading-none">{results.cgpa.toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-center justify-center w-[110px] py-2.5 group-hover:bg-primary/5 transition-colors">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">Equiv %</span>
                  <span className="text-2xl font-black text-foreground tracking-tighter leading-none">{results.totalPercentage.toFixed(2)}%</span>
                </div>
              </Link>
            </Tooltip>

            {/* Mobile Actions Block */}
            <div className="lg:hidden flex items-center gap-1 px-1 py-1 rounded-xl bg-card/40 border border-border/40 backdrop-blur-md">
              <Tooltip content="Auto-fill grades" position="bottom" className="w-auto" forceShow={true} variant="emerald">
                <button
                  onClick={onImportClick}
                  disabled={isProcessingPdf}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary transition-all active:scale-90 border border-border/20 cursor-pointer"
                >
                  {isProcessingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                </button>
              </Tooltip>

              <Tooltip content="Reset All" position="bottom" className="w-auto">
                <button
                  onClick={resetCalculator}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary transition-all active:scale-90 border border-border/20 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </Tooltip>

              {session?.user && (session.user.role === 'TEACHER' || session.user.role === 'SUPERUSER') && (
                <Tooltip content="Admin" position="bottom" className="w-auto">
                  <Link
                    href="/admin"
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition-all active:scale-90 border border-border/20 cursor-pointer"
                  >
                    <ShieldAlert className="h-4 w-4" />
                  </Link>
                </Tooltip>
              )}

              <div className="w-[1px] h-4 bg-border/40 mx-0.5" />

              <Tooltip content="Download PDF" position="bottom" className="w-auto">
                <button
                  onClick={downloadAsPDF}
                  disabled={results.cgpa === 0}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted/10 text-foreground transition-all active:scale-90 disabled:opacity-30 border border-border/20 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>

            {/* Desktop & Additional Actions */}
            {/* Mobile LET Toggle Checkbox */}
            <div
              onClick={() => setIsLETMode(!isLETMode)}
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
              <Tooltip content="Reset Marks" variant="emerald">
                <button
                  onClick={resetCalculator}
                  className="h-10 w-10 lg:h-12 lg:w-12 rounded-2xl bg-surface border border-border/50 text-foreground hover:border-primary hover:text-primary transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4 lg:h-5 lg:w-5" />
                </button>
              </Tooltip>

              {session?.user && (session.user.role === 'TEACHER' || session.user.role === 'SUPERUSER') && (
                <Tooltip content="Admin Dashboard" variant="emerald">
                  <Link
                    href="/admin"
                    className="h-10 w-10 lg:h-12 lg:w-12 rounded-2xl bg-surface border border-border/50 text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                  >
                    <ShieldAlert className="h-4 w-4 lg:h-5 lg:w-5" />
                  </Link>
                </Tooltip>
              )}

              <Tooltip content={isLETMode ? "Normal Curriculum" : "Lateral Entry Mode"} variant="emerald">
                <div
                  onClick={() => setIsLETMode(!isLETMode)}
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

              <Tooltip content="Auto-fill from PDF" position="bottom" variant="emerald" forceShow={true}>
                <button
                  onClick={onImportClick}
                  disabled={isProcessingPdf}
                  className="h-10 px-5 rounded-xl bg-surface border border-border/50 text-foreground hover:border-primary transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest active:scale-95 cursor-pointer"
                >
                  {isProcessingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4 text-primary" />}
                  <span>Import PDF</span>
                </button>
              </Tooltip>

              {results.semResults.filter(s => s.sgpa > 0).length > 1 && (
                <Tooltip content="Download Full Report" variant="emerald">
                  <button
                    onClick={downloadAsPDF}
                    className="h-10 w-10 rounded-xl bg-surface border border-border/50 text-foreground hover:border-emerald-500 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                  >
                    <Download className="h-4 w-4 lg:h-5 lg:w-5" />
                  </button>
                </Tooltip>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || results.cgpa === 0}
              className={cn(
                "hidden lg:flex h-12 px-8 rounded-2xl transition-all items-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-95 cursor-pointer",
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
                          "whitespace-nowrap px-5 py-2.5 rounded-xl text-xs lg:text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-90",
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
