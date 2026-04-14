import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

const workerPath = path.resolve('node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
(pdfjs as any).GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

async function t() {
    const buffer = fs.readFileSync('a:/karan/codesOfKaran/cgpacalculator/cgpa-app/public/test marks/sem6_mark.pdf');
    const pdf = await pdfjs.getDocument({data: new Uint8Array(buffer), password:'13032004', verbosity:0}).promise;
    let text = '';
    for(let i=1; i<=pdf.numPages; i++){
        const p = await pdf.getPage(i);
        const c = await p.getTextContent();
        text += c.items.map(it => ('str' in it ? it.str : '')).join(' ') + ' ';
    }
    const match = text.match(/6042B\s+(.*?)\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s+([SABCDEF])/i);
    if (match) console.log(`6042B: Grade ${match[2]}`);
    else console.log("Not found");
}
t();
