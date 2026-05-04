import React from 'react';
import { cn } from '@/lib/utils';
import { History, LogOut, ShieldAlert, Sparkles, Loader2, Download } from 'lucide-react';

import { Tooltip } from '../Tooltip';
import Link from 'next/link';
import { Semester, SemResult } from '@/types/calculator';


interface DesktopSidebarProps {
  displayedSemesters: Semester[];
  expandedSem: string | null;
  setExpandedSem: (id: string) => void;
  semResults: SemResult[];
  session: any;
  signOut: any;
  programCode: string;
  programName: string;
  downloadAsPDF: (id: string) => void;
}


export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  displayedSemesters,
  expandedSem,
  setExpandedSem,
  semResults,
  session,
  signOut,
  programCode,
  programName,
  downloadAsPDF
}) => {

  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  
  return (
    <aside className="hidden lg:flex w-64 border-r-2 border-border/50 flex-col bg-card/30 sticky top-0 h-screen z-[70]">
      <div className="p-6 border-b-2 border-border/50 flex items-center justify-start gap-3 bg-card/10">
        <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]">
          <Sparkles className="h-4 w-4 fill-current" />
        </div>
        <span className="font-black tracking-tighter text-2xl">Poly<span className="text-primary italic">Grade</span></span>
      </div>

      <div className="px-8 pt-5 pb-3 border-b border-border/50 bg-card/30 z-10">
        <Tooltip content={programName} position="bottom" className="w-auto">
          <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.25em] cursor-help">
            Semesters - {programCode}
          </span>
        </Tooltip>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {(() => {
          const groups: Semester[][] = [];
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
              const res = semResults.find(r => r.id === sem.id);
              const isActive = sem.id === expandedSem;
              return (
                <div
                  key={sem.id}
                  onClick={() => setExpandedSem(sem.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedSem(sem.id);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-3xl transition-all group border-2 outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 active:scale-95 cursor-pointer",
                    isActive
                      ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_15px_40px_-10px_rgba(16,185,129,0.5)]"
                      : "bg-card/50 border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("h-2.5 w-2.5 rounded-full transition-all", isActive ? "bg-primary-foreground" : "bg-card/80 group-hover:bg-primary")} />
                    <span className="font-black text-sm uppercase tracking-tighter">{(sem as any).displayName}</span>
                  </div>
                  {res && res.sgpa > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadAsPDF(sem.id);
                        }}
                        className={cn(
                          "h-6 w-6 rounded-md flex items-center justify-center transition-all hover:bg-white/20 active:scale-90",
                          isActive ? "text-primary-foreground/60 hover:text-primary-foreground" : "text-primary/60 hover:text-primary"
                        )}
                      >
                        <Download className="h-3 w-3" />
                      </button>
                      <span className={cn("text-xs font-black px-2 py-0.5 rounded-md", isActive ? "bg-primary-foreground/10 text-primary-foreground" : "bg-primary/10 text-primary")}>
                        {res.sgpa.toFixed(2)}
                      </span>
                    </div>
                  )}

                </div>
              );
            });

            if (isShared) {
              return (
                <div key={`group-${group[0].number}`} className="p-3 rounded-[2rem] border-2 border-emerald-500/30 bg-emerald-500/10 space-y-3 relative shadow-sm ring-1 ring-emerald-500/5">
                  <div className="absolute -top-3 left-6 px-3 bg-background border-2 border-emerald-500/30 text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] rounded-full shadow-sm">Pathway Selection</div>
                  {content}
                </div>
              );
            }
            return <React.Fragment key={group[0].id}>{content}</React.Fragment>;
          });
        })()}

        <div className="pt-4 border-t border-border/50 space-y-2 mt-4">
          {session?.user && (session.user.role === 'TEACHER' || session.user.role === 'SUPERUSER') && (
            <Link href="/admin" className="flex items-center justify-start gap-3 p-3 rounded-xl text-emerald-500 hover:bg-emerald-500/10 transition-all">
              <ShieldAlert className="h-5 w-5" />
              <span className="font-bold text-sm">Admin Panel</span>
            </Link>
          )}
          {session && (
            <Link href="/history" className="flex items-center justify-start gap-3 p-3 rounded-xl text-muted-foreground hover:bg-card/50 hover:text-foreground transition-all">
              <History className="h-5 w-5" />
              <span className="font-bold text-sm">History</span>
            </Link>
          )}
          {session && (
            <button
              onClick={async () => {
                setIsLoggingOut(true);
                await signOut({ callbackUrl: '/' });
              }}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-start gap-3 p-3 rounded-xl text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all disabled:opacity-70"
            >
              {isLoggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
              <span className="font-bold text-sm">Logout</span>
            </button>
          )}
        </div>
      </nav>
    </aside>

  );
};
