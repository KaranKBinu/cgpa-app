import React from 'react';
import { cn } from '@/lib/utils';
import { History, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Semester, SemResult } from '@/types/calculator';

interface DesktopSidebarProps {
  displayedSemesters: Semester[];
  expandedSem: string | null;
  setExpandedSem: (id: string) => void;
  semResults: SemResult[];
  session: any;
  signOut: any;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  displayedSemesters,
  expandedSem,
  setExpandedSem,
  semResults,
  session,
  signOut
}) => {
  return (
    <aside className="hidden lg:flex w-64 border-r-2 border-border/50 flex-col bg-card/30 sticky top-0 h-screen z-[70]">
      <div className="p-6 border-b-2 border-border/50 flex items-center justify-start gap-3 bg-card/10">
        <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]">G</div>
        <span className="font-black tracking-tighter text-2xl">Poly<span className="text-primary italic">Grade</span></span>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <div className="px-4 py-3 text-[11px] font-black text-muted-foreground uppercase tracking-[0.25em] mb-2 border-b border-border/50">Semesters</div>
        {displayedSemesters.map((sem) => {
          const res = semResults.find(r => r.id === sem.id);
          const isActive = sem.id === expandedSem;
          return (
            <button
              key={sem.id}
              onClick={() => setExpandedSem(sem.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-3xl transition-all group border-2 outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 active:scale-95",
                isActive
                  ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_15px_40px_-10px_rgba(16,185,129,0.5)]"
                  : "bg-card/50 border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("h-2.5 w-2.5 rounded-full transition-all", isActive ? "bg-primary-foreground" : "bg-card/80 group-hover:bg-primary")} />
                <span className="font-black text-sm uppercase tracking-tighter">{(sem as any).displayName}</span>
              </div>
              {res && res.sgpa > 0 && <span className={cn("text-xs font-black px-2 py-0.5 rounded-md", isActive ? "bg-primary-foreground/10 text-primary-foreground" : "bg-primary/10 text-primary")}>{res.sgpa.toFixed(2)}</span>}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border bg-card/50 space-y-2">
        <Link href="/history" className="flex items-center justify-start gap-3 p-3 rounded-xl text-muted-foreground hover:bg-card/50 hover:text-foreground transition-all">
          <History className="h-5 w-5" />
          <span className="font-bold text-sm">History</span>
        </Link>
        {session && (
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center justify-start gap-3 p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-bold text-sm">Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
};
