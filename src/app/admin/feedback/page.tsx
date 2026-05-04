import { getFeedbacks, updateFeedbackStatus } from "@/app/actions";
import { MessageSquare, Calendar, User, Mail, Tag, Archive, CheckCircle, Clock, Inbox, Filter, Sparkles, Search, Trash2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import FeedbackSearch from "@/components/admin/FeedbackSearch";

export default async function FeedbackManagement({ searchParams }: { searchParams: Promise<{ status?: string, q?: string }> }) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (userRole !== "SUPERUSER" && userRole !== "TEACHER") {
    redirect("/admin");
  }

  const resolvedSearchParams = await searchParams;
  const allFeedbacks = await getFeedbacks();
  const currentStatus = resolvedSearchParams.status || 'NEW';
  const searchQuery = (resolvedSearchParams.q || '').toLowerCase();
  
  const filteredFeedbacks = allFeedbacks.filter((f: any) => {
    const matchesStatus = currentStatus === 'ALL' || f.status === currentStatus;
    const matchesSearch = !searchQuery || 
                         f.name.toLowerCase().includes(searchQuery) || 
                         f.message.toLowerCase().includes(searchQuery) ||
                         f.email.toLowerCase().includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: allFeedbacks.length,
    new: allFeedbacks.filter((f: any) => f.status === 'NEW').length,
    read: allFeedbacks.filter((f: any) => f.status === 'READ').length,
    archived: allFeedbacks.filter((f: any) => f.status === 'ARCHIVED').length,
  };

  return (
    <div className="min-h-screen pb-20 space-y-8 lg:space-y-12 animate-fade-in pt-16 lg:pt-8">
      {/* Premium Header */}
      <div className="relative p-6 md:p-12 lg:p-16 rounded-[2.5rem] lg:rounded-[4rem] bg-gradient-to-br from-card/80 to-background border border-border/50 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/5 blur-[120px] -z-10" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
        
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 lg:gap-12 relative z-10">
          <div className="space-y-4 lg:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 lg:px-4 lg:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] lg:text-[10px] font-black tracking-[0.4em] uppercase">
              <Sparkles className="h-3 w-3 lg:h-4 lg:w-4" />
              Intelligence Center
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-foreground tracking-tighter leading-tight lg:leading-none">
              Student <span className="text-emerald-500">Pulse.</span>
            </h1>
            <p className="text-muted-foreground font-medium text-sm md:text-lg lg:text-xl max-w-2xl leading-relaxed">
              Real-time insights from the field. Track signals with administrative precision.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-4 w-full xl:w-auto">
            <StatCard label="Total Signals" value={stats.total} icon={<MessageSquare className="h-4 w-4" />} color="emerald" />
            <StatCard label="Action Req" value={stats.new} icon={<Inbox className="h-4 w-4" />} color="blue" isNew />
            <StatCard label="Resolved" value={stats.read} icon={<CheckCircle className="h-4 w-4" />} color="emerald" />
            <StatCard label="Archive" value={stats.archived} icon={<Archive className="h-4 w-4" />} color="muted" />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-6 justify-between bg-card/30 backdrop-blur-xl p-3 lg:p-4 rounded-[1.5rem] lg:rounded-[2.5rem] border border-border/30">
        <div className="flex items-center gap-2 bg-background/50 p-2 rounded-xl lg:rounded-2xl border border-border/50 overflow-x-auto no-scrollbar scroll-smooth">
          <FilterTab active={currentStatus === 'NEW'} label="Unread" count={stats.new} href="?status=NEW" />
          <FilterTab active={currentStatus === 'READ'} label="Processed" count={stats.read} href="?status=READ" />
          <FilterTab active={currentStatus === 'ARCHIVED'} label="Archive" count={stats.archived} href="?status=ARCHIVED" />
          <div className="w-px h-6 bg-border mx-1 shrink-0" />
          <FilterTab active={currentStatus === 'ALL'} label="All" href="?status=ALL" />
        </div>

        <FeedbackSearch />
      </div>

      {/* Feed List */}
      <div className="grid grid-cols-1 gap-6 md:gap-8">
        {filteredFeedbacks.map((item: any) => (
          <FeedbackCard key={item.id} item={item} />
        ))}

        {filteredFeedbacks.length === 0 && (
          <div className="py-20 lg:py-40 text-center rounded-[2.5rem] lg:rounded-[4rem] border-2 border-dashed border-border/50 bg-card/10 px-6">
            <div className="h-16 w-16 lg:h-24 lg:w-24 bg-card border border-border/50 rounded-2xl lg:rounded-[2rem] flex items-center justify-center mx-auto mb-6 lg:mb-8 text-muted-foreground/20 shadow-2xl">
              <Inbox className="h-8 w-8 lg:h-12 lg:w-12" />
            </div>
            <h3 className="text-xl lg:text-3xl font-black text-foreground mb-3 tracking-tighter italic">Signal Interrupted.</h3>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] lg:text-xs opacity-60">No communications found for current sectors.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, isNew }: { label: string, value: number, icon: any, color: string, isNew?: boolean }) {
  return (
    <div className={cn(
      "p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-border/50 backdrop-blur-xl transition-all hover:scale-105 shrink-0",
      isNew ? "bg-emerald-500 text-black shadow-2xl shadow-emerald-500/20 font-black" : "bg-background/40"
    )}>
      <div className="flex items-center justify-between mb-2 lg:mb-4">
        <div className={cn("p-1.5 lg:p-2 rounded-lg lg:rounded-xl", isNew ? "bg-black/10" : "bg-card border border-border/50 text-emerald-500")}>
          {icon}
        </div>
        {isNew && <div className="h-2 w-2 rounded-full bg-black animate-ping" />}
      </div>
      <p className={cn("text-[7px] lg:text-[9px] font-black uppercase tracking-widest leading-none mb-1", isNew ? "text-black/60" : "text-muted-foreground")}>{label}</p>
      <p className="text-xl lg:text-2xl font-black tracking-tighter">{value}</p>
    </div>
  );
}

function FilterTab({ active, label, count, href }: { active: boolean, label: string, count?: number, href: string }) {
  return (
    <a 
      href={href}
      className={cn(
        "flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg lg:rounded-xl transition-all font-black text-[8px] lg:text-[10px] uppercase tracking-widest whitespace-nowrap",
        active 
          ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/10" 
          : "text-muted-foreground hover:text-foreground hover:bg-card"
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn(
          "px-1.5 py-0.5 rounded-md text-[7px] lg:text-[8px] font-black",
          active ? "bg-black/10 text-black" : "bg-card border border-border text-muted-foreground"
        )}>
          {count}
        </span>
      )}
    </a>
  );
}

function FeedbackCard({ item }: { item: any }) {
  return (
    <div className={cn(
      "group relative p-6 lg:p-12 rounded-[2.5rem] lg:rounded-[3.5rem] border border-border/50 bg-card/30 backdrop-blur-2xl transition-all duration-700 hover:border-emerald-500/40",
      item.status === 'ARCHIVED' && "opacity-50 grayscale scale-[0.98]"
    )}>
      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/[0.03] blur-[120px] rounded-full -z-10 group-hover:bg-emerald-500/[0.07] transition-all" />
      
      <div className="flex flex-col lg:flex-row lg:gap-16">
        {/* Profile Card Fragment */}
        <div className="lg:w-80 space-y-6 lg:space-y-8 mb-6 lg:mb-0">
           <div className="space-y-4 lg:space-y-6">
              <div className="flex items-center gap-4 lg:gap-5">
                 <div className="h-14 w-14 lg:h-16 lg:w-16 rounded-[1.2rem] lg:rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-black font-black text-xl lg:text-2xl shadow-xl shadow-emerald-500/20 group-hover:rotate-6 transition-transform shrink-0">
                    {item.name[0]}
                 </div>
                 <div className="min-w-0">
                    <h3 className="text-lg font-black text-foreground tracking-tight group-hover:text-emerald-500 transition-colors uppercase truncate">{item.name}</h3>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                       <Tag className="h-3 w-3 lg:h-3.5 lg:w-3.5 shrink-0" />
                       <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest truncate">{item.subject}</span>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-2 pl-1">
                 <div className="flex items-center gap-3 text-muted-foreground hover:text-emerald-500 transition-colors">
                    <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-xl bg-background border border-border/50 flex items-center justify-center shadow-inner shrink-0 leading-none">
                      <Mail className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    </div>
                    <a href={`mailto:${item.email}`} className="text-[10px] lg:text-xs font-bold truncate">{item.email}</a>
                 </div>
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-xl bg-background border border-border/50 flex items-center justify-center shadow-inner shrink-0 leading-none">
                      <Clock className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    </div>
                    <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest">
                       {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                    </span>
                 </div>
              </div>
           </div>
        </div>

        {/* Message Content & Actions */}
        <div className="flex-1 space-y-6 lg:space-y-10 relative lg:pl-4 transition-all">
           <div className="hidden lg:block absolute -left-8 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/40 via-border/50 to-transparent" />
           
           <div className="relative">
              <div className="absolute -top-4 -left-2 text-4xl lg:text-6xl text-emerald-500/10 font-black italic select-none font-serif">&ldquo;</div>
              <div className="p-6 lg:p-10 rounded-[1.5rem] lg:rounded-[2.5rem] bg-background/50 border border-border/50 shadow-inner group-hover:bg-background/80 transition-all">
                <p className="text-foreground font-medium text-sm lg:text-xl leading-relaxed lg:leading-[1.8] whitespace-pre-wrap italic opacity-90 group-hover:opacity-100 transition-opacity">
                   {item.message}
                </p>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 lg:gap-6 pt-2 lg:pt-6">
              <div className="flex items-center gap-4 lg:gap-6">
                 <div className={cn(
                   "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all",
                   item.status === 'NEW' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-card border-border text-muted-foreground"
                 )}>
                   <div className={cn("h-1.5 w-1.5 rounded-full", item.status === 'NEW' ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30")} />
                   <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest">{item.status}</span>
                 </div>
                 <div className="text-[8px] lg:text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] hidden sm:block">
                    SECURE_ID: {item.id.slice(0, 8).toUpperCase()}
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 {item.status !== 'READ' && (
                    <form className="flex-1 sm:flex-none" action={async () => { "use server"; await updateFeedbackStatus(item.id, "READ"); }}>
                       <button type="submit" className="w-full h-12 lg:h-14 px-6 lg:px-8 rounded-xl lg:rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-widest text-[9px] lg:text-[11px] flex items-center justify-center lg:justify-start gap-2 lg:gap-3 hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-emerald-500/30 group/btn">
                          <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 group-hover/btn:rotate-12 transition-transform" />
                          Resolve Signal
                       </button>
                    </form>
                 )}
                 <form className="contents" action={async () => {
                    "use server";
                    const nextStatus = item.status === 'ARCHIVED' ? 'READ' : 'ARCHIVED';
                    await updateFeedbackStatus(item.id, nextStatus);
                 }}>
                    <button type="submit" title={item.status === 'ARCHIVED' ? "Unarchive" : "Archive"} className={cn(
                       "h-12 w-12 lg:h-14 lg:w-14 rounded-xl lg:rounded-2xl flex items-center justify-center border transition-all active:scale-95 shrink-0",
                       item.status === 'ARCHIVED' 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-inner" 
                          : "bg-card border-border/50 text-muted-foreground hover:text-foreground hover:bg-card/80"
                    )}>
                       <Archive className="h-5 w-5 lg:h-6 lg:w-6" />
                    </button>
                 </form>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
