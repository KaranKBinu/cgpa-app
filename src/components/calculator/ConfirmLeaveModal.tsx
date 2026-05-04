import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Save, LogOut } from 'lucide-react';

interface ConfirmLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSave: () => void;
}

export const ConfirmLeaveModal: React.FC<ConfirmLeaveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onSave
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
           className="relative w-full max-w-md bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <AlertTriangle size={120} />
          </div>

          <div className="relative space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black tracking-tighter text-foreground">Unsaved Progress</h3>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">You have an active calculation</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              You're about to leave the calculator. Would you like to save your progress before you go?
            </p>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={onSave}
                className="w-full h-14 bg-emerald-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Save className="h-4 w-4" />
                <span>Save and Exit</span>
              </button>
              
              <button
                onClick={onConfirm}
                className="w-full h-14 bg-surface border border-border/50 text-foreground rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>Discard & Leave</span>
              </button>

              <button
                onClick={onClose}
                className="w-full h-12 text-muted-foreground font-bold text-xs uppercase tracking-widest hover:text-foreground transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
