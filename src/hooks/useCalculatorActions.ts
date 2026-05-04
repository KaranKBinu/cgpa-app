import { useState } from 'react';

import { saveCalculation } from '@/app/actions';
import { Program, CalculatorResults, Semester, Subject } from '@/types/calculator';
import { Grade } from '@/lib/calculator';

interface UseCalculatorActionsProps {
  program: Program;
  results: CalculatorResults;
  grades: Record<string, Grade | "">;
  exclusions: Record<string, 'not-published' | 'not-taken' | null>;
  customSubjects: Record<string, Subject[]>;
  manualSgpas: Record<string, { sgpa: number; credits: number } | null>;
  studentName: string;
  selectedOptions: Record<string, string>;
  activeSessionId: string | null;
  session: any;
  router: any;
  isLETMode: boolean;
  groupedSemesters: Semester[];
  globalOpenElectives: any[];
  setGrades: any;
  setExclusions: any;
  setCustomSubjects: any;
  setActiveSessionId: any;
}

export function useCalculatorActions({
  program, results, grades, exclusions, customSubjects, manualSgpas, studentName, selectedOptions, activeSessionId, session, router, isLETMode, groupedSemesters, globalOpenElectives,
  setGrades, setExclusions, setCustomSubjects, setActiveSessionId
}: UseCalculatorActionsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [pdfPassword, setPdfPassword] = useState("");
  const [pdfErrorMessage, setPdfErrorMessage] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<{ name: string, data: string }[]>([]);
  const [useSamePassword, setUseSamePassword] = useState(true);
  const [s6Pathway, setS6Pathway] = useState<'normal' | 'internship'>('normal');

  const downloadAsPDF = async (semIdOrEvent?: string | any) => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const isSingleSem = typeof semIdOrEvent === 'string';
    const semId = isSingleSem ? semIdOrEvent : undefined;

    const targets = isSingleSem
      ? results.semResults.filter(s => s.id === semId)
      : (isLETMode ? results.semResults.filter(s => s.sgpa > 0 && s.number > 2) : results.semResults.filter(s => s.sgpa > 0));
    if (targets.length === 0) return;
    doc.setFontSize(22); doc.setTextColor(16, 185, 129); doc.text(isSingleSem ? "Semester Performance Report" : "PolyGrade Cumulative Report", 14, 22);
    doc.text(isSingleSem ? `Academic Result Summary` : `PolyGrade Final Transcript`, (pageWidth / 2) - 30, 60);
    doc.setFontSize(10); doc.setTextColor(100); doc.text(`Program: ${program.name} (${program.code})`, 14, 30); doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35); doc.text(`Schema: Kerala Polytechnic REV2021 Calculator`, 14, 40);
    doc.setDrawColor(240, 240, 240); doc.setFillColor(252, 252, 252); doc.roundedRect(14, 45, pageWidth - 28, 25, 2, 2, 'FD');
    doc.setFontSize(16); doc.setTextColor(0);
    if (isSingleSem) { const sem = targets[0]; doc.text(`SGPA: ${sem.sgpa.toFixed(2)}`, 20, 62); doc.text(`EQUIVALENT PERCENTAGE: ${sem.percentage.toFixed(1)}%`, pageWidth / 2, 62); }
    else { doc.text(`FINAL CGPA: ${results.cgpa.toFixed(2)}`, 20, 62); doc.text(`EQUIVALENT PERCENTAGE: ${results.totalPercentage.toFixed(1)}%`, pageWidth / 2, 62); }
    let currentY = 85;
    targets.forEach((sem) => {
      const curricularSem = groupedSemesters.find(s => s.id === sem.id);
      if (!curricularSem) return;
      if (currentY + 60 > doc.internal.pageSize.getHeight()) { doc.addPage(); currentY = 20; }
      doc.setFontSize(12); doc.setTextColor(16, 185, 129); doc.text(`${sem.name} Performance Overview`, 14, currentY);
      doc.setFontSize(10); doc.setTextColor(80); doc.text(`SGPA: ${sem.sgpa.toFixed(2)} | Credits Earned: ${sem.earnedCredits}`, 14, currentY + 6);
      const resolved = curricularSem.subjects.flatMap(s => { if (s.isGroup) { const optId = selectedOptions[s.id]; const opt = s.options?.find((o: any) => o.id === optId); return opt ? [opt] : []; } return [s]; });
      const semSubjects = [...resolved, ...(customSubjects[sem.id] || [])];
      const tableData = semSubjects.filter(s => (grades[s.id] || exclusions[s.id] === 'not-published') && exclusions[s.id] !== 'not-taken').map(s => { const isNP = exclusions[s.id] === 'not-published'; return [s.code || 'VAR', s.name, s.credits, isNP ? 'PENDING' : (grades[s.id] || '-')]; });
      if (sem.isManual) { doc.setFontSize(9); doc.setTextColor(150); doc.text("Semester was processed via manual aggregate entry.", 14, currentY + 10); currentY += 20; }
      else if (tableData.length > 0) { autoTable(doc, { startY: currentY + 10, head: [['Code', 'Course / Subject Name', 'CR', 'Grade']], body: tableData, theme: 'grid', headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] }, styles: { fontSize: 8 }, margin: { left: 14, right: 14 } }); currentY = (doc as any).lastAutoTable.finalY + 15; }
    });
    doc.save(isSingleSem ? `Transcript_${targets[0].name.replace(/\s+/g, '_')}_${program.code}.pdf` : `PolyGrade_FullReport_${program.code}.pdf`);
  };

  const handleSave = async () => {
    if (!session) { 
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`); 
      return; 
    }
    setIsSaving(true); setSaveStatus('idle');
    const label = studentName.trim() || (session?.user?.name || `Results for ${program.code}`);
    const semestersToSave = groupedSemesters.map(sem => {
      const res = results.semResults.find(r => r.id === sem.id)!;
      const resolved = sem.subjects.flatMap(sub => { 
        if (sub.isGroup) { 
          const optId = selectedOptions[sub.id]; 
          const opt = sub.options?.find((o: any) => o.id === optId) || globalOpenElectives?.find((o: any) => o.id === optId); 
          return opt ? [opt] : []; 
        } 
        return [sub]; 
      });

      const allSubjects = [...resolved, ...(customSubjects[sem.id] || [])];
      
      return { 
        id: sem.id, 
        name: sem.name, 
        number: sem.number, 
        sgpa: res.sgpa, 
        credits: res.attemptedCredits, 
        isManual: res.isManual, 
        subjects: allSubjects.map(s => {
          const isNotTaken = exclusions[s.id] === 'not-taken';
          const isPending = exclusions[s.id] === 'not-published';
          
          return { 
            code: s.code, 
            name: s.name, 
            credits: s.credits, 
            grade: isNotTaken ? 'HIDDEN' : (isPending ? 'PENDING' : (grades[s.id] || '')), 
            points: isPending ? -1 : (isNotTaken ? -2 : 0) 
          };
        })
      };
    });
    try { 
      const res = await saveCalculation({ 
        programId: program.id, 
        label, 
        cgpa: results.cgpa, 
        semesters: semestersToSave, 
        id: activeSessionId || undefined,
        isLET: isLETMode,
        studentName: studentName.trim() || undefined
      }); 
      if (res.success) {
        setSaveStatus('success');
        if (res.id) setActiveSessionId(res.id);
      } else {
        setSaveStatus('error');
      }
    }
    catch (e) { setSaveStatus('error'); }
    finally { setIsSaving(false); }
  };

  const resetSaveStatus = () => setSaveStatus('idle');

  return { isSaving, saveStatus, resetSaveStatus, isProcessingPdf, setIsProcessingPdf, pdfPassword, setPdfPassword, pdfErrorMessage, setPdfErrorMessage, pendingFiles, setPendingFiles, useSamePassword, setUseSamePassword, s6Pathway, setS6Pathway, downloadAsPDF, handleSave };
}
