import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Grade } from '@/lib/calculator';
import { Subject } from '@/types/calculator';
import { Tooltip } from '../Tooltip';

interface SubjectCardProps {
  sub: Subject;
  grade: Grade | '';
  exclusion: 'not-published' | 'not-taken' | null | undefined;
  onGradeChange: (id: string, grade: Grade) => void;
  onExclude: (id: string, type: 'not-published' | 'not-taken' | null) => void;
  onRemoveCustom?: (id: string) => void;
  onSelectElective?: (id: string) => void;
}

const GRADES: Grade[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];

export const SubjectCard: React.FC<SubjectCardProps> = ({
  sub,
  grade,
  exclusion,
  onGradeChange,
  onExclude,
  onRemoveCustom,
  onSelectElective
}) => {
  const isExcluded = !!exclusion;
  
  if (sub.isGroup) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative overflow-hidden rounded-[2rem] border-2 border-dashed border-border/50 bg-card/10 p-4 lg:p-8 hover:bg-card/20 hover:border-emerald-500/30 transition-all duration-500 flex flex-col items-center justify-center min-h-[160px] gap-4"
      >
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{sub.name}</p>
          <p className="text-xs font-bold text-muted-foreground/60 max-w-[200px]">Optional or Elective course slot not yet filled</p>
        </div>
        <button
          onClick={() => onSelectElective?.(sub.id)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-black font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Search className="h-4 w-4" />
          Select Elective
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative rounded-[2rem] border-2 transition-all duration-500 hover:z-10",
        isExcluded 
          ? "bg-muted/40 border-border/20 grayscale opacity-60" 
          : "bg-surface border-border/50 hover:border-primary/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
      )}
    >
      <div className="absolute top-0 right-0 p-3 flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
        <Tooltip content="Result Not Published" position="top" variant="emerald">
          <button
            onClick={() => onExclude(sub.id, exclusion === 'not-published' ? null : 'not-published')}
            className={cn(
              "h-8 px-3 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all",
              exclusion === 'not-published' ? "bg-amber-500 text-black" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            NP
          </button>
        </Tooltip>
        
        <Tooltip content={sub.isCustom ? "Remove Subject" : "Skip Subject"} position="top" variant="emerald">
          <button
            onClick={() => {
              if (sub.isCustom && onRemoveCustom) {
                onRemoveCustom(sub.id);
              } else {
                onExclude(sub.id, exclusion === 'not-taken' ? null : 'not-taken');
              }
            }}
            className={cn(
              "h-8 px-3 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all",
              exclusion === 'not-taken' ? "bg-red-500 text-white" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            {sub.isCustom ? <Trash2 className="h-3.5 w-3.5" /> : "Skip"}
          </button>
        </Tooltip>
      </div>

      <div className="p-4 lg:p-8 space-y-4 lg:space-y-6">
        <div>
          <div className="flex items-center justify-between mb-1 min-h-[20px]">
             <span className="text-[8px] lg:text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">{sub.code || 'VAR'}</span>
             {sub.isCustom && <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase tracking-widest">Added</span>}
          </div>
          <h3 className="text-sm lg:text-lg font-black text-foreground tracking-tight leading-tight line-clamp-2 md:line-clamp-none min-h-[2.5em] md:min-h-0">{sub.name}</h3>
          <p className="text-[9px] lg:text-[11px] font-black text-muted-foreground mt-1 uppercase tracking-widest">{sub.credits} Credits</p>
        </div>

        <div className="flex flex-wrap gap-1.5 lg:gap-2">
          {GRADES.map((g) => (
            <button
              key={g}
              disabled={isExcluded}
              onClick={() => onGradeChange(sub.id, g)}
              className={cn(
                "h-8 w-8 lg:h-11 lg:w-11 rounded-lg lg:rounded-xl text-xs lg:text-sm font-black transition-all flex items-center justify-center border-2",
                grade === g
                  ? "bg-primary border-primary text-black shadow-lg shadow-primary/20 scale-110"
                  : "bg-surface border-border/50 text-muted-foreground hover:text-foreground hover:border-border active:scale-90"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
