"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, Save, BarChart3, Calculator as CalcIcon,
  Trash2, CheckCircle2, Loader2, Plus, X, Download,
  LayoutDashboard, History, Settings, LogOut, FileText, FileDown
} from 'lucide-react';
import { calculateSGPA, calculateCGPA, groupSemesters, Grade, GRADE_POINTS } from '@/lib/calculator';
import { saveCalculation } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Tooltip } from './Tooltip';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

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
  const groupedSemesters = useMemo(() => groupSemesters(program.semesters), [program.semesters]);

  const [grades, setGrades] = useState<Record<string, Grade>>({});
  const [exclusions, setExclusions] = useState<Record<string, 'not-published' | 'not-taken' | null>>({});
  const [customSubjects, setCustomSubjects] = useState<Record<string, Subject[]>>({});
  const [manualSgpas, setManualSgpas] = useState<Record<string, { sgpa: number, credits: number } | null>>({});
  const [expandedSem, setExpandedSem] = useState<string | null>(groupedSemesters[0]?.id || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { data: session } = useSession();
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
        .map(sub => ({ credits: sub.credits, grade: grades[sub.id]! }));
      const sgpa = calculateSGPA(semGrades);
      const totalCredits = allSubjectsInSem.filter(s => exclusions[s.id] !== 'not-taken').reduce((a, s) => a + s.credits, 0);
      const earnedCredits = allSubjectsInSem.filter(s => grades[s.id] && grades[s.id] !== 'F' && !exclusions[s.id]).reduce((a, s) => a + s.credits, 0);
      return { id: sem.id, name: sem.name, sgpa, percentage: sgpa > 0 ? (sgpa - 0.5) * 10 : 0, totalCredits, earnedCredits, isComplete: semGrades.length === allSubjectsInSem.filter(s => !exclusions[s.id]).length, isManual: false };
    });
    const cgpa = calculateCGPA(semResults);
    const totalPercentage = cgpa > 0 ? (cgpa - 0.5) * 10 : 0;
    return { semResults, cgpa, totalPercentage };
  }, [groupedSemesters, grades, exclusions, customSubjects, manualSgpas]);

  const downloadAsPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129);
    doc.text("PolyCGPA Official Report", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Program: ${program.name} (${program.code})`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.text(`Schema: Kerala Polytechnic SITTTR REV2021`, 14, 40);

    doc.setDrawColor(240, 240, 240);
    doc.setFillColor(252, 252, 252);
    doc.roundedRect(14, 45, pageWidth - 28, 25, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("CUMULATIVE PERFORMANCE (OVERALL)", 20, 52);

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(`FINAL CGPA: ${results.cgpa.toFixed(2)}`, 20, 62);
    doc.text(`EQUIVALENT PERCENTAGE: ${results.totalPercentage.toFixed(1)}%`, pageWidth / 2, 62);

    let currentY = 85;

    results.semResults.forEach((sem) => {
      if (sem.sgpa === 0) return;

      const curricularSem = groupedSemesters.find(s => s.id === sem.id);
      if (!curricularSem) return;

      if (currentY + 60 > doc.internal.pageSize.getHeight()) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(16, 185, 129);
      doc.text(`${sem.name} Performance Overview`, 14, currentY);

      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(`SGPA: ${sem.sgpa.toFixed(2)} | Credits Earned: ${sem.earnedCredits}/${sem.totalCredits}`, 14, currentY + 6);

      const tableData = [...curricularSem.subjects, ...(customSubjects[sem.id] || [])]
        .filter(s => grades[s.id] && !exclusions[s.id])
        .map(s => [s.code || 'ELECTIVE', s.name, s.credits, grades[s.id]]);

      autoTable(doc, {
        startY: currentY + 10,
        head: [['Code', 'Course / Subject Name', 'CR', 'Grade']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 25 },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 20, halign: 'center' }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;
    });

    doc.save(`PolyCGPA_Results_${program.code}.pdf`);
  };

  const handleSave = async () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    setIsSaving(true);
    setSaveStatus('idle');
    const semestersToSave = groupedSemesters.map(sem => {
      const res = results.semResults.find(r => r.id === sem.id)!;
      return {
        id: sem.id, name: sem.name, number: sem.number, sgpa: res.sgpa, credits: res.earnedCredits, isManual: res.isManual,
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
      <aside className="w-16 lg:w-64 border-r-2 border-standard flex flex-col bg-black z-[70]">
        <Tooltip content="PolyCGPA Home" position="right" variant="emerald" className="w-auto">
          <div className="p-4 lg:p-6 border-b-2 border-standard flex items-center justify-center lg:justify-start gap-3 bg-white/[0.02]">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]">P</div>
            <span className="hidden lg:block font-black tracking-tighter text-2xl">Poly<span className="text-primary italic">CGPA</span></span>
          </div>
        </Tooltip>

        <nav className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-3 custom-scrollbar">
          <div className="hidden lg:block px-4 py-3 text-[11px] font-black text-white/40 uppercase tracking-[0.25em] mb-2 border-b border-white/5">Semesters</div>
          {groupedSemesters.map((sem) => {
            const res = results.semResults.find(r => r.id === sem.id);
            const isActive = sem.id === expandedSem;
            return (
              <button
                key={sem.id}
                onClick={() => setExpandedSem(sem.id)}
                className={cn(
                  "w-full flex items-center justify-center lg:justify-between p-4 rounded-3xl transition-all group border-2 outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 active:scale-95",
                  isActive
                    ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_15px_40px_-10px_rgba(16,185,129,0.5)]"
                    : "bg-[#0a0a0a] border-white/5 text-white/30 hover:border-white/20 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("h-2.5 w-2.5 rounded-full transition-all", isActive ? "bg-black" : "bg-white/10 group-hover:bg-primary")} />
                  <span className="hidden lg:block font-black text-sm uppercase tracking-tighter">{(sem as any).displayName}</span>
                </div>
                {res && res.sgpa > 0 && <span className={cn("hidden lg:block text-xs font-black px-2 py-0.5 rounded-md", isActive ? "bg-black/10 text-black/80" : "bg-primary/10 text-primary")}>{res.sgpa.toFixed(2)}</span>}
                <div className="lg:hidden font-black text-[10px]">{sem.number}</div>
              </button>
            )
          })}
        </nav>

        <div className="p-2 lg:p-4 border-t border-standard bg-white/[0.01]">
          <Tooltip content="View History" position="right" variant="emerald" className="lg:hidden">
            <Link href="/history" className="flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl text-muted hover:bg-white/5 hover:text-white transition-all">
              <History className="h-5 w-5" />
            </Link>
          </Tooltip>
          <Link href="/history" className="hidden lg:flex items-center justify-start gap-3 p-3 rounded-xl text-muted hover:bg-white/5 hover:text-white transition-all">
            <History className="h-5 w-5" />
            <span className="font-bold text-sm">History</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-surface-raised custom-scrollbar animate-fade-in relative">
        {/* Official Report Header (Print Only) */}
        <div className="print-only p-8 border-b-4 border-black mb-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">PolyCGPA Official Report</h1>
              <p className="text-sm font-bold opacity-60 uppercase tracking-widest">Academic Achievement Summary</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black uppercase">Syllabus Data</p>
              <p className="text-primary font-black uppercase">REV2021 Standard</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-10">
            <div>
              <p className="text-[10px] font-black uppercase text-muted mb-1">Bachelor / Diploma Program</p>
              <p className="text-lg font-black">{program.name}</p>
              <p className="text-sm font-bold opacity-60">{program.code}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-muted mb-1">Calculation Status</p>
              <p className="text-lg font-black text-primary uppercase">Official Result</p>
              <p className="text-xs font-bold opacity-60 tracking-widest">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        <header className="h-auto min-h-20 border-b border-standard flex flex-col md:flex-row items-center justify-between px-4 lg:px-8 py-4 bg-transparent z-50 gap-4">
          <div className="flex items-center gap-4 lg:gap-6">
            <div>
              <h1 className="text-sm lg:text-lg font-black tracking-tight leading-tight">{program.name} <span className="text-muted block lg:inline font-mono text-[10px] lg:text-sm">{program.code}</span></h1>
            </div>
            <div className="h-8 w-px bg-white/5 hidden lg:block" />
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[8px] lg:text-[9px] font-black text-muted uppercase">Global CGPA</span>
                <span className="text-base lg:text-xl font-black text-primary">{results.cgpa.toFixed(2)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] lg:text-[9px] font-black text-muted uppercase">Percentage</span>
                <span className="text-base lg:text-xl font-black text-white/80">{results.totalPercentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3 w-full md:w-auto relative z-[60]">
            <Tooltip content="Internal Cloud Save" position="bottom" variant="emerald" className="w-full md:w-auto">
              <button
                onClick={handleSave}
                disabled={isSaving || results.cgpa === 0}
                className={cn(
                  "btn-primary w-full md:w-auto min-w-[120px] lg:min-w-[140px] text-[10px] lg:text-xs h-10 lg:h-11",
                  saveStatus === 'success' && "bg-emerald-500/20 text-primary border border-emerald-500/30 shadow-none hover:translate-y-0"
                )}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : saveStatus === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {isSaving ? 'Saving' : saveStatus === 'success' ? 'Saved' : 'Save Session'}
              </button>
            </Tooltip>
          </div>
        </header>

        <div className="p-4 lg:p-12">
          <div className="max-w-5xl mx-auto space-y-8 lg:space-y-12">

            {/* Minimalist Curricular Apex HUD */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-12 border-b-2 border-white/5 relative">
              <div className="flex items-center gap-6">
                <div className="h-12 w-1.5 bg-primary rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-black tracking-tighter text-white uppercase">{currentSem?.name}</span>
                    <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[9px] font-black uppercase text-primary tracking-widest leading-none">Live</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Academic Core Matrix</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-8">
                {currentSemRes && currentSemRes.sgpa > 0 && (
                  <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-3xl p-2 pr-6 gap-6 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-black border border-white/5">
                      <div className="text-left">
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">SGPA</p>
                        <p className="text-3xl font-black text-white tracking-tighter leading-none">{currentSemRes.sgpa.toFixed(2)}</p>
                      </div>
                      <div className="h-8 w-px bg-white/10" />
                      <div className="text-right">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Equiv.</p>
                        <p className="text-3xl font-black text-white tracking-tighter leading-none">{currentSemRes.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <Tooltip content="Download Transcript" variant="emerald">
                      <button 
                        onClick={downloadAsPDF}
                        className="h-12 w-12 rounded-2xl flex items-center justify-center bg-emerald-500 text-black hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                      >
                        <FileDown className="h-5 w-5" />
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Input Dashboard */}
          <div className="grid grid-cols-1 gap-1">
            {/* Header row - Hidden on mobile */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-black text-muted uppercase tracking-widest border-b border-white/5">
              <div className="col-span-1">CODE</div>
              <div className="col-span-1 text-center">CR</div>
              <div className="col-span-6">COURSE DESCRIPTION</div>
              <div className="col-span-4 text-right">FINAL GRADE</div>
            </div>

            {(() => {
              const allSubjects = [
                ...(currentSem?.subjects || []),
                ...(customSubjects[expandedSem!] || [])
              ];

              return allSubjects.map((sub) => (
                <div key={sub.id} className={cn(
                  "flex flex-col lg:grid lg:grid-cols-12 gap-6 p-6 lg:px-8 lg:py-6 items-start lg:items-center group transition-all rounded-3xl mb-4 border-2 shadow-xl",
                  exclusions[sub.id]
                    ? "bg-white/[0.01] border-white/5 opacity-30 grayscale"
                    : "bg-white/[0.03] border-white/5 hover:border-primary/40 hover:bg-white/[0.05]"
                )}>
                  <div className="w-full flex justify-between items-center lg:col-span-1 border-b lg:border-none border-white/10 pb-3 lg:pb-0">
                    <div className="font-black text-xs text-primary/60 tracking-tighter">{(sub as any).isCustom ? 'ELECTIVE' : (sub.code || 'CORE')}</div>
                    <div className="lg:hidden text-center">
                      {(sub as any).isCustom ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-white/40">CR:</span>
                          <input
                            type="number"
                            value={sub.credits}
                            onChange={(e) => {
                              const newCustom = [...(customSubjects[expandedSem!] || [])];
                              const idx = newCustom.findIndex(s => s.id === sub.id);
                              if (idx !== -1) {
                                newCustom[idx] = { ...newCustom[idx], credits: Number(e.target.value) };
                                setCustomSubjects(prev => ({ ...prev, [expandedSem!]: newCustom }));
                              }
                            }}
                            className="w-10 bg-white/5 font-black text-[11px] text-white border border-white/20 rounded text-center py-0.5"
                          />
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-black text-white border border-white/20">{sub.credits} CREDITS</span>
                      )}
                    </div>
                  </div>
                  <div className="hidden lg:block lg:col-span-1 text-center">
                    {(sub as any).isCustom ? (
                      <input
                        type="number"
                        value={sub.credits}
                        onChange={(e) => {
                          const newCustom = [...(customSubjects[expandedSem!] || [])];
                          const idx = newCustom.findIndex(s => s.id === sub.id);
                          if (idx !== -1) {
                            newCustom[idx] = { ...newCustom[idx], credits: Number(e.target.value) };
                            setCustomSubjects(prev => ({ ...prev, [expandedSem!]: newCustom }));
                          }
                        }}
                        className="w-12 bg-white/5 font-black text-[11px] text-white border-2 border-white/20 rounded-lg text-center py-1 outline-none focus:border-primary focus:bg-black focus:ring-4 focus:ring-primary/20 transition-all"
                      />
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-black text-white border border-white/20">{sub.credits}</span>
                    )}
                  </div>
                  <div className="w-full lg:col-span-6">
                    {(sub as any).isCustom ? (
                      <input
                        value={sub.name}
                        onChange={(e) => {
                          const newCustom = [...(customSubjects[expandedSem!] || [])];
                          const idx = newCustom.findIndex(s => s.id === sub.id);
                          if (idx !== -1) {
                            newCustom[idx] = { ...newCustom[idx], name: e.target.value };
                            setCustomSubjects(prev => ({ ...prev, [expandedSem!]: newCustom }));
                          }
                        }}
                        className="w-full bg-transparent font-black text-base lg:text-lg tracking-tighter text-primary border-b-2 border-primary/20 focus:border-primary focus:bg-white/5 outline-none py-1 px-2 rounded-t-lg transition-all"
                        placeholder="Enter Course Title..."
                      />
                    ) : (
                      <p className="font-black text-base lg:text-lg tracking-tighter text-white leading-tight">{sub.name}</p>
                    )}
                  </div>
                  <div className="w-full lg:col-span-4 flex flex-row-reverse lg:flex-row justify-between lg:justify-end items-center gap-6 pt-4 lg:pt-0 border-t lg:border-none border-white/10">
                    <select
                      disabled={!!exclusions[sub.id]}
                      value={grades[sub.id] || ''}
                      onChange={(e) => setGrades(prev => ({ ...prev, [sub.id]: e.target.value as Grade }))}
                      className={cn(
                        "w-full lg:w-40 bg-black border-2 rounded-2xl py-3 px-4 text-sm font-black text-center appearance-none cursor-pointer outline-none transition-all",
                        grades[sub.id]
                          ? "border-primary text-primary shadow-[0_0_20px_rgba(16,185,129,0.3)] focus:ring-4 focus:ring-primary/20"
                          : "border-white/10 text-white/30 hover:border-white/40 hover:text-white focus:border-primary focus:text-white focus:ring-4 focus:ring-primary/20"
                      )}
                    >
                      <option value="" disabled className="bg-black">SELECT GRADE</option>
                      {Object.keys(GRADE_POINTS).map(g => (
                        <option key={g} value={g} className="bg-black text-white font-black">{g}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip content="Not Published" position="top">
                        <button
                          onClick={() => setExclusions(prev => ({ ...prev, [sub.id]: prev[sub.id] === 'not-published' ? null : 'not-published' }))}
                          className={cn(
                            "h-8 w-8 lg:h-7 lg:w-7 rounded-lg flex items-center justify-center border transition-all hover:scale-110 active:scale-90 shadow-lg",
                            exclusions[sub.id] === 'not-published'
                              ? "bg-gradient-to-br from-amber-400 to-amber-600 border-amber-400/50 text-black shadow-amber-500/40"
                              : "border-standard text-white/20 hover:text-amber-400/80 hover:border-amber-400/30 hover:bg-amber-400/5"
                          )}
                        >
                          <Plus className="h-4 w-4 rotate-45" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Not Taken / Exempt" position="top">
                        <button
                          onClick={() => setExclusions(prev => ({ ...prev, [sub.id]: prev[sub.id] === 'not-taken' ? null : 'not-taken' }))}
                          className={cn(
                            "h-8 w-8 lg:h-7 lg:w-7 rounded-lg flex items-center justify-center border transition-all hover:scale-110 active:scale-90 shadow-lg",
                            exclusions[sub.id] === 'not-taken'
                              ? "bg-gradient-to-br from-red-500 to-red-700 border-red-500/50 text-black shadow-red-500/40"
                              : "border-standard text-white/20 hover:text-red-500/80 hover:border-red-500/30 hover:bg-red-500/5"
                          )}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ))
            })()}

            {/* Footer Actions */}
            <div className="mt-8 lg:mt-12 flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-6 lg:p-8 rounded-2xl bg-surface border border-standard gap-6 lg:gap-0">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4 order-2 lg:order-1">
                <Tooltip content="Clear Semester">
                  <button
                    onClick={() => {
                      const newGrades = { ...grades };
                      currentSem?.subjects.forEach(s => delete newGrades[s.id]);
                      setGrades(newGrades);
                    }}
                    className="btn-ghost w-full py-3 lg:py-2 text-red-500 border border-transparent hover:border-red-500/20 hover:bg-red-500/5 group"
                  >
                    <Trash2 className="h-4 w-4 transition-transform group-hover:-rotate-12" /> Reset Grid
                  </button>
                </Tooltip>
                <Tooltip content="Add Subject" variant="emerald">
                  <button
                    onClick={() => {
                      const newSub: Subject = { id: `custom-${Math.random()}`, name: '', credits: 0, isCustom: true };
                      setCustomSubjects(prev => ({ ...prev, [expandedSem!]: [...(prev[expandedSem!] || []), newSub] }));
                    }}
                    className="btn-ghost w-full py-3 lg:py-2 text-primary border border-transparent hover:border-emerald-500/20 hover:bg-emerald-500/5 group"
                  >
                    <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" /> Add Row
                  </button>
                </Tooltip>
              </div>
              <div className="flex flex-col lg:flex-row items-center gap-6 order-1 lg:order-2 border-b lg:border-none border-white/5 pb-6 lg:pb-0 w-full lg:w-auto">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest leading-none">REV2021 Engine Ready</p>
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
