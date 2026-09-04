import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  FileCheck, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  Image as ImageIcon,
  Trash2,
  BookOpen
} from 'lucide-react';
import { DocumentParser, DocumentParseResult } from '../../utils/documentParser';
import { SourceDocumentInfo } from '../../types';
import { storageService } from '../../services/storageService';

interface DocumentImportTabProps {
  onImportComplete: (extractedText: string, suggestedTitle?: string, sourceDoc?: SourceDocumentInfo) => void;
  onSwitchToImagePages: () => void;
  storyId?: string;
}

export const DocumentImportTab: React.FC<DocumentImportTabProps> = ({
  onImportComplete,
  onSwitchToImagePages,
  storyId = `temp-${Date.now()}`
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<DocumentParseResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSourceToCloud, setUploadSourceToCloud] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setCustomError(null);
    setParseResult(null);
    setSelectedFile(file);

    // Validate size (max 20MB)
    const MAX_DOC_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_DOC_SIZE) {
      setCustomError(`ఫైల్ పరిమాణం 20MB పరిమితిని మించింది (${(file.size / (1024 * 1024)).toFixed(1)}MB). దయచేసి చిన్న ఫైల్‌ను ఎంచుకోండి.`);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await DocumentParser.parseDocument(file);
      setParseResult(result);
    } catch (err: any) {
      setCustomError(`పత్రం ప్రాసెస్ చేయడంలో లోపం: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyToEditor = async () => {
    if (!parseResult || !parseResult.success) return;

    let sourceDocInfo: SourceDocumentInfo | undefined = undefined;

    if (selectedFile && uploadSourceToCloud) {
      try {
        setUploadProgress(10);
        const uploadRes = await storageService.uploadStoryDocument(storyId, selectedFile, (pct) => {
          setUploadProgress(pct);
        });

        sourceDocInfo = {
          name: selectedFile.name,
          type: parseResult.fileType,
          size: selectedFile.size,
          storageUrl: uploadRes.downloadUrl,
          storagePath: uploadRes.storagePath,
          isScanned: !!parseResult.isScanned,
          uploadedAt: new Date().toISOString(),
          extractedWordCount: parseResult.wordCount
        };
      } catch (uploadErr) {
        console.warn('Document storage upload note:', uploadErr);
        // Still proceed with local extracted content even if storage upload had a glitch
        sourceDocInfo = {
          name: selectedFile.name,
          type: parseResult.fileType,
          size: selectedFile.size,
          uploadedAt: new Date().toISOString(),
          extractedWordCount: parseResult.wordCount
        };
      } finally {
        setUploadProgress(null);
      }
    }

    onImportComplete(parseResult.rawText, parseResult.suggestedTitle, sourceDocInfo);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParseResult(null);
    setCustomError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Informative Banner */}
      <div className="p-4 rounded-2xl bg-[#7A284B]/5 dark:bg-[#7A284B]/10 border border-[#7A284B]/20 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-[#7A284B] text-white shrink-0 mt-0.5">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE]">
            పత్రం ద్వారా కథను దిగుమతి చేయండి (Import Document)
          </h4>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] leading-relaxed">
            మీ వద్ద ఉన్న <strong>PDF</strong>, <strong>DOCX (Word)</strong>, లేదా <strong>TXT</strong> ఫైల్స్‌లోని తెలుగు సాహిత్యాన్ని సులభంగా సంగ్రహించి ఎడిటర్‌లోకి తీసుకురండి. సంగ్రహించిన తర్వాత మీరు కథను పూర్తిగా ఎడిట్ చేయవచ్చు.
          </p>
        </div>
      </div>

      {/* Upload Dropzone */}
      {!selectedFile && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
            isDragging
              ? 'border-[#7A284B] bg-[#7A284B]/5 scale-[0.99]'
              : 'border-[#E8E1DA] dark:border-[#2E2D36] bg-[#FAF7F2] dark:bg-[#18181D] hover:border-[#7A284B]/50 hover:bg-[#7A284B]/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="p-4 rounded-full bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591] mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1">
            ఫైల్‌ను ఇక్కడ లాగి వదలండి లేదా ఎంచుకోండి
          </h3>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mb-4">
            మద్దతు గల ఫార్మాట్‌లు: <strong>PDF</strong>, <strong>DOCX</strong>, <strong>TXT</strong> (గరిష్టంగా 20MB)
          </p>

          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold shadow-md transition-colors">
            <FileText className="w-4 h-4" />
            <span>పత్రాన్ని ఎంచుకోండి (Choose Document)</span>
          </span>
        </div>
      )}

      {/* Processing Loader */}
      {isProcessing && (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-[#E8E1DA] dark:border-[#2E2D36] bg-[#FAF7F2] dark:bg-[#18181D] text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#7A284B] animate-spin" />
          <h4 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE]">
            పత్రం నుండి కంటెంట్‌ను సంగ్రహిస్తోంది...
          </h4>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC]">
            దయచేసి వేచి ఉండండి, తెలుగు అక్షరాలను క్రమబద్ధీకరిస్తున్నాము.
          </p>
        </div>
      )}

      {/* Error / Scanned PDF Alert */}
      {(customError || (parseResult && !parseResult.success)) && !isProcessing && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold">
                {parseResult?.isScanned ? 'ఇమేజ్ ఆధారిత / స్కాన్ చేసిన PDF పత్రం' : 'దిగుమతి హెచ్చరిక'}
              </h4>
              <p className="text-xs leading-relaxed opacity-90">
                {customError || parseResult?.error || 'డాక్యుమెంట్ నుండి టెక్స్ట్ సేకరించడం సాధ్యపడలేదు.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {parseResult?.isScanned && (
              <button
                type="button"
                onClick={onSwitchToImagePages}
                className="px-4 py-2 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>చిత్ర కథ పేజీలు (Image Pages) మోడ్‌కి మారండి</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-black/20 text-xs font-bold transition-colors cursor-pointer"
            >
              మరో ఫైల్ ఎంచుకోండి
            </button>
          </div>
        </div>
      )}

      {/* Successful Extraction Preview */}
      {parseResult && parseResult.success && !isProcessing && (
        <div className="space-y-4">
          {/* File Meta Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#3E8065]/10 text-[#3E8065]">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE] flex items-center gap-2">
                  <span>{parseResult.fileName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3E8065] text-white">
                    విజయవంతంగా సంగ్రహించబడింది
                  </span>
                </h4>
                <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mt-0.5">
                  {(parseResult.fileSize / 1024).toFixed(1)} KB • {parseResult.paragraphs.length} పేరాలు • {parseResult.wordCount} పదాలు • {parseResult.characterCount} అక్షరాలు
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 text-[#6F6970] hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              title="ఫైల్ తొలగించు"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Extracted Text Preview Area */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#17151A] dark:text-[#F7F3EE]">
              సంగ్రహించిన కంటెంట్ ప్రివ్యూ (Extracted Content Preview):
            </label>
            <div className="max-h-60 overflow-y-auto p-4 rounded-xl bg-white dark:bg-[#202027] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-serif-telugu leading-relaxed text-[#17151A] dark:text-[#F7F3EE] space-y-2.5">
              {parseResult.paragraphs.map((p, idx) => (
                <p key={idx} className="leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Storage upload option */}
          <div className="flex items-center gap-2 text-xs text-[#6F6970] dark:text-[#AAA4AC] pt-1">
            <input
              type="checkbox"
              id="uploadSourceToCloud"
              checked={uploadSourceToCloud}
              onChange={(e) => setUploadSourceToCloud(e.target.checked)}
              className="rounded accent-[#7A284B] cursor-pointer"
            />
            <label htmlFor="uploadSourceToCloud" className="cursor-pointer select-none">
              అసలు పత్రాన్ని (Original Document) కూడా కథతో పాటు క్లౌడ్ స్టోరేజ్‌లో భద్రపరచండి
            </label>
          </div>

          {/* Transfer to Editor Action */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleApplyToEditor}
              disabled={uploadProgress !== null}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold shadow-md transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {uploadProgress !== null ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>అప్‌లోడ్ అవుతోంది ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ఎడిటర్‌లోకి పంపండి (Load into Editor)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
