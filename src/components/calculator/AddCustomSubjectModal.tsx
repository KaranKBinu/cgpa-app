import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, BookOpen, Hash } from 'lucide-react';

interface AddCustomSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, credits: number) => void;
}

export const AddCustomSubjectModal: React.FC<AddCustomSubjectModalProps> = ({
  isOpen, onClose, onConfirm
}) => {
  const [name, setName] = useState("");
  const [credits, setCredits] = useState("3");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isNaN(parseFloat(credits))) {
      onConfirm(name.trim(), parseFloat(credits));
      setName("");
      setCredits("3");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-background/90 backdrop-blur-xl" 
        />
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="relative w-full max-w-md bg-card border border-border/50 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Plus className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black text-foreground">Add Custom Course</h3>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
                <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Course Name</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <input 
                    autoFocus
                    type="text"
                    placeholder="e.g. Microprocessors Lab"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-14 bg-background border-2 border-border/50 rounded-2xl pl-12 pr-6 text-sm font-bold placeholder:text-muted-foreground/30 focus:border-primary/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Credits</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <input 
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    placeholder="3"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    className="w-full h-14 bg-background border-2 border-border/50 rounded-2xl pl-12 pr-6 text-sm font-bold placeholder:text-muted-foreground/30 focus:border-emerald-500/50 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full h-14 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:grayscale"
            >
              <span>Add to Semester</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
