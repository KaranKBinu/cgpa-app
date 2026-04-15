import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Trash2, Calculator as CalcIcon, Calendar, ArrowRight, BarChart3, Edit2 } from "lucide-react";
import Link from "next/link";
import { deleteCalculation } from "../actions";
import { auth } from "@/lib/auth";
import { Tooltip } from "@/components/Tooltip";

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
    <div className="min-h-screen pt-12 lg:pt-20 pb-40 px-4 lg:px-8 bg-background font-sans">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16 animate-fade-in px-2">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] border border-emerald-500/20 shadow-xl shadow-emerald-500/5">Archived Records</span>
              <div className="h-px w-24 bg-gradient-to-r from-emerald-500/30 to-transparent" />
            </div>
            <h1 className="text-4xl lg:text-7xl font-black text-foreground tracking-tighter leading-none">Your <span className="gradient-text">Journey</span></h1>
            <p className="text-muted-foreground text-sm lg:text-lg font-medium tracking-tight">System-wide log of your {calculations.length > 9 ? 'extensive' : ''} academic archive.</p>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search by name or code..."
                className="w-full lg:w-64 h-14 bg-card/50 border border-border/50 rounded-2xl px-6 pl-12 font-black text-xs outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
              />
              <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-card/50 border border-border/50 shadow-xl">
              <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-primary border border-emerald-500/20">
                <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
              <div className="pr-4">
                <p className="text-[9px] lg:text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-0.5">Sessions</p>
                <p className="text-xl lg:text-2xl font-black text-foreground leading-none">{calculations.length}</p>
              </div>
            </div>
          </div>
        </div>

        {calculations.length === 0 ? (
          <div className="py-32 text-center bg-card/50 border border-border/50 rounded-[4rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="h-24 w-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-primary border border-emerald-500/10 group-hover:scale-110 transition-transform duration-700">
              <CalcIcon className="h-12 w-12" />
            </div>
            <h3 className="text-3xl font-black text-foreground mb-4">No records found</h3>
            <p className="text-muted-foreground text-lg font-medium max-w-sm mx-auto mb-10">Your academic archive is currently empty. Initialize a new matrix to begin tracking.</p>
            <Link href="/" className="btn-primary h-14 px-10 rounded-[1.5rem] group">
              Start Analysis <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {calculations.map((calc, i) => (
              <div key={calc.id} style={{ animationDelay: `${i * 100}ms` }} className="bg-card/50 border border-border/50 rounded-3xl p-8 lg:p-10 animate-fade-in group">
                <div className="flex flex-col h-full justify-between gap-10">
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">{calc.program?.code}</span>
                        <h3 className="text-2xl font-black text-foreground tracking-tight group-hover:text-primary transition-all duration-300">{calc.label}</h3>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-card/80 flex items-center justify-center text-muted-foreground group-hover:bg-emerald-500/10 group-hover:text-primary transition-all">
                        <CalcIcon className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="px-4 py-2 rounded-xl bg-card/80 border border-border/50 flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                        <Calendar className="h-4 w-4" /> {format(calc.createdAt, 'MMM d, yyyy')}
                      </div>
                      <div className="px-4 py-2 rounded-xl bg-card/80 border border-border/50 flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                        <CalcIcon className="h-4 w-4" /> {calc.semesters.length} Terms
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border/50 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">Aggregate Result</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-foreground tracking-tighter leading-none">{calc.cgpa.toFixed(2)}</span>
                        <span className="text-xl font-bold italic text-primary">CP</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Tooltip content="Delete Record" position="top">
                        <form action={async () => {
                          "use server";
                          await deleteCalculation(calc.id);
                        }}>
                          <button type="submit" className="btn-danger">
                            <Trash2 className="h-6 w-6" />
                          </button>
                        </form>
                      </Tooltip>
                      <Tooltip content="Resume & Edit" position="top" variant="emerald">
                        <Link href={`/calculate/${calc.program?.code}?session=${calc.id}`} className="h-12 w-12 bg-emerald-500 text-black rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
                          <Edit2 size={20} strokeWidth={2.5} />
                        </Link>
                      </Tooltip>
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
