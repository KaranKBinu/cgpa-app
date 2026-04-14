import fs from 'fs';
import path from 'path';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { pathToFileURL } from 'url';

// Set up PDF.js worker
const workerPath = path.resolve('node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

async function testPdfParsing(filePath) {
    const buffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(buffer);
    
    try {
        const loadingTask = pdfjs.getDocument({
            data: uint8Array,
            password: '28042004',
            verbosity: 0
        });

        const pdf = await loadingTask.promise;
        console.log(`--- File: ${path.basename(filePath)} ---`);
        console.log(`Pages: ${pdf.numPages}`);
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map((item) => item.str).join(' ') + ' ';
        }

        // Branch
        const branchMatch = fullText.match(/INSTITUTION\s*:\s*(?:Diploma\s+in\s+Engineering\s+\/\s+Technology\s+\/\s+Management\s+\/\s+Commercial Practice)?\s*(.*?)\s+(?:\d{10}|REGISTER|NAME|FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|THE GRADE)/i);
        const branch = branchMatch ? branchMatch[1].trim() : "Unknown";
        console.log(`Branch: ${branch}`);

        // Semester
        const semMatch = fullText.match(/BRANCH\s*:\s*(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH)\s+SEMESTER/i) 
                      || fullText.match(/(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH)\s+SEMESTER/i);
        const semesterLetter = semMatch ? semMatch[1].trim() : "Unknown";
        console.log(`Semester: ${semesterLetter}`);

        // Subjects
        const tableStartIndex = fullText.indexOf("Grade");
        const tableText = tableStartIndex !== -1 ? fullText.substring(tableStartIndex) : fullText;
        const rowRegex = /(\d{4}[A-Z]{0,1})\s+(.*?)\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s+([SABCDEF])/gi;
        
        const subjects = [];
        let match;
        while ((match = rowRegex.exec(tableText)) !== null) {
            subjects.push({
                code: match[1],
                name: match[2].trim(),
                grade: match[3]
            });
        }
        console.log(`Subjects Found: ${subjects.length}`);
        return { semesterNumber: semesterLetter, subjects };
    } catch (error) {
        console.error(`Error processing ${path.basename(filePath)}:`, error.message);
        return null;
    }
}

async function runTest() {
    const dir = 'a:/karan/codesOfKaran/cgpacalculator/cgpa-app/public/test marks let';
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));
    
    for (const file of files) {
        await testPdfParsing(path.join(dir, file));
    }
}

runTest();
