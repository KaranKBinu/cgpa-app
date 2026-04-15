"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";

// ─── Namespaced loggers per action group ────────────────────────────────────
const logCalc    = createLogger("actions:calculation");
const logAuth    = createLogger("actions:auth");
const logAdmin   = createLogger("actions:admin");
const logProfile = createLogger("actions:profile");
const logConfig  = createLogger("actions:config");

// ─── Calculation ─────────────────────────────────────────────────────────────

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

  logCalc.info("saveCalculation called", {
    calcId: data.id ?? "new",
    programId: data.programId,
    semCount: data.semesters.length,
    cgpa: data.cgpa,
    userId: userId ?? "anonymous",
  });

  if (userId) {
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      logCalc.warn("Session mismatch – user not found in DB", { userId });
      return { success: false, error: "Session mismatch (DB Reset). Please logout and register again." };
    }
  }

  try {
    if (data.id) {
      logCalc.info("Updating existing calculation", { calcId: data.id, label: data.label });
      await prisma.calculation.update({
        where: { id: data.id },
        data: {
          label: data.label,
          cgpa: data.cgpa,
          userId,
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
                  code: sub.code,
                })),
              },
            })),
          },
        },
      });
      revalidatePath("/history");
      logCalc.info("Calculation updated successfully", { calcId: data.id });
      return { success: true, id: data.id };
    }

    // Check if a calculation with the same label + program already exists for this user.
    // If so, replace it (update) instead of creating a duplicate.
    const existing = await prisma.calculation.findFirst({
      where: { label: data.label, programId: data.programId, userId: userId ?? undefined },
      select: { id: true },
    });

    if (existing) {
      logCalc.info("Duplicate label+program found – replacing existing calculation", { existingId: existing.id, label: data.label });
      await prisma.calculation.update({
        where: { id: existing.id },
        data: {
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
                  code: sub.code,
                })),
              },
            })),
          },
        },
      });
      revalidatePath("/history");
      logCalc.info("Existing calculation replaced successfully", { calcId: existing.id });
      return { success: true, id: existing.id };
    }

    logCalc.info("Creating new calculation", { programId: data.programId, label: data.label });
    const result = await prisma.calculation.create({
      data: {
        programId: data.programId,
        label: data.label,
        cgpa: data.cgpa,
        userId,
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
                code: sub.code,
              })),
            },
          })),
        },
      },
    });

    revalidatePath("/history");
    logCalc.info("Calculation created successfully", { calcId: result.id });
    return { success: true, id: result.id };
  } catch (error: any) {
    logCalc.error("Failed to save calculation", { error: error.message, stack: error.stack });
    return { success: false, error: error.message || "Failed to save calculation" };
  }
}

export async function deleteCalculation(id: string) {
  logCalc.info("deleteCalculation called", { calcId: id });
  try {
    await prisma.calculation.delete({ where: { id } });
    revalidatePath("/history");
    logCalc.info("Calculation deleted", { calcId: id });
    return { success: true };
  } catch (error: any) {
    logCalc.error("Failed to delete calculation", { calcId: id, error: error.message });
    return { success: false, error: "Failed to delete" };
  }
}

// ─── Auth / User ──────────────────────────────────────────────────────────────

export async function registerUser(formData: FormData) {
  const name       = formData.get("name") as string;
  const email      = formData.get("email") as string;
  const password   = formData.get("password") as string;
  const department = formData.get("department") as string;
  const isLET      = formData.get("isLET") === "true";
  const role       = (formData.get("role") as any) || "STUDENT";

  logAuth.info("registerUser called", { email, department, role, isLET });

  if (!email || !password) {
    logAuth.warn("Registration rejected – missing email or password");
    return { error: "Email and password are required" };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      logAuth.warn("Registration rejected – email already exists", { email });
      return { error: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, email, password: hashedPassword, role, department, isLET },
    });

    logAuth.info("User registered successfully", { email, role });
    return { success: true };
  } catch (error: any) {
    logAuth.error("Registration failed", { email, error: error.message });
    return { error: "Something went wrong" };
  }
}

export async function updateUserRole(userId: string, role: any) {
  const session = await auth();
  const actorRole = (session?.user as any)?.role;

  logAdmin.info("updateUserRole called", { targetUserId: userId, newRole: role, actorRole });

  if (actorRole !== "SUPERUSER") {
    logAdmin.warn("updateUserRole unauthorised", { actorRole });
    return { error: "Unauthorized" };
  }

  try {
    await prisma.user.update({ where: { id: userId }, data: { role } });
    revalidatePath("/admin/users");
    logAdmin.info("User role updated", { targetUserId: userId, newRole: role });
    return { success: true };
  } catch (error: any) {
    logAdmin.error("Failed to update user role", { targetUserId: userId, error: error.message });
    return { error: "Failed to update role" };
  }
}

// ─── Admin – Programs / Semesters / Subjects ─────────────────────────────────

export async function createProgram(formData: FormData) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  const name   = formData.get("name") as string;
  const code   = formData.get("code") as string;
  const scheme = formData.get("scheme") as string;

  logAdmin.info("createProgram called", { name, code, scheme, actorRole: role });

  if (role !== "TEACHER" && role !== "SUPERUSER") {
    logAdmin.warn("createProgram unauthorised", { actorRole: role });
    return { error: "Unauthorized" };
  }

  try {
    const program = await prisma.program.create({ data: { name, code, scheme } });
    revalidatePath("/admin/programs");
    logAdmin.info("Program created", { programId: program.id, code });
    return { success: true, id: program.id };
  } catch (error: any) {
    logAdmin.error("Failed to create program", { code, error: error.message });
    return { error: "Failed to create program" };
  }
}

export async function addSemester(programId: string, name: string, number: number) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  logAdmin.info("addSemester called", { programId, name, number, actorRole: role });

  if (role !== "TEACHER" && role !== "SUPERUSER") {
    logAdmin.warn("addSemester unauthorised", { actorRole: role });
    return { error: "Unauthorized" };
  }

  try {
    await prisma.syllabusSemester.create({ data: { name, number, programId } });
    revalidatePath(`/admin/programs/${programId}`);
    logAdmin.info("Semester added", { programId, name, number });
    return { success: true };
  } catch (error: any) {
    logAdmin.error("Failed to add semester", { programId, error: error.message });
    return { error: "Failed to add semester" };
  }
}

export async function deleteSemester(id: string, programId: string) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  logAdmin.info("deleteSemester called", { semesterId: id, programId, actorRole: role });

  if (role !== "TEACHER" && role !== "SUPERUSER") {
    logAdmin.warn("deleteSemester unauthorised", { actorRole: role });
    return { error: "Unauthorized" };
  }

  try {
    await prisma.syllabusSemester.delete({ where: { id } });
    revalidatePath(`/admin/programs/${programId}`);
    logAdmin.info("Semester deleted", { semesterId: id });
    return { success: true };
  } catch (error: any) {
    logAdmin.error("Failed to delete semester", { semesterId: id, error: error.message });
    return { error: "Failed to delete semester" };
  }
}

export async function addSubject(
  semesterId: string,
  programId: string,
  data: { name: string; code: string; credits: number }
) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  logAdmin.info("addSubject called", { semesterId, programId, code: data.code, actorRole: role });

  if (role !== "TEACHER" && role !== "SUPERUSER") {
    logAdmin.warn("addSubject unauthorised", { actorRole: role });
    return { error: "Unauthorized" };
  }

  try {
    await prisma.syllabusSubject.create({ data: { ...data, semesterId } });
    revalidatePath(`/admin/programs/${programId}`);
    logAdmin.info("Subject added", { semesterId, code: data.code, name: data.name });
    return { success: true };
  } catch (error: any) {
    logAdmin.error("Failed to add subject", { semesterId, code: data.code, error: error.message });
    return { error: "Failed to add subject" };
  }
}

export async function deleteSubject(id: string, programId: string) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  logAdmin.info("deleteSubject called", { subjectId: id, programId, actorRole: role });

  if (role !== "TEACHER" && role !== "SUPERUSER") {
    logAdmin.warn("deleteSubject unauthorised", { actorRole: role });
    return { error: "Unauthorized" };
  }

  try {
    await prisma.syllabusSubject.delete({ where: { id } });
    revalidatePath(`/admin/programs/${programId}`);
    logAdmin.info("Subject deleted", { subjectId: id });
    return { success: true };
  } catch (error: any) {
    logAdmin.error("Failed to delete subject", { subjectId: id, error: error.message });
    return { error: "Failed to delete subject" };
  }
}

// ─── Config / Settings ────────────────────────────────────────────────────────

export async function getSettings() {
  try {
    let config = await prisma.configuration.findUnique({ where: { id: "global" } });

    if (!config) {
      logConfig.warn("No config found – seeding defaults");
      config = await prisma.configuration.create({
        data: { id: "global", appName: "PolyCGPA", revision: "Revision 2021" },
      });
    }

    return config;
  } catch (error: any) {
    logConfig.error("Failed to load settings – returning defaults", { error: error.message });
    return { appName: "PolyCGPA", revision: "Revision 2021" };
  }
}

export async function updateSettings(formData: FormData) {
  const session = await auth();
  const actorRole = (session?.user as any)?.role;

  const appName  = formData.get("appName") as string;
  const revision = formData.get("revision") as string;

  logConfig.info("updateSettings called", { appName, revision, actorRole });

  if (actorRole !== "SUPERUSER") {
    logConfig.warn("updateSettings unauthorised", { actorRole });
    return { error: "Unauthorized" };
  }

  try {
    await prisma.configuration.upsert({
      where: { id: "global" },
      update: { appName, revision },
      create: { id: "global", appName, revision },
    });
    revalidatePath("/");
    revalidatePath("/admin/settings");
    logConfig.info("Settings updated", { appName, revision });
    return { success: true };
  } catch (error: any) {
    logConfig.error("Failed to update settings", { error: error.message });
    return { error: "Failed to update settings" };
  }
}

// ─── Utility queries ──────────────────────────────────────────────────────────

export async function getSubjectByCode(code: string) {
  logAdmin.debug("getSubjectByCode called", { code });
  try {
    const subject = await prisma.syllabusSubject.findFirst({
      where: { code: { equals: code }, isGroup: false },
      select: { name: true, credits: true, code: true },
    });

    if (!subject) logAdmin.warn("Subject not found by code", { code });
    else logAdmin.debug("Subject found", { code, name: subject.name });

    return { success: true, subject };
  } catch (error: any) {
    logAdmin.error("getSubjectByCode failed", { code, error: error.message });
    return { success: false, error: "Failed to fetch subject" };
  }
}

export async function getPrograms() {
  logAdmin.debug("getPrograms called");
  try {
    const programs = await prisma.program.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    });
    logAdmin.info("Programs fetched", { count: programs.length });
    return { success: true, programs };
  } catch (error: any) {
    logAdmin.error("Failed to fetch programs", { error: error.message });
    return { success: false, programs: [] };
  }
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function updateProfile(formData: FormData) {
  const session = await auth();
  const userId = session?.user ? (session.user as any).id : null;

  const name       = formData.get("name") as string;
  const department = formData.get("department") as string;
  const isLET      = formData.get("isLET") === "true";

  logProfile.info("updateProfile called", { userId: userId ?? "unauthenticated", name, department, isLET });

  if (!userId) {
    logProfile.warn("updateProfile rejected – not authenticated");
    return { error: "Unauthorized" };
  }

  try {
    await prisma.user.update({ where: { id: userId }, data: { name, department, isLET } });
    revalidatePath("/profile");
    revalidatePath("/");
    logProfile.info("Profile updated", { userId, name, department });
    return { success: true };
  } catch (error: any) {
    logProfile.error("Failed to update profile", { userId, error: error.message });
    return { error: "Failed to update profile" };
  }
}
