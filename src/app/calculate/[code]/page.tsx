import prisma from "@/lib/prisma";
import Calculator from "@/components/Calculator";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function CalculatePage({ 
  params,
  searchParams
}: { 
  params: Promise<{ code: string }>,
  searchParams: Promise<{ session?: string }>
}) {
  const { code } = await params;
  const { session: sessionId } = await searchParams;
  const session = await auth();
  
  const user = session?.user?.email ? await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isLET: true }
  }) : null;

  const [program, historicalData, allOpenElectives] = await Promise.all([
    prisma.program.findUnique({
      where: { code },
      include: {
        semesters: {
          orderBy: { number: 'asc' },
          include: {
            subjects: {
              where: { parentId: null },
              orderBy: { name: 'asc' },
              include: {
                options: true
              }
            }
          }
        }
      }
    }),
    sessionId ? prisma.calculation.findUnique({
      where: { id: sessionId },
      include: {
        semesters: {
          include: {
            subjects: true
          }
        }
      }
    }) : Promise.resolve(null),
    prisma.syllabusSubject.findMany({
      where: {
        category: 'Open Elective course',
        parentId: { not: null },
        semester: {
          program: {
            code: { not: code }
          }
        }
      },
      include: {
        semester: {
          include: {
            program: true
          }
        }
      }
    })
  ]);

  if (!program) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Calculator 
        program={program} 
        historicalData={historicalData} 
        globalOpenElectives={allOpenElectives} 
        userIsLET={!!user?.isLET}
      />
    </div>
  );
}
