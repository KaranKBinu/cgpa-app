import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Grade } from '@/lib/calculator';
import { Subject } from '@/types/calculator';
import { Tooltip } from '../Tooltip';
import { ElectiveSelector } from './ElectiveSelector';

interface SubjectCardProps {
  sub: Subject;
  grade: Grade | '';
  exclusion: 'not-published' | 'not-taken' | null | undefined;
  onGradeChange: (id: string, grade: Grade) => void;
  onExclude: (id: string, type: 'not-published' | 'not-taken' | null) => void;
  onRemoveCustom?: (id: string) => void;

  // Elective selection props
  selectedOptionId?: string;
  onSelectOption?: (groupId: string, optionId: string) => void;
  groupedOpenElectives?: Record<string, any[]>;
}

const GRADES: Grade[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];

export const SubjectCard: React.FC<SubjectCardProps> = ({
  sub,
  grade,
  exclusion,
  onGradeChange,
  onExclude,
  onRemoveCustom,
  selectedOptionId,
  onSelectOption,
  groupedOpenElectives = {}
}) => {
  const [isSelectorOpen, setIsSelectorOpen] = React.useState(false);
  const isExcluded = !!exclusion;

  // If it's a group, we might have a selected option or not.
  // The 'sub' passed from SubjectsView now contains { ...group, selectedOpt }
  const groupData = sub.isGroup ? sub : null;
  const currentSub = groupData?.selectedOpt || sub;
  const isOpenElective = groupData?.category === 'Open Elective course';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "group relative rounded-[2.5rem] border-2 transition-all duration-300 hover:z-10",
        isSelectorOpen
          ? "z-50 bg-card border-primary ring-4 ring-primary/10 shadow-2xl"
          : isExcluded
            ? "bg-muted/40 border-border/20 grayscale opacity-60 z-0"
            : groupData
              ? "bg-primary/5 border-primary/20 hover:border-primary/40 shadow-lg shadow-primary/5 z-0"
              : "bg-surface border-border/50 hover:border-primary/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] z-0"
      )}
    >
      <div className="absolute top-0 right-0 p-3 flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10">
        <Tooltip content="Result Not Published" position="top" variant="emerald">
          <button
            onClick={() => onExclude(currentSub.id, exclusion === 'not-published' ? null : 'not-published')}
            className={cn(
              "h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all border border-border/50 shadow-sm cursor-pointer active:scale-90",
              exclusion === 'not-published' ? "bg-amber-500 text-black border-amber-600 shadow-amber-500/20" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            NP
          </button>
        </Tooltip>

        <Tooltip content={currentSub.isCustom ? "Remove Subject" : "Skip Subject"} position="top" variant="emerald">
          <button
            onClick={() => {
              if (currentSub.isCustom && onRemoveCustom) {
                onRemoveCustom(currentSub.id);
              } else {
                onExclude(currentSub.id, exclusion === 'not-taken' ? null : 'not-taken');
              }
            }}
            className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center transition-all border border-border/50 shadow-sm cursor-pointer active:scale-90",
              exclusion === 'not-taken' ? "bg-red-500 text-white border-red-600 shadow-red-500/20" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>

      <div className="p-4 lg:p-8 space-y-4 lg:space-y-6">
        {groupData ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-[11px] lg:text-[10px] font-black text-primary uppercase tracking-[0.3em]">{groupData.name}</p>
              <p className="text-xs lg:text-[11px] font-bold text-muted-foreground/60 leading-relaxed">
                {groupData.selectedOpt
                  ? "Switch to a different elective anytime."
                  : `Choose your ${isOpenElective ? "inter-departmental" : "specific"} elective course.`}
              </p>
            </div>

            <ElectiveSelector
              label={isOpenElective ? "Search your Open Elective" : "Select Elective"}
              options={groupData.options}
              groupedOptions={isOpenElective ? groupedOpenElectives : undefined}
              selectedId={selectedOptionId}
              onSelect={(optId) => onSelectOption?.(groupData.id, optId)}
              isOpenElective={isOpenElective}
              onOpenChange={setIsSelectorOpen}
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1.5 min-h-[20px]">
              <span className="text-[11px] lg:text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">{currentSub.code || 'VAR'}</span>
              {currentSub.isCustom && <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase tracking-widest">Added</span>}
            </div>
            <h3 className="text-base lg:text-lg font-black text-foreground tracking-tight leading-tight line-clamp-2 md:line-clamp-none min-h-[2.5em] md:min-h-0">{currentSub.name}</h3>
            <p className="text-sm lg:text-[11px] font-black text-muted-foreground mt-1.5 uppercase tracking-widest">{currentSub.credits} Credits</p>
          </div>
        )}

        {/* Only show grades if it's NOT a group OR if a group has a selection */}
        {(!groupData || groupData.selectedOpt) && (
          <div className={cn("space-y-4", groupData && "pt-4 border-t border-border/20")}>
            {groupData && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-foreground uppercase tracking-widest">{groupData.selectedOpt?.name}</span>
                <span className="text-xs font-black text-muted-foreground uppercase">{groupData.selectedOpt?.credits} Credits</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2 lg:gap-2">
              {GRADES.map((g) => (
                <button
                  key={g}
                  disabled={isExcluded}
                  onClick={() => onGradeChange(currentSub.id, g)}
                  className={cn(
                    "h-10 w-10 lg:h-11 lg:w-11 rounded-xl lg:rounded-xl text-sm lg:text-sm font-black transition-all flex items-center justify-center border-2 cursor-pointer shadow-sm disabled:opacity-70",
                    grade === g
                      ? "bg-primary border-primary text-black shadow-lg shadow-primary/20 scale-110"
                      : "bg-surface border-border text-muted-foreground hover:text-foreground hover:border-emerald-500/50 active:scale-90"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
