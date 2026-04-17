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
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Premium Hero Section */}
      <div className="relative p-12 lg:p-16 rounded-[4rem] bg-gradient-to-br from-card/80 to-background border border-border/50 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/5 blur-[120px] -z-10" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
        
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-12 relative z-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black tracking-[0.4em] uppercase">
              <ShieldCheck className="h-4 w-4" />
              Administrative Command
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-none">
              Control <span className="text-emerald-500">Center.</span>
            </h1>
            <p className="text-muted-foreground font-medium text-lg md:text-xl max-w-2xl leading-relaxed">
              Welcome back, Commander. Oversee academic integrity, manage program structures, and respond to student signals from this central hub.
            </p>
          </div>

          <div className="h-28 w-28 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/10 hover:scale-105 transition-transform duration-500">
             <LayoutDashboard className="h-14 w-14" />
          </div>
        </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Intelligence Signals" 
          value={feedbackCount} 
          subValue="New feedback"
          icon={<MessageSquare className="h-6 w-6" />} 
          color="emerald" 
          isNew={feedbackCount > 0}
        />
        <StatCard 
          label="Active Community" 
          value={userCount} 
          subValue="Registered users"
          icon={<Users className="h-6 w-6" />} 
          color="blue" 
        />
        <StatCard 
          label="Academic Corpus" 
          value={programCount} 
          subValue="Programs listed"
          icon={<BookOpen className="h-6 w-6" />} 
          color="purple" 
        />
        <StatCard 
          label="Total Computations" 
          value={calculationCount} 
          subValue="CGPA calculations"
          icon={<Calculator className="h-6 w-6" />} 
          color="orange" 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Task Dashboard / Quick Links */}
        <div className="xl:col-span-2 space-y-6">
          <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-2">Navigation Matrix</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickLink 
              href="/admin/programs" 
              title="Academic Architect"
              description="Construct and edit program structures and syllabus subjects."
              icon={<GraduationCap className="h-6 w-6" />}
              color="emerald"
            />
            <QuickLink 
              href="/admin/feedback" 
              title="Pulse Monitoring"
              description="Review student feedback, bug reports, and signals."
              icon={<Sparkles className="h-6 w-6" />}
              color="blue"
            />
            <QuickLink 
              href="/admin/users" 
              title="User Authority"
              description="Manage user roles, accounts, and system access."
              icon={<Users className="h-6 w-6" />}
              color="purple"
            />
            <QuickLink 
              href="/admin/settings" 
              title="Core Calibration"
              description="Tune system parameters and global configurations."
              icon={<Settings className="h-6 w-6" />}
              color="orange"
            />
          </div>
        </div>

        {/* Recent Signals Feed */}
        <div className="space-y-6">
           <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-2">Latest Signals</h3>
           <div className="rounded-[3rem] bg-card/40 border border-border/50 p-8 space-y-8 backdrop-blur-xl relative overflow-hidden h-full">
              {latestFeedbacks.length > 0 ? (
                latestFeedbacks.map((f: any, i: number) => (
                  <div key={f.id} className="relative group">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-card border border-border/50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground line-clamp-1">{f.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-80">{f.message}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60 pt-1 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {format(new Date(f.createdAt), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                    {i !== latestFeedbacks.length - 1 && <div className="h-px bg-border/50 mt-8" />}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                  <TrendingUp className="h-12 w-12 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No signals detected</p>
                </div>
              )}
              
              <Link href="/admin/feedback" className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 hover:text-black transition-all group mt-auto">
                 Explore Intelligence <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, icon, color, isNew }: { label: string, value: number, subValue: string, icon: React.ReactNode, color: string, isNew?: boolean }) {
  const colorMap: any = {
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20 shadow-purple-500/5",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-orange-500/5"
  };

  return (
    <div className={cn(
      "p-8 rounded-[2.5rem] bg-card/50 border border-border/50 flex flex-col justify-between h-56 transition-all duration-500 hover:scale-[1.02] hover:border-emerald-500/20 group relative overflow-hidden shadow-2xl",
      isNew && "ring-2 ring-emerald-500/30 border-emerald-500/30"
    )}>
      {isNew && (
        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      )}
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">{label}</p>
        <div className="flex items-end gap-2">
           <p className="text-4xl font-black text-foreground tracking-tighter leading-none">{value}</p>
           <p className="text-[10px] font-bold text-muted-foreground/60 mb-1">{subValue}</p>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ href, title, description, icon, color }: { href: string, title: string, description: string, icon: React.ReactNode, color: string }) {
  const colorMap: any = {
    emerald: "from-emerald-500/10 to-transparent text-emerald-500 border-emerald-500/20",
    blue: "from-blue-500/10 to-transparent text-blue-500 border-blue-500/20",
    purple: "from-purple-500/10 to-transparent text-purple-500 border-purple-500/20",
    orange: "from-orange-500/10 to-transparent text-orange-500 border-orange-500/20"
  };

  return (
    <Link href={href} className="flex items-center gap-6 p-6 rounded-[2rem] bg-card/30 border border-border/50 hover:border-emerald-500/30 transition-all group overflow-hidden relative">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", colorMap[color])} />
      <div className="h-14 w-14 rounded-2xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground group-hover:scale-110 group-hover:text-emerald-500 transition-all shadow-xl relative z-10">
        {icon}
      </div>
      <div className="space-y-1 relative z-10">
        <h4 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
          {title}
          <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </h4>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">{description}</p>
      </div>
    </Link>
  );
}
