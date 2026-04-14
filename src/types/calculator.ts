import { Grade } from "@/lib/calculator";

export interface Subject {
  id: string;
  code?: string;
  name: string;
  credits: number;
  category?: string | null;
  isCustom?: boolean;
  isGroup?: boolean;
  options?: Subject[];
}

export interface Semester {
  id: string;
  name: string;
  number: number;
  subjects: Subject[];
  isManual?: boolean;
  sgpa?: number;
  displayName?: string;
}

export interface Program {
  id: string;
  name: string;
  code: string;
  semesters: Semester[];
}

export interface SemResult {
  id: string;
  name: string;
  sgpa: number;
  percentage: number;
  totalCredits: number;
  earnedCredits: number;
  attemptedCredits: number;
  number: number;
  isComplete: boolean;
  isManual: boolean;
}

export interface CalculatorResults {
  semResults: SemResult[];
  cgpa: number;
  totalPercentage: number;
}
