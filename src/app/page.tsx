// Rebuild triggered to resolve module factory error
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import HomeClient from "@/components/HomeClient";
import { getSettings } from "./actions";

export default async function Home() {
  const session = await auth();
  const userId = session?.user ? (session.user as any).id : null;
  const config = await getSettings();

  let allPrograms: any[] = [];
  let recentCalculationsRaw: any[] | null = null;
  let user: any = null;

  try {
    const results = await Promise.all([
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
    allPrograms = results[0];
    recentCalculationsRaw = results[1];
    user = results[2];
  } catch (error) {
    console.error("Database connectivity error on Home page:", error);
  }

  const recentCalculations = (recentCalculationsRaw as any[]) || [];
  const latestCalculation = recentCalculations[0];

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
    <HomeClient 
      programs={programs} 
      userProgramId={userProgramId} 
      recentCalculations={recentCalculations}
      appName={config.appName}
    />
  );
}
