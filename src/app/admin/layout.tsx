import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, BookOpen, Settings, LayoutDashboard } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user as any;

  if (!user || (user.role !== "TEACHER" && user.role !== "SUPERUSER")) {
    redirect("/");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 space-y-2">
          <div className="p-6 rounded-3xl bg-card/50 border border-border/50 mb-6">
            <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4">Admin Control</h2>
            <nav className="space-y-1">
              <AdminNavLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
              <AdminNavLink href="/admin/programs" icon={<BookOpen className="h-4 w-4" />} label="Programs" />
              {user.role === "SUPERUSER" && (
                <>
                  <AdminNavLink href="/admin/users" icon={<Users className="h-4 w-4" />} label="User Management" />
                  <AdminNavLink href="/admin/settings" icon={<Settings className="h-4 w-4" />} label="Settings" />
                </>
              )}
            </nav>
          </div>
        </aside>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-card/50 transition-all font-bold text-sm group"
    >
      <div className="p-2 rounded-lg bg-card/80 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all">
        {icon}
      </div>
      {label}
    </Link>
  );
}
