import prisma from "@/lib/prisma";
import { User as UserIcon, Shield, Mail, Calendar, ShieldAlert, Search, Filter, MoreHorizontal, UserPlus, Fingerprint, Star, ArrowRight, ShieldCheck } from "lucide-react";
import { Role } from "@prisma/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import UserRoleAction from "@/components/admin/UserRoleAction";

export default async function UserManagement({ searchParams }: { searchParams: Promise<{ q?: string, role?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const q = (resolvedSearchParams.q || "").toLowerCase();
  const roleFilter = resolvedSearchParams.role || "ALL";

  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = !q || 
                         (u.name || "").toLowerCase().includes(q) || 
                         (u.email || "").toLowerCase().includes(q);
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: allUsers.length,
    students: allUsers.filter(u => u.role === 'STUDENT').length,
    teachers: allUsers.filter(u => u.role === 'TEACHER').length,
    admins: allUsers.filter(u => u.role === 'SUPERUSER').length,
  };

  return (
    <div className="space-y-8 lg:space-y-12 animate-fade-in pb-20 pt-16 lg:pt-8">
      {/* Premium Header */}
      <div className="relative p-6 md:p-12 lg:p-16 rounded-[2.5rem] lg:rounded-[4rem] bg-gradient-to-br from-card/80 to-background border border-border/50 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/5 blur-[120px] -z-10" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
        
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 lg:gap-12 relative z-10">
          <div className="space-y-4 lg:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] lg:text-[10px] font-black tracking-[0.4em] uppercase">
              <Shield className="h-4 w-4" />
              Identity Infrastructure
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-foreground tracking-tighter leading-tight lg:leading-none">
              User <span className="text-emerald-500">Registry.</span>
            </h1>
            <p className="text-muted-foreground font-medium text-sm md:text-lg lg:text-xl max-w-2xl leading-relaxed">
              Maintain the community ecosystem. Manage roles, audit access levels, and ensure authority.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:gap-4 w-full xl:w-auto">
            <QuickStat label="Total Entities" value={stats.total} icon={<UserIcon className="h-4 w-4" />} />
            <QuickStat label="Superusers" value={stats.admins} icon={<Star className="h-4 w-4" />} color="amber" />
            <QuickStat label="Instructors" value={stats.teachers} icon={<ShieldCheck className="h-4 w-4" />} color="purple" />
            <QuickStat label="Students" value={stats.students} icon={<UserPlus className="h-4 w-4" />} color="blue" />
          </div>
        </div>
      </div>

      {/* Advanced Control Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-6 justify-between bg-card/30 backdrop-blur-xl p-3 lg:p-4 rounded-[1.5rem] lg:rounded-[2.5rem] border border-border/30">
        <div className="flex items-center gap-2 bg-background/50 p-1.5 lg:p-2 rounded-xl lg:rounded-2xl border border-border/50 overflow-x-auto no-scrollbar scroll-smooth">
          <FilterLink active={roleFilter === 'ALL'} label="All Personnel" href="?role=ALL" />
          <FilterLink active={roleFilter === 'STUDENT'} label="Students" href="?role=STUDENT" />
          <FilterLink active={roleFilter === 'TEACHER'} label="Teachers" href="?role=TEACHER" />
          <FilterLink active={roleFilter === 'SUPERUSER'} label="Superusers" href="?role=SUPERUSER" />
        </div>

        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
          <form action="" method="get" className="contents">
            <input type="hidden" name="role" value={roleFilter} />
            <input 
              type="text" 
              name="q"
              placeholder="Search registry..."
              defaultValue={resolvedSearchParams.q}
              className="w-full h-12 lg:h-14 pl-12 pr-4 bg-background/50 border border-border/50 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-muted-foreground/30"
            />
          </form>
        </div>
      </div>

      {/* Intelligence Directory (User List) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
        
        {filteredUsers.length === 0 && (
          <div className="col-span-full py-20 lg:py-40 text-center rounded-[2rem] lg:rounded-[4rem] border-2 border-dashed border-border/50 bg-card/10">
            <Fingerprint className="h-12 w-12 lg:h-20 lg:w-20 mx-auto text-muted-foreground/20 mb-6" />
            <h3 className="text-xl lg:text-2xl font-black text-foreground mb-2">No Matching Entities.</h3>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-[8px] lg:text-[10px]">No identities found in this sector.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function UserCard({ user }: { user: any }) {
  return (
    <div className="group relative p-6 lg:p-8 rounded-[2rem] lg:rounded-[3rem] bg-card/30 border border-border/50 backdrop-blur-2xl transition-all duration-500 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 flex flex-col h-full overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] -z-10 group-hover:bg-emerald-500/10 transition-colors" />
      
      {/* Identity Header */}
      <div className="flex items-start justify-between mb-6 lg:mb-8">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-xl lg:rounded-2xl bg-gradient-to-br from-background to-card border border-border/50 flex items-center justify-center text-emerald-500 shadow-xl group-hover:scale-105 transition-transform duration-500 shrink-0">
             <UserIcon className="h-5 w-5 lg:h-7 lg:w-7" />
          </div>
          <div>
            <h4 className="text-sm lg:text-lg font-black text-foreground tracking-tight group-hover:text-emerald-500 transition-colors line-clamp-1">{user.name || "Anonymous User"}</h4>
            <div className="flex items-center gap-1.5 text-muted-foreground">
               <Mail className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
               <span className="text-[8px] lg:text-[10px] font-bold truncate max-w-[120px] lg:max-w-[140px]">{user.email}</span>
            </div>
          </div>
        </div>
        <RoleBadge role={user.role} />
      </div>

      <div className="flex-1 space-y-4 lg:space-y-6">
         <div className="flex items-center justify-between text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 border-b border-border/30 pb-3 lg:pb-4">
            <span>Access Tier</span>
            <span>ID: {user.id.slice(-6).toUpperCase()}</span>
         </div>

         {/* Access Control Action */}
         <div className="space-y-3 lg:space-y-4">
            <div className="grid grid-cols-1 gap-2 lg:gap-3">
               <label className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1 opacity-50">Modify Authorization</label>
               <UserRoleAction userId={user.id} currentRole={user.role} />
            </div>
         </div>
      </div>

      <div className="mt-6 lg:mt-8 flex items-center gap-2 text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
         <Calendar className="h-3 w-3" />
         Enrolled: {format(new Date(user.createdAt), 'MMM yyyy')}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: any = {
    STUDENT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    TEACHER: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    SUPERUSER: "bg-amber-500/10 text-amber-500 border-amber-500/20 ring-4 ring-amber-500/5"
  };

  return (
    <span className={cn(
      "px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg lg:rounded-xl text-[7px] lg:text-[8px] font-black uppercase tracking-[0.2em] border",
      styles[role] || styles.STUDENT
    )}>
      {role === 'SUPERUSER' ? 'Admin' : role.toLowerCase()}
    </span>
  );
}

function QuickStat({ label, value, icon, color }: { label: string, value: number, icon: any, color?: string }) {
  const colors: any = {
    emerald: "text-emerald-500 bg-emerald-500/10",
    amber: "text-amber-500 bg-amber-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    blue: "text-blue-500 bg-blue-500/10"
  };
  
  return (
    <div className="p-3 lg:p-4 rounded-2xl lg:rounded-3xl bg-background/40 border border-border/50 backdrop-blur-xl flex items-center gap-3 lg:gap-4 shrink-0">
      <div className={cn("h-8 w-8 lg:h-10 lg:w-10 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0", colors[color || 'emerald'])}>
        {icon}
      </div>
      <div>
        <p className="text-[7px] lg:text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">{label}</p>
        <p className="text-lg lg:text-xl font-black text-foreground">{value}</p>
      </div>
    </div>
  );
}

function FilterLink({ active, label, href }: { active: boolean, label: string, href: string }) {
  return (
    <a 
      href={href}
      className={cn(
        "px-4 py-2 lg:px-6 lg:py-2.5 rounded-lg lg:rounded-xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
        active 
          ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/10" 
          : "text-muted-foreground hover:text-foreground hover:bg-card/50"
      )}
    >
      {label}
    </a>
  );
}
