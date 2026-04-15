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
  return (textContent.items as { str: string }[]).map((i) => i.str).join(' ');
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
  // In the browser, DOMMatrix is natively available so no crash occurs.
  const pdfjs = await import('pdfjs-dist');

  // Point the worker at the bundled copy shipped with pdfjs-dist
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();

  const results: ParsedTranscriptFile[] = [];

  for (const file of files) {
    try {
      const binaryStr = atob(file.data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

      const loadingTask = pdfjs.getDocument({
        data: bytes,
        password: password || undefined,
        verbosity: 0,
      });

      const pdf = await loadingTask.promise;

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        fullText += (await getPageText(page)) + ' ';
      }

      results.push(parseTranscriptText(fullText, file.name));
    } catch (error: any) {
      const msg: string = error?.message || String(error);
      const isPasswordError =
        msg.toLowerCase().includes('password') || error?.name === 'PasswordException';
      results.push({ fileName: file.name, error: msg, isPasswordRequired: isPasswordError });
    }
  }

  return { success: true, results };
}
