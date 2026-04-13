"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";

export async function saveCalculation(data: {
  id?: string;
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
  const session = await auth();
  const userId = session?.user ? (session.user as any).id : null;

  try {
    if (data.id) {
       // Update existing: We delete relations and recreate to handle complex structure changes easily
       await (prisma as any).calculation.update({
         where: { id: data.id },
         data: {
           label: data.label,
           cgpa: data.cgpa,
           semesters: {
             deleteMany: {},
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
       return { success: true, id: data.id };
    }

    const result = await (prisma as any).calculation.create({
      data: {
        programId: data.programId,
        label: data.label,
        cgpa: data.cgpa,
        userId: userId as any,
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

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as any) || "STUDENT";

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const existingUser = await (prisma as any).user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await (prisma as any).user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong" };
  }
}

export async function updateUserRole(userId: string, role: any) {
  const session = await auth();
  if ((session?.user as any)?.role !== "SUPERUSER") {
    return { error: "Unauthorized" };
  }

  try {
    await (prisma as any).user.update({
      where: { id: userId },
      data: { role },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update role" };
  }
}

// Administrative Actions
export async function createProgram(formData: FormData) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "TEACHER" && role !== "SUPERUSER") return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const scheme = formData.get("scheme") as string;

  try {
    const program = await prisma.program.create({
      data: { name, code, scheme }
    });
    revalidatePath("/admin/programs");
    return { success: true, id: program.id };
  } catch (error) {
    return { error: "Failed to create program" };
  }
}

export async function addSemester(programId: string, name: string, number: number) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "TEACHER" && role !== "SUPERUSER") return { error: "Unauthorized" };

  try {
    await prisma.syllabusSemester.create({
      data: { name, number, programId }
    });
    revalidatePath(`/admin/programs/${programId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to add semester" };
  }
}

export async function deleteSemester(id: string, programId: string) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "TEACHER" && role !== "SUPERUSER") return { error: "Unauthorized" };

  try {
    await prisma.syllabusSemester.delete({ where: { id } });
    revalidatePath(`/admin/programs/${programId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete semester" };
  }
}

export async function addSubject(semesterId: string, programId: string, data: { name: string, code: string, credits: number }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "TEACHER" && role !== "SUPERUSER") return { error: "Unauthorized" };

  try {
    await prisma.syllabusSubject.create({
      data: { ...data, semesterId }
    });
    revalidatePath(`/admin/programs/${programId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to add subject" };
  }
}

export async function deleteSubject(id: string, programId: string) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "TEACHER" && role !== "SUPERUSER") return { error: "Unauthorized" };

  try {
    await prisma.syllabusSubject.delete({ where: { id } });
    revalidatePath(`/admin/programs/${programId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete subject" };
  }
}

export async function getSettings() {
  try {
    let config = await (prisma as any).configuration.findUnique({
      where: { id: "global" }
    });
    
    if (!config) {
      config = await (prisma as any).configuration.create({
        data: { id: "global", appName: "PolyCGPA", revision: "Revision 2021" }
      });
    }
    
    return config;
  } catch (error) {
    return { appName: "PolyCGPA", revision: "Revision 2021" };
  }
}

export async function updateSettings(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== "SUPERUSER") return { error: "Unauthorized" };

  const appName = formData.get("appName") as string;
  const revision = formData.get("revision") as string;

  try {
    await (prisma as any).configuration.upsert({
      where: { id: "global" },
      update: { appName, revision },
      create: { id: "global", appName, revision }
    });
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update settings" };
  }
}
