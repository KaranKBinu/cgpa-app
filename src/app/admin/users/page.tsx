import prisma from "@/lib/prisma";
import { User as UserIcon, Shield, Mail, Calendar, ShieldAlert } from "lucide-react";
import { Role } from "@prisma/client";
import { updateUserRole } from "../../actions";

export default async function UserManagement() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter">User <span className="text-emerald-500">Management</span></h1>
        <p className="text-white/40 font-medium">Control access levels and manage system identities.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-widest">User</th>
                <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-widest">Role</th>
                <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-widest">Joined</th>
                <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6 text-white font-bold h-20">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all">
                           <UserIcon className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                           <span>{user.name || "Unnamed User"}</span>
                           <span className="text-white/30 text-xs font-medium">{user.email}</span>
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-6">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-8 py-6 text-white/40 text-xs font-bold">
                    {user.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <form action={async (formData) => {
                      "use server";
                      const role = formData.get("role") as Role;
                      const id = formData.get("userId") as string;
                      await updateUserRole(id, role);
                    }} className="flex items-center justify-end gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <select 
                        name="role" 
                        defaultValue={user.role}
                        className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500/50"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="TEACHER">Teacher</option>
                        <option value="SUPERUSER">Superuser</option>
                      </select>
                      <button type="submit" className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                        Update
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: any = {
    STUDENT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    TEACHER: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    SUPERUSER: "bg-amber-500/10 text-amber-500 border-amber-500/20"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[role] || styles.STUDENT}`}>
      {role}
    </span>
  );
}
