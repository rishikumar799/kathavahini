import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Loader2, 
  Plus, 
  CheckCircle2,
  Eye,
  AlertCircle,
  X,
  RotateCcw,
  Sparkles,
  BookOpen,
  Minus,
  Layers
} from 'lucide-react';
import { StoryImagePage } from '../../types';
import { storageService, UploadProgressInfo, UploadStatus } from '../../services/storageService';

interface ImagePagesTabProps {
  imagePages: StoryImagePage[];
  onChange: (pages: StoryImagePage[]) => void;
  storyId?: string;
}

interface UploadQueueItem {
  id: string;
  file: File;
  name: string;
  status: UploadStatus;
  percent: number;
  bytesTransferred: number;
  totalBytes: number;
  targetSlotIndex?: number;
  error?: string;
  cancelFn?: () => void;
}

export const ImagePagesTab: React.FC<ImagePagesTabProps> = ({
  imagePages,
  onChange,
  storyId = `story-${Date.now()}`
}) => {
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const singleSlotFileInputRef = useRef<HTMLInputElement>(null);
  const [targetSlotIndex, setTargetSlotIndex] = useState<number | null>(null);

  // How many page images does the user intend to have?
  const [targetPageCount, setTargetPageCount] = useState<number>(() => Math.max(imagePages.length, 3));
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (imagePages.length > targetPageCount) {
      setTargetPageCount(imagePages.length);
    }
  }, [imagePages.length, targetPageCount]);

  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [previewImage, setPreviewImage] = useState<StoryImagePage | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const processUploadQueue = async (itemsToUpload: UploadQueueItem[], currentPages: StoryImagePage[]) => {
    const concurrency = 2;
    let nextIndex = 0;
    let pagesAccumulator = [...currentPages];

    const uploadSingleItem = async (item: UploadQueueItem) => {
      const validation = storageService.validateImageFile(item.file, 15 * 1024 * 1024);
      if (!validation.isValid) {
        setUploadQueue(prev => prev.map(q => q.id === item.id ? {
          ...q,
          status: 'FAILED',
          error: validation.error || 'చిత్రం చెల్లదు'
        } : q));
        return;
      }

      setUploadQueue(prev => prev.map(q => q.id === item.id ? {
        ...q,
        status: 'UPLOADING',
        percent: 0,
        bytesTransferred: 0,
        totalBytes: item.file.size
      } : q));

      try {
        const pageNumber = item.targetSlotIndex !== undefined ? item.targetSlotIndex + 1 : pagesAccumulator.length + 1;
        const pageId = `page_${pageNumber}_${Date.now()}`;
        const uploadRes = await storageService.uploadStoryPageImage(storyId, pageId, item.file, {
          onProgress: (pct, info?: UploadProgressInfo) => {
            setUploadQueue(prev => prev.map(q => q.id === item.id ? {
              ...q,
              status: info?.status || 'UPLOADING',
              percent: pct,
              bytesTransferred: info?.bytesTransferred || 0,
              totalBytes: info?.totalBytes || item.file.size,
            } : q));
          },
          onTaskCreated: (handle) => {
            setUploadQueue(prev => prev.map(q => q.id === item.id ? {
              ...q,
              cancelFn: () => handle.cancel()
            } : q));
          }
        });

        // Mark complete in queue
        setUploadQueue(prev => prev.map(q => q.id === item.id ? {
          ...q,
          status: 'COMPLETE',
          percent: 100,
          bytesTransferred: item.file.size,
          totalBytes: item.file.size,
          cancelFn: undefined
        } : q));

        const newPage: StoryImagePage = {
          id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          pageNumber: 1, // Will be normalized below
          imageUrl: uploadRes.downloadUrl,
          imagePath: uploadRes.storagePath,
          imageMetadata: uploadRes.metadata,
          caption: '',
          altText: `పేజీ చిత్రం`
        };

        if (item.targetSlotIndex !== undefined && item.targetSlotIndex < pagesAccumulator.length) {
          // Replace specific slot
          pagesAccumulator[item.targetSlotIndex] = newPage;
        } else {
          // Append
          pagesAccumulator.push(newPage);
        }

        // Renumber pages sequentially
        const renumbered = pagesAccumulator.map((p, idx) => ({
          ...p,
          pageNumber: idx + 1,
          altText: `పేజీ ${idx + 1}`
        }));

        pagesAccumulator = renumbered;
        onChange([...pagesAccumulator]);
        setTargetPageCount(prev => Math.max(prev, pagesAccumulator.length));
      } catch (err: any) {
        console.error('Upload failed for item:', item.name, err);
        const isCancel = err.code === 'storage/canceled';
        setUploadQueue(prev => prev.map(q => q.id === item.id ? {
          ...q,
          status: isCancel ? 'CANCELED' : 'FAILED',
          error: isCancel ? 'అప్‌లోడ్ రద్దు చేయబడింది' : (err.message || 'అప్‌లోడ్ లోపం'),
          cancelFn: undefined
        } : q));
      }
    };

    const worker = async () => {
      while (nextIndex < itemsToUpload.length) {
        const currentItem = itemsToUpload[nextIndex++];
        await uploadSingleItem(currentItem);
      }
    };

    const workers = [];
    const count = Math.min(concurrency, itemsToUpload.length);
    for (let i = 0; i < count; i++) {
      workers.push(worker());
    }

    await Promise.all(workers);
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);

    const fileArray = Array.from(files);
    // If files are selected, automatically set the target page count to hold all of them!
    const updatedCount = Math.max(imagePages.length + fileArray.length, fileArray.length);
    setTargetPageCount(updatedCount);

    const newItems: UploadQueueItem[] = fileArray.map((file) => ({
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      file,
      name: file.name,
      status: 'QUEUED',
      percent: 0,
      bytesTransferred: 0,
      totalBytes: file.size,
    }));

    setUploadQueue(prev => [...prev, ...newItems]);
    await processUploadQueue(newItems, imagePages);

    if (multiFileInputRef.current) {
      multiFileInputRef.current.value = '';
    }
  };

  const handleSingleSlotSelected = async (files: FileList | null) => {
    if (!files || files.length === 0 || targetSlotIndex === null) return;
    const file = files[0];
    const slotIdx = targetSlotIndex;
    setTargetSlotIndex(null);

    const newItem: UploadQueueItem = {
      id: `queue-slot-${Date.now()}`,
      file,
      name: file.name,
      status: 'QUEUED',
      percent: 0,
      bytesTransferred: 0,
      totalBytes: file.size,
      targetSlotIndex: slotIdx
    };

    setUploadQueue(prev => [...prev, newItem]);
    await processUploadQueue([newItem], imagePages);

    if (singleSlotFileInputRef.current) {
      singleSlotFileInputRef.current.value = '';
    }
  };

  const handleOpenSlotUpload = (index: number) => {
    setTargetSlotIndex(index);
    singleSlotFileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleRetryItem = async (itemId: string) => {
    const item = uploadQueue.find(q => q.id === itemId);
    if (!item) return;

    const resetItem: UploadQueueItem = {
      ...item,
      status: 'QUEUED',
      percent: 0,
      bytesTransferred: 0,
      error: undefined,
    };

    setUploadQueue(prev => prev.map(q => q.id === itemId ? resetItem : q));
    await processUploadQueue([resetItem], imagePages);
  };

  const handleCancelItem = (itemId: string) => {
    const item = uploadQueue.find(q => q.id === itemId);
    if (item?.cancelFn) {
      item.cancelFn();
    }
  };

  const handleRemoveQueueItem = (itemId: string) => {
    setUploadQueue(prev => prev.filter(q => q.id !== itemId));
  };

  const handleClearFinishedQueue = () => {
    setUploadQueue(prev => prev.filter(q => q.status === 'UPLOADING' || q.status === 'VALIDATING' || q.status === 'PROCESSING'));
  };

  const handleMovePage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= imagePages.length) return;

    const reordered = [...imagePages];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const updated = reordered.map((p, idx) => ({
      ...p,
      pageNumber: idx + 1,
      altText: `పేజీ ${idx + 1}`
    }));
    onChange(updated);
  };

  const handleRemovePage = async (index: number) => {
    const target = imagePages[index];
    const remaining = imagePages.filter((_, idx) => idx !== index).map((p, idx) => ({
      ...p,
      pageNumber: idx + 1,
      altText: `పేజీ ${idx + 1}`
    }));
    onChange(remaining);
    setTargetPageCount(prev => Math.max(remaining.length, prev > 1 ? prev - 1 : 1));

    if (target?.imagePath) {
      storageService.deleteFileByPath(target.imagePath).catch(() => {});
    }
  };

  const handleCaptionChange = (index: number, newCaption: string) => {
    const updated = [...imagePages];
    updated[index] = { ...updated[index], caption: newCaption };
    onChange(updated);
  };

  const handleSetTargetCount = (newCount: number) => {
    const count = Math.max(1, Math.min(50, newCount));
    setTargetPageCount(count);
  };

  const activeUploadsCount = uploadQueue.filter(q => q.status === 'UPLOADING' || q.status === 'VALIDATING' || q.status === 'PROCESSING').length;
  const isUploading = activeUploadsCount > 0;

  // Build full slots array up to targetPageCount
  const displaySlotsCount = Math.max(targetPageCount, imagePages.length);
  const slots = Array.from({ length: displaySlotsCount }).map((_, idx) => {
    return {
      index: idx,
      pageNumber: idx + 1,
      pageData: imagePages[idx] || null,
      isCover: idx === 0
    };
  });

  return (
    <div className="space-y-6">
      {/* Hidden file inputs */}
      <input
        ref={multiFileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={(e) => handleFilesSelected(e.target.files)}
        className="hidden"
      />
      <input
        ref={singleSlotFileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={(e) => handleSingleSlotSelected(e.target.files)}
        className="hidden"
      />

      {/* Hero Configuration Card: Choose Number of Images / Pages */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#7A284B]/10 via-[#7A284B]/5 to-transparent border border-[#7A284B]/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-[#7A284B] text-white shadow-sm shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE] flex items-center gap-2">
                <span>చిత్ర కథ పేజీలు (Image-Based Story Pages)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7A284B] text-white">
                  ప్రతి పేజీ ఒక చిత్రం
                </span>
              </h4>
              <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mt-0.5 leading-relaxed">
                ఈ కథలో ప్రతి పేజీ ఒక చిత్రం రూపంలో ఉంటుంది. <strong>పేజీ 1 స్వయంచాలకంగా కథ యొక్క ముఖచిత్రంగా (Cover) మారుతుంది.</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => multiFileInputRef.current?.click()}
            disabled={isUploading}
            className="px-5 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold shrink-0 shadow-md transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            <span>అన్ని చిత్రాలను ఒకేసారి ఎంచుకోండి</span>
          </button>
        </div>

        {/* Number of Images Selector / Stepper */}
        <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#202027]/80 backdrop-blur-sm border border-[#E8E1DA] dark:border-[#2E2D36] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE]">
              ఎన్ని పేజీల చిత్రాలు ఉన్నాయి? (Total Page Images):
            </span>
            <div className="flex items-center gap-1.5 bg-[#FAF7F2] dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] rounded-xl p-1">
              <button
                type="button"
                onClick={() => handleSetTargetCount(targetPageCount - 1)}
                disabled={targetPageCount <= 1 || targetPageCount <= imagePages.length}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer text-[#17151A] dark:text-[#F7F3EE]"
                title="తగ్గించండి"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min={imagePages.length || 1}
                max={50}
                value={targetPageCount}
                onChange={(e) => handleSetTargetCount(parseInt(e.target.value) || 1)}
                className="w-12 text-center text-xs font-bold bg-transparent text-[#17151A] dark:text-[#F7F3EE] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSetTargetCount(targetPageCount + 1)}
                disabled={targetPageCount >= 50}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer text-[#17151A] dark:text-[#F7F3EE]"
                title="పెంచండి"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Count Presets */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC]">త్వరిత ఎంపిక:</span>
            {[2, 3, 5, 8, 10, 15].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => handleSetTargetCount(cnt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  targetPageCount === cnt
                    ? 'bg-[#7A284B] text-white'
                    : 'bg-[#FAF7F2] dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-[#6F6970] dark:text-[#AAA4AC] hover:border-[#7A284B]/40'
                }`}
              >
                {cnt} పేజీలు
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Queue Progress Card */}
      {uploadQueue.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#7A284B] dark:text-[#D87591]">
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#7A284B]" />
                  <span>చిత్రాలు అప్‌లోడ్ అవుతున్నాయి ({activeUploadsCount} క్యూలో / ప్రాసెస్‌లో)...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#3E8065]" />
                  <span>అప్‌లోడ్ ప్రక్రియ పూర్తయింది</span>
                </>
              )}
            </div>

            {!isUploading && (
              <button
                type="button"
                onClick={handleClearFinishedQueue}
                className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#7A284B] font-medium cursor-pointer"
              >
                క్యూను క్లియర్ చేయండి
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {uploadQueue.map((item) => {
              const isItemActive = item.status === 'UPLOADING' || item.status === 'VALIDATING' || item.status === 'PROCESSING';
              const isItemFailed = item.status === 'FAILED';
              const isItemCanceled = item.status === 'CANCELED';
              const isItemComplete = item.status === 'COMPLETE';

              return (
                <div 
                  key={item.id} 
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    isItemFailed ? 'border-red-500/30 bg-red-500/5' :
                    isItemComplete ? 'border-[#3E8065]/30 bg-[#3E8065]/5' :
                    isItemCanceled ? 'border-amber-500/30 bg-amber-500/5' :
                    'border-[#E8E1DA] dark:border-[#2E2D36] bg-white dark:bg-[#202027]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-[#17151A] dark:text-[#F7F3EE] truncate max-w-[200px] sm:max-w-xs">
                        {item.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        item.status === 'COMPLETE' ? 'bg-[#3E8065] text-white' :
                        item.status === 'UPLOADING' ? 'bg-[#7A284B] text-white' :
                        item.status === 'VALIDATING' ? 'bg-blue-600 text-white' :
                        item.status === 'PROCESSING' ? 'bg-purple-600 text-white' :
                        item.status === 'CANCELED' ? 'bg-amber-600 text-white' :
                        item.status === 'FAILED' ? 'bg-red-600 text-white' :
                        'bg-gray-400 text-white'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-[#6F6970] dark:text-[#AAA4AC]">
                        {formatBytes(item.bytesTransferred)} / {formatBytes(item.totalBytes)} ({item.percent}%)
                      </span>

                      {isItemActive && item.cancelFn && (
                        <button
                          type="button"
                          onClick={() => handleCancelItem(item.id)}
                          className="p-1 text-[#6F6970] hover:text-red-500 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                          title="రద్దు చేయండి"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isItemFailed && (
                        <button
                          type="button"
                          onClick={() => handleRetryItem(item.id)}
                          className="px-2 py-0.5 rounded bg-[#7A284B] text-white text-[10px] font-bold hover:bg-[#631F3C] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      )}

                      {!isItemActive && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQueueItem(item.id)}
                          className="p-1 text-[#6F6970] hover:text-red-500 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 rounded-full ${
                        isItemFailed ? 'bg-red-500' :
                        isItemComplete ? 'bg-[#3E8065]' :
                        isItemCanceled ? 'bg-amber-500' :
                        'bg-[#7A284B]'
                      }`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Drag-and-Drop Batch Zone when no pages yet */}
      {imagePages.length === 0 && !isUploading && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => multiFileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center ${
            isDragging
              ? 'border-[#7A284B] bg-[#7A284B]/10 scale-[0.99]'
              : 'border-[#E8E1DA] dark:border-[#2E2D36] bg-[#FAF7F2] dark:bg-[#18181D] hover:border-[#7A284B]/50 hover:bg-[#7A284B]/5'
          }`}
        >
          <div className="p-4 rounded-2xl bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591] mb-3">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1 font-serif-telugu">
            మీ కథా చిత్ర పేజీలను ఇక్కడ లాగి వదలండి లేదా ఎంచుకోండి
          </h3>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mb-4 max-w-md leading-relaxed">
            మీ వద్ద ఉన్న <strong>అన్ని పేజీల చిత్రాలను ఒకేసారి సెలెక్ట్ చేయండి</strong>. అవి వరుసగా <strong>పేజీ 1, పేజీ 2, పేజీ 3...</strong> రూపంలో కథగా రూపుదిద్దుకుంటాయి (JPG, PNG, WEBP - గరిష్టంగా 15MB ఒక్కో చిత్రానికి).
          </p>
          <span className="px-6 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold shadow-md transition-colors inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>చిత్రాలన్నింటినీ ఒకేసారి అప్‌లోడ్ చేయండి</span>
          </span>
        </div>
      )}

      {/* Sequential Story Pages Slots Grid */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6F6970] dark:text-[#AAA4AC] px-1">
          <div className="flex items-center gap-2">
            <span>అప్‌లోడ్ అయిన పేజీలు: <strong className="text-[#17151A] dark:text-[#F7F3EE]">{imagePages.length}</strong> / <strong>{displaySlotsCount}</strong></span>
            {imagePages.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3E8065]/10 text-[#3E8065] border border-[#3E8065]/20">
                ✓ పేజీ 1 ముఖచిత్రంగా ఉంది
              </span>
            )}
          </div>
          <span>వరుస క్రమం మార్చడానికి బాణపు గుర్తులను ఉపయోగించండి</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map((slot) => {
            const page = slot.pageData;
            const isFirst = slot.isCover;

            return (
              <div
                key={`slot-${slot.index}`}
                className={`group relative flex flex-col rounded-2xl border transition-all overflow-hidden shadow-sm ${
                  page
                    ? isFirst
                      ? 'border-[#7A284B] ring-1 ring-[#7A284B]/30 bg-white dark:bg-[#18181D]'
                      : 'border-[#E8E1DA] dark:border-[#2E2D36] bg-white dark:bg-[#18181D]'
                    : 'border-dashed border-[#E8E1DA] dark:border-[#2E2D36] bg-[#FAF7F2]/60 dark:bg-[#18181D]/40 hover:border-[#7A284B]/40'
                }`}
              >
                {page ? (
                  /* Filled Page Slot */
                  <>
                    <div className="relative aspect-[3/4] bg-[#FAF7F2] dark:bg-[#202027] overflow-hidden">
                      <img
                        src={page.imageUrl}
                        alt={page.altText || `పేజీ ${slot.pageNumber}`}
                        className="w-full h-full object-contain"
                      />

                      {/* Page Badge */}
                      <span className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm flex items-center gap-1 ${
                        isFirst 
                          ? 'bg-[#7A284B] text-white ring-1 ring-white/30' 
                          : 'bg-black/70 text-white'
                      }`}>
                        {isFirst && <Sparkles className="w-3 h-3" />}
                        <span>పేజీ {slot.pageNumber} {isFirst ? '(ముఖచిత్రం)' : ''}</span>
                      </span>

                      {/* Actions Overlay */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setPreviewImage(page)}
                          className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-colors cursor-pointer"
                          title="పెద్దదిగా చూడండి (Preview)"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenSlotUpload(slot.index)}
                          className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-colors cursor-pointer"
                          title="చిత్రాన్ని మార్చండి (Replace)"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePage(slot.index)}
                          className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-md transition-colors cursor-pointer"
                          title="పేజీని తొలగించండి"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Reordering Controls */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-xs">
                        <span className="font-semibold text-[11px] opacity-90">క్రమం మార్చండి:</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMovePage(slot.index, 'up')}
                            disabled={slot.index === 0}
                            className="p-1 rounded hover:bg-white/20 disabled:opacity-30 cursor-pointer"
                            title="పైకి జరపండి"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMovePage(slot.index, 'down')}
                            disabled={slot.index === imagePages.length - 1}
                            className="p-1 rounded hover:bg-white/20 disabled:opacity-30 cursor-pointer"
                            title="కిందికి జరపండి"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Caption Input */}
                    <div className="p-3 border-t border-[#E8E1DA]/60 dark:border-[#2E2D36]/60 bg-[#FAF7F2]/50 dark:bg-[#18181D]">
                      <input
                        type="text"
                        value={page.caption || ''}
                        onChange={(e) => handleCaptionChange(slot.index, e.target.value)}
                        placeholder={`పేజీ ${slot.pageNumber} వివరణ / శీర్షిక (ఐచ్ఛికం)...`}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-1 focus:ring-[#7A284B]"
                      />
                    </div>
                  </>
                ) : (
                  /* Empty Page Slot */
                  <div
                    onClick={() => handleOpenSlotUpload(slot.index)}
                    className="aspect-[3/4] flex flex-col items-center justify-center p-6 text-center cursor-pointer group hover:bg-[#7A284B]/5 transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1">
                      పేజీ {slot.pageNumber} {isFirst ? '(ముఖచిత్రం)' : ''}
                    </span>
                    <span className="text-[11px] text-[#6F6970] dark:text-[#AAA4AC]">
                      ఈ పేజీ చిత్రాన్ని ఎంచుకోండి
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleSetTargetCount(displaySlotsCount + 1)}
            className="px-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#202027] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] hover:border-[#7A284B] transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#7A284B]" />
            <span>మరో పేజీని జోడించండి (+1 Page Slot)</span>
          </button>

          {imagePages.length > 0 && (
            <button
              type="button"
              onClick={() => multiFileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-[#7A284B]/10 text-[#7A284B] hover:bg-[#7A284B]/20 text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>మరిన్ని చిత్రాలను ఒకేసారి జోడించండి</span>
            </button>
          )}
        </div>
      </div>

      {/* Full Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4"
        >
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img
              src={previewImage.imageUrl}
              alt={`పేజీ ${previewImage.pageNumber}`}
              className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl"
            />
            <div className="mt-3 text-center text-white text-sm font-serif-telugu">
              <strong>పేజీ {previewImage.pageNumber}</strong>
              {previewImage.caption && <p className="text-xs opacity-80 mt-1">{previewImage.caption}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="mt-4 px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            మూసివేయి (Close)
          </button>
        </div>
      )}
    </div>
  );
};
