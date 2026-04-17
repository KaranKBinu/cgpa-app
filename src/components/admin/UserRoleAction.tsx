"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "@/app/actions";
import { ArrowRight, Loader2 } from "lucide-react";
import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";

export default function UserRoleAction({ userId, currentRole }: { userId: string, currentRole: Role }) {
  const [role, setRole] = useState<Role>(currentRole);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUpdate = () => {
    startTransition(async () => {
      const result = await updateUserRole(userId, role);
      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex gap-2">
      <select 
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        disabled={isPending}
        className="flex-1 h-12 bg-background/50 border border-border rounded-xl px-4 text-xs font-black uppercase tracking-widest text-foreground appearance-none cursor-pointer focus:border-emerald-500/50 transition-all shadow-inner disabled:opacity-50"
      >
        <option value="STUDENT">Student Tier</option>
        <option value="TEACHER">Faculty Access</option>
        <option value="SUPERUSER">Root Admin</option>
      </select>
      <button 
        onClick={handleUpdate}
        disabled={isPending || role === currentRole}
        className="h-12 w-12 rounded-xl bg-emerald-500 text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
      >
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ArrowRight className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
