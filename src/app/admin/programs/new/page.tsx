import { createProgram } from "@/app/actions";
import { BookOpen, ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function NewProgramPage() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const res = await createProgram(formData);
    if (res.success) {
      redirect(`/admin/programs/${res.id}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Link href="/admin/programs" className="flex items-center gap-2 text-muted-foreground hover:text-emerald-500 transition-all mb-8 font-bold text-sm group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Programs
      </Link>

      <div className="bg-card/50 border border-border/50 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <BookOpen className="h-40 w-40" />
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2">New <span className="text-emerald-500">Program</span></h1>
          <p className="text-muted-foreground font-medium">Initialize a new academic structure for the calculator.</p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-4">Program Name</label>
            <input 
              name="name"
              placeholder="Computer Science & Engineering"
              className="w-full bg-background border border-border/50 rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold placeholder:text-muted-foreground/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-4">Program Code</label>
              <input 
                name="code"
                placeholder="CS"
                className="w-full bg-background border border-border/50 rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold placeholder:text-muted-foreground/50"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-4">Scheme / Revision</label>
              <input 
                name="scheme"
                placeholder="Revision 2021"
                defaultValue="Revision 2021"
                className="w-full bg-background border border-border/50 rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold placeholder:text-muted-foreground/50"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full h-16 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-3xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-8 group">
            <Save className="h-5 w-5" />
            Create & Configure
          </button>
        </form>
      </div>
    </div>
  );
}
