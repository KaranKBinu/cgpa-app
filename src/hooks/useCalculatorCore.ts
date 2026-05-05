import { useState, useMemo, useEffect } from 'react';
import { Grade, calculateSGPA, calculateCGPA } from '@/lib/calculator';
import { Subject, Semester, Program, CalculatorResults } from '@/types/calculator';

interface UseCalculatorCoreProps {
  program: Program;
  historicalData?: any;
  globalOpenElectives: any[];
  userIsLET: boolean;
  groupedSemesters: Semester[];
  session?: any;
}

export function useCalculatorCore({
  program,
  historicalData,
  globalOpenElectives,
  userIsLET,
  groupedSemesters,
  session
}: UseCalculatorCoreProps) {
  const [isLETMode, setIsLETMode] = useState(userIsLET);
  const [grades, setGrades] = useState<Record<string, Grade | "">>( {});
  const [exclusions, setExclusions] = useState<Record<string, 'not-published' | 'not-taken' | null>>({});
  const [customSubjects, setCustomSubjects] = useState<Record<string, Subject[]>>({});
  const [manualSgpas, setManualSgpas] = useState<Record<string, { sgpa: number, credits: number } | null>>({});
  const [expandedSem, setExpandedSem] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Sync isLETMode with userIsLET prop (important for login/profile updates)
  useEffect(() => {
    setIsLETMode(userIsLET);
  }, [userIsLET]);

  const displayedSemesters = useMemo(() => {
    return isLETMode 
      ? groupedSemesters.filter(s => s.number > 2)
      : groupedSemesters;
  }, [groupedSemesters, isLETMode]);

  // Initial expand & Sync
  useEffect(() => {
    if (displayedSemesters.length > 0) {
      const isCurrentValid = displayedSemesters.some(s => s.id === expandedSem);
      if (!expandedSem || !isCurrentValid) {
        setExpandedSem(displayedSemesters[0].id);
      }
    }
  }, [displayedSemesters, expandedSem]);

  // State Persistence & Historical Data Loading
  useEffect(() => {
    const saved = localStorage.getItem(`poly-cgpa-${program.id}`);
    
    if (historicalData) {
      const histGrades: Record<string, Grade | ""> = {};
      const histExclusions: Record<string, 'not-published' | 'not-taken' | null> = {};
      const histCustom: Record<string, Subject[]> = {};
      const histManual: Record<string, { sgpa: number, credits: number } | null> = {};
      const histSelected: Record<string, string> = {};
      
      historicalData.semesters.forEach((histSem: any) => {
        const activeSem = groupedSemesters.find(s => s.name === histSem.name) || groupedSemesters.find(s => s.number === histSem.number);
        if (!activeSem) return;
        const matchedInThisSem = new Set<string>();
        if (histSem.subjects.length === 0 && histSem.sgpa > 0) {
          histManual[activeSem.id] = { sgpa: histSem.sgpa, credits: histSem.credits };
        }
        histSem.subjects.forEach((sub: any) => {
          const subCodeTrimmed = sub.code?.trim() || "";
          const subNameNormalized = sub.name?.trim().toLowerCase().replace(/[^a-z0-9]/g, "") || "";
          let foundSubjectId = "";
          let parentGroupId = "";

          activeSem.subjects.forEach(s => {
            if (s.isGroup) {
              // 1. Check local options
              let opt = s.options?.find(o => 
                (o.code && o.code.trim() === subCodeTrimmed) || 
                (o.name.trim().toLowerCase().replace(/[^a-z0-9]/g, "") === subNameNormalized)
              );
              
              // 2. Check global open electives if not found in local options
              if (!opt && s.category === 'Open Elective course') {
                opt = globalOpenElectives?.find(o => 
                  (o.code && o.code.trim() === subCodeTrimmed) || 
                  (o.name.trim().toLowerCase().replace(/[^a-z0-9]/g, "") === subNameNormalized)
                );
              }

              if (opt) { 
                foundSubjectId = opt.id; 
                parentGroupId = s.id; 
                histSelected[s.id] = opt.id; 
              }
            } else if ((s.code && s.code.trim() === subCodeTrimmed) || (s.name.trim().toLowerCase().replace(/[^a-z0-9]/g, "") === subNameNormalized)) {
              foundSubjectId = s.id;
            }
          });

          if (foundSubjectId) {
            histGrades[foundSubjectId] = sub.grade === 'HIDDEN' ? '' : sub.grade as Grade;
            if (sub.grade === 'HIDDEN') histExclusions[foundSubjectId] = 'not-taken';
            else if (sub.grade === 'PENDING' || sub.points === -1) { 
              histExclusions[foundSubjectId] = 'not-published'; 
              histGrades[foundSubjectId] = '' as Grade; 
            }
            matchedInThisSem.add(parentGroupId || foundSubjectId);
          } else {
            if (!histCustom[activeSem.id]) histCustom[activeSem.id] = [];
            
            // Prevent duplicates in historical custom subjects
            const subCodeNormalized = sub.code?.trim().toUpperCase();
            const isDuplicate = histCustom[activeSem.id].some(s => s.code?.trim().toUpperCase() === subCodeNormalized);
            
            if (!isDuplicate) {
              const customId = `hist-${Math.random().toString(36).substring(2, 11)}`;
              histCustom[activeSem.id].push({ id: customId, code: sub.code, name: sub.name, credits: sub.credits, isCustom: true });
              if (sub.grade === 'HIDDEN') {
                histExclusions[customId] = 'not-taken';
                histGrades[customId] = '' as Grade;
              } else if (sub.grade === 'PENDING' || sub.points === -1) { 
                histExclusions[customId] = 'not-published'; 
                histGrades[customId] = '' as Grade; 
              } else { 
                histGrades[customId] = sub.grade as Grade; 
              }
            }
          }
        });
        // We no longer automatically mark unmatched subjects as 'not-taken'.
        // This ensures that if curriculum subjects were not saved (e.g., they weren't graded yet),
        // they still appear as empty subjects for the user to fill.
      });

      setGrades(histGrades); setCustomSubjects(histCustom); setExclusions(histExclusions);
      setManualSgpas(histManual); setSelectedOptions(histSelected);
      
      let loadedName = historicalData.studentName || "";
      setStudentName(loadedName); 
      setActiveSessionId(historicalData.id);
      if (historicalData.isLET !== undefined) setIsLETMode(historicalData.isLET);
      return;
    }

    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.grades) setGrades(data.grades);
        if (data.exclusions) setExclusions(data.exclusions);
        if (data.customSubjects) setCustomSubjects(data.customSubjects);
        if (data.manualSgpas) setManualSgpas(data.manualSgpas);
        if (data.selectedOptions) setSelectedOptions(data.selectedOptions);
        if (data.studentName) setStudentName(data.studentName);
        if (data.isLETMode !== undefined) setIsLETMode(data.isLETMode);
      } catch (e) { console.error('Failed to load local state', e); }
    }
  }, [program.id, historicalData, groupedSemesters]);

  useEffect(() => {
    const state = { grades, exclusions, customSubjects, manualSgpas, studentName, selectedOptions, isLETMode, updatedAt: Date.now() };
    localStorage.setItem(`poly-cgpa-${program.id}`, JSON.stringify(state));
  }, [program.id, grades, exclusions, customSubjects, manualSgpas, studentName, selectedOptions, isLETMode]);

  const results = useMemo(() => {
    const semResults = groupedSemesters.map(sem => {
      const manualEntry = manualSgpas[sem.id];
      if (manualEntry) {
        const officialCredits = sem.subjects.reduce((acc, sub) => acc + (sub.credits || 0), 0);
        return {
          id: sem.id, name: sem.name, sgpa: manualEntry.sgpa,
          percentage: manualEntry.sgpa > 0 ? manualEntry.sgpa * 9.5 : 0,
          totalCredits: officialCredits, earnedCredits: officialCredits,
          attemptedCredits: officialCredits, number: sem.number,
          isComplete: true, isManual: true
        };
      }
      const resolvedSubjects = sem.subjects.flatMap(sub => {
        if (sub.isGroup) {
          const selectedId = selectedOptions[sub.id];
          const selectedOpt = sub.options?.find((o: any) => o.id === selectedId) || 
                              globalOpenElectives?.find((o: any) => o.id === selectedId);
          return selectedOpt ? [selectedOpt] : [sub];
        }
        return [sub];
      });
      const rawSubjectsInSem = [...resolvedSubjects, ...(customSubjects[sem.id] || [])];
      
      // Strict Deduplication by Code
      const allSubjectsInSem: Subject[] = [];
      const seenCodes = new Set<string>();
      rawSubjectsInSem.forEach(sub => {
        const codeKey = sub.code?.trim().toUpperCase() || sub.id;
        if (!seenCodes.has(codeKey)) {
          seenCodes.add(codeKey);
          allSubjectsInSem.push(sub);
        }
      });
      
      const semGrades = allSubjectsInSem
        .filter(sub => (grades[sub.id] || exclusions[sub.id] === 'not-published') && exclusions[sub.id] !== 'not-taken')
        .map(sub => ({ 
          credits: sub.credits, 
          grade: (exclusions[sub.id] === 'not-published' ? 'F' : grades[sub.id]) as Grade 
        }));

      const sgpa = calculateSGPA(semGrades);
      
      const totalCredits = allSubjectsInSem
        .filter(s => exclusions[s.id] !== 'not-taken')
        .reduce((a, s) => a + s.credits, 0);

      const earnedCredits = allSubjectsInSem
        .filter(s => grades[s.id] && grades[s.id] !== 'F' && !exclusions[s.id])
        .reduce((a, s) => a + s.credits, 0);

      const attemptedCredits = semGrades.reduce((a, s) => a + s.credits, 0);

      return { 
        id: sem.id, 
        name: sem.name, 
        sgpa, 
        percentage: sgpa > 0 ? sgpa * 9.5 : 0, 
        totalCredits, 
        earnedCredits, 
        attemptedCredits, 
        number: sem.number, 
        isComplete: semGrades.length === allSubjectsInSem.filter(s => exclusions[s.id] !== 'not-taken').length, 
        isManual: false 
      };
    });
    const relevantSems = isLETMode ? semResults.filter(s => s.sgpa > 0 && s.number > 2) : semResults.filter(s => s.sgpa > 0);
    const cgpa = calculateCGPA(relevantSems.map(s => ({ sgpa: s.sgpa, totalCredits: s.attemptedCredits })));
    return { semResults, cgpa, totalPercentage: cgpa > 0 ? cgpa * 9.5 : 0 };
  }, [groupedSemesters, grades, exclusions, customSubjects, manualSgpas, isLETMode, selectedOptions, globalOpenElectives]);

  const resetCalculator = () => {
    setGrades({});
    setExclusions({});
    setCustomSubjects({});
    setManualSgpas({});
    setStudentName("");
    setSelectedOptions({});
    setActiveSessionId(null);
    localStorage.removeItem(`poly-cgpa-${program.id}`);
  };

  return {
    isLETMode, setIsLETMode,
    grades, setGrades,
    exclusions, setExclusions,
    customSubjects, setCustomSubjects,
    manualSgpas, setManualSgpas,
    expandedSem, setExpandedSem,
    studentName, setStudentName,
    selectedOptions, setSelectedOptions,
    activeSessionId, setActiveSessionId,
    results, displayedSemesters, resetCalculator
  };
}
