import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Loader2, Save, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaveSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  setStudentName: (name: string) => void;
  isSaving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
  handleSave: () => void;
  activeSessionId: string | null;
}

export const SaveSessionModal: React.FC<SaveSessionModalProps> = ({
  isOpen,
  onClose,
  studentName,
  setStudentName,
  isSaving,
  saveStatus,
  handleSave,
  activeSessionId
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />
        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.9, y: 20 }}
           className="relative w-full max-w-lg bg-card border border-border/50 rounded-[3rem] p-8 lg:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Save size={140} />
          </div>

          <div className="relative space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-black tracking-tighter text-foreground">Save Your Progress</h3>
                <p className="text-muted-foreground text-sm font-medium">Sync results to your academic dashboard.</p>
              </div>
              <button 
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-surface border border-border/50 text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Session / Student Name</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <input 
                    type="text"
                    placeholder="Enter semester or student identity..."
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full h-14 bg-background border-2 border-border/50 rounded-2xl pl-12 pr-6 text-sm font-bold placeholder:text-muted-foreground/30 focus:border-emerald-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-4">
                 <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500">
                    <CheckCircle2 className="h-5 w-5" />
                 </div>
                 <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide leading-relaxed">
                   Your calculation will be {activeSessionId ? "updated in" : "added to"} your account history and can be accessed from any device.
                 </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-16 bg-emerald-500 text-black rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>{activeSessionId ? "Update Session" : "Confirm Saving"}</span>
                  </>
                )}
              </button>

              {saveStatus === 'success' && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-emerald-500 font-bold text-xs"
                >
                  Academic record persistent. Success!
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
