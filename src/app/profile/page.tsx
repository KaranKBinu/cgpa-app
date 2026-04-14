import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPrograms } from "@/app/actions";
import ProfileClient from "@/components/ProfileClient";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const [user, programsRes] = await Promise.all([
    prisma.user.findUnique({
      where: { id: (session.user as any).id }
    }),
    getPrograms()
  ]);

  if (!user) {
    // This could happen if DB was reset but session is still active
    redirect("/auth/login");
  }

  // programsRes already has { id, name, code } from getPrograms in actions.ts
  const programs = programsRes.success ? programsRes.programs : [];

  return (
    <div className="min-h-screen">
       <ProfileClient user={user} programs={programs} />
    </div>
  );
}
