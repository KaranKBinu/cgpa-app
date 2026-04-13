import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// Set worker path correctly for Node.js
const workerPath = path.resolve('node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
(pdfjs as any).GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

async function extractText(pdfPath: string, password?: string) {
    try {
        console.log(`Reading file: ${pdfPath}`);
        const data = new Uint8Array(fs.readFileSync(pdfPath));
        console.log(`File read. Size: ${data.length} bytes`);
        
        const loadingTask = pdfjs.getDocument({
            data,
            password: password,
            disableFontFace: true,
            verbosity: 0
        });

        const pdf = await loadingTask.promise;
        console.log(`PDF loaded. Pages: ${pdf.numPages}`);

        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const text = (textContent.items as any[]).map((item: any) => item.str).join(' ');
            fullText += text + ' ';
        }
        console.log('--- Extracted Text ---');
        console.log(fullText);

        // Branch Extraction Test
        const branchMatch = fullText.match(/INSTITUTION\s*:\s*(?:Diploma\s+in\s+Engineering\s+\/\s+Technology\s+\/\s+Management\s+\/\s+Commercial Practice)?\s*(.*?)\s+(?:\d{10}|REGISTER|NAME|FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|THE GRADE)/i);
        console.log('\nExtracted Branch:', branchMatch ? branchMatch[1].trim() : "Not found");

    } catch (error) {
        console.error('Error extracting text:', error);
    }
}

const pdfPath = 'public/test marks/sem1_mark.pdf';
const password = '13032004';

extractText(pdfPath, password);
