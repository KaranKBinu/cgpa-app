import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  id: string;
  name: string;
  code?: string;
}

interface ElectiveSelectorProps {
  label: string;
  options?: Option[];
  groupedOptions?: Record<string, Option[]>;
  selectedId?: string;
  onSelect: (id: string) => void;
  isOpenElective?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ElectiveSelector: React.FC<ElectiveSelectorProps> = ({
  label,
  options = [],
  groupedOptions = {},
  selectedId,
  onSelect,
  isOpenElective,
  onOpenChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    onOpenChange?.(next);
  };

  const selectedOption = useMemo(() => {
    if (!selectedId) return null;
    const allOptions = [...options, ...Object.values(groupedOptions).flat()];
    return allOptions.find(o => o.id === selectedId);
  }, [selectedId, options, groupedOptions]);

  const filteredGroupedOptions = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return groupedOptions;

    const result: Record<string, Option[]> = {};
    Object.entries(groupedOptions).forEach(([groupName, groupOptions]) => {
      const filtered = groupOptions.filter(o => 
        o.name.toLowerCase().includes(query) || 
        o.code?.toLowerCase().includes(query)
      );
      if (filtered.length > 0) result[groupName] = filtered;
    });
    return result;
  }, [groupedOptions, search]);

  const filteredOptions = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return options;
    return options.filter(o => 
      o.name.toLowerCase().includes(query) || 
      o.code?.toLowerCase().includes(query)
    );
  }, [options, search]);

  const hasAnyResults = filteredOptions.length > 0 || Object.keys(filteredGroupedOptions).length > 0;

  return (
    <div className="relative w-full">
      <button
        onClick={handleToggle}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-surface border-2 transition-all duration-300",
          isOpen ? "border-primary shadow-lg shadow-primary/10" : "border-border/50 hover:border-border"
        )}
      >
        <div className="flex flex-col items-start min-w-0">
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{label}</span>
          <span className={cn(
            "text-sm font-bold truncate w-full",
            selectedOption ? "text-foreground" : "text-muted-foreground italic"
          )}>
            {selectedOption ? selectedOption.name : "Choose an option..."}
          </span>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div className="fixed inset-0 z-40" onClick={() => { setIsOpen(false); onOpenChange?.(false); }} />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-0 right-0 top-full mt-2 z-50 bg-card border-2 border-border/50 rounded-2xl shadow-2xl overflow-hidden min-w-[280px] max-h-[400px] flex flex-col"
            >
              {isOpenElective && (
                <div className="p-3 border-b border-border/50 bg-muted/30">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search department or course..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-background border border-border/50 rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                {!hasAnyResults ? (
                  <div className="py-8 text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No results found</p>
                  </div>
                ) : (
                  <>
                    {filteredOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          onSelect(opt.id);
                          setIsOpen(false);
                          onOpenChange?.(false);
                          setSearch("");
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl flex items-center justify-between group transition-all mb-1",
                          selectedId === opt.id ? "bg-primary text-black" : "hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-black">{opt.name}</span>
                          {opt.code && <span className={cn("text-[9px] font-bold uppercase", selectedId === opt.id ? "text-black/60" : "text-muted-foreground/60")}>{opt.code}</span>}
                        </div>
                        {selectedId === opt.id && <Check className="h-4 w-4" strokeWidth={3} />}
                      </button>
                    ))}

                    {Object.entries(filteredGroupedOptions).map(([groupName, groupOptions]) => (
                      <div key={groupName} className="mb-4">
                        <div className="px-4 py-2">
                           <span className="text-[9px] font-black text-primary/50 uppercase tracking-[0.2em]">{groupName}</span>
                        </div>
                        {groupOptions.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              onSelect(opt.id);
                              setIsOpen(false);
                              onOpenChange?.(false);
                              setSearch("");
                            }}
                            className={cn(
                              "w-full text-left px-4 py-3 rounded-xl flex items-center justify-between group transition-all mb-1",
                              selectedId === opt.id ? "bg-primary text-black" : "hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-black">{opt.name}</span>
                              {opt.code && <span className={cn("text-[9px] font-bold uppercase", selectedId === opt.id ? "text-black/60" : "text-muted-foreground/60")}>{opt.code}</span>}
                            </div>
                            {selectedId === opt.id && <Check className="h-4 w-4" strokeWidth={3} />}
                          </button>
                        ))}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
