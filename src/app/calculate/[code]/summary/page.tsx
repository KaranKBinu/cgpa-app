"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Trophy, BarChart3, TrendingUp, Star, Download, Share2, ArrowUpRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CGPATrend } from '@/components/calculator/CGPATrend';


export default function SummaryPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [context, setContext] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);


  useEffect(() => {
    setMounted(true);
    
    if (status === 'unauthenticated') {
      const currentPath = window.location.pathname + window.location.search;
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (status === 'authenticated') {
      const searchParams = new URLSearchParams(window.location.search);
      const sessionId = searchParams.get('session') || 'draft';
      const saved = sessionStorage.getItem(`summary_context_${params.code}_${sessionId}`);
      
      if (saved) {
        setContext(JSON.parse(saved));
      } else {
        router.replace(`/calculate/${params.code}`);
      }
    }
  }, [params.code, router, status]);


  const downloadAsPDF = async () => {
    if (!context) return;
    setIsExporting(true);
    try {
        const { results, program, grades, exclusions, customSubjects, selectedOptions, isLETMode, globalOpenElectives } = context;
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        const targets = isLETMode 
            ? results.semResults.filter((s: any) => s.sgpa > 0 && s.number > 2) 
            : results.semResults.filter((s: any) => s.sgpa > 0);

        if (targets.length === 0) {
            setIsExporting(false);
            return;
        }

        doc.setFontSize(22); 
        doc.setTextColor(16, 185, 129); 
        doc.text("PolyGrade Cumulative Report", 14, 22);
        doc.text(`PolyGrade Final Transcript`, (pageWidth / 2) - 30, 60);
        
        doc.setFontSize(10); 
        doc.setTextColor(100); 
        doc.text(`Program: ${program.name} (${program.code})`, 14, 30); 
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35); 
        doc.text(`System: Kerala Polytechnic REV2021 Calculator`, 14, 40);
        
        doc.setDrawColor(240, 240, 240); 
        doc.setFillColor(252, 252, 252); 
        doc.roundedRect(14, 45, pageWidth - 28, 25, 2, 2, 'FD');
        
        doc.setFontSize(16); 
        doc.setTextColor(0);
        doc.text(`FINAL CGPA: ${results.cgpa.toFixed(2)}`, 20, 62); 
        doc.text(`EQUIVALENT PERCENTAGE: ${results.totalPercentage.toFixed(1)}%`, pageWidth / 2, 62);

        let currentY = 85;
        targets.forEach((sem: any) => {
            const curricularSem = program.semesters.find((s: any) => s.id === sem.id);
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
            doc.text(`SGPA: ${sem.sgpa.toFixed(2)} | Credits Earned: ${sem.earnedCredits}`, 14, currentY + 6);
            
            const resolved = curricularSem.subjects.flatMap((s: any) => { 
                if (s.isGroup) { 
                    const optId = selectedOptions[s.id]; 
                    const opt = s.options?.find((o: any) => o.id === optId) || globalOpenElectives.find((o: any) => o.id === optId); 
                    return opt ? [opt] : []; 
                } 
                return [s]; 
            });

            const semSubjects = [...resolved, ...(customSubjects[sem.id] || [])];
            const tableData = semSubjects.filter(s => (grades[s.id] || exclusions[s.id] === 'not-published') && exclusions[s.id] !== 'not-taken').map(s => { 
                const isNP = exclusions[s.id] === 'not-published'; 
                return [s.code || 'VAR', s.name, s.credits, isNP ? 'PENDING' : (grades[s.id] || '-')]; 
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
                    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] }, 
                    styles: { fontSize: 8 }, 
                    margin: { left: 14, right: 14 } 
                }); 
                currentY = (doc as any).lastAutoTable.finalY + 15; 
            }
        });
        doc.save(`PolyGrade_FullReport_${program.code}.pdf`);
    } catch (error) {
        console.error("PDF Export failed:", error);
    } finally {
        setIsExporting(false);
    }
  };

  if (!mounted || status === 'loading' || !session || !context) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    );
  }


  const { results, studentName } = context;
  const validSems = results.semResults.filter((s: any) => s.sgpa > 0);
  const hasF = Object.values(context.grades).some(g => g === 'F');

  const getClassification = () => {
    if (hasF) return "Not Passed";
    if (results.cgpa === 0) return "N/A";
    if (results.cgpa >= 8) return "First Class with Distinction";
    if (results.cgpa >= 7) return "First Class";
    return "Second Class";
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 font-sans flex flex-col relative">

      {/* Cinematic Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      </div>

      {/* Top Navigation Bar - Ultra Condensed */}
      <nav className="z-50 w-full bg-black/50 backdrop-blur-md border-b border-white/5 px-4 py-1.5 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            href={`/calculate/${params.code}`}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-emerald-400 transition-colors group"
          >
            <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
            Calculator
          </Link>
          <div className="flex items-center gap-4">
             <button 
                onClick={downloadAsPDF}
                disabled={isExporting}
                className="bg-emerald-500 text-black px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
             >
                {isExporting ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Download className="h-2.5 w-2.5" />}
                Export
             </button>
          </div>
        </div>
      </nav>

      {/* Main Container - Maximum Density Layout - With slight breathing room */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 pt-6 pb-12 max-w-4xl mx-auto w-full gap-2 overflow-y-auto custom-scrollbar">

        
        {/* Main Hero Result - Zero Gap */}
        <section className="relative flex flex-col items-center justify-center py-0">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 text-center flex flex-col items-center"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-[0.4em] mb-2">
                    <Trophy className="h-3 w-3" />
                    Final Scorecard
                </div>

                {studentName && (
                  <p className="text-xs sm:text-sm font-black text-white/80 uppercase tracking-[0.2em] mb-4 text-center px-4">
                    {studentName}
                  </p>
                )}

                <h1 className="relative group leading-[0.8] mb-0">
                    <motion.span 
                        className="text-[6rem] sm:text-[10rem] md:text-[14rem] font-black tracking-tighter block glare-text select-none"
                    >
                        {results.cgpa.toFixed(2)}
                    </motion.span>
                    <span className="text-[11px] sm:text-sm font-black uppercase tracking-[0.5em] text-emerald-500/60 block mt-1">
                        Cumulative GPA
                    </span>
                </h1>

                <div className="mt-1 px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
                    <p className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-emerald-400">
                        {getClassification()}
                    </p>
                </div>
            </motion.div>
        </section>

        {/* Aggregate Stats Row - Zero Top Margin */}
        <section className="w-full grid grid-cols-2 gap-1 shrink-0 mt-2">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Percentage</span>
                <span className="text-4xl font-black text-white">{results.totalPercentage.toFixed(1)}%</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Semesters</span>
                <span className="text-4xl font-black text-white">{validSems.length}</span>
            </div>
        </section>

        {/* Semester Journey Grid - Hero SGPAs */}
        <section className="w-full shrink-0 mt-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
                {validSems.map((sem: any, idx: number) => (
                    <motion.div
                        key={sem.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * idx }}
                        className="bg-white/5 border border-white/10 rounded-2xl py-5 px-6 flex flex-col items-center justify-center hover:bg-white/10 transition-all flex-1 min-w-[100px] max-w-[150px]"
                    >
                        <span className="text-[10px] font-black text-emerald-500 uppercase mb-0.5">Sem {sem.number}</span>
                        <p className="text-3xl font-black tracking-tighter text-white glare-text">{sem.sgpa.toFixed(2)}</p>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* Marks Over Time Chart */}
        <section className="w-full shrink-0 mt-4 mb-4 max-w-2xl mx-auto">
            <CGPATrend semResults={results.semResults} />
        </section>


        {/* Verification Footer - Minimal */}
        <footer className="shrink-0 flex flex-col items-center gap-2 opacity-30 pb-2">
            <p className="text-[7px] font-black uppercase tracking-[0.5em] text-center">
                Verified Analysis • PolyCGPA Calculator
            </p>
        </footer>

      </div>

    </div>
  );
}
