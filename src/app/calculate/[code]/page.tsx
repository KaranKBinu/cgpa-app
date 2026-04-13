import prisma from "@/lib/prisma";
import Calculator from "@/components/Calculator";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function CalculatePage({ 
  params,
  searchParams
}: { 
  params: Promise<{ code: string }>,
  searchParams: Promise<{ session?: string }>
}) {
  const { code } = await params;
  const { session: sessionId } = await searchParams;

  const [program, historicalData] = await Promise.all([
    prisma.program.findUnique({
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
    }) : Promise.resolve(null)
  ]);

  if (!program) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Calculator program={program} historicalData={historicalData} />
    </div>
  );
}
