export type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export const GRADE_POINTS: Record<Grade, number> = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 5,
  F: 0,
};

export interface SubjectInput {
  credits: number;
  grade: Grade;
}

export interface SemesterInput {
  subjects: SubjectInput[];
}

export function calculateSGPA(subjects: SubjectInput[]): number {
  if (subjects.length === 0) return 0;
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  subjects.forEach((subject) => {
    // Some subjects might have 0 credits (non-credit courses)
    if (subject.credits > 0) {
        totalPoints += GRADE_POINTS[subject.grade] * subject.credits;
        totalCredits += subject.credits;
    }
  });
  
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

export function calculateCGPA(semesters: { sgpa: number; totalCredits: number }[]): number {
  if (semesters.length === 0) return 0;
  
  let weightedPoints = 0;
  let totalCredits = 0;
  
  semesters.forEach((sem) => {
    weightedPoints += sem.sgpa * sem.totalCredits;
    totalCredits += sem.totalCredits;
  });
  
  return totalCredits > 0 ? weightedPoints / totalCredits : 0;
}

export function groupSemesters<T extends { id: string; name: string; subjects: any[], isInternship?: boolean }>(semesters: T[]) {
  const result: (T & { originalIds: string[] })[] = [];
  let pendingInternshipSubjects: any[] = [];
  let pendingInternshipIds: string[] = [];

  semesters.forEach((sem) => {
    const isInternship = sem.isInternship || sem.name.toLowerCase().includes('internship');
    if (isInternship) {
      pendingInternshipSubjects.push(...sem.subjects);
      pendingInternshipIds.push(sem.id);
    } else {
      result.push({
        ...sem,
        name: pendingInternshipSubjects.length > 0 ? `${sem.name} + Internship` : sem.name,
        subjects: [...pendingInternshipSubjects, ...sem.subjects],
        originalIds: [...pendingInternshipIds, sem.id]
      });
      pendingInternshipSubjects = [];
      pendingInternshipIds = [];
    }
  });

  if (pendingInternshipSubjects.length > 0 && result.length > 0) {
    const last = result[result.length - 1];
    last.name = `${last.name} + Internship`;
    last.subjects.push(...(pendingInternshipSubjects as any));
    last.originalIds.push(...pendingInternshipIds);
  }

  return result.map((sem, index) => ({
    ...sem,
    number: index + 1,
    displayName: `S${index + 1}`
  }));
}
