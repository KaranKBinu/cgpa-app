"use client";

import React, { useState, useMemo } from 'react';
import { groupSemesters, Grade } from '@/lib/calculator';
import { parseTranscriptPdfs } from '@/lib/pdfParser';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Program } from '@/types/calculator';

// Sub-components
import { DesktopSidebar } from './calculator/DesktopSidebar';
import { CalculatorHeader } from './calculator/CalculatorHeader';
import { SemesterHUD } from './calculator/SemesterHUD';
import { SubjectsView } from './calculator/SubjectsView';
import { ManualEntryView } from './calculator/ManualEntryView';
import { ActionFABs } from './calculator/ActionFABs';
import { SaveSessionModal } from './calculator/SaveSessionModal';
import { PDFImportModal } from './calculator/PDFImportModal';
import { LoadingOverlay } from './calculator/LoadingOverlay';
import { ToastContainer, ToastData } from './calculator/Toast';

// Hooks
import { useCalculatorCore } from '@/hooks/useCalculatorCore';
import { useCalculatorActions } from '@/hooks/useCalculatorActions';

export default function Calculator({ 
  program, historicalData, globalOpenElectives = [], userIsLET = false 
}: { 
  program: Program; historicalData?: any; globalOpenElectives?: any[]; userIsLET?: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const groupedSemesters = useMemo(() => groupSemesters(program.semesters), [program.semesters]);
  
  const core = useCalculatorCore({ program, historicalData, globalOpenElectives, userIsLET, groupedSemesters });
  const actions = useCalculatorActions({
    ...core, program, session, router, groupedSemesters, globalOpenElectives,
    setGrades: core.setGrades, setExclusions: core.setExclusions, setCustomSubjects: core.setCustomSubjects,
    setActiveSessionId: core.setActiveSessionId
  });

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (message: string, variant: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, variant }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync save status to modal closure and toasts
  React.useEffect(() => {
    if (actions.saveStatus === 'success') {
      setIsSaveModalOpen(false);
      addToast("Progress saved to your account!", 'success');
      actions.resetSaveStatus();
    } else if (actions.saveStatus === 'error') {
      addToast("Failed to save progress.", 'error');
      actions.resetSaveStatus();
    }
  }, [actions.saveStatus, actions]);

  const currentSem = core.displayedSemesters.find(s => s.id === core.expandedSem);
  const currentSemRes = core.results.semResults.find(r => r.id === core.expandedSem);

  const groupedOpenElectives = useMemo(() => {
    const groups: Record<string, any[]> = {};
    globalOpenElectives.forEach(sub => {
      const progName = sub.semester?.program?.name || "Other";
      if (!groups[progName]) groups[progName] = [];
      groups[progName].push(sub);
    });
    return groups;
  }, [globalOpenElectives]);

  const handleImportConfirm = async () => {
    actions.setIsProcessingPdf(true);
    actions.setPdfErrorMessage(null);
    try {
      const res = await parseTranscriptPdfs(actions.pendingFiles, actions.pdfPassword);
      if (res.success && res.results) {
        const newGrades: Record<string, Grade> = {};
        const newSelectedOptions: Record<string, string> = {};
        const newCustomSubjects: Record<string, any[]> = {};
        const newExclusions: Record<string, 'not-published' | 'not-taken' | null> = {};
        
        res.results.forEach((fileRes: any) => {
          if (!fileRes.subjects) return;

          // Find the target semester(s) in our program that correspond to this PDF file
          const targetSemesters = program.semesters.filter(sem => {
            if (sem.number !== fileRes.semester) return false;

            // Handle S6 Pathway prioritization
            if (sem.number === 6) {
              const semName = sem.name.toLowerCase();
              const isInternshipSem = semName.includes('internship pathway');
              const isNormalSem = semName.includes('normal pathway') || !isInternshipSem;

              const matchesPathway = (actions.s6Pathway === 'internship' && isInternshipSem) || 
                                    (actions.s6Pathway === 'normal' && isNormalSem);
              return matchesPathway;
            }
            return true;
          });

          // Fallback to number match if pathway specific one not found or multiple found
          const targetSem = targetSemesters[0] || program.semesters.find(s => s.number === fileRes.semester);
          if (!targetSem) return;

          // Track which DB subject IDs (or group IDs) were matched from the PDF
          const matchedDbSubjectIds = new Set<string>();

          fileRes.subjects.forEach((extracted: any) => {
            let matched = false;
            const normalizedCode = extracted.code?.trim().toUpperCase();

            // 1. Direct match with standard subjects
            const directMatch = targetSem.subjects.find(sub => !sub.isGroup && sub.code?.trim().toUpperCase() === normalizedCode);
            if (directMatch) {
              newGrades[directMatch.id] = extracted.grade;
              matchedDbSubjectIds.add(directMatch.id);
              matched = true;
            } else {
              // 2. Search in local elective options or open electives
              for (const sub of targetSem.subjects) {
                if (sub.isGroup) {
                  const optMatch = sub.options?.find(o => o.code?.trim().toUpperCase() === normalizedCode);
                  if (optMatch) {
                    newGrades[optMatch.id] = extracted.grade;
                    newSelectedOptions[sub.id] = optMatch.id;
                    matchedDbSubjectIds.add(sub.id); // group itself is matched
                    matched = true;
                    break;
                  }
                  
                  if (sub.category === 'Open Elective course') {
                    const globalMatch = globalOpenElectives.find(o => o.code?.trim().toUpperCase() === normalizedCode);
                    if (globalMatch) {
                      newGrades[globalMatch.id] = extracted.grade;
                      newSelectedOptions[sub.id] = globalMatch.id;
                      matchedDbSubjectIds.add(sub.id); // group itself is matched
                      matched = true;
                      break;
                    }
                  }
                }
              }

              // 3. Check if it's already in customSubjects (either in state or newly added in this loop)
              if (!matched) {
                const existingCustom = [
                  ...(core.customSubjects[targetSem.id] || []),
                  ...(newCustomSubjects[targetSem.id] || [])
                ].find(s => s.code?.trim().toUpperCase() === normalizedCode);

                if (existingCustom) {
                  newGrades[existingCustom.id] = extracted.grade;
                  matched = true;
                }
              }
            }

            // 4. Unmatched: Add as new custom subject
            if (!matched) {
              if (!newCustomSubjects[targetSem.id]) newCustomSubjects[targetSem.id] = [];
              const customId = `c-${Math.random().toString(36).substring(2, 9)}`;
              newCustomSubjects[targetSem.id].push({
                id: customId,
                name: extracted.name,
                code: extracted.code,
                credits: 0,
                isCustom: true
              });
              newGrades[customId] = extracted.grade;
            }
          });

          // BUG FIX: DB subjects in this semester that were NOT in the PDF
          // must be hidden from the UI — mark them as 'not-taken'.
          targetSem.subjects.forEach((sub) => {
            if (!matchedDbSubjectIds.has(sub.id)) {
              newExclusions[sub.id] = 'not-taken';
            }
          });
        });

        // Check if any results failed due to password
        const hasPasswordError = res.results.some((r: any) => r.isPasswordRequired);
        if (hasPasswordError) {
          actions.setPdfErrorMessage("Incorrect password or password required for some files.");
          actions.setIsProcessingPdf(false);
          return;
        }

        if (Object.keys(newGrades).length > 0) {
          core.setGrades(prev => ({ ...prev, ...newGrades }));
          if (Object.keys(newSelectedOptions).length > 0) {
            core.setSelectedOptions(prev => ({ ...prev, ...newSelectedOptions }));
          }
          if (Object.keys(newCustomSubjects).length > 0) {
            core.setCustomSubjects(prev => {
              const next = { ...prev };
              Object.entries(newCustomSubjects).forEach(([semId, subs]) => {
                next[semId] = [...(next[semId] || []), ...subs];
              });
              return next;
            });
          }
          if (Object.keys(newExclusions).length > 0) {
            core.setExclusions(prev => ({ ...prev, ...newExclusions }));
          }
          
          actions.setPendingFiles([]); 
          actions.setPdfPassword(""); 
          actions.setIsProcessingPdf(false);
        } else {
          // No subjects found and no password error
          actions.setPdfErrorMessage("Could not find any subjects to import. Please check if the PDF is correct.");
          actions.setIsProcessingPdf(false);
        }
      } else { 
        actions.setPdfErrorMessage((res as any).error || "Parsing failed"); 
        actions.setIsProcessingPdf(false); 
      }
    } catch (e) { 
      actions.setPdfErrorMessage("Parsing failed"); 
      actions.setIsProcessingPdf(false); 
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-emerald-500/30 transition-colors duration-500">
      <DesktopSidebar {...core} semResults={core.results.semResults} session={session} signOut={signOut} />

      <main className="flex-1 flex flex-col min-w-0">
        <CalculatorHeader 
          {...core} program={program} results={core.results} {...actions} session={session} groupedSemesters={groupedSemesters}
          handleSave={() => setIsSaveModalOpen(true)}
          onImportClick={() => (document.getElementById('pdf-upload') as any)?.click()}
          resetCalculator={() => {
            if (window.confirm("Are you sure you want to clear current data and start a new calculation?")) {
              core.resetCalculator();
              router.replace(`/calculate/${program.code}`);
            }
          }}
        />

        <div className="px-3 sm:px-4 lg:px-10 py-6 lg:py-12 pb-32 lg:pb-12">
          <div className="max-w-4xl mx-auto space-y-4 lg:space-y-12">
            <SemesterHUD 
              currentSem={currentSem} expandedSem={core.expandedSem} manualSgpas={core.manualSgpas} 
              setManualSgpas={core.setManualSgpas} currentSemRes={currentSemRes} 
            />

            <div className="grid grid-cols-1 gap-1">
              {core.manualSgpas[core.expandedSem!] ? (
                <ManualEntryView currentSem={currentSem} manualSgpas={core.manualSgpas} setManualSgpas={core.setManualSgpas} />
              ) : (
                <SubjectsView 
                   {...core} currentSem={currentSem} globalOpenElectives={globalOpenElectives} onGradeChange={(id, g) => core.setGrades(prev => ({ ...prev, [id]: g }))}
                   onExclude={(id, t) => core.setExclusions(prev => ({ ...prev, [id]: t }))}
                   onRemoveCustom={(sid, subId) => {
                     core.setCustomSubjects(p => ({
                       ...p,
                       [sid]: (p[sid] || []).filter(s => s.id !== subId)
                     }));
                     // Also clear grade/exclusion for this custom subject
                     core.setGrades(prev => {
                       const next = { ...prev };
                       delete next[subId];
                       return next;
                     });
                     core.setExclusions(prev => {
                       const next = { ...prev };
                       delete next[subId];
                       return next;
                     });
                   }}
                   setCustomSubjects={core.setCustomSubjects}
                />
              )}
            </div>
          </div>
        </div>

        <ActionFABs {...core} {...actions} currentSemRes={currentSemRes} setIsSaveModalOpen={setIsSaveModalOpen} />
      </main>

      <input type="file" id="pdf-upload" multiple accept=".pdf" className="hidden" 
        onChange={async (e) => {
          const files = Array.from(e.target.files || []);
          const p = await Promise.all(files.map(file => {
            return new Promise<{ name: string, data: string }>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve({ name: file.name, data: base64 });
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          }));
          actions.setPendingFiles(p);
          // Reset input so the same file can be selected again if needed
          e.target.value = '';
        }}
      />

      <SaveSessionModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} {...core} {...actions} />
      <PDFImportModal isOpen={actions.pendingFiles.length > 0} onClose={() => actions.setPendingFiles([])} {...actions} onConfirm={handleImportConfirm} errorMessage={actions.pdfErrorMessage} isProcessing={actions.isProcessingPdf} />
      

      <LoadingOverlay 
        isLoading={actions.isSaving || actions.isProcessingPdf} 
        message={actions.isSaving ? "Saving Calculation..." : "Processing PDFs..."} 
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
