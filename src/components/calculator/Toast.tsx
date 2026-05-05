import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastData {
  id: string;
  message: string;
  variant?: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

const ICONS = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
  error: <XCircle className="h-5 w-5 text-red-500 shrink-0" />,
  info: <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0" />,
};

const BORDER = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  info: 'border-blue-400/30 bg-blue-400/10',
};

const TEXT = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-blue-300',
};

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
  const variant = toast.variant ?? 'success';

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl shadow-black/30 min-w-[260px] max-w-[360px]',
        BORDER[variant]
      )}
    >
      {ICONS[variant]}
      <span className={cn('text-xs font-black uppercase tracking-widest leading-snug flex-1', TEXT[variant])}>
        {toast.message}
      </span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-muted-foreground hover:text-foreground transition-colors ml-1 shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
    <AnimatePresence mode="popLayout">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </AnimatePresence>
  </div>
);
