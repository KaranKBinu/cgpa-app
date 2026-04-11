import prisma from "@/lib/prisma";
import { Users, BookOpen, Calculator, ShieldCheck } from "lucide-react";

export default async function AdminDashboard() {
  const [userCount, programCount, calculationCount] = await Promise.all([
    prisma.user.count(),
    prisma.program.count(),
    prisma.calculation.count()
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-foreground tracking-tighter">System <span className="text-emerald-500">Overview</span></h1>
          <p className="text-muted-foreground font-medium">Real-time statistics and administrative metrics.</p>
        </div>
        <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
           <ShieldCheck className="h-8 w-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Active Users" 
          value={userCount} 
          icon={<Users className="h-6 w-6" />} 
          color="emerald" 
        />
        <StatCard 
          label="Registered Programs" 
          value={programCount} 
          icon={<BookOpen className="h-6 w-6" />} 
          color="blue" 
        />
        <StatCard 
          label="Total Computations" 
          value={calculationCount} 
          icon={<Calculator className="h-6 w-6" />} 
          color="purple" 
        />
      </div>

      <div className="p-8 rounded-[2.5rem] bg-card/50 border border-border/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <ShieldCheck className="h-32 w-32" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-4">Welcome to the Command Center</h2>
        <p className="text-muted-foreground font-medium leading-relaxed max-w-2xl">
          As an administrator, you have the authority to manage academic structures, oversee student progress, 
          and maintain the integrity of the PolyCGPA ecosystem. Use the sidebar to navigate through specific administrative tasks.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
  const colorMap: any = {
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20"
  };

  return (
    <div className="p-8 rounded-[2rem] bg-card/50 border border-border/50 flex flex-col justify-between h-48 group hover:border-border transition-all">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
        <p className="text-4xl font-black text-foreground">{value}</p>
      </div>
    </div>
  );
}
