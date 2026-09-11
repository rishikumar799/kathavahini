import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  RotateCcw
} from 'lucide-react';
import { storageService, StorageUploadResult, UploadProgressInfo, UploadStatus } from '../../services/storageService';
import { ImageMetadata } from '../../types';

export interface CoverImageUploaderProps {
  value?: string;
  storagePath?: string;
  metadata?: ImageMetadata;
  onChange?: (imageUrl: string, storagePath?: string, metadata?: ImageMetadata) => void;
  targetType?: 'story' | 'novel' | 'knowledge' | 'profile' | 'writer';
  targetId?: string;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;

  // Alternate / legacy props supported seamlessly
  entityId?: string;
  folder?: string;
  initialImageUrl?: string;
  initialImagePath?: string;
  onImageUploaded?: (imageUrl: string, storagePath?: string, metadata?: ImageMetadata) => void;
  onImageRemoved?: () => void;
}

export const CURATED_COVER_PRESETS = [
  {
    id: 'literature-books',
    title: 'సాహిత్య భాండాగారం',
    category: 'పుస్తకాలు',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 'vintage-pen-ink',
    title: 'కలాలు - రచనా వేదిక',
    category: 'సాహిత్యం',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 'telugu-culture-scroll',
    title: 'ప్రాచీన తాళపత్ర సంపద',
    category: 'చరిత్ర',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 'village-river-nature',
    title: 'గోదావరి తీరం - పల్లెటూరు',
    category: 'ప్రకృతి',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 'temple-heritage',
    title: 'ఆలయ శిల్పకళా వైభవం',
    category: 'సంస్కృతి',
    url: 'https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 'human-emotions-life',
    title: 'జీవితం & అనుబంధాలు',
    category: 'సాంఘికం',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 'night-mystery',
    title: 'రహస్యం & ఉత్కంఠ',
    category: 'సస్పెన్స్',
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 'morning-hope',
    title: 'ఉషోదయ కాంతి కిరణాలు',
    category: 'నవ్యత',
    url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&q=80&w=1200',
  },
];

export const CoverImageUploader: React.FC<CoverImageUploaderProps> = ({
  value,
  storagePath,
  metadata,
  onChange,
  targetType = 'story',
  targetId,
  label = 'కవర్ చిత్రం (Cover Image)',
  helperText = 'JPG, PNG, WEBP ఫార్మాట్లు (గరిష్టంగా 10MB)',
  disabled = false,
  className = '',
  entityId,
  folder,
  initialImageUrl,
  initialImagePath,
  onImageUploaded,
  onImageRemoved,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('IDLE');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bytesTransferred, setBytesTransferred] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeCancelRef = useRef<(() => void) | null>(null);
  const lastSelectedFileRef = useRef<File | null>(null);

  // Derive active values seamlessly from either prop style
  const effectiveValue = value !== undefined ? value : (initialImageUrl || '');
  const effectiveStoragePath = storagePath !== undefined ? storagePath : initialImagePath;
  const effectiveTargetId = targetId || entityId || `${targetType || 'story'}-${Date.now()}`;
  const effectiveTargetType = targetType ?? (folder === 'novels' ? 'novel' : folder === 'knowledge' ? 'knowledge' : 'story');

  const [urlInput, setUrlInput] = useState(effectiveValue);
  const [previewError, setPreviewError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync external value with local url input when changed
  useEffect(() => {
    setUrlInput(effectiveValue);
    setPreviewError(false);
  }, [effectiveValue]);

  // Safe multi-callback notifier
  const notifyChange = (newUrl: string, newPath?: string, newMeta?: ImageMetadata) => {
    if (typeof onChange === 'function') {
      onChange(newUrl, newPath, newMeta);
    }
    if (newUrl) {
      if (typeof onImageUploaded === 'function') {
        onImageUploaded(newUrl, newPath, newMeta);
      }
    } else {
      if (typeof onImageRemoved === 'function') {
        onImageRemoved();
      }
    }
  };

  const handleCancelUpload = () => {
    if (activeCancelRef.current) {
      activeCancelRef.current();
      activeCancelRef.current = null;
    }
    setUploadStatus('CANCELED');
    setErrorMsg('అప్‌లోడ్ రద్దు చేయబడింది (Upload cancelled).');
    setUploadProgress(0);
  };

  const handleFileSelection = async (file: File) => {
    setErrorMsg(null);
    setPreviewError(false);
    lastSelectedFileRef.current = file;
    setCurrentFileName(file.name);
    setTotalBytes(file.size);
    setBytesTransferred(0);

    // Validate file with appropriate limits (10MB for stories/novels/knowledge, 5MB for profile)
    const maxAllowedSize = (effectiveTargetType === 'profile' || effectiveTargetType === 'writer') ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    const validation = storageService.validateImageFile(file, maxAllowedSize);
    if (!validation.isValid) {
      setErrorMsg(validation.error || 'సరైన చిత్రాన్ని ఎంచుకోండి');
      setUploadStatus('FAILED');
      return;
    }

    setUploadStatus('UPLOADING');
    setUploadProgress(0);

    const uploadOptions = {
      onProgress: (percent: number, info?: UploadProgressInfo) => {
        setUploadProgress(percent);
        if (info) {
          setUploadStatus(info.status);
          setBytesTransferred(info.bytesTransferred);
          setTotalBytes(info.totalBytes || file.size);
        }
      },
      onTaskCreated: ({ cancel }: { cancel: () => void }) => {
        activeCancelRef.current = cancel;
      },
    };

    try {
      let uploadResult: StorageUploadResult;

      if (effectiveTargetType === 'story') {
        uploadResult = await storageService.uploadStoryCover(effectiveTargetId, file, uploadOptions);
      } else if (effectiveTargetType === 'novel') {
        uploadResult = await storageService.uploadNovelCover(effectiveTargetId, file, uploadOptions);
      } else if (effectiveTargetType === 'knowledge') {
        uploadResult = await storageService.uploadKnowledgeCover(effectiveTargetId, file, uploadOptions);
      } else if (effectiveTargetType === 'profile') {
        uploadResult = await storageService.uploadProfileImage(effectiveTargetId, file, uploadOptions);
      } else {
        uploadResult = await storageService.uploadWriterProfileImage(effectiveTargetId, file, uploadOptions);
      }

      setUploadStatus('COMPLETE');
      setUploadProgress(100);
      activeCancelRef.current = null;
      notifyChange(uploadResult.downloadUrl, uploadResult.storagePath, uploadResult.metadata);
    } catch (err: any) {
      activeCancelRef.current = null;
      if (err?.code === 'storage/canceled') {
        setUploadStatus('CANCELED');
        setErrorMsg('అప్‌లోడ్ రద్దు చేయబడింది.');
      } else {
        setUploadStatus('FAILED');
        setErrorMsg(err.message || 'చిత్రాన్ని అప్‌లోడ్ చేయడంలో సమస్య ఎదురైంది. దయచేసి మళ్లీ ప్రయత్నించండి.');
      }
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRetryUpload = () => {
    if (lastSelectedFileRef.current) {
      handleFileSelection(lastSelectedFileRef.current);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && uploadStatus !== 'UPLOADING' && uploadStatus !== 'PROCESSING') {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || uploadStatus === 'UPLOADING' || uploadStatus === 'PROCESSING') return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelection(file);
    }
  };

  const handleUrlSubmit = () => {
    setErrorMsg(null);
    const trimmed = urlInput.trim();
    if (!trimmed) {
      notifyChange('', undefined, undefined);
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setErrorMsg('దయచేసి సరైన వెబ్‌సైట్ లింక్ (https://...) నమోదు చేయండి');
      return;
    }

    notifyChange(trimmed, undefined, undefined);
  };

  const handleRemoveImage = () => {
    setErrorMsg(null);
    setUrlInput('');
    setPreviewError(false);
    setUploadStatus('IDLE');
    setUploadProgress(0);
    lastSelectedFileRef.current = null;
    notifyChange('', undefined, undefined);
  };

  const hasImage = Boolean(effectiveValue && effectiveValue.trim());
  const isFirebaseStorage = Boolean(effectiveValue && effectiveValue.includes('firebasestorage.googleapis.com'));
  const isBusy = uploadStatus === 'UPLOADING' || uploadStatus === 'PROCESSING' || uploadStatus === 'VALIDATING';

  const formatBytes = (bytes: number) => {
    if (bytes <= 0) return '0 KB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="block text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-[#FAF7F2] dark:bg-[#121118] p-1 rounded-xl border border-[#E8E1DA] dark:border-[#26242E]">
          <button
            type="button"
            disabled={disabled || isBusy}
            onClick={() => {
              setActiveTab('upload');
              setErrorMsg(null);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-[#7A284B] text-white shadow-xs'
                : 'text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A] dark:hover:text-white'
            }`}
          >
            <UploadCloud className="w-3 h-3" />
            <span>పరికరం నుండి అప్‌లోడ్</span>
          </button>
          <button
            type="button"
            disabled={disabled || isBusy}
            onClick={() => {
              setActiveTab('url');
              setErrorMsg(null);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'url'
                ? 'bg-[#7A284B] text-white shadow-xs'
                : 'text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A] dark:hover:text-white'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>ఇమేజ్ URL</span>
          </button>
          <button
            type="button"
            disabled={disabled || isBusy}
            onClick={() => {
              setActiveTab('presets');
              setErrorMsg(null);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-[#7A284B] text-white shadow-xs'
                : 'text-[#6F6970] dark:text-[#A29CA6] hover:text-[#17151A] dark:hover:text-white'
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>కవర్ గ్యాలరీ</span>
          </button>
        </div>
      </div>

      {/* Error Banner with Instant Retry & Recovery Actions */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span>{errorMsg}</span>
              {currentFileName && (
                <span className="block text-[11px] opacity-80">ఫైల్: {currentFileName}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {lastSelectedFileRef.current && (
              <button
                type="button"
                onClick={handleRetryUpload}
                className="px-2.5 py-1 rounded-lg bg-red-600 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-all cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>మళ్లీ ప్రయత్నించు</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setActiveTab('url');
                setErrorMsg(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#18181D] text-xs font-bold text-[#17151A] dark:text-white shadow-xs hover:bg-[#7A284B] hover:text-white transition-all cursor-pointer"
            >
              ఇమేజ్ URL వాడండి
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('presets');
                setErrorMsg(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#7A284B] text-xs font-bold text-white shadow-xs hover:bg-[#631F3C] transition-all cursor-pointer"
            >
              కవర్ గ్యాలరీ
            </button>
          </div>
        </div>
      )}

      {/* Option A: Upload from Device */}
      {activeTab === 'upload' && !hasImage && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && !isBusy) {
              fileInputRef.current?.click();
            }
          }}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            isDragging
              ? 'border-[#7A284B] bg-[#7A284B]/5 scale-[0.99]'
              : 'border-[#E8E1DA] dark:border-[#2E2D36] hover:border-[#7A284B]/50 bg-[#FAF7F2]/60 dark:bg-[#121118]/60'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : isBusy ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg,image/gif"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelection(e.target.files[0]);
              }
            }}
            className="hidden"
            disabled={disabled || isBusy}
          />

          {isBusy ? (
            <div className="space-y-3 py-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#7A284B]/10 text-[#7A284B] flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <div className="flex items-center justify-between text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
                  <span className="truncate max-w-[200px]" title={currentFileName}>
                    {currentFileName || 'చిత్రం అప్‌లోడ్ అవుతోంది...'}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7A284B] transition-all duration-150 rounded-full"
                    style={{ width: `${Math.max(5, uploadProgress)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
                  <span>
                    {bytesTransferred > 0
                      ? `${formatBytes(bytesTransferred)} / ${formatBytes(totalBytes)}`
                      : uploadStatus === 'VALIDATING'
                      ? 'ఫైల్ చెల్లుబాటు చేస్తోంది...'
                      : uploadStatus === 'PROCESSING'
                      ? 'క్లౌడ్ రికార్డు ప్రాసెస్ చేస్తోంది...'
                      : 'అప్‌లోడ్ ప్రారంభమవుతోంది...'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelUpload();
                    }}
                    className="text-red-500 hover:text-red-700 font-bold underline cursor-pointer"
                  >
                    రద్దు చేయి (Cancel)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591] flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu">
                  చిత్రాన్ని ఇక్కడ లాగండి లేదా క్లిక్ చేసి ఎంచుకోండి
                </p>
                <p className="text-[11px] text-[#6F6970] dark:text-[#A29CA6] mt-0.5">
                  {helperText}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Option B: Paste Image URL */}
      {activeTab === 'url' && !hasImage && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="url"
                value={urlInput}
                disabled={disabled || isBusy}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlSubmit();
                  }
                }}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#121118] border border-[#E8E1DA] dark:border-[#26242E] text-xs focus:ring-2 focus:ring-[#7A284B] focus:outline-none text-[#17151A] dark:text-white"
              />
              <ImageIcon className="w-4 h-4 text-[#6F6970] absolute left-3 top-3" />
            </div>
            <button
              type="button"
              onClick={handleUrlSubmit}
              disabled={disabled || isBusy || !urlInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#7A284B] hover:bg-[#68223F] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              జోడించండి
            </button>
          </div>
          <p className="text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
            బాహ్య చిత్ర లింక్ (Unsplash లేదా ఏదైనా పబ్లిక్ ఇమేజ్ లింక్) అతికించండి.
          </p>
        </div>
      )}


      {/* Option C: Curated Telugu Literature Covers Gallery */}
      {activeTab === 'presets' && !hasImage && (
        <div className="space-y-2.5">
          <p className="text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
            మీ రచనకు సరిపోయే అందమైన ప్రామాణిక కవర్ చిత్రాన్ని ఒకే క్లిక్‌తో ఎంచుకోండి:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto p-1">
            {CURATED_COVER_PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => {
                  notifyChange(preset.url, undefined, {
                    fileName: `${preset.id}.jpg`,
                    contentType: 'image/jpeg',
                    size: 153600,
                    uploadedAt: new Date().toISOString(),
                  });
                }}
                className="group relative rounded-xl overflow-hidden border border-[#E8E1DA] dark:border-[#2E2D36] hover:border-[#7A284B] hover:shadow-md cursor-pointer transition-all bg-black/5 aspect-4/3 flex flex-col justify-end p-2"
              >
                <img
                  src={preset.url}
                  alt={preset.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="relative z-10 space-y-0.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#7A284B]/80 text-white font-bold inline-block">
                    {preset.category}
                  </span>
                  <p className="text-[11px] font-bold text-white font-serif-telugu truncate">
                    {preset.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview & Active Management Card */}
      {hasImage && (
        <div className="relative rounded-2xl border border-[#E8E1DA] dark:border-[#26242E] bg-[#FAF7F2] dark:bg-[#121118] p-3 flex flex-col sm:flex-row items-center gap-4 overflow-hidden">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg,image/gif"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelection(e.target.files[0]);
              }
            }}
            className="hidden"
            disabled={disabled || isBusy}
          />

          {/* Thumbnail Preview */}
          <div className="relative w-full sm:w-32 h-24 rounded-xl overflow-hidden bg-black/5 shrink-0 border border-black/10 dark:border-white/10">
            {previewError ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-red-500 text-[10px] p-2 text-center">
                <AlertCircle className="w-5 h-5 mb-1" />
                <span>చిత్రం లోడ్ కాలేదు</span>
              </div>
            ) : (
              <img
                src={effectiveValue}
                alt="Cover Preview"
                onError={() => setPreviewError(true)}
                className="w-full h-full object-cover"
              />
            )}
            {isBusy && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Metadata & Actions */}
          <div className="flex-1 min-w-0 space-y-1 w-full text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isFirebaseStorage 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
              }`}>
                {isFirebaseStorage ? 'Firebase Storage Upload' : 'External Web URL'}
              </span>
              {metadata?.size && (
                <span className="text-[10px] text-[#6F6970] dark:text-[#A29CA6]">
                  {formatBytes(metadata.size)}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-[#17151A] dark:text-[#F7F3EE] truncate" title={metadata?.fileName || effectiveValue}>
              {metadata?.fileName || effectiveValue}
            </p>
            <p className="text-[11px] text-[#6F6970] dark:text-[#A29CA6]">
              {isFirebaseStorage 
                ? 'ఈ చిత్రం క్లౌడ్ స్టోరేజ్‌లో సురక్షితంగా నిల్వ చేయబడింది.' 
                : 'బాహ్య వెబ్ లింక్ ఉపయోగించబడుతోంది.'}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                disabled={disabled || isBusy}
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#18181F] border border-[#E8E1DA] dark:border-[#26242E] text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] hover:bg-[#7A284B] hover:text-white transition-all cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>మార్చండి (Replace)</span>
              </button>

              <button
                type="button"
                disabled={disabled || isBusy}
                onClick={handleRemoveImage}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>తొలగించండి (Remove)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
