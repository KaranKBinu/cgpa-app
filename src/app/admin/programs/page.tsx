import prisma from "@/lib/prisma";
import { BookOpen, Plus, Trash2, Edit2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { cn } from "@/lib/utils";

export default async function ProgramManagement() {
  const programs = await prisma.program.findMany({
    include: {
      _count: {
        select: { semesters: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  async function deleteProgram(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.program.delete({ where: { id } });
    revalidatePath("/admin/programs");
  }

  return (
    <div className="space-y-8 lg:space-y-12 animate-fade-in pb-20 pt-16 lg:pt-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter">Academic <span className="text-emerald-500">Programs</span></h1>
          <p className="text-muted-foreground font-medium text-sm lg:text-base">Manage syllabus structures and degree paths.</p>
        </div>
        <Link href="/admin/programs/new" className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] lg:text-xs flex items-center justify-center gap-3 hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-emerald-500/20">
          <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
          Add Program
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {programs.map((program) => (
          <div key={program.id} className="p-6 lg:p-8 rounded-[1.8rem] lg:rounded-[2.5rem] bg-card/50 border border-border/50 hover:border-emerald-500/30 transition-all group flex flex-col h-full">
            <div className="flex items-start justify-between mb-6 lg:mb-8">
              <div className="space-y-1 lg:space-y-2">
                <span className="text-[9px] lg:text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] lg:tracking-[0.4em]">{program.code}</span>
                <h3 className="text-xl lg:text-2xl font-black text-foreground tracking-tight leading-tight group-hover:text-emerald-500 transition-colors uppercase">{program.name}</h3>
                <p className="text-muted-foreground text-[8px] lg:text-[10px] font-black uppercase tracking-widest opacity-60 underline underline-offset-4 decoration-emerald-500/30">{program.scheme}</p>
              </div>
              <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-xl lg:rounded-2xl bg-card/80 border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all shrink-0 shadow-lg">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-8 lg:mb-10">
               <div className="px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl bg-card/80 border border-border/50 flex items-center gap-2 text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-inner">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {program._count.semesters} Semesters
               </div>
            </div>

            <div className="mt-auto pt-6 lg:pt-8 border-t border-border/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 lg:gap-3">
                <Link href={`/admin/programs/${program.id}`} className="p-2.5 lg:p-3 rounded-xl bg-card/80 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all text-muted-foreground border border-border/50">
                  <Edit2 className="h-4 w-4" />
                </Link>
                <form action={deleteProgram}>
                  <input type="hidden" name="id" value={program.id} />
                  <button type="submit" className="p-2.5 lg:p-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 transition-all text-red-500 border border-red-500/10 opacity-60 hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
              <Link href={`/calculate/${program.code}`} className="h-10 lg:h-12 px-4 lg:px-6 rounded-lg lg:rounded-xl bg-card/80 hover:bg-emerald-500 hover:text-black transition-all flex items-center gap-2 text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-xl border border-border/50">
                Visualize <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {programs.length === 0 && (
        <div className="py-20 lg:py-40 text-center bg-card/50 border-2 border-dashed border-border/50 rounded-[2rem] lg:rounded-[3rem] px-6">
           <BookOpen className="h-12 w-12 text-muted-foreground/20 mx-auto mb-6" />
           <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No academic sectors registered.</p>
        </div>
      )}
    </div>
  );
}
