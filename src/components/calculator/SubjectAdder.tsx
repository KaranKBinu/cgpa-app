import React, { useState, useMemo } from 'react';
import { Plus, Search, Check, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Subject } from '@/types/calculator';

interface SubjectAdderProps {
  hiddenSubjects: Subject[];
  onAddExisting: (id: string) => void;
  onAddCustom: (name: string, credits: number) => void;
}

export const SubjectAdder: React.FC<SubjectAdderProps> = ({
  hiddenSubjects,
  onAddExisting,
  onAddCustom
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCredits, setCustomCredits] = useState<number>(0);

  const filteredHidden = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return hiddenSubjects;
    return hiddenSubjects.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.code?.toLowerCase().includes(query)
    );
  }, [hiddenSubjects, search]);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName && customCredits >= 0) {
      onAddCustom(customName, customCredits);
      setCustomName("");
      setCustomCredits(0);
      setShowCustomForm(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative overflow-hidden rounded-[2.5rem] border-2 border-dashed border-border bg-card/10 p-8 lg:p-12 hover:bg-card/20 hover:border-primary transition-all duration-500 flex flex-col items-center justify-center gap-4 w-full h-full min-h-[160px] shadow-lg shadow-black/5"
      >
        <div className="h-16 w-16 rounded-full bg-surface border-2 border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500 shadow-xl shadow-black/20">
          <Plus className={cn("h-6 w-6 text-muted-foreground group-hover:text-black transition-all", isOpen && "rotate-45")} />
        </div>
        <div className="text-center">
          <p className="text-xs font-black text-foreground uppercase tracking-widest mb-1">Add Course</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Restore or add custom</p>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => { setIsOpen(false); setShowCustomForm(false); }} />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-0 right-0 mb-4 z-[70] bg-card border-2 border-border/50 rounded-[2rem] shadow-2xl overflow-hidden min-w-[300px] flex flex-col max-h-[400px]"
            >
              {!showCustomForm ? (
                <>
                  <div className="p-4 border-b border-border/50 bg-muted/30">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">Restore Curriculum Subject</p>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search missing subjects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-background border border-border/50 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-primary transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                    {filteredHidden.length > 0 ? (
                      filteredHidden.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            onAddExisting(sub.id);
                            setIsOpen(false);
                            setSearch("");
                          }}
                          className="w-full text-left px-4 py-3 rounded-xl flex items-center justify-between group hover:bg-primary/10 transition-all mb-1"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-foreground">{sub.name}</span>
                            <span className="text-[9px] font-bold uppercase text-muted-foreground/60">{sub.code || 'VAR'} • {sub.credits} Credits</span>
                          </div>
                          <Plus className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))
                    ) : (
                      <div className="py-8 text-center px-6">
                        <AlertCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No matching subjects found in curriculum</p>
                      </div>
                    )}
                  </div>

                  <div className="p-2 bg-muted/20 border-t border-border/50">
                    <button
                      onClick={() => setShowCustomForm(true)}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-black transition-all group shadow-sm"
                    >
                      <Sparkles className="h-4 w-4 group-hover:animate-spin-slow" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Add Custom Subject Instead</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">New Custom Subject</p>
                     <button onClick={() => setShowCustomForm(false)} className="text-[10px] font-black text-muted-foreground uppercase hover:text-foreground">Back</button>
                  </div>
                  <form onSubmit={handleAddCustom} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest ml-1">Subject Name</label>
                      <input
                        autoFocus
                        required
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="e.g. Advanced Workshop"
                        className="w-full bg-background border border-border/50 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest ml-1">Credits</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.5"
                        value={customCredits}
                        onChange={(e) => setCustomCredits(Number(e.target.value))}
                        className="w-full bg-background border border-border/50 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all border border-emerald-400"
                    >
                      Add to Semester
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
