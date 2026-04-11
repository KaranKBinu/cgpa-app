import prisma from "@/lib/prisma";
import Calculator from "@/components/Calculator";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function CalculatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const program = await prisma.program.findUnique({
    where: { code },
    include: {
      semesters: {
        orderBy: { number: 'asc' },
        include: {
          subjects: {
            orderBy: { name: 'asc' }
          }
        }
      }
    }
  });

  if (!program) {
    notFound();
  }

  return (
    <div className="min-h-screen px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 space-y-4">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-white/40 hover:text-white transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to Programs
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2">
                {program.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-primary text-xs font-bold">
                  {program.code}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs font-bold">
                  {program.scheme}
                </span>
                <span className="text-sm text-white/40 font-medium">
                  {program.semesters.length} Semesters Total
                </span>
              </div>
            </div>
            <div className="h-1px flex-1 border-b border-white/5 mb-2 hidden md:block mx-10"></div>
          </div>
        </div>

        <Calculator program={program} />
      </div>
    </div>
  );
}
