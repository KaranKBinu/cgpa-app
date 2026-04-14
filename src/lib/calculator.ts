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

export function groupSemesters<S, T extends { id: string; name: string; subjects: S[] }>(semesters: T[]) {
  return semesters.map((sem, index) => {
    // Deduplicate subjects within the semester
    const uniqueSubjects: S[] = [];
    const seen = new Set<string>();

    sem.subjects.forEach(sub => {
      // For elective groups, use the unique ID to prevent merging distinct slots
      // For standard subjects, remain strict with code-name pairs
      const key = (sub as any).isGroup ? (sub as any).id : `${(sub as any).code || ''}-${(sub as any).name}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSubjects.push(sub);
      }
    });

    let displayName = `S${index + 1}`;
    if (sem.name.toLowerCase().includes('normal pathway')) displayName = 'S6 Normal';
    else if (sem.name.toLowerCase().includes('internship pathway')) displayName = 'S6 Intern';
    else if (index >= 5) {
      // If we are beyond S5 and it's not a named pathway, keep it S6, S7 etc but try to stay relative
      // Actually, standard naming is fine for others
    }

    return {
      ...sem,
      subjects: uniqueSubjects,
      originalIds: [sem.id],
      number: index + 1,
      displayName
    };
  });
}
