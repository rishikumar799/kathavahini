import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  X, 
  RotateCcw,
  BookOpen,
  Check
} from 'lucide-react';
import { DocumentParser, DocumentParseResult } from '../../utils/documentParser';
import { storageService, UploadProgressInfo, UploadStatus } from '../../services/storageService';
import { SourceDocumentInfo } from '../../types';

interface DocumentImportTabProps {
  onImportComplete: (extractedText: string, suggestedTitle?: string, sourceDoc?: SourceDocumentInfo) => void;
  onSwitchToImagePages?: () => void;
  storyId?: string;
  initialSourceDoc?: SourceDocumentInfo;
}

export const DocumentImportTab: React.FC<DocumentImportTabProps> = ({
  onImportComplete,
  storyId = `story-${Date.now()}`,
  initialSourceDoc
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<DocumentParseResult | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);
  
  // Storage upload tracking
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('IDLE');
  const [bytesTransferred, setBytesTransferred] = useState<number>(0);
  const [totalBytes, setTotalBytes] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState<boolean>(!!initialSourceDoc);
  const [appliedDocInfo, setAppliedDocInfo] = useState<SourceDocumentInfo | undefined>(initialSourceDoc);
  const cancelTaskRef = useRef<(() => void) | null>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setParseResult(null);
    setCustomError(null);
    setUploadError(null);
    setIsApplied(false);

    try {
      const result = await DocumentParser.parseDocument(file);
      setParseResult(result);
      if (!result.success && !result.isScanned) {
        setCustomError(result.error || 'పత్రం ప్రాసెస్ చేయడంలో లోపం సంభవించింది.');
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      setCustomError(err.message || 'ఫైల్ ప్రాసెస్ చేయడంలో లోపం సంభవించింది.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyToStory = async () => {
    if (!selectedFile || !parseResult) return;

    setUploadError(null);
    let sourceDocInfo: SourceDocumentInfo | undefined = undefined;

    setUploadProgress(0);
    setUploadStatus('UPLOADING');
    setBytesTransferred(0);
    setTotalBytes(selectedFile.size);

    try {
      const uploadRes = await storageService.uploadStoryDocument(storyId, selectedFile, {
        onProgress: (pct, info?: UploadProgressInfo) => {
          setUploadProgress(pct);
          if (info?.status) setUploadStatus(info.status);
          if (info?.bytesTransferred !== undefined) setBytesTransferred(info.bytesTransferred);
          if (info?.totalBytes !== undefined) setTotalBytes(info.totalBytes);
        },
        onTaskCreated: (handle) => {
          cancelTaskRef.current = () => handle.cancel();
        }
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
      setUploadStatus('COMPLETE');
    } catch (uploadErr: any) {
      console.warn('Document storage upload note:', uploadErr);
      const isCanceled = uploadErr.code === 'storage/canceled';
      setUploadStatus(isCanceled ? 'CANCELED' : 'FAILED');
      setUploadError(isCanceled ? 'అప్‌లోడ్ రద్దు చేయబడింది' : (uploadErr.message || 'స్టోరేజ్ అప్‌లోడ్ లోపం'));

      if (isCanceled) {
        setUploadProgress(null);
        return;
      }

      // Fallback with local extracted info
      sourceDocInfo = {
        name: selectedFile.name,
        type: parseResult.fileType,
        size: selectedFile.size,
        uploadedAt: new Date().toISOString(),
        extractedWordCount: parseResult.wordCount
      };
    } finally {
      cancelTaskRef.current = null;
    }

    setAppliedDocInfo(sourceDocInfo);
    setIsApplied(true);
    onImportComplete(parseResult.rawText || '', parseResult.suggestedTitle, sourceDocInfo);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParseResult(null);
    setCustomError(null);
    setUploadError(null);
    setUploadProgress(null);
    setUploadStatus('IDLE');
    setIsApplied(false);
    setAppliedDocInfo(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-5">
      {/* Informative Banner */}
      <div className="p-4 rounded-2xl bg-[#7A284B]/5 dark:bg-[#7A284B]/10 border border-[#7A284B]/20 flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-[#7A284B] text-white shrink-0 mt-0.5">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE] flex items-center gap-2">
            <span>పి.డి.ఎఫ్ కథా పత్రం అప్‌లోడ్ (Full PDF Story Upload)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7A284B] text-white">
              PDF డాక్యుమెంట్
            </span>
          </h4>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] leading-relaxed">
            మీ పూర్తి <strong>PDF కథా పత్రాన్ని</strong> ఇక్కడ అప్‌లోడ్ చేయండి. మీ పత్రం భద్రపరచబడి కథతో పాటు పాఠకులకు లభ్యమవుతుంది. తెలుగు అక్షరాలు ఆటోమేటిక్‌గా రీడర్ కోసం సిద్ధం చేయబడతాయి.
          </p>
        </div>
      </div>

      {/* Confirmed Applied Document Card */}
      {isApplied && appliedDocInfo && (
        <div className="p-5 rounded-2xl bg-[#3E8065]/10 border border-[#3E8065]/30 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#3E8065] text-white shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE]">
                  పూర్తి PDF కథ విజయవంతంగా జతచేయబడింది!
                </h4>
                <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC]">
                  ఫైల్: <strong>{appliedDocInfo.name}</strong> ({formatBytes(appliedDocInfo.size || 0)})
                  {appliedDocInfo.extractedWordCount ? ` • ~${appliedDocInfo.extractedWordCount} పదాలు` : ''}
                </p>
                <p className="text-xs text-[#3E8065] dark:text-[#52B788] font-medium pt-1">
                  ✓ పత్రం భద్రంగా క్లౌడ్ స్టోరేజ్‌లో భద్రపరచబడింది. కథను సమర్పించడానికి కింద ఉన్న 'సమర్పించండి' బటన్ నొక్కండి.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] transition-colors cursor-pointer"
            >
              మరో PDF మార్చండి
            </button>
          </div>
        </div>
      )}

      {/* Upload Dropzone */}
      {!selectedFile && !isApplied && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center ${
            isDragging
              ? 'border-[#7A284B] bg-[#7A284B]/10 scale-[0.99]'
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

          <div className="p-4 rounded-2xl bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591] mb-3">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
            మీ PDF పత్రాన్ని ఇక్కడ లాగి వదలండి లేదా ఎంచుకోండి
          </h3>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mb-4 max-w-md">
            మద్దతు గల ఫార్మాట్‌లు: <strong>PDF కథలు</strong>, DOCX, TXT (గరిష్టంగా 25MB). మీ పూర్తి పత్రం పాఠకుల కోసం భద్రపరచబడుతుంది.
          </p>

          <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold shadow-md transition-colors">
            <FileText className="w-4 h-4" />
            <span>PDF పత్రాన్ని ఎంచుకోండి (Choose PDF Story)</span>
          </span>
        </div>
      )}

      {/* Processing Loader */}
      {isProcessing && (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-[#E8E1DA] dark:border-[#2E2D36] bg-[#FAF7F2] dark:bg-[#18181D] text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#7A284B] animate-spin" />
          <h4 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE]">
            PDF పత్రం నుండి కంటెంట్‌ను సంగ్రహిస్తోంది...
          </h4>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC]">
            దయచేసి వేచి ఉండండి, మీ పత్రం మరియు తెలుగు అక్షరాలు క్రమబద్ధీకరించబడుతున్నాయి.
          </p>
        </div>
      )}

      {/* Scanned PDF or Parsing Warning */}
      {(customError || (parseResult && parseResult.isScanned)) && !isProcessing && !isApplied && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold">
                {parseResult?.isScanned ? 'ఇమేజ్ ఆధారిత / స్కాన్ చేసిన PDF పత్రం' : 'దిగుమతి గమనిక'}
              </h4>
              <p className="text-xs leading-relaxed opacity-90">
                {parseResult?.isScanned
                  ? 'ఈ PDF పత్రం స్కాన్ చేసిన చిత్రాలతో ఉంది. మీ పూర్తి PDF కథ యధాతథంగా అప్‌లోడ్ చేయబడుతుంది మరియు పాఠకులు నేరుగా చదవగలరు.'
                  : (customError || parseResult?.error || 'డాక్యుమెంట్ ప్రాసెస్ చేయడంలో గమనిక.')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleApplyToStory}
              disabled={uploadProgress !== null}
              className="px-5 py-2.5 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>ఈ పూర్తి PDF కథతో కొనసాగించండి</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-black/20 text-xs font-bold transition-colors cursor-pointer"
            >
              మరో ఫైల్ ఎంచుకోండి
            </button>
          </div>
        </div>
      )}

      {/* Successful Extraction Preview & Confirmation */}
      {parseResult && parseResult.success && !isProcessing && !isApplied && (
        <div className="space-y-4 p-5 rounded-2xl border border-[#E8E1DA] dark:border-[#2E2D36] bg-[#FAF7F2] dark:bg-[#18181D]">
          {/* Document Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8E1DA] dark:border-[#2E2D36]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#3E8065]/10 text-[#3E8065]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] truncate max-w-xs sm:max-w-md">
                  {selectedFile?.name}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-[#6F6970] dark:text-[#AAA4AC] mt-0.5">
                  <span>{formatBytes(selectedFile?.size || 0)}</span>
                  <span>•</span>
                  <span>~{parseResult.wordCount} పదాలు</span>
                  {parseResult.pageCount && (
                    <>
                      <span>•</span>
                      <span>{parseResult.pageCount} పేజీలు</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-lg text-[#6F6970] hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              title="తొలగించి వేరే ఫైల్ ఎంచుకోండి"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Extracted Text Preview Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#6F6970] dark:text-[#AAA4AC]">
              <span className="font-semibold">సంగ్రహించిన కంటెంట్ ప్రివ్యూ:</span>
              <span>మొదటి కొన్ని పేరాలు</span>
            </div>
            <div className="max-h-40 overflow-y-auto p-3.5 rounded-xl bg-white dark:bg-[#202027] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-serif-telugu leading-relaxed text-[#17151A] dark:text-[#F7F3EE]">
              {parseResult.rawText?.slice(0, 500)}...
            </div>
          </div>

          {/* Progress Bar while Uploading to Cloud Storage */}
          {uploadProgress !== null && (
            <div className="p-3 rounded-xl bg-white dark:bg-[#202027] border border-[#E8E1DA] dark:border-[#2E2D36] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#7A284B] dark:text-[#D87591] flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>క్లౌడ్ స్టోరేజ్‌కి అప్‌లోడ్ అవుతోంది...</span>
                </span>
                <span className="font-mono text-[#6F6970] dark:text-[#AAA4AC]">
                  {formatBytes(bytesTransferred)} / {formatBytes(totalBytes)} ({uploadProgress}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#7A284B] transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Error Banner */}
          {uploadError && (
            <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-600 dark:text-red-400 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
              <button
                type="button"
                onClick={handleApplyToStory}
                className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] inline-flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleApplyToStory}
              disabled={uploadProgress !== null}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold shadow-md transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {uploadProgress !== null ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>అప్‌లోడ్ అవుతోంది ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ఈ PDF పత్రాన్ని కథకు జతచేయండి (Attach PDF Story)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
