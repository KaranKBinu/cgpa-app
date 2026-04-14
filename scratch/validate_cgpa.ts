import { PrismaClient } from '@prisma/client';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

const prisma = new PrismaClient();

// PDF set up
const workerPath = path.resolve('node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
(pdfjs as any).GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

const GRADE_POINTS: any = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 };

async function validate() {
  const password = "13032004";
  const testDir = "a:/karan/codesOfKaran/cgpacalculator/cgpa-app/public/test marks";
  const files = ["sem1_mark.pdf", "sem2_mark.pdf", "sem3_mark.pdf", "sem4_mark.pdf", "sem5_mark.pdf", "sem6_mark.pdf"];
  
  const program = await prisma.program.findUnique({
    where: { code: 'CM' },
    include: {
        semesters: {
            include: {
                subjects: {
                    include: { options: true }
                }
            }
        }
      }
  });

  if (!program) throw new Error("CM Program not found");

  const results = [];
  
  for (const fileName of files) {
    const buffer = fs.readFileSync(path.join(testDir, fileName));
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer), password, verbosity: 0 }).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ') + ' ';
    }
    
    const semMatch = fullText.match(/(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH)\s+SEMESTER/i);
    const semLetter = semMatch ? semMatch[1].trim() : "Unknown";
    const semMap: any = { 'FIRST': 1, 'SECOND': 2, 'THIRD': 3, 'FOURTH': 4, 'FIFTH': 5, 'SIXTH': 6 };
    const semNum = semMap[semLetter];
    
    const tableText = fullText.substring(fullText.indexOf("Grade"));
    const rowRegex = /(\d{4}[A-Z]{0,1})\s+(.*?)\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s+([SABCDEF])/gi;
    
    const semester = program.semesters.find(s => s.number === semNum);
    if (!semester) continue;

    let totalPoints = 0;
    let totalCredits = 0;
    
    let match;
    console.log(`\n--- ${semLetter} SEMESTER ---`);
    while ((match = rowRegex.exec(tableText)) !== null) {
        const code = match[1];
        const grade = match[3];
        
        // Find subject in DB to get credits
        let dbSub = null;
        for(const s of semester.subjects) {
            if (s.code === code) dbSub = s;
            else {
                const opt = (s as any).options?.find((o: any) => o.code === code);
                if (opt) dbSub = opt;
            }
        }

        // If not found in program, search globally (Open Electives)
        if (!dbSub) {
            dbSub = await prisma.syllabusSubject.findFirst({
                where: { code: code }
            });
        }

        if (dbSub) {
            console.log(`[Matched] ${dbSub.name} (${code}): Grade ${grade}, Credits ${dbSub.credits}`);
            if (dbSub.credits > 0) {
                totalPoints += GRADE_POINTS[grade] * dbSub.credits;
                totalCredits += dbSub.credits;
            }
        } else {
            console.log(`[Unmatched] ${match[2]} (${code}): Grade ${grade}`);
        }
    }
    
    const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    console.log(`\n>>> RESULT: SGPA ${sgpa.toFixed(4)} (Total Credits: ${totalCredits})`);
    results.push({ semName: semLetter, sgpa, totalCredits });
  }

  // Calculate CGPA
  let weightedPoints = 0;
  let allCredits = 0;
  results.forEach(r => {
      weightedPoints += r.sgpa * r.totalCredits;
      allCredits += r.totalCredits;
  });
  
  const finalCgpa = allCredits > 0 ? weightedPoints / allCredits : 0;
  console.log(`\n============================`);
  console.log(`FINAL CALCULATED CGPA: ${finalCgpa.toFixed(4)}`);
  console.log(`TARGET CGPA: 8.6600`);
  console.log(`DIFFERENCE: ${Math.abs(finalCgpa - 8.66).toFixed(4)}`);
  console.log(`============================`);
}

validate().catch(console.error).finally(() => prisma.$disconnect());
