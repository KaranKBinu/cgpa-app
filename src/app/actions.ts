"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveCalculation(data: {
  programId: string;
  label: string;
  cgpa: number;
  semesters: {
    name: string;
    number: number;
    sgpa: number;
    credits: number;
    subjects: {
      name: string;
      credits: number;
      grade: string;
      points: number;
      code?: string;
    }[];
  }[];
}) {
  try {
    const result = await prisma.calculation.create({
      data: {
        programId: data.programId,
        label: data.label,
        cgpa: data.cgpa,
        semesters: {
          create: data.semesters.map(sem => ({
            name: sem.name,
            number: sem.number,
            sgpa: sem.sgpa,
            credits: sem.credits,
            subjects: {
              create: sem.subjects.map(sub => ({
                name: sub.name,
                credits: sub.credits,
                grade: sub.grade,
                points: sub.points,
                code: sub.code
              }))
            }
          }))
        }
      }
    });

    revalidatePath('/history');
    return { success: true, id: result.id };
  } catch (error) {
    console.error("Failed to save calculation:", error);
    return { success: false, error: "Failed to save calculation" };
  }
}

export async function deleteCalculation(id: string) {
    try {
        await prisma.calculation.delete({
            where: { id }
        });
        revalidatePath('/history');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete" };
    }
}
