import React from 'react';
import { Calculator as CalcIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Semester } from '@/types/calculator';

interface ManualEntryViewProps {
  currentSem: Semester | undefined;
  manualSgpas: Record<string, { sgpa: number; credits: number } | null>;
  setManualSgpas: React.Dispatch<React.SetStateAction<Record<string, { sgpa: number; credits: number } | null>>>;
}

export const ManualEntryView: React.FC<ManualEntryViewProps> = ({
  currentSem,
  manualSgpas,
  setManualSgpas
}) => {
  if (!currentSem) return null;
  const manualData = manualSgpas[currentSem.id];

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 rounded-[3rem] border-2 border-primary/20 bg-card/10 backdrop-blur-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
        <CalcIcon size={200} />
      </div>

      <div className="relative space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-2">
            Manual Override Mode
          </div>
          <h3 className="text-3xl font-black tracking-tighter text-foreground">Semester Results</h3>
          <p className="text-muted-foreground text-sm font-medium">Input your officially obtained SGPA for this term.</p>
        </div>

        <div className="grid grid-cols-1 max-w-xs mx-auto">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center block">Total SGPA</label>
            <input 
              type="number" 
              step="0.01" 
              min="0" 
              max="10"
              placeholder="0.00"
              value={manualData?.sgpa || ""}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setManualSgpas(prev => ({ ...prev, [currentSem.id]: { sgpa: val || 0, credits: 0 } }));
              }}
              className="w-full h-16 bg-background rounded-2xl border-2 border-border px-6 text-3xl font-black text-foreground outline-none focus:border-primary/50 transition-all text-center"
            />
          </div>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 text-center">
            <p className="text-primary font-black text-xs uppercase tracking-widest mb-1">Resulting Equivalent %</p>
            <p className="text-4xl font-black text-foreground tracking-tighter">
              {manualData && manualData.sgpa > 0 ? ((manualData.sgpa - 0.5) * 10).toFixed(1) : "0.0"}%
            </p>
        </div>
      </div>
    </div>
  );
};
