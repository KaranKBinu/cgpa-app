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
          The Ultimate SGPA/CGPA Companion
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 text-foreground">
          Calculate with <span className="gradient-text">Precision.</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed font-medium">
          Select your program to get started. We have the complete Revision 2021 database pre-loaded for all Kerala Polytechnic courses.
        </p>
      </div>

      <ProgramSelector programs={programs} userProgramId={userProgramId} />

      <RecentCalculatorLink programs={programs} recentCalculations={recentCalculations} />

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <div className="bg-card/50 border border-border/50 rounded-3xl p-6 space-y-3">
          <div className="text-primary font-black uppercase text-[10px] tracking-widest">01. Discovery</div>
          <h3 className="text-lg font-bold text-foreground">Select Program</h3>
          <p className="text-sm text-muted-foreground">Find your specific diploma course from our extensive database of 43+ programs.</p>
        </div>
        <div className="bg-card/50 border border-border/50 rounded-3xl p-6 space-y-3">
          <div className="text-primary font-black uppercase text-[10px] tracking-widest">02. Computation</div>
          <h3 className="text-lg font-bold text-foreground">Enter Grades</h3>
          <p className="text-sm text-muted-foreground">Simply select your grades for each subject. Credits and weights are handled automatically.</p>
        </div>
        <div className="bg-card/50 border border-border/50 rounded-3xl p-6 space-y-3">
          <div className="text-primary font-black uppercase text-[10px] tracking-widest">03. Outcome</div>
          <h3 className="text-lg font-bold text-foreground">Get Result</h3>
          <p className="text-sm text-muted-foreground">View your SGPA and CGPA instantly with detailed subject breakdown and analysis.</p>
        </div>
      </div>
    </div>
  );
}
