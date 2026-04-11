import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Trash2, Calculator as CalcIcon, Calendar, ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";
import { deleteCalculation } from "../actions";
import { auth } from "@/lib/auth";

export default async function HistoryPage() {
  const session = await auth();
  const userId = session?.user ? (session.user as any).id : null;
  const role = session?.user ? (session.user as any).role : "STUDENT";

  let where = {};
  if (role === "STUDENT") {
    where = { userId: userId };
  }

  const calculations = await prisma.calculation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      program: true,
      semesters: true
    }
  });

  return (
    <div className="min-h-screen pt-12 lg:pt-20 pb-40 px-4 lg:px-8 bg-surface-raised font-sans">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 animate-fade-in">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
               <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] border border-emerald-500/20 shadow-xl shadow-emerald-500/5">Archived Records</span>
               <div className="h-px w-24 bg-gradient-to-r from-emerald-500/30 to-transparent" />
            </div>
            <h1 className="text-4xl lg:text-7xl font-black text-white tracking-tighter leading-none">Your <span className="gradient-text">Journey</span></h1>
            <p className="text-muted text-sm lg:text-lg font-medium tracking-tight">System-wide log of your academic computations and milestones.</p>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6 p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] bg-surface border border-standard shadow-2xl w-full lg:w-auto">
             <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-xl lg:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-primary border border-emerald-500/20">
                <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8" />
             </div>
             <div>
                <p className="text-[8px] lg:text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-1">Stored Sessions</p>
                <p className="text-2xl lg:text-3xl font-black text-white leading-none">{calculations.length}</p>
             </div>
          </div>
        </div>

        {calculations.length === 0 ? (
          <div className="py-32 text-center bg-surface border border-standard rounded-[4rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="h-24 w-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-primary border border-emerald-500/10 group-hover:scale-110 transition-transform duration-700">
               <CalcIcon className="h-12 w-12" />
            </div>
            <h3 className="text-3xl font-black text-white mb-4">No records found</h3>
            <p className="text-muted text-lg font-medium max-w-sm mx-auto mb-10">Your academic archive is currently empty. Initialize a new matrix to begin tracking.</p>
            <Link href="/" className="btn-primary h-14 px-10 rounded-[1.5rem] group">
               Start Analysis <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {calculations.map((calc, i) => (
              <div key={calc.id} style={{ animationDelay: `${i * 100}ms` }} className="dashboard-card p-8 lg:p-10 animate-fade-in group">
                <div className="flex flex-col h-full justify-between gap-10">
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                         <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">{calc.program?.code}</span>
                         <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-primary transition-all duration-300">{calc.label}</h3>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-muted group-hover:bg-emerald-500/10 group-hover:text-primary transition-all">
                        <CalcIcon className="h-6 w-6" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <div className="px-4 py-2 rounded-xl bg-white/5 border border-standard flex items-center gap-2 text-[10px] font-bold text-muted">
                          <Calendar className="h-4 w-4" /> {format(calc.createdAt, 'MMM d, yyyy')}
                       </div>
                       <div className="px-4 py-2 rounded-xl bg-white/5 border border-standard flex items-center gap-2 text-[10px] font-bold text-muted">
                          <CalcIcon className="h-4 w-4" /> {calc.semesters.length} Terms
                       </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-standard flex items-end justify-between">
                    <div>
                       <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-2">Aggregate Result</p>
                       <div className="flex items-baseline gap-2">
                          <span className="text-6xl font-black text-white tracking-tighter leading-none">{calc.cgpa.toFixed(2)}</span>
                          <span className="text-xl font-bold italic text-primary">CP</span>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <form action={async () => {
                         "use server";
                         await deleteCalculation(calc.id);
                      }}>
                         <button type="submit" className="btn-danger">
                            <Trash2 className="h-6 w-6" />
                         </button>
                      </form>
                      <Link href={`/calculate/${calc.program?.code}`} className="btn-secondary h-14 w-14 p-0 rounded-2xl">
                         <ArrowRight className="h-6 w-6" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
