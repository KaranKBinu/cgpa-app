import prisma from "@/lib/prisma";
import { ArrowLeft, Plus, Trash2, BookOpen, Layers, GraduationCap, ChevronRight, Save } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { addSemester, deleteSemester, addSubject, deleteSubject } from "@/app/actions";
import { groupSemesters } from "@/lib/calculator";

export default async function ProgramDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const rawProgram = await prisma.program.findUnique({
    where: { id },
    include: {
      semesters: {
        orderBy: { number: 'asc' },
        include: {
          subjects: {
            orderBy: { code: 'asc' }
          }
        }
      }
    }
  });

  if (!rawProgram) notFound();

  const groupedSemesters = groupSemesters(rawProgram.semesters);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <Link href="/admin/programs" className="flex items-center gap-2 text-muted-foreground hover:text-emerald-500 transition-all mb-4 font-bold text-sm group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Programs
          </Link>
          <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter">
            Configure <span className="text-emerald-500">{rawProgram.code}</span>
          </h1>
          <p className="text-muted-foreground font-medium">{rawProgram.name} — {rawProgram.scheme}</p>
        </div>

        <form action={async () => {
          "use server";
          await addSemester(id, `Semester ${rawProgram.semesters.length + 1}`, rawProgram.semesters.length + 1);
        }}>
          <button type="submit" className="h-14 px-8 rounded-2xl bg-card/50 border border-border/50 text-foreground font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-card/80 transition-all group">
            <Layers className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            Add Semester
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {groupedSemesters.map((sem) => (
          <div key={sem.id} className="bg-card/50 border border-border/50 rounded-[2.5rem] overflow-hidden group/sem">
            <div className="p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card/30 border-b border-border/50">
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <span className="text-xl font-black">{sem.number}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-foreground">{sem.displayName} <span className="text-sm font-medium text-muted-foreground ml-2">({sem.name})</span></h3>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">{sem.subjects.length} Total Subjects</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <form action={async () => {
                  "use server";
                  // Delete all original IDs (in case it was grouped)
                  for (const sid of sem.originalIds) {
                    await deleteSemester(sid, id);
                  }
                }}>
                  <button type="submit" className="p-4 rounded-xl text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>

            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Code</th>
                      <th className="px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Subject Name</th>
                      <th className="px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">CR</th>
                      <th className="px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sem.subjects.map((sub) => (
                      <tr key={sub.id} className="border-b border-border/30 group/row">
                        <td className="px-4 py-4 font-mono text-sm text-emerald-500 font-bold">{sub.code}</td>
                        <td className="px-4 py-4 text-foreground font-bold">{sub.name}</td>
                        <td className="px-4 py-4 text-center font-black text-muted-foreground">{sub.credits}</td>
                        <td className="px-4 py-4 text-right">
                          <form action={async () => {
                            "use server";
                            await deleteSubject(sub.id, id);
                          }}>
                            <button type="submit" className="p-2 text-muted-foreground hover:text-red-500 transition-all">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Add Subject Row */}
                    <tr className="bg-emerald-500/[0.02]">
                       <td colSpan={4} className="p-4">
                          <form action={async (formData) => {
                            "use server";
                            const name = formData.get("name") as string;
                            const code = formData.get("code") as string;
                            const credits = parseFloat(formData.get("credits") as string);
                            // Add subject to the LAST original semester in the group (usually the normal one)
                             const targetSemId = sem.originalIds[sem.originalIds.length - 1];
                            await addSubject(targetSemId, id, { name, code, credits });
                          }} className="flex flex-col lg:flex-row items-center gap-4">
                             <input name="code" placeholder="Code (e.g. 1021)" className="flex-1 lg:max-w-[120px] bg-background border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:border-emerald-500/50 outline-none" required />
                             <input name="name" placeholder="Subject Name" className="flex-[3] bg-background border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:border-emerald-500/50 outline-none" required />
                             <input name="credits" type="number" step="0.5" placeholder="CR" className="w-20 bg-background border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:border-emerald-500/50 outline-none" required />
                             <button type="submit" className="h-11 px-6 rounded-xl bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Add
                             </button>
                          </form>
                       </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}

        {groupedSemesters.length === 0 && (
          <div className="py-20 text-center bg-card/50 border border-dashed border-border/50 rounded-[3rem]">
            <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-bold">No semesters configured. Click &quot;Add Semester&quot; to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
