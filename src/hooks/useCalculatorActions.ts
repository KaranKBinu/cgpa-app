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
    const pageHeight = doc.internal.pageSize.getHeight();
    const isSingleSem = typeof semIdOrEvent === 'string';
    const semId = isSingleSem ? semIdOrEvent : undefined;

    const targets = isSingleSem
      ? results.semResults.filter(s => s.id === semId)
      : (isLETMode ? results.semResults.filter(s => s.sgpa > 0 && s.number > 2) : results.semResults.filter(s => s.sgpa > 0));
    
    if (targets.length === 0) return;

    // Helper for Emerald color
    const primaryColor = [16, 185, 129] as [number, number, number];
    const secondaryColor = [31, 41, 55] as [number, number, number];

    // Page Background Accent
    doc.setFillColor(252, 252, 252);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Header Branding
    doc.setFontSize(24);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("PolyGrade", 14, 25);
    
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.setFont("helvetica", "normal");
    doc.text("KERALA POLYTECHNIC ACADEMIC RECORD", 14, 32);

    // Right-aligned Info
    doc.setFontSize(9);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - 14, 25, { align: 'right' });
    doc.text(`ID: PG-${Math.random().toString(36).substring(7).toUpperCase()}`, pageWidth - 14, 30, { align: 'right' });

    // Main Title Section
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(14, 45, pageWidth - 28, 0.5, 'F');

    doc.setFontSize(18);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(isSingleSem ? "SEMESTER STATEMENT" : "CUMULATIVE TRANSCRIPT", 14, 60);

    // Candidate Info Box
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(14, 68, pageWidth - 28, 25, 3, 3, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("CANDIDATE NAME", 20, 75);
    doc.text("ACADEMIC PROGRAM", pageWidth / 2 + 10, 75);
    
    doc.setFontSize(11);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(studentName.toUpperCase() || (session?.user?.name?.toUpperCase() || "N/A"), 20, 82);
    doc.text(`${program.name} (${program.code})`, pageWidth / 2 + 10, 82);

    // Summary Stats
    let currentY = 105;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.roundedRect(14, currentY, (pageWidth - 32) / 2, 20, 2, 2, 'F');
    
    doc.setFillColor(31, 41, 55);
    doc.roundedRect(pageWidth / 2 + 2, currentY, (pageWidth - 32) / 2, 20, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.text(isSingleSem ? "SEMESTER SGPA" : "CUMULATIVE CGPA", 20, currentY + 7);
    doc.text("EQUIVALENT PERCENTAGE", pageWidth / 2 + 8, currentY + 7);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    if (isSingleSem) {
      const sem = targets[0];
      doc.text(sem.sgpa.toFixed(2), 20, currentY + 15);
      doc.text(`${sem.percentage.toFixed(1)}%`, pageWidth / 2 + 8, currentY + 15);
    } else {
      doc.text(results.cgpa.toFixed(2), 20, currentY + 15);
      doc.text(`${results.totalPercentage.toFixed(1)}%`, pageWidth / 2 + 8, currentY + 15);
    }

    currentY += 35;

    // Table Section
    targets.forEach((sem, idx) => {
      const curricularSem = groupedSemesters.find(s => s.id === sem.id);
      if (!curricularSem) return;

      if (currentY + 50 > pageHeight) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text(`${sem.name.toUpperCase()}`, 14, currentY);
      
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.setFont("helvetica", "normal");
      doc.text(`SGPA: ${sem.sgpa.toFixed(2)} | CREDITS: ${sem.earnedCredits}`, pageWidth - 14, currentY, { align: 'right' });

      const resolved = curricularSem.subjects.flatMap(s => {
        if (s.isGroup) {
          const optId = selectedOptions[s.id];
          const opt = s.options?.find((o: any) => o.id === optId) || globalOpenElectives?.find((o: any) => o.id === optId);
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
            s.code || 'N/A',
            s.name,
            s.credits,
            isNP ? 'PENDING' : (grades[s.id] || '-')
          ];
        });

      if (sem.isManual) {
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text("Note: Semester marks were entered as an aggregate value.", 14, currentY + 6);
        currentY += 15;
      } else if (tableData.length > 0) {
        autoTable(doc, {
          startY: currentY + 4,
          head: [['CODE', 'COURSE TITLE', 'CREDITS', 'GRADE']],
          body: tableData,
          theme: 'grid',
          headStyles: { 
            fillColor: [243, 244, 246], 
            textColor: [31, 41, 55],
            fontSize: 7,
            fontStyle: 'bold',
            halign: 'center'
          },
          styles: { 
            fontSize: 7,
            cellPadding: 3,
            textColor: [55, 65, 81]
          },
          columnStyles: {
            0: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 20, halign: 'center' }
          },
          margin: { left: 14, right: 14 }
        });
        currentY = (doc as any).lastAutoTable.finalY + 12;
      } else {
        currentY += 10;
      }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable?.finalY || currentY;
    doc.setFontSize(7);
    doc.setTextColor(180);
    doc.text("Disclaimer: This is a system-generated transcript for self-assessment purposes and may not be used as an official document.", pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text("Generated by PolyGrade - Kerala Polytechnic Revision 2021 GPA Calculator", pageWidth / 2, pageHeight - 14, { align: 'center' });

    doc.save(isSingleSem ? `Semester_Transcript_${targets[0].number}_${program.code}.pdf` : `PolyGrade_Full_Report_${program.code}.pdf`);
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
