import React, { useState, useRef } from 'react';
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
  RotateCcw
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
  error?: string;
  cancelFn?: () => void;
}

export const ImagePagesTab: React.FC<ImagePagesTabProps> = ({
  imagePages,
  onChange,
  storyId = `story-${Date.now()}`
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      // Validate with 10MB limit for story page images
      const validation = storageService.validateImageFile(item.file, 10 * 1024 * 1024);
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
        const pageId = `page_${pagesAccumulator.length + 1}`;
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

        // Append page
        const newPage: StoryImagePage = {
          id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          pageNumber: pagesAccumulator.length + 1,
          imageUrl: uploadRes.downloadUrl,
          imagePath: uploadRes.storagePath,
          imageMetadata: uploadRes.metadata,
          caption: '',
          altText: `పేజీ ${pagesAccumulator.length + 1}`
        };

        pagesAccumulator = [...pagesAccumulator, newPage];
        onChange([...pagesAccumulator]);
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
    const newItems: UploadQueueItem[] = fileArray.map(file => ({
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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      pageNumber: idx + 1
    }));
    onChange(updated);
  };

  const handleRemovePage = async (index: number) => {
    const target = imagePages[index];
    const remaining = imagePages.filter((_, idx) => idx !== index).map((p, idx) => ({
      ...p,
      pageNumber: idx + 1
    }));
    onChange(remaining);

    if (target?.imagePath) {
      storageService.deleteFileByPath(target.imagePath).catch(() => {});
    }
  };

  const handleCaptionChange = (index: number, newCaption: string) => {
    const updated = [...imagePages];
    updated[index] = { ...updated[index], caption: newCaption };
    onChange(updated);
  };

  const activeUploadsCount = uploadQueue.filter(q => q.status === 'UPLOADING' || q.status === 'VALIDATING' || q.status === 'PROCESSING').length;
  const isUploading = activeUploadsCount > 0;

  return (
    <div className="space-y-6">
      {/* Information Header */}
      <div className="p-4 rounded-2xl bg-[#7A284B]/5 dark:bg-[#7A284B]/10 border border-[#7A284B]/20 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#7A284B] text-white shrink-0 mt-0.5">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE]">
              చిత్ర కథ పేజీలు (Image-Based Story Pages / Comics / Scanned Pages)
            </h4>
            <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mt-0.5 leading-relaxed">
              స్కాన్ చేసిన చేతిరాత పేజీలు, బొమ్మల కథలు (Illustrated Stories), కామిక్స్ లేదా పుస్తక పేజీల చిత్రాలను వరుస క్రమంలో అప్‌లోడ్ చేయండి. పాఠకులు ఈ పేజీలను అనుకూలమైన రీడర్‌లో వీక్షించగలరు.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold shrink-0 shadow-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>పేజీలను జోడించండి</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={(e) => handleFilesSelected(e.target.files)}
        className="hidden"
      />

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Real Upload Queue Indicators */}
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

          <div className="space-y-2.5">
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

                      {/* Cancel active upload */}
                      {isItemActive && item.cancelFn && (
                        <button
                          type="button"
                          onClick={() => handleCancelItem(item.id)}
                          className="p-1 text-[#6F6970] hover:text-red-500 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                          title="రద్దు చేయండి (Cancel)"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Retry failed upload */}
                      {isItemFailed && (
                        <button
                          type="button"
                          onClick={() => handleRetryItem(item.id)}
                          className="px-2 py-0.5 rounded bg-[#7A284B] text-white text-[10px] font-bold hover:bg-[#631F3C] inline-flex items-center gap-1 cursor-pointer"
                          title="మళ్లీ ప్రయత్నించండి"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      )}

                      {/* Remove from queue if not active */}
                      {!isItemActive && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQueueItem(item.id)}
                          className="p-1 text-[#6F6970] hover:text-red-500 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                          title="తొలగించు"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
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

                  {/* Error / diagnostic details */}
                  {item.error && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-1.5 leading-snug">
                      {item.error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {imagePages.length === 0 && !isUploading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-[#E8E1DA] dark:border-[#2E2D36] bg-[#FAF7F2] dark:bg-[#18181D] hover:border-[#7A284B]/50 hover:bg-[#7A284B]/5 transition-all cursor-pointer text-center"
        >
          <div className="p-4 rounded-full bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591] mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1">
            కథా చిత్ర పేజీలను ఎంచుకోండి
          </h3>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mb-4 max-w-sm">
            ఒకేసారి ఒకటి లేదా అంతకంటే ఎక్కువ చిత్రాలను ఎంచుకోవచ్చు (JPG, PNG, WEBP - గరిష్టంగా 5MB ఒక్కో చిత్రానికి).
          </p>
          <span className="px-5 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold shadow-md transition-colors inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>చిత్రాలను అప్‌లోడ్ చేయండి</span>
          </span>
        </div>
      )}

      {/* Image Pages Grid / List */}
      {imagePages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#6F6970] dark:text-[#AAA4AC] px-1">
            <span>మొత్తం పేజీలు: <strong className="text-[#17151A] dark:text-[#F7F3EE]">{imagePages.length}</strong></span>
            <span>వరుస క్రమాన్ని మార్చడానికి బాణపు గుర్తులను ఉపయోగించండి</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {imagePages.map((page, index) => (
              <div
                key={page.id}
                className="group relative flex flex-col bg-white dark:bg-[#18181D] rounded-2xl border border-[#E8E1DA] dark:border-[#2E2D36] overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-[3/4] bg-[#FAF7F2] dark:bg-[#202027] overflow-hidden">
                  <img
                    src={page.imageUrl}
                    alt={page.altText || `పేజీ ${page.pageNumber}`}
                    className="w-full h-full object-contain"
                  />

                  {/* Page Badge */}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-xs font-bold bg-black/70 text-white backdrop-blur-md shadow-sm">
                    పేజీ {page.pageNumber}
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
                      onClick={() => handleRemovePage(index)}
                      className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-md transition-colors cursor-pointer"
                      title="పేజీని తొలగించండి"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Reordering Controls at Bottom of Thumbnail */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between bg-black/60 backdrop-blur-md px-2 py-1 rounded-xl text-white text-xs">
                    <span className="font-semibold text-[11px] opacity-90">క్రమం మార్చండి:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMovePage(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-white/20 disabled:opacity-30 cursor-pointer"
                        title="పైకి జరపండి"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePage(index, 'down')}
                        disabled={index === imagePages.length - 1}
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
                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                    placeholder="పేజీ వివరణ / శీర్షిక (ఐచ్ఛికం)..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-1 focus:ring-[#7A284B]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
