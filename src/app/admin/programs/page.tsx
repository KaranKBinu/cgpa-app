import prisma from "@/lib/prisma";
import { BookOpen, Plus, Trash2, Edit2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

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
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Academic <span className="text-emerald-500">Programs</span></h1>
          <p className="text-white/40 font-medium">Manage syllabus structures and degree paths.</p>
        </div>
        <Link href="/admin/programs/new" className="px-6 py-3 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-emerald-500/20">
          <Plus className="h-4 w-4" />
          Add Program
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {programs.map((program) => (
          <div key={program.id} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all group">
            <div className="flex items-start justify-between mb-8">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">{program.code}</span>
                <h3 className="text-2xl font-black text-white tracking-tight leading-tight">{program.name}</h3>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">{program.scheme}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
               <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 text-[10px] font-bold text-white/40">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {program._count.semesters} Semesters
               </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link href={`/admin/programs/${program.id}`} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white">
                  <Edit2 className="h-4 w-4" />
                </Link>
                <form action={deleteProgram}>
                  <input type="hidden" name="id" value={program.id} />
                  <button type="submit" className="p-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 transition-all text-red-500/40 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
              <Link href={`/calculate/${program.code}`} className="h-12 px-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white">
                View Live <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {programs.length === 0 && (
        <div className="py-20 text-center bg-white/5 border border-dashed border-white/10 rounded-[3rem]">
           <BookOpen className="h-12 w-12 text-white/20 mx-auto mb-4" />
           <p className="text-white/40 font-bold">No academic programs registered yet.</p>
        </div>
      )}
    </div>
  );
}
