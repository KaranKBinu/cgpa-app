import React from 'react';
import { Plus } from 'lucide-react';
import { SubjectCard } from './SubjectCard';
import { Grade } from '@/lib/calculator';
import { Subject, Semester } from '@/types/calculator';

interface SubjectsViewProps {
  currentSem: Semester | undefined;
  grades: Record<string, Grade>;
  exclusions: Record<string, 'not-published' | 'not-taken' | null>;
  customSubjects: Record<string, Subject[]>;
  selectedOptions: Record<string, string>;
  globalOpenElectives: any[];
  onGradeChange: (id: string, grade: Grade) => void;
  onExclude: (id: string, type: 'not-published' | 'not-taken' | null) => void;
  onAddCustom: (semId: string) => void;
  onRemoveCustom: (semId: string, subjectId: string) => void;
  onOpenElectiveSearch: (semId: string, groupId: string) => void;
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
  onAddCustom,
  onRemoveCustom,
  onOpenElectiveSearch
}) => {
  if (!currentSem) return null;

  const resolvedSubjects = currentSem.subjects.flatMap(sub => {
    if (sub.isGroup) {
      const selectedId = selectedOptions[sub.id];
      const selectedOpt = sub.options?.find((o: any) => o.id === selectedId) || 
                          globalOpenElectives?.find((o: any) => o.id === selectedId);
      return selectedOpt ? [selectedOpt] : [sub];
    }
    return [sub];
  });

  const allSubjectsToShow = [...resolvedSubjects, ...(customSubjects[currentSem.id] || [])];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
      {allSubjectsToShow.map((sub) => (
        <SubjectCard
          key={sub.id}
          sub={sub}
          grade={grades[sub.id] || ''}
          exclusion={exclusions[sub.id]}
          onGradeChange={onGradeChange}
          onExclude={onExclude}
          onRemoveCustom={(id) => onRemoveCustom(currentSem.id, id)}
          onSelectElective={sub.isGroup ? () => onOpenElectiveSearch(currentSem.id, sub.id) : undefined}
        />
      ))}

      {/* Add Custom Course Card */}
      <button
        onClick={() => onAddCustom(currentSem.id)}
        className="group relative overflow-hidden rounded-[2rem] border-2 border-dashed border-border/50 bg-card/10 p-8 lg:p-12 hover:bg-card/20 hover:border-primary/50 transition-all duration-500 flex flex-col items-center justify-center gap-4 group"
      >
        <div className="h-16 w-16 rounded-full bg-surface border-2 border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500 shdaow-xl shadow-black/20">
          <Plus className="h-6 w-6 text-muted-foreground group-hover:text-black transition-colors" />
        </div>
        <div className="text-center">
          <p className="text-xs font-black text-foreground uppercase tracking-widest mb-1">Add Course</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Manual result entry</p>
        </div>
      </button>
    </div>
  );
};
