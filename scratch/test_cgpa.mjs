import fs from 'fs';
import path from 'path';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { pathToFileURL } from 'url';

// Set up PDF.js worker
const workerPath = path.resolve('node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

const GRADE_POINTS = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 };

async function parseMarks() {
    const dir = 'a:/karan/codesOfKaran/cgpacalculator/cgpa-app/public/test marks let';
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));
    const results = [];

    for (const file of files) {
        const buffer = fs.readFileSync(path.join(dir, file));
        const uint8Array = new Uint8Array(buffer);
        
        const pdf = await pdfjs.getDocument({ data: uint8Array, password: '28042004', verbosity: 0 }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map((item) => item.str).join(' ') + ' ';
        }

        const semMatch = fullText.match(/(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH)\s+SEMESTER/i);
        const semName = semMatch ? semMatch[1].trim() : "Unknown";
        
        const rowRegex = /(\d{4}[A-Z]{0,1})\s+(.*?)\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s+([SABCDEF])/gi;
        const subjects = [];
        let match;
        while ((match = rowRegex.exec(fullText)) !== null) {
            // Assume 3 credits for each subject for simplicity in this test, 
            // OR we should look up real credits.
            // Wait, for CGPA we need real credits.
            subjects.push({ code: match[1], name: match[2], grade: match[3] });
        }
        results.push({ semName, subjects });
    }
    return results;
}

// Mock credits database (very simplified for test)
const MOCK_CREDITS = {
    // S1
    "2001": 5, "2002": 4, "2003": 4, "2004": 3, "2005": 3, "2109": 1.5, "2108": 1.5,
    // S3 (CM)
    "3131": 4, "3132": 3, "3133": 3, "3134": 3, "3139": 2.5, "3137": 1.5, "3138": 1.5, "3001": 0, "3002": 3,
};

function calculateSGPA(subs) {
    let pts = 0;
    let crs = 0;
    subs.forEach(s => {
        const c = MOCK_CREDITS[s.code] || 3; // Default 3 if missing
        pts += GRADE_POINTS[s.grade] * c;
        crs += c;
    });
    return crs > 0 ? pts / crs : 0;
}

async function run() {
    const sems = await parseMarks();
    console.log("Calculated SGPAs:");
    const results = sems.map(s => {
        const sgpa = calculateSGPA(s.subjects);
        const credits = s.subjects.reduce((acc, sub) => acc + (MOCK_CREDITS[sub.code] || 3), 0);
        console.log(`${s.semName}: SGPA=${sgpa.toFixed(2)}, Credits=${credits}`);
        return { sgpa, credits, name: s.semName };
    });

    // CGPA from All
    let tPts = 0, tCrs = 0;
    results.forEach(r => { tPts += r.sgpa * r.credits; tCrs += r.credits; });
    console.log(`\nOverall CGPA (S1-S6): ${(tPts / tCrs).toFixed(2)}`);

    // CGPA from S3-S6 (LET)
    tPts = 0; tCrs = 0;
    results.filter(r => !['FIRST', 'SECOND'].includes(r.name)).forEach(r => { tPts += r.sgpa * r.credits; tCrs += r.credits; });
    console.log(`LET CGPA (S3-S6): ${(tPts / tCrs).toFixed(2)}`);
}

run();
