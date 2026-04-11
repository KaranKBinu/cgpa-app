"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronRight, Save, BarChart3, Calculator as CalcIcon, 
    Trash2, CheckCircle2, Loader2, Plus, X, Download, 
    LayoutDashboard, History, Settings, LogOut, FileText
} from 'lucide-react';
import { calculateSGPA, calculateCGPA, Grade, GRADE_POINTS } from '@/lib/calculator';
import { saveCalculation } from '@/app/actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Subject {
  id: string;
  code?: string;
  name: string;
  credits: number;
  isCustom?: boolean;
}

interface Semester {
  id: string;
  name: string;
  number: number;
  subjects: Subject[];
  isManual?: boolean;
  sgpa?: number;
}

interface Program {
  id: string;
  name: string;
  code: string;
  semesters: Semester[];
}

export default function Calculator({ program }: { program: Program }) {
  const groupedSemesters = useMemo(() => {
    // Reverted to simple mapping to prevent missing/confusing semesters (S3/S6)
    return program.semesters.map(sem => ({
      ...sem,
      originalIds: [sem.id]
    }));
  }, [program.semesters]);

  const [grades, setGrades] = useState<Record<string, Grade>>({});
  const [exclusions, setExclusions] = useState<Record<string, 'not-published' | 'not-taken' | null>>({});
  const [customSubjects, setCustomSubjects] = useState<Record<string, Subject[]>>({});
  const [manualSgpas, setManualSgpas] = useState<Record<string, { sgpa: number, credits: number } | null>>({});
  const [expandedSem, setExpandedSem] = useState<string | null>(groupedSemesters[0]?.id || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem(`poly-cgpa-${program.id}`);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.grades) setGrades(data.grades);
            if (data.exclusions) setExclusions(data.exclusions);
            if (data.customSubjects) setCustomSubjects(data.customSubjects);
            if (data.manualSgpas) setManualSgpas(data.manualSgpas);
        } catch (e) {
            console.error('Failed to load local state', e);
        }
    }
  }, [program.id]);

  useEffect(() => {
    const state = { grades, exclusions, customSubjects, manualSgpas };
    localStorage.setItem(`poly-cgpa-${program.id}`, JSON.stringify(state));
  }, [program.id, grades, exclusions, customSubjects, manualSgpas]);

  const results = useMemo(() => {
    const semResults = groupedSemesters.map(sem => {
      const manualEntry = manualSgpas[sem.id];
      if (manualEntry) {
        return {
            id: sem.id, name: sem.name, sgpa: manualEntry.sgpa,
            percentage: manualEntry.sgpa > 0 ? (manualEntry.sgpa - 0.5) * 10 : 0,
            totalCredits: manualEntry.credits, earnedCredits: manualEntry.credits,
            isComplete: true, isManual: true
        };
      }
      const allSubjectsInSem = [...sem.subjects, ...(customSubjects[sem.id] || [])];
      const semGrades = allSubjectsInSem
        .filter(sub => grades[sub.id] && !exclusions[sub.id])
        .map(sub => ({ credits: sub.credits, points: GRADE_POINTS[grades[sub.id]] }));
      const sgpa = calculateSGPA(semGrades);
      const totalCredits = allSubjectsInSem.filter(s => exclusions[s.id] !== 'not-taken').reduce((a, s) => a + s.credits, 0);
      const earnedCredits = allSubjectsInSem.filter(s => grades[s.id] && grades[s.id] !== 'F' && !exclusions[s.id]).reduce((a, s) => a + s.credits, 0);
      return { id: sem.id, name: sem.name, sgpa, percentage: sgpa > 0 ? (sgpa - 0.5) * 10 : 0, totalCredits, earnedCredits, isComplete: semGrades.length === allSubjectsInSem.filter(s => !exclusions[s.id]).length, isManual: false };
    });
    const cgpa = calculateCGPA(semResults);
    const totalPercentage = cgpa > 0 ? (cgpa - 0.5) * 10 : 0;
    return { semResults, cgpa, totalPercentage };
  }, [groupedSemesters, grades, exclusions, customSubjects, manualSgpas]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    const semestersToSave = groupedSemesters.map(sem => {
        const res = results.semResults.find(r => r.id === sem.id)!;
        return {
            id: sem.id, name: sem.name, sgpa: res.sgpa, credits: res.earnedCredits, isManual: res.isManual,
            subjects: sem.subjects.filter(s => grades[s.id]).map(s => ({ id: s.id, name: s.name, credits: s.credits, grade: grades[s.id], points: GRADE_POINTS[grades[s.id]], code: s.code }))
        }
    }).filter(s => s.sgpa > 0);
    const res = await saveCalculation({ programId: program.id, label: `Results for ${program.code}`, cgpa: results.cgpa, semesters: semestersToSave });
    setIsSaving(false);
    if (res.success) { setSaveStatus('success'); setTimeout(() => router.push('/history'), 1000); }
    else setSaveStatus('error');
  };

  const currentSem = groupedSemesters.find(s => s.id === expandedSem);
  const currentSemRes = results.semResults.find(r => r.id === expandedSem);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 border-r border-standard flex flex-col bg-surface">
        <div className="p-6 border-b border-standard flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-black shadow-lg shadow-emerald-500/20">P</div>
          <span className="hidden lg:block font-black tracking-tighter text-xl">Poly<span className="text-primary">CGPA</span></span>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <div className="hidden lg:block px-4 py-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">Semesters</div>
          {groupedSemesters.map((sem) => {
            const res = results.semResults.find(r => r.id === sem.id);
            const isActive = sem.id === expandedSem;
            return (
              <button 
                key={sem.id}
                onClick={() => setExpandedSem(sem.id)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-all group",
                  isActive ? "bg-white/5 text-primary" : "text-muted hover:bg-white/[0.02] hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("h-2 w-2 rounded-full transition-all", isActive ? "bg-primary scale-125" : "bg-white/10 group-hover:bg-white/30")} />
                  <span className="hidden lg:block font-bold text-sm">S{sem.number}</span>
                </div>
                {res && res.sgpa > 0 && <span className="hidden lg:block text-[10px] font-mono opacity-60">{res.sgpa.toFixed(2)}</span>}
                <div className="lg:hidden font-black text-xs">{sem.number}</div>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-standard bg-white/[0.01]">
          <Link href="/history" className="flex items-center gap-3 p-3 rounded-xl text-muted hover:bg-white/5 hover:text-white transition-all">
             <History className="h-5 w-5" />
             <span className="hidden lg:block font-bold text-sm">History</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-surface-raised">
        {/* Modern Sticky Header */}
        <header className="h-20 border-b border-standard flex items-center justify-between px-8 bg-black/50 backdrop-blur-xl z-50">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-lg font-black tracking-tight">{program.name} <span className="text-muted ml-2 font-mono text-sm">{program.code}</span></h1>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-muted uppercase">Global CGPA</span>
                <span className="text-xl font-black text-primary">{results.cgpa.toFixed(2)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-muted uppercase">Percentage</span>
                <span className="text-xl font-black text-white/80">{results.totalPercentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={isSaving || results.cgpa === 0} className={cn(
                "h-10 px-6 rounded-lg font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95",
                saveStatus === 'success' ? "bg-emerald-500/20 text-primary border border-emerald-500/30" : "bg-primary hover:bg-emerald-400 text-black shadow-lg shadow-primary/20"
            )}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : saveStatus === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {isSaving ? 'Saving' : saveStatus === 'success' ? 'Saved' : 'Save Session'}
            </button>
            <button onClick={() => window.print()} className="h-10 w-10 border border-standard rounded-lg flex items-center justify-center hover:bg-white/5 transition-all">
              <Download className="h-4 w-4 text-muted" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar animate-fade-in">
          <div className="max-w-5xl mx-auto space-y-12">
            
            {/* Semester Context & Local Results */}
            <div className="flex items-end justify-between border-b border-standard pb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                   <div className="h-1 w-8 bg-primary rounded-full shadow-[0_0_10px_var(--primary-glow)]" />
                   <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">{currentSem?.name} Scope</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter">Academic Matrix</h2>
              </div>
              
              {currentSemRes && currentSemRes.sgpa > 0 && (
                <div className="flex gap-12 text-right">
                  <div>
                    <p className="text-[10px] font-black text-muted uppercase mb-1">Semester SGPA</p>
                    <p className="text-4xl font-black text-white tracking-tighter">{currentSemRes.sgpa.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted uppercase mb-1">Marks Equiv.</p>
                    <p className="text-4xl font-black text-white/40 tracking-tighter">{currentSemRes.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input Dashboard */}
            <div className="grid grid-cols-1 gap-1">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-black text-muted uppercase tracking-widest border-b border-white/5">
                <div className="col-span-1">CODE</div>
                <div className="col-span-1 text-center">CR</div>
                <div className="col-span-6">COURSE DESCRIPTION</div>
                <div className="col-span-4 text-right">FINAL GRADE</div>
              </div>

              {currentSem?.subjects.map((sub) => (
                <div key={sub.id} className={cn(
                  "grid grid-cols-12 gap-4 px-6 py-4 items-center group transition-colors",
                  exclusions[sub.id] ? "opacity-20 grayscale" : "hover:bg-white/[0.02]"
                )}>
                  <div className="col-span-1 font-mono text-[10px] text-muted">{sub.code || 'CORE'}</div>
                  <div className="col-span-1 text-center">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-bold text-white/40 border border-standard">{sub.credits}</span>
                  </div>
                  <div className="col-span-6">
                    <p className="font-bold text-sm tracking-tight">{sub.name}</p>
                  </div>
                  <div className="col-span-4 flex justify-end items-center gap-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setExclusions(prev => ({...prev, [sub.id]: prev[sub.id] === 'not-published' ? null : 'not-published'}))} title="Not Published" className={cn("h-7 w-7 rounded-md flex items-center justify-center border transition-all", exclusions[sub.id] === 'not-published' ? "bg-amber-500 border-amber-500 text-black" : "border-standard text-white/20 hover:text-white")}><Plus className="h-3.5 w-3.5 rotate-45" /></button>
                      <button onClick={() => setExclusions(prev => ({...prev, [sub.id]: prev[sub.id] === 'not-taken' ? null : 'not-taken'}))} title="Not Taken" className={cn("h-7 w-7 rounded-md flex items-center justify-center border transition-all", exclusions[sub.id] === 'not-taken' ? "bg-red-500 border-red-500 text-black" : "border-standard text-white/20 hover:text-white")}><X className="h-3.5 w-3.5" /></button>
                    </div>
                    <select 
                      disabled={!!exclusions[sub.id]}
                      value={grades[sub.id] || ''} 
                      onChange={(e) => setGrades(prev => ({...prev, [sub.id]: e.target.value as Grade}))}
                      className={cn(
                        "w-32 bg-transparent border rounded-lg py-2 px-3 text-xs font-black text-center appearance-none cursor-pointer outline-none transition-all",
                        grades[sub.id] 
                          ? "border-emerald-500/50 text-primary bg-emerald-500/5" 
                          : "border-standard text-white/20 hover:border-white/30"
                      )}
                    >
                      <option value="" disabled className="bg-black">GRADE</option>
                      {Object.keys(GRADE_POINTS).map(g => (
                        <option key={g} value={g} className="bg-black text-white">{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              
              {/* Footer Actions */}
              <div className="mt-12 flex items-center justify-between p-8 rounded-2xl bg-surface border border-standard">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                        const newGrades = {...grades};
                        currentSem?.subjects.forEach(s => delete newGrades[s.id]);
                        setGrades(newGrades);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" /> Reset Grid
                  </button>
                  <button 
                    onClick={() => {
                        const newSub: Subject = { id: `custom-${Math.random()}`, name: 'New Elective Course', credits: 3, isCustom: true };
                        setCustomSubjects(prev => ({ ...prev, [expandedSem!]: [...(prev[expandedSem!] || []), newSub] }));
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-500/40 hover:text-primary hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/20"
                  >
                    <Plus className="h-4 w-4" /> Add Row
                  </button>
                </div>
                <div className="flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                   <p className="text-[10px] font-black text-muted uppercase tracking-widest leading-none">SIITR REV2021 Engine Activated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
