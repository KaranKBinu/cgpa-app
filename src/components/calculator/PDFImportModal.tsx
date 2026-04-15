import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, FileUp, Loader2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingFiles: any[];
  pdfPassword: string;
  setPdfPassword: (pw: string) => void;
  isProcessing: boolean;
  onConfirm: () => void;
  errorMessage: string | null;
  useSamePassword: boolean;
  setUseSamePassword: (val: boolean) => void;
  s6Pathway: 'normal' | 'internship';
  setS6Pathway: (val: 'normal' | 'internship') => void;
}

export const PDFImportModal: React.FC<PDFImportModalProps> = ({
  isOpen, onClose, pendingFiles, pdfPassword, setPdfPassword, isProcessing, onConfirm, errorMessage, useSamePassword, setUseSamePassword, s6Pathway, setS6Pathway
}) => {
  const [showPdfPassword, setShowPdfPassword] = useState(false);
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-background/90 backdrop-blur-xl" 
        />
        
        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.95 }} 
          className="relative w-full max-w-md bg-card border border-border/50 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Import Transcripts</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Upload official PDF results</p>
            </div>
            <button 
              onClick={onClose} 
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-surface border border-border/50 text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Conditional Content: Upload or Password/Pathway */}
          {!pendingFiles.length ? (
            <div 
              onClick={() => (document.getElementById('pdf-upload') as any)?.click()}
              className="group cursor-pointer border-2 border-dashed border-border/50 rounded-[2rem] p-12 flex flex-col items-center gap-4 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
            >
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center transition-transform group-hover:scale-110">
                <FileUp className="h-8 w-8 text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="font-black text-sm uppercase tracking-widest text-foreground">Click to browse</p>
                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Supports multiple official PDFs</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">PDF Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <input 
                    type={showPdfPassword ? "text" : "password"}
                    placeholder="Enter password (if any)..."
                    value={pdfPassword}
                    onChange={(e) => setPdfPassword(e.target.value)}
                    className="w-full h-14 bg-background border-2 border-border/50 rounded-2xl pl-12 pr-12 text-sm font-bold placeholder:text-muted-foreground/30 focus:border-emerald-500/50 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPdfPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPdfPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* S6 Pathway Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Sem 6 Pathway (If applicable)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setS6Pathway('normal')}
                    className={cn(
                      "h-12 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all",
                      s6Pathway === 'normal' ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-background border-border/50 text-muted-foreground hover:border-border"
                    )}
                  >
                    Normal Pathway
                  </button>
                  <button 
                    onClick={() => setS6Pathway('internship')}
                    className={cn(
                      "h-12 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all",
                      s6Pathway === 'internship' ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-background border-border/50 text-muted-foreground hover:border-border"
                    )}
                  >
                    Internship
                  </button>
                </div>
              </div>

              {/* Multiple Files Logic */}
              {pendingFiles.length > 1 && (
                <button 
                  onClick={() => setUseSamePassword(!useSamePassword)}
                  className="flex items-center gap-3 w-full p-2 hover:bg-white/5 rounded-lg transition-all"
                >
                  <div className={cn("h-5 w-5 rounded border-2 transition-all flex items-center justify-center", useSamePassword ? 'bg-emerald-500 border-emerald-500' : 'border-border/50')}>
                    {useSamePassword && <X className="h-3 w-3 text-black rotate-45" />}
                  </div>
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Use for all files</span>
                </button>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{errorMessage}</p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="w-full h-14 mt-6 bg-emerald-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span>Start Extraction</span>
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
