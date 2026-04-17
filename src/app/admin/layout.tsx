import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

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
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-4">
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
