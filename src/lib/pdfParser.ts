/**
 * Client-side PDF parser.
 * This file is intentionally browser-only — pdfjs-dist requires DOMMatrix
 * which exists in browsers but NOT in Node.js / Vercel serverless lambdas.
 * Never import this file from server components or server actions.
 */

export interface ParsedTranscriptFile {
  fileName: string;
  branch?: string;
  semester?: number;
  semesterName?: string;
  subjects?: { code: string; name: string; grade: string }[];
  error?: string;
  isPasswordRequired?: boolean;
}

/** Extract full text from a single PDF page */
async function getPageText(page: any): Promise<string> {
  const textContent = await page.getTextContent();
  const items = textContent.items as any[];
  
  // Sort items by visual position to ensure logical reading order.
  // PDF coordinates: (0,0) is bottom-left. Y increases upwards.
  items.sort((a, b) => {
    // b.transform[5] is the Y-coordinate. Higher Y means higher on page.
    const yDiff = b.transform[5] - a.transform[5];
    if (Math.abs(yDiff) > 5) return yDiff; // Use a small threshold for "same line"
    // a.transform[4] is the X-coordinate.
    return a.transform[4] - b.transform[4];
  });

  return items.map((i) => i.str || '').join(' ').replace(/\s+/g, ' ');
}

/** Parse extracted full text into structured transcript data */
function parseTranscriptText(
  fullText: string,
  fileName: string
): ParsedTranscriptFile {
  // Extract Branch
  const branchMatch = fullText.match(
    /INSTITUTION\s*:\s*(?:Diploma\s+in\s+Engineering\s+\/\s+Technology\s+\/\s+Management\s+\/\s+Commercial Practice)?\s*(.*?)\s+(?:\d{10}|REGISTER|NAME|FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|THE GRADE)/i
  );
  let branch = branchMatch ? branchMatch[1].trim() : 'Unknown';
  branch = branch.replace(/\s+/g, ' ');

  // Extract Semester
  const semMatch =
    fullText.match(/BRANCH\s*:\s*(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH)\s+SEMESTER/i) ||
    fullText.match(/(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH)\s+SEMESTER/i);
  const semesterLetter = semMatch ? semMatch[1].trim() : 'Unknown';

  const semMap: Record<string, number> = {
    FIRST: 1, SECOND: 2, THIRD: 3, FOURTH: 4, FIFTH: 5, SIXTH: 6,
  };
  const semesterNumber = semMap[semesterLetter] || 0;

  // Extract Subjects
  const tableStartIndex = fullText.indexOf('Grade');
  const tableText = tableStartIndex !== -1 ? fullText.substring(tableStartIndex) : fullText;
  const rowRegex =
    /(\d{4}[A-Z]{0,1})\s+(.*?)\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s+([SABCDEF])/gi;

  const subjects: { code: string; name: string; grade: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = rowRegex.exec(tableText)) !== null) {
    subjects.push({ code: match[1], name: match[2].trim(), grade: match[3] });
  }

  return {
    fileName,
    branch,
    semester: semesterNumber,
    semesterName: `${semesterLetter} SEMESTER`,
    subjects,
  };
}

let pdfjsInitialized = false;

/**
 * Parse transcript PDFs entirely in the browser.
 * @param files  Array of { name, data } where data is base64-encoded PDF bytes.
 * @param password  Optional PDF password (applied to all files).
 */
export async function parseTranscriptPdfs(
  files: { name: string; data: string }[],
  password?: string
): Promise<{ success: boolean; results: ParsedTranscriptFile[] }> {
  // Dynamic import — pdfjs-dist is large; only load it when actually needed.
  const pdfjs = await import('pdfjs-dist');

  // Point the worker at the bundled copy shipped with pdfjs-dist
  // Ensure we only set this once to avoid re-initializing the worker unnecessarily
  if (!pdfjsInitialized) {
    try {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString();
      pdfjsInitialized = true;
    } catch (err) {
      console.error('Failed to initialize PDF.js worker:', err);
    }
  }

  const results: ParsedTranscriptFile[] = [];

  for (const file of files) {
    let pdf: any = null;
    let loadingTask: any = null;
    
    try {
      const binaryStr = atob(file.data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

      loadingTask = pdfjs.getDocument({
        data: bytes,
        password: password || undefined,
        verbosity: 0,
      });

      pdf = await loadingTask.promise;

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        try {
          fullText += (await getPageText(page)) + ' ';
        } finally {
          // Explicitly cleanup page resources if available in this version
          if (page.cleanup) page.cleanup();
        }
      }

      results.push(parseTranscriptText(fullText, file.name));
    } catch (error: any) {
      const msg: string = error?.message || String(error);
      const isPasswordError =
        msg.toLowerCase().includes('password') || error?.name === 'PasswordException';
      results.push({ fileName: file.name, error: msg, isPasswordRequired: isPasswordError });
    } finally {
      // CRITICAL: Always destroy the PDF document and cleanup the loading task
      // to prevent memory leaks and worker hangs.
      try {
        if (pdf) {
          await pdf.destroy();
        }
        if (loadingTask && loadingTask.destroy) {
          await loadingTask.destroy();
        }
      } catch (cleanupError) {
        console.warn('Error during PDF cleanup:', cleanupError);
      }
    }
  }

  return { success: true, results };
}
