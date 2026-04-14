import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

// Set up PDF.js worker
const workerPath = path.resolve('node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
(pdfjs as any).GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

async function testExtraction() {
  const filePath = "a:/karan/codesOfKaran/cgpacalculator/cgpa-app/public/test marks/sem1_mark.pdf";
  const password = "13032004";
  
  const buffer = fs.readFileSync(filePath);
  const uint8Array = new Uint8Array(buffer);
  
  const loadingTask = pdfjs.getDocument({
    data: uint8Array,
    password: password,
    verbosity: 0
  });

  const pdf = await loadingTask.promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ') + ' ';
  }

  const branchMatch = fullText.match(/INSTITUTION\s*:\s*(?:Diploma\s+in\s+Engineering\s+\/\s+Technology\s+\/\s+Management\s+\/\s+Commercial Practice)?\s*(.*?)\s+(?:\d{10}|REGISTER|NAME|FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|THE GRADE)/i);
  let branch = branchMatch ? branchMatch[1].trim() : "Unknown";
  console.log("Extracted Branch:", branch);
  
  // Extract subjects to see codes
  const tableStartIndex = fullText.indexOf("Grade");
  const tableText = tableStartIndex !== -1 ? fullText.substring(tableStartIndex) : fullText;
  const rowRegex = /(\d{4}[A-Z]{0,1})\s+(.*?)\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s+([SABCDEF])/gi;
  
  let match;
  while ((match = rowRegex.exec(tableText)) !== null) {
     console.log(`- [${match[1]}] ${match[2].trim()}: ${match[3]}`);
  }
}

testExtraction().catch(console.error);
