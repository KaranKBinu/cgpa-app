import React from 'react';
import { SubjectCard } from './SubjectCard';
import { Grade } from '@/lib/calculator';
import { Subject, Semester } from '@/types/calculator';
import { SubjectAdder } from './SubjectAdder';

interface SubjectsViewProps {
  currentSem: Semester | undefined;
  grades: Record<string, Grade | "">;
  exclusions: Record<string, 'not-published' | 'not-taken' | null>;
  customSubjects: Record<string, Subject[]>;
  selectedOptions: Record<string, string>;
  globalOpenElectives: any[];
  onGradeChange: (id: string, grade: Grade) => void;
  onExclude: (id: string, type: 'not-published' | 'not-taken' | null) => void;
  onRemoveCustom: (semId: string, subjectId: string) => void;
  setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setCustomSubjects: React.Dispatch<React.SetStateAction<Record<string, Subject[]>>>;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  currentSem,
  grades,
  exclusions,
  customSubjects,
  selectedOptions,
  globalOpenElectives,
  onGradeChange,
  onExclude,
  onRemoveCustom,
  setSelectedOptions,
  setCustomSubjects
}) => {
  if (!currentSem) return null;

  const resolvedSubjects = currentSem.subjects.map(sub => {
    if (sub.isGroup) {
      const selectedId = selectedOptions[sub.id];
      const selectedOpt = sub.options?.find((o: any) => o.id === selectedId) || 
                          globalOpenElectives?.find((o: any) => o.id === selectedId);
      return { ...sub, selectedOpt };
    }
    return sub;
  });

  // Find all subjects (curriculum + global open electives) that are currently hidden (marked as not-taken)
  const curriculumHidden = React.useMemo(() => {
    if (!currentSem) return [];
    
    // 1. Core curriculum subjects
    const hiddenCurriculum = currentSem.subjects.filter(sub => exclusions[sub.id] === 'not-taken');
    
    // 2. Global open electives that might have been skipped
    const hiddenGlobal = globalOpenElectives.filter(sub => exclusions[sub.id] === 'not-taken');
    
    // Deduplicate and return
    const allHidden = [...hiddenCurriculum, ...hiddenGlobal];
    const seen = new Set();
    return allHidden.filter(s => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [currentSem, exclusions, globalOpenElectives]);

  const allSubjectsToShow = React.useMemo(() => {
    return [...resolvedSubjects, ...(customSubjects[currentSem.id] || [])]
      .filter(sub => {
        if (sub.isGroup && sub.selectedOpt) {
          return exclusions[sub.selectedOpt.id] !== 'not-taken';
        }
        return exclusions[sub.id] !== 'not-taken';
      });
  }, [resolvedSubjects, customSubjects, currentSem.id, exclusions]);

  const groupedOpenElectives = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    globalOpenElectives.forEach(sub => {
      const progName = sub.semester?.program?.name || "Other Department";
      if (!groups[progName]) groups[progName] = [];
      groups[progName].push(sub);
    });
    return groups;
  }, [globalOpenElectives]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
      {allSubjectsToShow.map((sub) => (
        <SubjectCard
          key={sub.id}
          sub={sub}
          grade={sub.isGroup && sub.selectedOpt ? (grades[sub.selectedOpt.id] || '') : (grades[sub.id] || '')}
          exclusion={sub.isGroup && sub.selectedOpt ? exclusions[sub.selectedOpt.id] : exclusions[sub.id]}
          onGradeChange={onGradeChange}
          onExclude={onExclude}
          onRemoveCustom={(id) => onRemoveCustom(currentSem.id, id)}
          selectedOptionId={sub.isGroup ? selectedOptions[sub.id] : undefined}
          onSelectOption={(groupId, optId) => {
             setSelectedOptions((prev: any) => ({ ...prev, [groupId]: optId }));
          }}
          groupedOpenElectives={groupedOpenElectives}
        />
      ))}

      {/* Improved Add Subject Control */}
      <SubjectAdder 
        hiddenSubjects={curriculumHidden}
        onAddExisting={(subId) => onExclude(subId, null)}
        onAddCustom={(name, credits) => {
          setCustomSubjects((p: any) => ({
            ...p,
            [currentSem.id]: [...(p[currentSem.id] || []), { 
              id: `c-${Math.random().toString(36).substring(2, 9)}`, 
              name, 
              credits, 
              isCustom: true 
            }]
          }));
        }}
      />
    </div>
  );
};
