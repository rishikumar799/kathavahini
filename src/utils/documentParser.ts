import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker safely
try {
  if (typeof window !== 'undefined') {
    // Set fallback worker or use standard unpkg / cdnjs worker if local bundle isn't resolved
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn('PDF.js worker setup note:', e);
}

export interface DocumentParseResult {
  success: boolean;
  fileType: 'pdf' | 'docx' | 'txt' | 'unknown';
  fileName: string;
  fileSize: number;
  paragraphs: string[];
  rawText: string;
  wordCount: number;
  characterCount: number;
  pageCount?: number;
  isScanned?: boolean;
  suggestedTitle?: string;
  error?: string;
}

export class DocumentParser {
  /**
   * Parse TXT file
   */
  public static async parseTxt(file: File): Promise<DocumentParseResult> {
    try {
      const text = await file.text();
      const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
      
      if (!cleanText) {
        return {
          success: false,
          fileType: 'txt',
          fileName: file.name,
          fileSize: file.size,
          paragraphs: [],
          rawText: '',
          wordCount: 0,
          characterCount: 0,
          error: 'ఈ టెక్స్ట్ ఫైల్‌లో ఎలాంటి కంటెంట్ కనుగొనబడలేదు (Empty text file).'
        };
      }

      // Split into paragraphs by double newlines or blank lines
      const rawParas = cleanText.split(/\n\s*\n+/);
      const paragraphs = rawParas
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const words = cleanText.split(/\s+/).filter(Boolean);
      const suggestedTitle = paragraphs[0]?.length < 80 ? paragraphs[0] : file.name.replace(/\.[^/.]+$/, '');

      return {
        success: true,
        fileType: 'txt',
        fileName: file.name,
        fileSize: file.size,
        paragraphs: paragraphs.length > 0 ? paragraphs : [cleanText],
        rawText: cleanText,
        wordCount: words.length,
        characterCount: cleanText.length,
        suggestedTitle
      };
    } catch (err: any) {
      console.error('TXT parsing error:', err);
      return {
        success: false,
        fileType: 'txt',
        fileName: file.name,
        fileSize: file.size,
        paragraphs: [],
        rawText: '',
        wordCount: 0,
        characterCount: 0,
        error: `టెక్స్ట్ ఫైల్ చదవడంలో లోపం: ${err.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Parse DOCX file using mammoth
   */
  public static async parseDocx(file: File): Promise<DocumentParseResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const rawText = (result.value || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

      if (!rawText) {
        return {
          success: false,
          fileType: 'docx',
          fileName: file.name,
          fileSize: file.size,
          paragraphs: [],
          rawText: '',
          wordCount: 0,
          characterCount: 0,
          error: 'ఈ Word డాక్యుమెంట్‌లో ఎలాంటి టెక్స్ట్ కంటెంట్ కనుగొనబడలేదు.'
        };
      }

      const rawParas = rawText.split(/\n\s*\n+/);
      const paragraphs = rawParas
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const words = rawText.split(/\s+/).filter(Boolean);
      const suggestedTitle = paragraphs[0]?.length < 80 ? paragraphs[0] : file.name.replace(/\.[^/.]+$/, '');

      return {
        success: true,
        fileType: 'docx',
        fileName: file.name,
        fileSize: file.size,
        paragraphs: paragraphs.length > 0 ? paragraphs : [rawText],
        rawText,
        wordCount: words.length,
        characterCount: rawText.length,
        suggestedTitle
      };
    } catch (err: any) {
      console.error('DOCX parsing error:', err);
      return {
        success: false,
        fileType: 'docx',
        fileName: file.name,
        fileSize: file.size,
        paragraphs: [],
        rawText: '',
        wordCount: 0,
        characterCount: 0,
        error: `Word డాక్యుమెంట్ ప్రాసెస్ చేయడంలో లోపం: ${err.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Parse PDF file using pdfjs-dist
   */
  public static async parsePdf(file: File): Promise<DocumentParseResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        useSystemFonts: true
      });

      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const allPageTexts: string[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        let lastY: number | null = null;
        let pageLines: string[] = [];
        let currentLine = '';

        for (const item of textContent.items as any[]) {
          if ('str' in item) {
            const currentY = item.transform ? item.transform[5] : null;
            if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 8) {
              if (currentLine.trim()) {
                pageLines.push(currentLine.trim());
              }
              currentLine = item.str;
            } else {
              currentLine += (currentLine ? ' ' : '') + item.str;
            }
            lastY = currentY;
          }
        }

        if (currentLine.trim()) {
          pageLines.push(currentLine.trim());
        }

        const pageText = pageLines.join('\n');
        if (pageText.trim()) {
          allPageTexts.push(pageText.trim());
        }
      }

      const rawText = allPageTexts.join('\n\n').trim();
      const charCount = rawText.replace(/\s/g, '').length;

      // Scanned PDF detection: if total non-space characters across entire doc is < 40 or avg < 10 chars per page
      const isScanned = charCount < 40 || (charCount / Math.max(1, numPages)) < 15;

      if (isScanned) {
        return {
          success: false,
          fileType: 'pdf',
          fileName: file.name,
          fileSize: file.size,
          paragraphs: [],
          rawText: '',
          wordCount: 0,
          characterCount: 0,
          pageCount: numPages,
          isScanned: true,
          error: 'ఈ PDF పత్రం ఇమేజ్ ఆధారితంగా లేదా స్కాన్ చేయబడినదిగా కనిపిస్తోంది (Scanned/Image-based PDF). ఇందులోని టెక్స్ట్ నేరుగా సేకరించలేము. మీరు ఈ పేజీలను "చిత్ర కథ పేజీలు (Image-Based Story Pages)" మోడ్‌లో జోడించవచ్చు.'
        };
      }

      // Group into paragraphs
      const paragraphs: string[] = [];
      for (const pageText of allPageTexts) {
        const pageParas = pageText.split(/\n\s*\n+/);
        for (const p of pageParas) {
          const trimmed = p.trim();
          if (trimmed.length > 0) {
            paragraphs.push(trimmed);
          }
        }
      }

      const words = rawText.split(/\s+/).filter(Boolean);
      const suggestedTitle = paragraphs[0]?.length < 80 ? paragraphs[0] : file.name.replace(/\.[^/.]+$/, '');

      return {
        success: true,
        fileType: 'pdf',
        fileName: file.name,
        fileSize: file.size,
        paragraphs: paragraphs.length > 0 ? paragraphs : [rawText],
        rawText,
        wordCount: words.length,
        characterCount: rawText.length,
        pageCount: numPages,
        isScanned: false,
        suggestedTitle
      };
    } catch (err: any) {
      console.error('PDF parsing error:', err);
      return {
        success: false,
        fileType: 'pdf',
        fileName: file.name,
        fileSize: file.size,
        paragraphs: [],
        rawText: '',
        wordCount: 0,
        characterCount: 0,
        error: `PDF పత్రం చదవడంలో లోపం: ${err.message || 'ఫైల్ పాడై ఉండవచ్చు'}`
      };
    }
  }

  /**
   * Universal dispatch parser
   */
  public static async parseDocument(file: File): Promise<DocumentParseResult> {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    if (fileName.endsWith('.txt') || fileType.includes('text/plain')) {
      return this.parseTxt(file);
    } else if (fileName.endsWith('.docx') || fileType.includes('wordprocessingml') || fileType.includes('msword')) {
      return this.parseDocx(file);
    } else if (fileName.endsWith('.pdf') || fileType.includes('application/pdf')) {
      return this.parsePdf(file);
    } else {
      return {
        success: false,
        fileType: 'unknown',
        fileName: file.name,
        fileSize: file.size,
        paragraphs: [],
        rawText: '',
        wordCount: 0,
        characterCount: 0,
        error: 'మద్దతు లేని ఫైల్ ఫార్మాట్. కేవలం PDF, DOCX, లేదా TXT ఫైళ్లను మాత్రమే అప్‌లోడ్ చేయండి.'
      };
    }
  }
}
