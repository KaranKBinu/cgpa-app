import prisma from "@/lib/prisma";
import ProgramSelector from "@/components/ProgramSelector";
import RecentCalculatorLink from "@/components/RecentCalculatorLink";
import { Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  const userId = session?.user ? (session.user as any).id : null;

  const [allPrograms, recentCalculationsRaw, user] = await Promise.all([
    prisma.program.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true }
    }),
    userId ? prisma.calculation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: {
        program: true,
        _count: {
          select: { semesters: true }
        }
      }
    }) : Promise.resolve(null),
    userId ? prisma.user.findUnique({
      where: { id: userId },
      select: { department: true }
    }) : Promise.resolve(null)
  ]);

  const recentCalculations = (recentCalculationsRaw as any[]) || [];
  const latestCalculation = recentCalculations[0];

  // Priority: Latest calculation program > User Profile Department > alphabetical
  let userProgramId: string | undefined;

  if (latestCalculation?.programId) {
    userProgramId = latestCalculation.programId;
  } else if (user?.department) {
    const matched = allPrograms.find(p =>
      p.code.toLowerCase() === user.department?.toLowerCase() ||
      p.name.toLowerCase() === user.department?.toLowerCase()
    );
    if (matched) userProgramId = matched.id;
  }

  const programs = userProgramId
    ? [
      ...allPrograms.filter(p => p.id === userProgramId),
      ...allPrograms.filter(p => p.id !== userProgramId)
    ]
    : allPrograms;

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-600/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-[150px] -z-10"></div>

      <div className="text-center space-y-4 mb-12 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-primary text-[10px] font-black tracking-[0.3em] uppercase mb-4">
          <Sparkles className="h-3 w-3" />
          Made with Love
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-4 text-foreground leading-[1.1]">
          GPA Calculator <span className="gradient-text">For Kerala Polytechnic</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-semibold">
          Select your program to get started. We have the advanced GPA Calculator for all Kerala Polytechnic courses.
        </p>
      </div>

      <ProgramSelector programs={programs} userProgramId={userProgramId} />

      <RecentCalculatorLink programs={programs} recentCalculations={recentCalculations} />

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <div className="bg-card/50 border border-border/50 rounded-3xl p-6 space-y-3 group hover:border-emerald-500/30 transition-colors">
          <div className="text-primary font-black uppercase text-[10px] tracking-widest">01. The Fast-Track</div>
          <h3 className="text-xl font-black text-foreground">Skip the Typing</h3>
          <p className="text-sm text-muted-foreground font-medium">Listen, rookie: don't waste time entering subjects. Just drop your PDF transcripts and let our parser scrape every grade and credit automatically. It's built to handle the boring stuff for you.</p>
        </div>
        <div className="bg-card/50 border border-border/50 rounded-3xl p-6 space-y-3 group hover:border-emerald-500/30 transition-colors">
          <div className="text-primary font-black uppercase text-[10px] tracking-widest">02. The Logic Flip</div>
          <h3 className="text-xl font-black text-foreground">Context is Everything</h3>
          <p className="text-sm text-muted-foreground font-medium">Lateral Entry student? Just toggle LET Mode and we'll handle the Sem-3 skip. Adding a custom elective? Do it on the fly. We adapt the engine to your specific academic pathway in real-time.</p>
        </div>
        <div className="bg-card/50 border border-border/50 rounded-3xl p-6 space-y-3 group hover:border-emerald-500/30 transition-colors">
          <div className="text-primary font-black uppercase text-[10px] tracking-widest">03. The Safety Net</div>
          <h3 className="text-xl font-black text-foreground">Zero Data Loss</h3>
          <p className="text-sm text-muted-foreground font-medium">Close the tab? No stress. Every single grade you enter is instantly locked into a local draft. Log in for cloud sync, or stay local—either way, your progress is exactly where you left it.</p>
        </div>
      </div>
    </div>
  );
}
