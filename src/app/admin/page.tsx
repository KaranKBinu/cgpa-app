import React from "react";
import prisma from "@/lib/prisma";
import { Users, BookOpen, Calculator, ShieldCheck, MessageSquare, Settings, ArrowRight, GraduationCap, Sparkles, TrendingUp, Clock, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default async function AdminDashboard() {
  const [userCount, programCount, calculationCount, feedbackCount, latestFeedbacks] = await Promise.all([
    prisma.user.count(),
    prisma.program.count(),
    prisma.calculation.count(),
    (prisma as any).feedback.count({ where: { status: 'NEW' } }),
    (prisma as any).feedback.findMany({ take: 3, orderBy: { createdAt: 'desc' } })
  ]);

  return (
    <div className="space-y-6 lg:space-y-12 animate-fade-in pb-20 pt-16 lg:pt-8">
      {/* Premium Hero Section */}
      <div className="relative p-6 md:p-12 lg:p-16 rounded-[2.5rem] lg:rounded-[4rem] bg-gradient-to-br from-card/80 to-background border border-border/50 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/5 blur-[120px] -z-10" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
        
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 lg:gap-12 relative z-10">
          <div className="space-y-3 lg:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] lg:text-[10px] font-black tracking-[0.4em] uppercase">
              <ShieldCheck className="h-3 w-3 lg:h-4 lg:w-4" />
              Administrative Command
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-foreground tracking-tighter leading-tight lg:leading-none">
              Control <span className="text-emerald-500">Center.</span>
            </h1>
            <p className="text-muted-foreground font-medium text-xs lg:text-xl max-w-2xl leading-relaxed opacity-80 lg:opacity-100">
              Welcome back, Commander. Oversee academic integrity and manage structures.
            </p>
          </div>

          <div className="h-16 w-16 md:h-28 md:w-28 rounded-2xl md:rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/10 hover:scale-105 transition-transform duration-500 shrink-0">
             <LayoutDashboard className="h-8 w-8 md:h-14 md:w-14" />
          </div>
        </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          label="Intelligence Signals" 
          value={feedbackCount} 
          subValue="New feedback"
          icon={<MessageSquare className="h-5 w-5 lg:h-6 lg:w-6" />} 
          color="emerald" 
          isNew={feedbackCount > 0}
        />
        <StatCard 
          label="Active Community" 
          value={userCount} 
          subValue="Registered users"
          icon={<Users className="h-5 w-5 lg:h-6 lg:w-6" />} 
          color="blue" 
        />
        <StatCard 
          label="Academic Corpus" 
          value={programCount} 
          subValue="Programs listed"
          icon={<BookOpen className="h-5 w-5 lg:h-6 lg:w-6" />} 
          color="purple" 
        />
        <StatCard 
          label="Total Computations" 
          value={calculationCount} 
          subValue="Calculations"
          icon={<Calculator className="h-5 w-5 lg:h-6 lg:w-6" />} 
          color="orange" 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Navigation Matrix */}
        <div className="xl:col-span-2 space-y-6">
          <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-2">Navigation Matrix</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickLink href="/admin/programs" title="Programs" description="Construct structures." icon={<GraduationCap />} color="emerald" />
            <QuickLink href="/admin/feedback" title="Pulse" description="Review signals." icon={<Sparkles />} color="blue" />
            <QuickLink href="/admin/users" title="Users" description="Role management." icon={<Users />} color="purple" />
            <QuickLink href="/admin/settings" title="Settings" description="Calibration." icon={<Settings />} color="orange" />
          </div>
        </div>

        {/* Signals Feed */}
        <div className="space-y-6">
           <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-2">Latest Signals</h3>
           <div className="rounded-[2.5rem] lg:rounded-[3rem] bg-card/40 border border-border/50 p-6 lg:p-8 space-y-6 lg:space-y-8 backdrop-blur-xl relative overflow-hidden flex flex-col h-full">
              {latestFeedbacks.length > 0 ? (
                latestFeedbacks.map((f: any, i: number) => (
                  <div key={f.id} className="relative group">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-card border border-border/50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shrink-0">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{f.name}</p>
                        <p className="text-[10px] leading-relaxed opacity-60 line-clamp-2">{f.message}</p>
                      </div>
                    </div>
                    {i !== latestFeedbacks.length - 1 && <div className="h-px bg-border/50 mt-4 lg:mt-6" />}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-center opacity-30 py-10">
                  <TrendingUp className="h-8 w-8 mb-4" />
                  <p className="text-[8px] font-black uppercase tracking-widest">No signals</p>
                </div>
              )}
              <Link href="/admin/feedback" className="mt-auto flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all">
                 Review All <ArrowRight className="h-3 w-3" />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, icon, color, isNew }: { label: string, value: number, subValue: string, icon: React.ReactNode, color: string, isNew?: boolean }) {
  const colorMap: any = {
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20"
  };

  return (
    <div className={cn(
      "relative p-5 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] bg-card/50 border border-border/50 flex sm:flex-col items-center sm:items-start justify-between sm:justify-between sm:h-56 transition-all duration-500 group overflow-hidden shadow-2xl overflow-hidden",
      isNew && "ring-2 ring-emerald-500/30"
    )}>
      {/* Horizontal on mobile, vertical on desktop */}
      <div className={`h-12 w-12 lg:h-14 lg:w-14 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>

      <div className="flex-1 ml-4 sm:ml-0 sm:mt-0 text-left">
        <p className="text-[7px] lg:text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 lg:mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
           <p className="text-2xl lg:text-4xl font-black text-foreground tracking-tighter leading-none">{value}</p>
           <p className="text-[8px] lg:text-[10px] font-bold text-muted-foreground/40">{subValue}</p>
        </div>
      </div>

      {isNew && <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:block" />}
      
      {/* Mobile-only background hint */}
      <div className={cn("absolute inset-0 opacity-[0.03] sm:hidden", colorMap[color].split(' ')[1])} />
    </div>
  );
}

function QuickLink({ href, title, description, icon, color }: { href: string, title: string, description: string, icon: React.ReactNode, color: string }) {
  const colorMap: any = {
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20"
  };

  return (
    <Link href={href} className="flex items-center gap-4 p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] bg-card/30 border border-border/50 hover:border-emerald-500/30 transition-all group overflow-hidden relative">
      <div className={cn("h-10 w-10 lg:h-14 lg:w-14 rounded-xl lg:rounded-2xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-emerald-500 transition-all shadow-xl shrink-0")}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { 
          className: cn((icon.props as any)?.className, "h-5 w-5 lg:h-6 lg:w-6") 
        }) : icon}
      </div>
      <div className="min-w-0">
        <h4 className="text-[10px] lg:text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
          {title}
          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </h4>
        <p className="text-[9px] lg:text-xs text-muted-foreground font-medium truncate lg:whitespace-normal">{description}</p>
      </div>
      <div className={cn("absolute inset-0 opacity-[0.02] sm:hidden", colorMap[color].split(' ')[1])} />
    </Link>
  );
}
