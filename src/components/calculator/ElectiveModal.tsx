import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, CheckCircle2 } from 'lucide-react';

interface ElectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  options: any[]; // These would be SyllabusSubject[] related
  onSelect: (optionId: string) => void;
  selectedId: string | undefined;
  title: string;
  groupedOptions?: Record<string, any[]>;
}

export const ElectiveModal: React.FC<ElectiveModalProps> = ({
  isOpen, onClose, searchQuery, setSearchQuery, options, onSelect, selectedId, title, groupedOptions
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-background/90 backdrop-blur-xl" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-card border border-border/50 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
          <div className="p-8 border-b border-border/50 shrink-0">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">{title}</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Search across departmental catalog</p>
              </div>
              <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-xl bg-card border border-border/50 text-muted-foreground hover:text-white transition-all"><X className="h-5 w-5" /></button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
              <input type="text" placeholder="Search course name or code..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-14 bg-background border-2 border-border/50 rounded-2xl pl-12 pr-6 text-sm font-bold focus:border-emerald-500/50 outline-none transition-all placeholder:text-muted-foreground/30" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 custom-scrollbar">
            {groupedOptions ? Object.entries(groupedOptions).map(([groupName, groupItems]) => {
              const filtered = groupItems.filter(opt => 
                opt.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                opt.code?.toLowerCase().includes(searchQuery.toLowerCase())
              );
              if (filtered.length === 0) return null;
              return (
                <div key={groupName} className="space-y-4">
                  <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] px-2">{groupName}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filtered.map((opt) => (
                      <button key={opt.id} onClick={() => { onSelect(opt.id); onClose(); }} className={`relative flex flex-col items-start p-5 rounded-[1.5rem] border-2 transition-all text-left group ${selectedId === opt.id ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10' : 'bg-card border-border/50 hover:border-emerald-500/50'}`}>
                        {selectedId === opt.id && <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-emerald-500" />}
                        <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest mb-1">{opt.code || 'UNCODED'}</span>
                        <span className="text-sm font-black text-foreground leading-tight">{opt.name}</span>
                        <span className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-tight">{opt.credits} Credits</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            }) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
