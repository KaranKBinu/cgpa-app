import { PrismaClient } from '@prisma/client';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

const prisma = new PrismaClient();
const workerPath = path.resolve('node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
(pdfjs as any).GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
const GRADE_POINTS: any = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 };

async function validate() {
  const password = "13032004";
  const testDir = "a:/karan/codesOfKaran/cgpacalculator/cgpa-app/public/test marks";
  const files = ["sem1_mark.pdf", "sem2_mark.pdf", "sem3_mark.pdf", "sem4_mark.pdf", "sem5_mark.pdf", "sem6_mark.pdf"];
  
  const program = await prisma.program.findUnique({
    where: { code: 'CM' },
    include: { semesters: { include: { subjects: { include: { options: true } } } } }
  });

  const results = [];
  for (const fileName of files) {
    const buffer = fs.readFileSync(path.join(testDir, fileName));
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer), password, verbosity: 0 }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += (textContent.items as { str: string }[]).map((item) => item.str).join(' ') + ' ';
    }
    const semMatch = fullText.match(/(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH)\s+SEMESTER/i);
    const semLetter = semMatch ? semMatch[1].trim() : "Unknown";
    const semMap: any = { 'FIRST': 1, 'SECOND': 2, 'THIRD': 3, 'FOURTH': 4, 'FIFTH': 5, 'SIXTH': 6 };
    const semNum = semMap[semLetter];
    const semester = program!.semesters.find(s => s.number === semNum);
    
    let totalPoints = 0;
    let totalCredits = 0;
    const rowRegex = /(\d{4}[A-Z]{0,1})\s+(.*?)\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s+([SABCDEF])/gi;
    
    let match;
    while ((match = rowRegex.exec(fullText.substring(fullText.indexOf("Grade")))) !== null) {
        const code = match[1];
        const grade = match[3];
        let dbSub = null;
        for(const s of semester!.subjects) {
            if (s.code === code) dbSub = s;
            else { const opt = s.options.find(o => o.code === code); if (opt) dbSub = opt; }
        }
        if (!dbSub) dbSub = await prisma.syllabusSubject.findFirst({ where: { code: code } });
        if (dbSub && dbSub.credits > 0) {
            totalPoints += GRADE_POINTS[grade] * dbSub.credits;
            totalCredits += dbSub.credits;
        }
    }
    results.push({ semName: semLetter, sgpa: totalPoints / totalCredits, totalCredits });
  }

  console.log("\n--- TEST RESULTS SUMMARY ---");
  results.forEach(r => console.log(`${r.semName.padEnd(8)} SEMESTER: SGPA ${r.sgpa.toFixed(2)} (${r.totalCredits} Credits)`));
  
  const totalPoints = results.reduce((acc, r) => acc + (r.sgpa * r.totalCredits), 0);
  const totalCredits = results.reduce((acc, r) => acc + r.totalCredits, 0);
  const finalCgpa = totalPoints / totalCredits;
  
  console.log(`\n---------------------------`);
  console.log(`Calculated CGPA: ${finalCgpa.toFixed(2)}`);
  console.log(`Official CGPA  : 8.66`);
  console.log(`Match Status   : ${Math.abs(finalCgpa - 8.66) < 0.01 ? "✅ PERFECT MATCH" : "❌ DISCREPANCY"}`);
  console.log(`---------------------------\n`);
}

validate().catch(console.error).finally(() => prisma.$disconnect());
