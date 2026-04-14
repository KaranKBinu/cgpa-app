"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, Save, BarChart3, Calculator as CalcIcon,
  Trash2, CheckCircle2, Loader2, Plus, X, Download, Check,
  LayoutDashboard, History, Settings, LogOut, FileText, FileDown, ArrowRight,
  Search
} from 'lucide-react';
import { calculateSGPA, calculateCGPA, groupSemesters, Grade, GRADE_POINTS } from '@/lib/calculator';
import { saveCalculation, processTranscriptPdfs } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Tooltip } from './Tooltip';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { SyllabusSemester, SyllabusSubject } from '@prisma/client';

interface Subject {
  id: string;
  code?: string;
  name: string;
  credits: number;
  isCustom?: boolean;
  isGroup?: boolean;
  options?: Subject[];
}

interface Semester {
  id: string;
  name: string;
  number: number;
  subjects: Subject[];
  isManual?: boolean;
  sgpa?: number;
  displayName?: string;
}

interface Program {
  id: string;
  name: string;
  code: string;
  semesters: Semester[];
}

export default function Calculator({ program, historicalData, globalOpenElectives = [] }: { 
  program: Program & { semesters: (SyllabusSemester & { subjects: SyllabusSubject[] })[] };
  historicalData?: any;
  globalOpenElectives?: any[];
}) {
  const groupedOpenElectives = useMemo(() => {
    const groups: Record<string, any[]> = {};
    globalOpenElectives.forEach(sub => {
      const progName = sub.semester?.program?.name || "Other";
      if (!groups[progName]) groups[progName] = [];
      groups[progName].push(sub);
    });
    return groups;
  }, [globalOpenElectives]);
  const groupedSemesters = useMemo(() => groupSemesters(program.semesters), [program.semesters]);

  const [grades, setGrades] = useState<Record<string, Grade>>({});
  const [exclusions, setExclusions] = useState<Record<string, 'not-published' | 'not-taken' | null>>({});
  const [customSubjects, setCustomSubjects] = useState<Record<string, Subject[]>>({});
  const [manualSgpas, setManualSgpas] = useState<Record<string, { sgpa: number, credits: number } | null>>({});
  const [expandedSem, setExpandedSem] = useState<string | null>(groupedSemesters[0]?.id || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchGroup, setActiveSearchGroup] = useState<string | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [pdfPassword, setPdfPassword] = useState("");
  const [pdfErrorMessage, setPdfErrorMessage] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<{ name: string, data: string }[]>([]);
  const [useSamePassword, setUseSamePassword] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem(`poly-cgpa-${program.id}`);
    
    // If we have historical data passed from props, it takes priority over local storage
    if (historicalData) {
      const histGrades: Record<string, Grade> = {};
      const histExclusions: Record<string, 'not-published' | 'not-taken' | null> = {};
      const histCustom: Record<string, Subject[]> = {};
      const histManual: Record<string, { sgpa: number, credits: number } | null> = {};
      const histSelected: Record<string, string> = {};
      
      historicalData.semesters.forEach((histSem: any) => {
        const activeSem = groupedSemesters.find(s => s.number === histSem.number);
        if (!activeSem) return;

        // If it was a manual entry in history
        if (histSem.subjects.length === 0 && histSem.sgpa > 0) {
          histManual[activeSem.id] = { sgpa: histSem.sgpa, credits: histSem.credits };
        }

        histSem.subjects.forEach((sub: any) => {
          const subCodeTrimmed = sub.code?.trim() || "";
          const subNameTrimmed = sub.name?.trim().toLowerCase() || "";

          // Try to match with an official subject or elective option
          let foundSubjectId = "";
          activeSem.subjects.forEach(s => {
            if (s.isGroup) {
              const opt = s.options?.find(o => 
                (o.code && o.code.trim() === subCodeTrimmed) || 
                (o.name.trim().toLowerCase() === subNameTrimmed)
              );
              if (opt) {
                foundSubjectId = opt.id;
                histSelected[s.id] = opt.id;
              }
            } else if (
              (s.code && s.code.trim() === subCodeTrimmed) || 
              (s.name.trim().toLowerCase() === subNameTrimmed)
            ) {
              foundSubjectId = s.id;
            }
          });

          if (foundSubjectId) {
            histGrades[foundSubjectId] = sub.grade as Grade;
          } else {
            // It was a custom subject, restore it
            if (!histCustom[activeSem.id]) histCustom[activeSem.id] = [];
            const customId = `hist-${Math.random().toString(36).substring(2, 11)}`;
            histCustom[activeSem.id].push({
              id: customId,
              code: sub.code,
              name: sub.name,
              credits: sub.credits,
              isCustom: true
            });
            histGrades[customId] = sub.grade as Grade;
          }
        });
      });

      setGrades(histGrades);
      setCustomSubjects(histCustom);
      setManualSgpas(histManual);
      setSelectedOptions(histSelected);
      setStudentName(historicalData.label || "");
      setActiveSessionId(historicalData.id);
      return;
    }

    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.grades) setGrades(data.grades);
        if (data.exclusions) setExclusions(data.exclusions);
        if (data.customSubjects) setCustomSubjects(data.customSubjects);
        if (data.manualSgpas) setManualSgpas(data.manualSgpas);
        if (data.selectedOptions) setSelectedOptions(data.selectedOptions);
        if (data.studentName) setStudentName(data.studentName);
      } catch (e) {
        console.error('Failed to load local state', e);
      }
    }
  }, [program.id, historicalData]);

  useEffect(() => {
    const state = { grades, exclusions, customSubjects, manualSgpas, studentName, selectedOptions };
    localStorage.setItem(`poly-cgpa-${program.id}`, JSON.stringify(state));
  }, [program.id, grades, exclusions, customSubjects, manualSgpas, studentName, selectedOptions]);

  const results = useMemo(() => {
    const semResults = groupedSemesters.map(sem => {
      const manualEntry = manualSgpas[sem.id];
      if (manualEntry) {
        return {
          id: sem.id, name: sem.name, sgpa: manualEntry.sgpa,
          percentage: manualEntry.sgpa > 0 ? (manualEntry.sgpa - 0.5) * 10 : 0,
          totalCredits: manualEntry.credits, earnedCredits: manualEntry.credits,
          attemptedCredits: manualEntry.credits,
          isComplete: true, isManual: true
        };
      }

      // Resolve elective groups to their selected options
      const resolvedSubjects = sem.subjects.flatMap(sub => {
        if (sub.isGroup) {
          const selectedId = selectedOptions[sub.id];
          // Search local options first, then global pool
          const selectedOpt = sub.options?.find(o => o.id === selectedId) || 
                              globalOpenElectives?.find(o => o.id === selectedId);
          // If an option is selected, use it. Otherwise, keep the group as a placeholder
          return selectedOpt ? [selectedOpt] : [sub];
        }
        return [sub];
      });

      const allSubjectsInSem = [...resolvedSubjects, ...(customSubjects[sem.id] || [])];
      const semGrades = allSubjectsInSem
        .filter(sub => (grades[sub.id] || exclusions[sub.id] === 'not-published') && exclusions[sub.id] !== 'not-taken')
        .map(sub => ({ credits: sub.credits, grade: (exclusions[sub.id] === 'not-published' ? 'F' : grades[sub.id]) as any }));
      const sgpa = calculateSGPA(semGrades);
      const attemptedCredits = semGrades.reduce((a, s) => a + s.credits, 0);
      const totalCredits = allSubjectsInSem
        .filter(s => exclusions[s.id] !== 'not-taken')
        .reduce((a, s) => a + s.credits, 0);
      const earnedCredits = allSubjectsInSem
        .filter(s => grades[s.id] && grades[s.id] !== 'F' && !exclusions[s.id])
        .reduce((a, s) => a + s.credits, 0);
      
      return { 
        id: sem.id, 
        name: sem.name, 
        sgpa, 
        percentage: sgpa > 0 ? (sgpa - 0.5) * 10 : 0, 
        totalCredits, 
        earnedCredits, 
        attemptedCredits,
        isComplete: semGrades.length === allSubjectsInSem.filter(s => exclusions[s.id] !== 'not-taken').length, 
        isManual: false 
      };
    });
    const cgpa = calculateCGPA(semResults.filter(s => s.sgpa > 0).map(s => ({ sgpa: s.sgpa, totalCredits: s.attemptedCredits })));
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
    doc.text(`Schema: Kerala Polytechnic REV2021 Engine`, 14, 40);

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

      const resolved = curricularSem.subjects.flatMap(s => {
        if (s.isGroup) {
          const optId = selectedOptions[s.id];
          const opt = s.options?.find(o => o.id === optId);
          return opt ? [opt] : [];
        }
        return [s];
      });
      const semSubjects = [...resolved, ...(customSubjects[sem.id] || [])];
      const tableData = semSubjects
        .filter(s => (grades[s.id] || exclusions[s.id] === 'not-published') && exclusions[s.id] !== 'not-taken')
        .map(s => {
          const isNP = exclusions[s.id] === 'not-published';
          return [
            s.code || 'VAR', 
            s.name, 
            s.credits, 
            isNP ? 'PENDING' : (grades[s.id] || '-')
          ];
        });

      if (sem.isManual) {
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text("Semester was processed via manual aggregate entry.", 14, currentY + 10);
        currentY += 20;
      } else if (tableData.length > 0) {
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
      } else {
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text("No graded subjects recorded for this term.", 14, currentY + 10);
        currentY += 20;
      }
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
    
    // Choose the best label
    const label = studentName.trim() 
      ? studentName.trim() 
      : (session?.user?.name || `Results for ${program.code}`);

    const semestersToSave = groupedSemesters.map(sem => {
      const res = (results.semResults as any[]).find(r => r.id === sem.id)!;
      
      const resolved = sem.subjects.flatMap(sub => {
        if (sub.isGroup) {
          const optId = selectedOptions[sub.id];
          const opt = sub.options?.find(o => o.id === optId) || 
                      globalOpenElectives?.find(o => o.id === optId);
          return opt ? [opt] : [];
        }
        return [sub];
      });

      return {
        id: sem.id, name: sem.name, number: sem.number, sgpa: res.sgpa, credits: res.attemptedCredits, isManual: res.isManual,
        subjects: [...resolved, ...(customSubjects[sem.id] || [])]
          .filter(s => grades[s.id] || exclusions[s.id] === 'not-published')
          .map(s => {
            const isNP = exclusions[s.id] === 'not-published';
            const gd = isNP ? 'F' : grades[s.id] as Grade;
            return { 
              name: s.name, 
              credits: s.credits, 
              grade: gd, 
              points: isNP ? 0 : GRADE_POINTS[gd], 
              code: s.code 
            };
          })
      }
    }).filter(s => s.sgpa > 0);

    const res = await saveCalculation({ 
      id: activeSessionId || undefined,
      programId: program.id, 
      label: label, 
      cgpa: results.cgpa, 
      semesters: semestersToSave 
    });

    setIsSaving(false);
    if (res.success) { 
      setSaveStatus('success'); 
      setIsSaveModalOpen(false);
      setTimeout(() => router.push('/history'), 1000); 
    }
    else {
      setSaveStatus('error');
    }
  };

  const processFiles = async (filesToProcess: { name: string, data: string }[], password?: string) => {
    setIsProcessingPdf(true);
    setPdfErrorMessage(null);
    
    const filesBatch = useSamePassword ? filesToProcess : [filesToProcess[0]];
    const res = await processTranscriptPdfs(filesBatch, password);
    setIsProcessingPdf(false);

    if (res.success && res.results) {
        const passwordRequired = res.results.some((r: any) => r.isPasswordRequired);
        
        if (passwordRequired) {
            setPendingFiles(filesToProcess);
            setIsPdfModalOpen(true);
            if (password) setPdfErrorMessage("Incorrect password. Please try again.");
            return;
        }

        // Handle successful processing of the batch
        if (!useSamePassword && filesToProcess.length > 1) {
            // One by one mode: remove the processed file and keep modal open for next
            const remaining = filesToProcess.slice(1);
            setPendingFiles(remaining);
            setPdfPassword("");
            setIsPdfModalOpen(true);
            // We still need to apply the results of the current file
        }

        const newGrades = { ...grades };
        const newCustomSubjects = { ...customSubjects };
        const newExclusions = { ...exclusions };

        res.results.forEach((result) => {
            if ('error' in result) {
                console.error(`Error in ${result.fileName}: ${result.error}`);
                return;
            }

            const sem = groupedSemesters.find(s => s.number === result.semester);
            if (!sem) return;

            const matchedOriginalIds = new Set<string>();

            result.subjects.forEach((sub) => {
                const subCodeTrimmed = sub.code?.trim() || "";
                const subNameTrimmed = sub.name?.trim().toLowerCase() || "";

                // Try to find in official subjects first
                const original = sem.subjects.find((s) => 
                    (s.code && s.code.trim() === subCodeTrimmed) || 
                    (s.name.trim().toLowerCase() === subNameTrimmed)
                );

                if (original) {
                    newGrades[original.id] = sub.grade as Grade;
                    newExclusions[original.id] = null; // Ensure it's visible
                    matchedOriginalIds.add(original.id);
                } else {
                    // Check if it already exists in custom subjects
                    if (!newCustomSubjects[sem.id]) newCustomSubjects[sem.id] = [];
                    
                    const existingCustomIdx = newCustomSubjects[sem.id].findIndex(s => 
                        (s.code && s.code.trim() === subCodeTrimmed) || 
                        (s.name.trim().toLowerCase() === subNameTrimmed)
                    );
                    
                    if (existingCustomIdx !== -1) {
                        const existingId = newCustomSubjects[sem.id][existingCustomIdx].id;
                        newGrades[existingId] = sub.grade as Grade;
                        newExclusions[existingId] = null;
                    } else {
                        // New custom subject
                        const customId = `pdf-${Math.random().toString(36).substring(2, 11)}`;
                        newCustomSubjects[sem.id].push({
                            id: customId,
                            code: sub.code,
                            name: sub.name,
                            credits: 4, // Default for unknown theory
                            isCustom: true
                        });
                        newGrades[customId] = sub.grade as Grade;
                        newExclusions[customId] = null;
                    }
                }
            });

            // Automatically hide official subjects NOT found in the PDF for this semester
            sem.subjects.forEach(s => {
                if (!matchedOriginalIds.has(s.id)) {
                    newExclusions[s.id] = 'not-taken';
                }
            });
        });

        setGrades(newGrades);
        setCustomSubjects(newCustomSubjects);
        setExclusions(newExclusions);
        
        if (useSamePassword || filesToProcess.length === 1) {
            setPendingFiles([]);
            setPdfPassword("");
            setIsPdfModalOpen(false); // Close it if finished
        }
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileData: { name: string, data: string }[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]); // Remove data:application/pdf;base64,
            };
            reader.readAsDataURL(file);
        });
        fileData.push({ name: file.name, data: base64 });
    }

    await processFiles(fileData);
  };

  const currentSem = groupedSemesters.find(s => s.id === expandedSem);
  const currentSemRes = results.semResults.find(r => r.id === expandedSem);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans relative">
      {/* Sidebar Navigation - Desktop */}
      <aside className="hidden lg:flex w-64 border-r-2 border-border/50 flex-col bg-card/30 sticky top-0 h-screen z-[70]">
        <div className="p-6 border-b-2 border-border/50 flex items-center justify-start gap-3 bg-card/10">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]">P</div>
          <span className="font-black tracking-tighter text-2xl">Poly<span className="text-primary italic">CGPA</span></span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <div className="px-4 py-3 text-[11px] font-black text-muted-foreground uppercase tracking-[0.25em] mb-2 border-b border-border/50">Semesters</div>
          {groupedSemesters.map((sem) => {
            const res = results.semResults.find(r => r.id === sem.id);
            const isActive = sem.id === expandedSem;
            return (
              <button
                key={sem.id}
                onClick={() => setExpandedSem(sem.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-3xl transition-all group border-2 outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 active:scale-95",
                  isActive
                    ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_15px_40px_-10px_rgba(16,185,129,0.5)]"
                    : "bg-card/50 border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("h-2.5 w-2.5 rounded-full transition-all", isActive ? "bg-primary-foreground" : "bg-card/80 group-hover:bg-primary")} />
                  <span className="font-black text-sm uppercase tracking-tighter">{(sem as any).displayName}</span>
                </div>
                {res && res.sgpa > 0 && <span className={cn("text-xs font-black px-2 py-0.5 rounded-md", isActive ? "bg-primary-foreground/10 text-primary-foreground" : "bg-primary/10 text-primary")}>{res.sgpa.toFixed(2)}</span>}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border bg-card/50">
          <Link href="/history" className="flex items-center justify-start gap-3 p-3 rounded-xl text-muted-foreground hover:bg-card/50 hover:text-foreground transition-all">
            <History className="h-5 w-5" />
            <span className="font-bold text-sm">History</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-background animate-fade-in relative touch-pan-y">
        <header className="h-auto border-b border-border flex flex-col items-stretch px-4 lg:px-8 py-2 bg-transparent z-[60] gap-2">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-4">
              <div className="lg:hidden h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-black">P</div>
              <div>
                <h1 className="text-sm lg:text-lg font-black tracking-tight leading-tight max-w-[150px] lg:max-w-none truncate">{program.name}</h1>
                <span className="text-muted-foreground font-mono text-[9px] lg:text-sm">{program.code}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-6">
              <div className="flex items-center gap-3 border-r border-border pr-3 lg:pr-6">
                <input 
                  type="file" 
                  multiple 
                  accept=".pdf" 
                  className="hidden" 
                  id="pdf-upload" 
                  onChange={handlePdfUpload} 
                />
                
                <Tooltip content={isProcessingPdf ? "Processing..." : "Auto-fill results from PDF Marksheets"} position="bottom">
                  <button
                    onClick={() => document.getElementById('pdf-upload')?.click()}
                    disabled={isProcessingPdf}
                    className={cn(
                      "hidden lg:flex px-4 py-2.5 rounded-2xl transition-all items-center gap-2 text-[10px] font-black uppercase tracking-widest border-2",
                      isProcessingPdf 
                        ? "bg-primary/20 border-primary/30 text-primary animate-pulse" 
                        : "bg-card border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    {isProcessingPdf ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <FileText className="h-3 w-3" />
                    )}
                    <span>{isProcessingPdf ? "Parsing..." : "Auto-Fill"}</span>
                  </button>
                </Tooltip>

                <div className="flex flex-col items-end">
                  <span className="text-[7px] lg:text-[9px] font-black text-muted-foreground uppercase">CGPA</span>
                  <span className="text-sm lg:text-xl font-black text-primary">{results.cgpa.toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[7px] lg:text-[9px] font-black text-muted-foreground uppercase">Pct</span>
                  <span className="text-sm lg:text-xl font-black text-foreground/80">{results.totalPercentage.toFixed(0)}%</span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  if (!session) router.push('/auth/login');
                  else setIsSaveModalOpen(true);
                }}
                disabled={isSaving || results.cgpa === 0}
                className={cn(
                  "hidden lg:flex px-6 py-2.5 rounded-2xl transition-all items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                  saveStatus === 'success' 
                    ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                    : "bg-emerald-500 text-black hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
                )}
              >
                {activeSessionId ? (
                  <>
                    <History className="h-3 w-3" />
                    <span>Update Progress</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3" />
                    <span>Save Session</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Semester Tab Bar */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto py-2 no-scrollbar border-t border-border/30">
            {groupedSemesters.map((sem) => {
              const isActive = sem.id === expandedSem;
              const res = results.semResults.find(r => r.id === sem.id);
              return (
                <button
                  key={sem.id}
                  onClick={() => setExpandedSem(sem.id)}
                  className={cn(
                    "whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                    isActive
                      ? "bg-emerald-500 border-emerald-500 text-black"
                      : "bg-card/50 border-border/50 text-muted-foreground"
                  )}
                >
                  {sem.displayName} {res && res.sgpa > 0 && <span className="ml-1 opacity-60">[{res.sgpa.toFixed(1)}]</span>}
                </button>
              )
            })}
            
            <button
              onClick={() => document.getElementById('pdf-upload')?.click()}
              className="flex-none px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase"
            >
              {isProcessingPdf ? <Loader2 className="h-3 w-3 animate-spin" /> : "Fill PDF"}
            </button>
          </div>
        </header>

        <div className="p-4 lg:p-12">
          <div className="max-w-5xl mx-auto space-y-4 lg:space-y-12">

            {/* Minimalist Curricular Apex HUD */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 pb-6 lg:pb-12 border-b-2 border-border/50 relative">
              <div className="flex items-center gap-6">
                <div className="h-12 w-1.5 bg-primary rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-black tracking-tighter text-foreground uppercase">{currentSem?.name}</span>
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Academic Core Matrix</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-8">
                {currentSemRes && (
                  <div className="flex items-center bg-card/50 border border-border rounded-3xl p-1 lg:p-2 lg:pr-6 gap-3 lg:gap-6 shadow-2xl backdrop-blur-md">
                    {currentSemRes.sgpa > 0 ? (
                      <div className="flex items-center gap-4 p-3 lg:p-4 rounded-2xl bg-background border border-border">
                        <div className="text-left">
                          <p className="text-[7px] lg:text-[9px] font-black text-primary uppercase tracking-widest mb-0.5">SGPA</p>
                          <p className="text-xl lg:text-3xl font-black text-foreground tracking-tighter leading-none">{currentSemRes.sgpa.toFixed(2)}</p>
                        </div>
                        <div className="h-6 lg:h-8 w-px bg-border" />
                        <div className="text-right">
                          <p className="text-[7px] lg:text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 whitespace-nowrap">Equiv Pct</p>
                          <p className="text-xl lg:text-3xl font-black text-foreground tracking-tighter leading-none">{currentSemRes.percentage.toFixed(0)}%</p>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Awaiting Data</div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Tooltip content={manualSgpas[expandedSem!] ? "Switch to Interactive Grid" : "Set results manually"} position="top">
                        <button 
                          onClick={() => {
                            if (manualSgpas[expandedSem!]) {
                              setManualSgpas(prev => {
                                const next = { ...prev };
                                delete next[expandedSem!];
                                return next;
                              });
                            } else {
                              setManualSgpas(prev => ({ ...prev, [expandedSem!]: { sgpa: 0, credits: 0 } }));
                            }
                          }}
                          className={cn(
                            "h-10 w-10 lg:h-12 lg:w-12 rounded-2xl flex items-center justify-center transition-all border-2",
                            manualSgpas[expandedSem!] 
                              ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" 
                              : "bg-card border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                          )}
                        >
                          {manualSgpas[expandedSem!] ? <CheckCircle2 className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
                        </button>
                      </Tooltip>

                      <Tooltip content="Download Transcript" variant="emerald">
                        <button
                          onClick={downloadAsPDF}
                          disabled={currentSemRes.sgpa === 0}
                          className="h-10 w-10 lg:h-12 lg:w-12 rounded-2xl flex items-center justify-center bg-emerald-500 text-black hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:grayscale"
                        >
                          <FileDown className="h-5 w-5" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Input Dashboard */}
          <div className="grid grid-cols-1 gap-1">
            {manualSgpas[expandedSem!] ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-10 lg:p-20 rounded-[3rem] bg-card/50 border-2 border-primary/20 flex flex-col items-center justify-center text-center space-y-8"
              >
                <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-3xl font-black tracking-tighter text-foreground mb-4 font-sans">Manual Result Entry</h3>
                  <p className="text-muted-foreground font-medium text-lg leading-relaxed">The automated subject grid is bypassed. Results entered here will be directly applied to the CGPA matrix.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-left ml-4">Semester SGPA</p>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="0.00"
                      value={manualSgpas[expandedSem!]?.sgpa || ''}
                      onChange={(e) => setManualSgpas(prev => ({ 
                        ...prev, 
                        [expandedSem!]: { ...prev[expandedSem!]!, sgpa: Number(e.target.value) } 
                      }))}
                      className="w-full h-16 bg-background border-2 border-border/50 rounded-3xl px-8 font-black text-2xl outline-none focus:border-primary focus:ring-8 focus:ring-primary/10 transition-all text-center"
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-left ml-4">Total Credits</p>
                    <input 
                      type="number"
                      min="0"
                      placeholder="0"
                      value={manualSgpas[expandedSem!]?.credits || ''}
                      onChange={(e) => setManualSgpas(prev => ({ 
                        ...prev, 
                        [expandedSem!]: { ...prev[expandedSem!]!, credits: Number(e.target.value) } 
                      }))}
                      className="w-full h-16 bg-background border-2 border-border/50 rounded-3xl px-8 font-black text-2xl outline-none focus:border-primary focus:ring-8 focus:ring-primary/10 transition-all text-center"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
            {/* Header row - Hidden on mobile */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/50">
              <div className="col-span-1">CODE</div>
              <div className="col-span-1 text-center">CR</div>
              <div className="col-span-6">COURSE DESCRIPTION</div>
              <div className="col-span-4 text-right">FINAL GRADE</div>
            </div>

            {(() => {
              const subjects = [...(currentSem?.subjects || []), ...(customSubjects[expandedSem!] || [])]
                .filter(s => exclusions[s.id] !== 'not-taken');
              
              if (subjects.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border/50 rounded-[3rem] bg-card/10">
                    <Trash2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-xs italic">All subjects removed or not added</p>
                  </div>
                )
              }

              return subjects.map((sub) => {
                const isNotPublished = exclusions[sub.id] === 'not-published';
                return (
                  <div key={sub.id} className={cn(
                    "flex flex-col lg:grid lg:grid-cols-12 gap-6 p-6 lg:px-8 lg:py-6 items-start lg:items-center group transition-all rounded-3xl mb-4 border-2 shadow-xl",
                    isNotPublished
                      ? "bg-amber-500/5 border-amber-500/20 opacity-70"
                      : "bg-card/50 border-border/50 hover:border-primary/40 hover:bg-card/80"
                  )}>
                  <div className="w-full flex justify-between items-center lg:col-span-1 border-b lg:border-none border-border pb-3 lg:pb-0">
                    <div className="font-black text-xs text-primary/60 tracking-tighter">
                      {(sub as any).isCustom ? (
                        <input
                          value={sub.code || ''}
                          placeholder="CODE"
                          onChange={(e) => {
                            const newCustom = [...(customSubjects[expandedSem!] || [])];
                            const idx = newCustom.findIndex(s => s.id === sub.id);
                            if (idx !== -1) {
                              newCustom[idx] = { ...newCustom[idx], code: e.target.value.toUpperCase() };
                              setCustomSubjects(prev => ({ ...prev, [expandedSem!]: newCustom }));
                            }
                          }}
                          className="w-full bg-transparent outline-none border-none focus:text-primary uppercase"
                        />
                      ) : (
                        sub.code || 'CORE'
                      )}
                    </div>
                    <div className="lg:hidden text-center">
                      {(sub as any).isCustom ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-muted-foreground">CR:</span>
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
                            className="w-10 bg-card/80 font-black text-[11px] text-foreground border border-border rounded text-center py-0.5"
                          />
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-card/80 text-[11px] font-black text-foreground border border-border">{sub.credits} CREDITS</span>
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
                        className="w-12 bg-card/80 font-black text-[11px] text-foreground border-2 border-border rounded-lg text-center py-1 outline-none focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/20 transition-all"
                      />
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-card/80 text-[11px] font-black text-foreground border border-border">{sub.credits}</span>
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
                        className="w-full bg-transparent font-black text-base lg:text-lg tracking-tighter text-primary border-b-2 border-primary/20 focus:border-primary focus:bg-card/50 outline-none py-1 px-2 rounded-t-lg transition-all"
                        placeholder="Enter Course Title..."
                      />
                    ) : sub.isGroup ? (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest leading-none pl-1">
                          {sub.category === 'Open Elective course' ? 'Inter-Departmental Selection' : 'Choose Elective Option'}
                        </p>
                        <div className="relative group/select">
                          {sub.category === 'Open Elective course' ? (
                            <button 
                              onClick={() => {
                                setActiveSearchGroup(sub.id);
                                setIsSearchModalOpen(true);
                              }}
                              className={cn(
                                "w-full bg-background/50 border-2 text-left text-foreground font-black text-sm lg:text-base rounded-2xl px-5 py-2.5 outline-none focus:ring-8 focus:ring-primary/10 transition-all flex items-center justify-between group/btn",
                                selectedOptions[sub.id] ? "border-primary/40" : "border-border/50 text-muted-foreground italic"
                              )}
                            >
                              <div className="flex flex-col">
                                <span className={cn("transition-all truncate max-w-[200px] lg:max-w-[300px]", selectedOptions[sub.id] ? "text-foreground" : "text-muted-foreground")}>
                                  {selectedOptions[sub.id] 
                                    ? (globalOpenElectives.find(o => o.id === selectedOptions[sub.id])?.name || "Selected Subject")
                                    : `Search in All Departments...`}
                                </span>
                                {selectedOptions[sub.id] && (
                                  <span className="text-[10px] font-mono text-primary/60 tracking-widest leading-none">
                                    {globalOpenElectives.find(o => o.id === selectedOptions[sub.id])?.code}
                                  </span>
                                )}
                              </div>
                              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/btn:bg-primary group-hover/btn:text-black transition-all">
                                <Search className="h-4 w-4" />
                              </div>
                            </button>
                          ) : (
                            <>
                              <select 
                                value={selectedOptions[sub.id] || ""}
                                onChange={(e) => {
                                  const optId = e.target.value;
                                  setSelectedOptions(prev => ({ ...prev, [sub.id]: optId }));
                                }}
                                className={cn(
                                  "w-full bg-background/50 border-2 text-foreground font-black text-sm lg:text-base rounded-2xl px-5 py-3 outline-none focus:ring-8 focus:ring-primary/10 transition-all appearance-none cursor-pointer",
                                  selectedOptions[sub.id] ? "border-primary/40 text-foreground" : "border-border/50 text-muted-foreground italic"
                                )}
                              >
                                <option value="">Select from Group: {sub.name}...</option>
                                {sub.options?.map(opt => (
                                  <option key={opt.id} value={opt.id} className="bg-card text-foreground">{opt.name}</option>
                                ))}
                              </select>
                              <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none group-hover/select:translate-x-1 transition-transform" />
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className={cn(
                        "font-black text-base lg:text-lg tracking-tighter leading-tight transition-all",
                        isNotPublished ? "text-amber-500 line-through opacity-60" : "text-foreground"
                      )}>
                        {sub.name}
                      </p>
                    )}
                  </div>
                  <div className="w-full lg:col-span-4 flex flex-row-reverse lg:flex-row justify-between lg:justify-end items-center gap-6 pt-4 lg:pt-0 border-t lg:border-none border-border">
                    {/* Standard High-Contrast Select */}
                    <select
                      disabled={!!exclusions[sub.id] || (sub.isGroup && !selectedOptions[sub.id])}
                      value={(sub.isGroup ? grades[selectedOptions[sub.id]] : grades[sub.id]) || ''}
                      onChange={(e) => {
                        const targetId = sub.isGroup ? selectedOptions[sub.id] : sub.id;
                        if (targetId) setGrades(prev => ({ ...prev, [targetId]: e.target.value as Grade }));
                      }}
                      className={cn(
                        "w-full lg:w-32 h-10 rounded-full border-2 text-[10px] font-black tracking-widest text-center cursor-pointer outline-none appearance-none transition-all",
                        (sub.isGroup ? grades[selectedOptions[sub.id]] : grades[sub.id])
                          ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "border-border/50 bg-option-pane text-foreground/80 hover:text-foreground hover:border-border hover:shadow-lg",
                        (!!exclusions[sub.id] || (sub.isGroup && !selectedOptions[sub.id])) && "opacity-20 cursor-not-allowed"
                      )}
                    >
                      <option value="" disabled className="bg-option-pane text-foreground/50">{sub.isGroup && !selectedOptions[sub.id] ? 'PICK OPTION' : 'GRADE'}</option>
                      {Object.keys(GRADE_POINTS).map(g => (
                        <option key={g} value={g} className="bg-option-pane text-foreground font-black">{g}</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip content={isNotPublished ? "Restore Grade Entry" : "Result Not Published"} position="top">
                        <button
                          onClick={() => setExclusions(prev => ({ ...prev, [sub.id]: prev[sub.id] === 'not-published' ? null : 'not-published' }))}
                          className={cn(
                            "h-10 w-10 lg:h-9 lg:w-9 rounded-xl flex items-center justify-center border-2 transition-all hover:scale-110 active:scale-95 shadow-lg",
                            exclusions[sub.id] === 'not-published'
                              ? "bg-amber-500 border-amber-500 text-white shadow-amber-500/20"
                              : "border-border/50 bg-card text-muted-foreground hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 shadow-none"
                          )}
                        >
                          <History className="h-4 w-4" />
                        </button>
                      </Tooltip>

                      <Tooltip content="Delete Subject" position="top">
                        <button
                          onClick={() => setExclusions(prev => ({ ...prev, [sub.id]: 'not-taken' }))}
                          className="h-10 w-10 lg:h-9 lg:w-9 rounded-xl flex items-center justify-center border-2 transition-all hover:scale-110 active:scale-95 border-border/50 bg-card text-muted-foreground hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 shadow-none"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                  );
              });
            })()}
            </>
            )}

            {/* Footer Actions */}
            <div className="mt-8 lg:mt-16 mb-24 lg:mb-32 flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-4 lg:p-10 rounded-[2.5rem] bg-card border-2 border-border/50 gap-8 lg:gap-0 shadow-2xl relative overflow-hidden group/actions">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/20 via-primary/20 to-red-500/20" />
              
              <div className="grid grid-cols-2 lg:flex lg:flex-row items-center gap-3 lg:gap-6 order-2 lg:order-1 w-full lg:w-auto">
                <button
                  onClick={() => {
                    const newGrades = { ...grades };
                    currentSem?.subjects.forEach((s: Subject) => delete newGrades[s.id]);
                    setGrades(newGrades);
                  }}
                  className="h-14 lg:h-12 px-6 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all bg-red-500/5 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white active:scale-95 group/reset"
                >
                  <Trash2 className="h-4 w-4 transition-transform group-hover/reset:-rotate-12" /> <span className="hidden sm:inline">Reset</span> Grid
                </button>

                <button
                  onClick={() => {
                    const newSub: Subject = { id: `custom-${Math.random()}`, name: '', credits: 0, isCustom: true };
                    setCustomSubjects(prev => ({ ...prev, [expandedSem!]: [...(prev[expandedSem!] || []), newSub] }));
                  }}
                  className="h-14 lg:h-12 px-6 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all bg-emerald-500/5 text-primary border border-emerald-500/10 hover:bg-emerald-500 hover:text-black active:scale-95 group/add"
                >
                  <Plus className="h-4 w-4 transition-transform group-hover/add:rotate-90" /> Add Row
                </button>

                {Object.keys(exclusions).filter(k => (currentSem?.subjects.some((s: Subject) => s.id === k) || customSubjects[expandedSem!]?.some((s: Subject) => s.id === k)) && exclusions[k]).length > 0 && (
                  <button
                    onClick={() => setExclusions({})}
                    className="h-14 lg:h-12 px-6 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all bg-card border-2 border-border hover:border-primary hover:text-primary active:scale-95"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Restore {Object.keys(exclusions).filter(k => (currentSem?.subjects.some((s: Subject) => s.id === k) || customSubjects[expandedSem!]?.some((s: Subject) => s.id === k)) && exclusions[k]).length}
                  </button>
                )}
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

      {/* Mobile Floating Action Button (FAB) */}
      <AnimatePresence>
        {results.cgpa > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 100 }}
            className="lg:hidden fixed bottom-8 right-6 z-[90]"
          >
            <button
              onClick={() => setIsSaveModalOpen(true)}
              disabled={isSaving}
              className={cn(
                "h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90",
                saveStatus === 'success' 
                  ? "bg-emerald-500 text-black" 
                  : "bg-emerald-500 text-black shadow-emerald-500/40"
              )}
            >
              <div className="flex flex-col items-center gap-0.5">
                <Save className="h-5 w-5" />
                <span className="text-[7px] font-black uppercase tracking-tighter">Save</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Session Modal */}
      <AnimatePresence>
        {isSaveModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSaveModalOpen(false)}
              className="absolute inset-0 bg-background/60 backdrop-blur-xl" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card border-2 border-border shadow-2xl rounded-[3rem] p-8 lg:p-12 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500/50 via-primary to-emerald-500/50" />
              
              <div className="flex flex-col items-center text-center gap-6">
                <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
                  <Save className="h-10 w-10 text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black tracking-tight uppercase">Save Session</h2>
                  <p className="text-sm text-muted-foreground font-medium">Enter a student name to identify these results in your history.</p>
                </div>

                <div className="w-full space-y-4">
                  <div className="space-y-2 text-left px-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Student Name / Label</label>
                    <input
                      autoFocus
                      type="text"
                      placeholder={session?.user?.name || "e.g. Rahul K."}
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      className="w-full h-14 bg-surface border-2 border-border/50 rounded-2xl px-6 font-black text-lg outline-none focus:border-primary transition-all placeholder:text-muted-foreground/30"
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="h-14 w-full bg-emerald-500 text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:grayscale"
                    >
                      {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-5 w-5" /> Confirm & Save</>}
                    </button>
                    <button
                      onClick={() => setIsSaveModalOpen(false)}
                      className="h-14 w-full bg-transparent text-muted-foreground font-black uppercase tracking-widest text-[10px] hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* PDF Password Modal */}
      <AnimatePresence>
        {isPdfModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPdfModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-[2.5rem] p-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setIsPdfModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X />
                </button>
              </div>

              <div className="mb-8">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 mb-6">
                  <FileText className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-black text-foreground tracking-tighter mb-2">Import Transcripts</h2>
                <p className="text-muted-foreground text-sm font-medium">
                  {!useSamePassword && pendingFiles.length > 0
                    ? `Enter password for "${pendingFiles[0].name}"`
                    : "Enter the password used to open your Kerala Polytechnic PDF marksheets."}
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">PDF Password</label>
                  <input
                    type="password"
                    value={pdfPassword}
                    onChange={(e) => {
                        setPdfPassword(e.target.value);
                        setPdfErrorMessage(null);
                    }}
                    placeholder="Enter PDF password..."
                    className={cn(
                      "w-full h-14 bg-background border rounded-2xl px-6 font-bold focus:border-primary transition-all text-center",
                      pdfErrorMessage ? "border-red-500" : "border-border/50"
                    )}
                    autoFocus
                  />
                  {pdfErrorMessage && (
                    <p className="text-[10px] font-bold text-red-500 text-center uppercase tracking-widest">{pdfErrorMessage}</p>
                  )}
                </div>

                {pendingFiles.length > 1 && (
                  <div className="flex items-center justify-center gap-3 py-2 cursor-pointer group" onClick={() => setUseSamePassword(!useSamePassword)}>
                    <div className={cn(
                      "h-5 w-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200",
                      useSamePassword 
                        ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20" 
                        : "border-border/50 group-hover:border-emerald-500/50"
                    )}>
                      {useSamePassword && <Check className="h-3.5 w-3.5 text-white stroke-[4]" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Use same password for all PDFs</span>
                  </div>
                )}

                <div className="pt-4 flex flex-col gap-3">
                  <button
                    disabled={isProcessingPdf}
                    onClick={() => processFiles(pendingFiles, pdfPassword)}
                    className="btn-primary w-full h-14 group"
                  >
                    {isProcessingPdf ? <Loader2 className="animate-spin h-5 w-5" /> : (
                        <>Process Files <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                  <button
                    onClick={() => setIsPdfModalOpen(false)}
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--primary);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {/* Elective Search Modal */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 lg:p-12"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-card border-2 border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 lg:p-8 border-b border-border/50 space-y-6 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter">Elective Search</h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Inter-Departmental Pool</p>
                  </div>
                  <button 
                    onClick={() => {
                        setIsSearchModalOpen(false);
                        setSearchQuery("");
                    }} 
                    className="h-10 w-10 rounded-full hover:bg-red-500 hover:text-white flex items-center justify-center transition-all border border-border/50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary h-5 w-5" />
                  <input 
                    autoFocus
                    placeholder="Search for subject, code or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 bg-background border-2 border-border/50 rounded-2xl pl-14 pr-6 font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg shadow-inner"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-8 custom-scrollbar bg-option-pane/30">
                {Object.keys(groupedOpenElectives).length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary/40" />
                        <p className="text-sm font-bold text-muted-foreground">Loading Elective Cache...</p>
                    </div>
                ) : (
                    Object.entries(groupedOpenElectives).sort(([a], [b]) => a.localeCompare(b)).map(([progName, items]) => {
                        const q = searchQuery.toLowerCase();
                        const filtered = items.filter(it => {
                            const progCode = it.semester?.program?.code?.toLowerCase() || "";
                            return it.name.toLowerCase().includes(q) || 
                                   it.code.toLowerCase().includes(q) ||
                                   progName.toLowerCase().includes(q) ||
                                   progCode.includes(q);
                        });
                        
                        if (filtered.length === 0) return null;

                        return (
                            <div key={progName} className="space-y-3">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="h-1 w-6 bg-primary/20 rounded-full" />
                                    <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">{progName}</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {filtered.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                if (activeSearchGroup) {
                                                    setSelectedOptions(prev => ({ ...prev, [activeSearchGroup]: item.id }));
                                                    setIsSearchModalOpen(false);
                                                    setSearchQuery("");
                                                }
                                            }}
                                            className="w-full text-left p-4 rounded-3xl bg-card border-2 border-transparent hover:border-primary/40 hover:bg-primary/5 transition-all group flex items-center justify-between"
                                        >
                                            <div>
                                                <p className="font-black text-sm lg:text-base tracking-tight group-hover:text-primary transition-colors">{item.name}</p>
                                                <p className="text-[10px] font-black text-muted-foreground/60 tracking-widest uppercase">{item.code}</p>
                                            </div>
                                            <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
                
                {searchQuery && Object.values(groupedOpenElectives).every(items => 
                    items.every(it => !it.name.toLowerCase().includes(searchQuery.toLowerCase()) && !it.code.toLowerCase().includes(searchQuery.toLowerCase()))
                ) && (
                    <div className="py-20 text-center text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="font-bold">No results found for "{searchQuery}"</p>
                    </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
