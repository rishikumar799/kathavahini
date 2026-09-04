import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  StorageReference,
  UploadTask,
} from 'firebase/storage';
import { storage, auth } from '../lib/firebase';
import { ImageMetadata } from '../types';

export interface StorageUploadResult {
  downloadUrl: string;
  storagePath: string;
  metadata: ImageMetadata;
}

export type UploadStatus =
  | 'IDLE'
  | 'QUEUED'
  | 'VALIDATING'
  | 'UPLOADING'
  | 'PROCESSING'
  | 'SAVING'
  | 'COMPLETE'
  | 'FAILED'
  | 'CANCELED';

export interface UploadProgressInfo {
  status: UploadStatus;
  percent: number;
  bytesTransferred: number;
  totalBytes: number;
  fileName: string;
  error?: string;
}

export interface UploadOptions {
  onProgress?: (percent: number, info?: UploadProgressInfo) => void;
  onTaskCreated?: (controls: { cancel: () => void; task: UploadTask }) => void;
}

export type ProgressOrOptions =
  | ((percent: number, info?: UploadProgressInfo) => void)
  | UploadOptions;

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export class StorageService {
  /**
   * Validate file type and size according to security rules
   */
  public validateImageFile(file: File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'దయచేసి ఒక చిత్రాన్ని ఎంచుకోండి (Please select an image file).' };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return {
        isValid: false,
        error: 'ఈ ఫైల్ ఫార్మాట్‌కు మద్దతు లేదు. కేవలం JPG, PNG, WEBP, GIF చిత్రాలను మాత్రమే అప్‌లోడ్ చేయండి.'
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        error: `ఫైల్ పరిమాణం 5MB పరిమితిని మించింది (${(file.size / (1024 * 1024)).toFixed(1)}MB). దయచేసి చిన్న చిత్రాన్ని ఎంచుకోండి.`
      };
    }

    return { isValid: true };
  }

  /**
   * Core resumable upload helper to Firebase Storage with real progress reporting,
   * cancellation handle, and clear diagnostic error handling
   */
  private async executeUpload(
    storageRef: StorageReference,
    file: File,
    customMeta: Record<string, string>,
    progressOrOptions?: ProgressOrOptions
  ): Promise<StorageUploadResult> {
    const onProgress = typeof progressOrOptions === 'function'
      ? progressOrOptions
      : progressOrOptions?.onProgress;
    const onTaskCreated = typeof progressOrOptions === 'object'
      ? progressOrOptions?.onTaskCreated
      : undefined;

    const notifyProgress = (percent: number, info: UploadProgressInfo) => {
      if (onProgress) {
        try {
          onProgress(percent, info);
        } catch (err) {
          console.warn('Progress notification error:', err);
        }
      }
    };

    // 1. Validate file
    notifyProgress(0, {
      status: 'VALIDATING',
      percent: 0,
      bytesTransferred: 0,
      totalBytes: file.size,
      fileName: file.name,
    });

    const isDocument = customMeta.purpose?.includes('document');
    const validation = isDocument ? this.validateDocumentFile(file) : this.validateImageFile(file);
    if (!validation.isValid) {
      const errorMsg = validation.error || 'ఫైల్ చెల్లదు';
      notifyProgress(0, {
        status: 'FAILED',
        percent: 0,
        bytesTransferred: 0,
        totalBytes: file.size,
        fileName: file.name,
        error: errorMsg,
      });
      throw new Error(errorMsg);
    }

    // 2. Authentication check
    if (!auth.currentUser) {
      const authError = 'ఫైళ్లను అప్‌లోడ్ చేయడానికి దయచేసి ముందుగా లాగిన్ చేయండి (Please log in to upload).';
      notifyProgress(0, {
        status: 'FAILED',
        percent: 0,
        bytesTransferred: 0,
        totalBytes: file.size,
        fileName: file.name,
        error: authError,
      });
      throw new Error(authError);
    }

    // 3. Initiate resumable upload task
    notifyProgress(0, {
      status: 'UPLOADING',
      percent: 0,
      bytesTransferred: 0,
      totalBytes: file.size,
      fileName: file.name,
    });

    return new Promise<StorageUploadResult>((resolve, reject) => {
      let isSettled = false;
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type || 'application/octet-stream',
        customMetadata: customMeta,
      });

      if (onTaskCreated) {
        onTaskCreated({
          cancel: () => {
            if (!isSettled) {
              uploadTask.cancel();
            }
          },
          task: uploadTask,
        });
      }

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (isSettled) return;
          const bytesTransferred = snapshot.bytesTransferred;
          const totalBytes = snapshot.totalBytes || file.size;
          const percent = totalBytes > 0 ? Math.min(100, Math.round((bytesTransferred / totalBytes) * 100)) : 0;

          notifyProgress(percent, {
            status: 'UPLOADING',
            percent,
            bytesTransferred,
            totalBytes,
            fileName: file.name,
          });
        },
        (error: any) => {
          if (isSettled) return;
          isSettled = true;

          const errorCode = error?.code || '';
          const errorMessage = (error?.message || '').toLowerCase();

          if (errorCode === 'storage/canceled') {
            notifyProgress(0, {
              status: 'CANCELED',
              percent: 0,
              bytesTransferred: 0,
              totalBytes: file.size,
              fileName: file.name,
              error: 'అప్‌లోడ్ రద్దు చేయబడింది (Upload cancelled).'
            });
            const cancelErr = new Error('అప్‌లోడ్ రద్దు చేయబడింది.');
            (cancelErr as any).code = 'storage/canceled';
            reject(cancelErr);
            return;
          }

          let userMsg = 'అప్‌లోడ్ చేయడంలో లోపం ఏర్పడింది.';
          if (errorCode === 'storage/unauthorized') {
            userMsg = 'అప్‌లోడ్ చేయడానికి అనుమతి లేదు. దయచేసి మీ లాగిన్ స్థితిని సరిచూసుకోండి.';
          } else if (errorCode === 'storage/retry-limit-exceeded' || errorMessage.includes('retry-limit-exceeded')) {
            userMsg = 'నెట్‌వర్క్ సమయం ముగిసింది. దయచేసి ఇంటర్నెట్ సరిచూసుకొని మళ్లీ ప్రయత్నించండి.';
          } else if (errorCode === 'storage/unknown' || errorMessage.includes('404') || errorMessage.includes('not found') || errorMessage.includes('bucket')) {
            userMsg = 'Firebase Storage బకెట్ (kathavahini-9a9c1.firebasestorage.app) అందుబాటులో లేదు (Not Found 404). Firebase Console లో Storage "Get Started" ఎనేబుల్ చేయండి లేదా "చిత్రం URL" ఎంపికను ఉపయోగించండి.';
          } else {
            userMsg = error?.message || 'అప్‌లోడ్ చేయడంలో సాంకేతిక లోపం ఎదురైంది.';
          }

          notifyProgress(0, {
            status: 'FAILED',
            percent: 0,
            bytesTransferred: 0,
            totalBytes: file.size,
            fileName: file.name,
            error: userMsg,
          });

          const enrichedError = new Error(userMsg);
          (enrichedError as any).code = errorCode;
          reject(enrichedError);
        },
        async () => {
          if (isSettled) return;
          try {
            notifyProgress(100, {
              status: 'PROCESSING',
              percent: 100,
              bytesTransferred: file.size,
              totalBytes: file.size,
              fileName: file.name,
            });

            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

            const result: StorageUploadResult = {
              downloadUrl,
              storagePath: storageRef.fullPath,
              metadata: {
                fileName: file.name,
                contentType: file.type || 'application/octet-stream',
                size: file.size,
                uploadedAt: new Date().toISOString(),
              },
            };

            notifyProgress(100, {
              status: 'COMPLETE',
              percent: 100,
              bytesTransferred: file.size,
              totalBytes: file.size,
              fileName: file.name,
            });

            isSettled = true;
            resolve(result);
          } catch (err: any) {
            isSettled = true;
            notifyProgress(0, {
              status: 'FAILED',
              percent: 0,
              bytesTransferred: 0,
              totalBytes: file.size,
              fileName: file.name,
              error: err.message || 'Download URL ఉత్పత్తి చేయడంలో విఫలమైంది',
            });
            reject(err);
          }
        }
      );
    });
  }


  /**
   * Upload user profile avatar
   * Path: users/{userId}/profile/{uniqueFileName}
   */
  public async uploadProfileImage(
    userId: string,
    file: File,
    progressOrOptions?: ProgressOrOptions
  ): Promise<StorageUploadResult> {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `users/${userId}/profile/${uniqueFileName}`;
    const storageRef = ref(storage, filePath);

    return this.executeUpload(
      storageRef,
      file,
      {
        uploadedBy: userId,
        purpose: 'profile_avatar',
        timestamp: new Date().toISOString(),
      },
      progressOrOptions
    );
  }

  /**
   * Upload writer / author profile image
   * Path: writers/{writerId}/profile/{uniqueFileName}
   */
  public async uploadWriterProfileImage(
    writerId: string,
    file: File,
    progressOrOptions?: ProgressOrOptions
  ): Promise<StorageUploadResult> {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `writers/${writerId}/profile/${uniqueFileName}`;
    const storageRef = ref(storage, filePath);

    return this.executeUpload(
      storageRef,
      file,
      {
        uploadedBy: writerId,
        purpose: 'writer_profile',
        timestamp: new Date().toISOString(),
      },
      progressOrOptions
    );
  }

  /**
   * Upload story cover image
   * Path: stories/{storyId}/cover/{uniqueFileName}
   */
  public async uploadStoryCover(
    storyId: string,
    file: File,
    progressOrOptions?: ProgressOrOptions
  ): Promise<StorageUploadResult> {
    const currentUid = auth.currentUser?.uid || 'anonymous';
    const fileExt = file.name.split('.').pop() || 'jpg';
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `stories/${storyId}/cover/${uniqueFileName}`;
    const storageRef = ref(storage, filePath);

    return this.executeUpload(
      storageRef,
      file,
      {
        uploadedBy: currentUid,
        storyId,
        purpose: 'story_cover',
        timestamp: new Date().toISOString(),
      },
      progressOrOptions
    );
  }

  /**
   * Upload novel cover image
   * Path: novels/{novelId}/cover/{uniqueFileName}
   */
  public async uploadNovelCover(
    novelId: string,
    file: File,
    progressOrOptions?: ProgressOrOptions
  ): Promise<StorageUploadResult> {
    const currentUid = auth.currentUser?.uid || 'anonymous';
    const fileExt = file.name.split('.').pop() || 'jpg';
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `novels/${novelId}/cover/${uniqueFileName}`;
    const storageRef = ref(storage, filePath);

    return this.executeUpload(
      storageRef,
      file,
      {
        uploadedBy: currentUid,
        novelId,
        purpose: 'novel_cover',
        timestamp: new Date().toISOString(),
      },
      progressOrOptions
    );
  }

  /**
   * Upload knowledge article cover image
   * Path: knowledge/{knowledgeId}/cover/{uniqueFileName}
   */
  public async uploadKnowledgeCover(
    knowledgeId: string,
    file: File,
    progressOrOptions?: ProgressOrOptions
  ): Promise<StorageUploadResult> {
    const currentUid = auth.currentUser?.uid || 'anonymous';
    const fileExt = file.name.split('.').pop() || 'jpg';
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `knowledge/${knowledgeId}/cover/${uniqueFileName}`;
    const storageRef = ref(storage, filePath);

    return this.executeUpload(
      storageRef,
      file,
      {
        uploadedBy: currentUid,
        knowledgeId,
        purpose: 'knowledge_cover',
        timestamp: new Date().toISOString(),
      },
      progressOrOptions
    );
  }

  /**
   * Validate document file type and size (PDF, DOCX, TXT max 20MB)
   */
  public validateDocumentFile(file: File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'దయచేసి ఒక పత్రాన్ని (Document) ఎంచుకోండి.' };
    }

    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    const isPdf = name.endsWith('.pdf') || type.includes('pdf');
    const isDocx = name.endsWith('.docx') || name.endsWith('.doc') || type.includes('wordprocessingml') || type.includes('msword');
    const isTxt = name.endsWith('.txt') || type.includes('text/plain');

    if (!isPdf && !isDocx && !isTxt) {
      return {
        isValid: false,
        error: 'ఈ ఫైల్ ఫార్మాట్ చెల్లదు. కేవలం PDF, DOCX, లేదా TXT ఫైళ్లను మాత్రమే అప్‌లోడ్ చేయండి.'
      };
    }

    const MAX_DOC_SIZE = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_DOC_SIZE) {
      return {
        isValid: false,
        error: `డాక్యుమెంట్ పరిమాణం 20MB పరిమితిని మించింది (${(file.size / (1024 * 1024)).toFixed(1)}MB).`
      };
    }

    return { isValid: true };
  }

  /**
   * Upload content image (for mixed stories or image pages)
   * Path: stories/{storyId}/content/{uniqueFileName}
   */
  public async uploadStoryContentImage(
    storyId: string,
    file: File,
    progressOrOptions?: ProgressOrOptions
  ): Promise<StorageUploadResult> {
    const currentUid = auth.currentUser?.uid || 'anonymous';
    const fileExt = file.name.split('.').pop() || 'jpg';
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `stories/${storyId}/content/${uniqueFileName}`;
    const storageRef = ref(storage, filePath);

    return this.executeUpload(
      storageRef,
      file,
      {
        uploadedBy: currentUid,
        storyId,
        purpose: 'story_content_image',
        timestamp: new Date().toISOString(),
      },
      progressOrOptions
    );
  }

  /**
   * Upload original source document
   * Path: stories/{storyId}/documents/{uniqueFileName}
   */
  public async uploadStoryDocument(
    storyId: string,
    file: File,
    progressOrOptions?: ProgressOrOptions
  ): Promise<StorageUploadResult> {
    const currentUid = auth.currentUser?.uid || 'anonymous';
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFileName = `${Date.now()}_${sanitizedName}`;
    const filePath = `stories/${storyId}/documents/${uniqueFileName}`;
    const storageRef = ref(storage, filePath);

    return this.executeUpload(
      storageRef,
      file,
      {
        uploadedBy: currentUid,
        storyId,
        purpose: 'story_source_document',
        originalName: file.name,
        timestamp: new Date().toISOString(),
      },
      progressOrOptions
    );
  }

  /**
   * Upload multiple story image pages with controlled concurrency (max 2 parallel)
   */
  public async uploadStoryImagePages(
    storyId: string,
    files: File[],
    onProgressPerFile?: (fileIndex: number, percent: number, info?: UploadProgressInfo) => void
  ): Promise<StorageUploadResult[]> {
    const results: StorageUploadResult[] = new Array(files.length);
    const concurrency = 2;
    let nextIndex = 0;

    const worker = async () => {
      while (nextIndex < files.length) {
        const index = nextIndex++;
        const file = files[index];
        const res = await this.uploadStoryContentImage(storyId, file, {
          onProgress: (percent, info) => {
            if (onProgressPerFile) {
              onProgressPerFile(index, percent, info);
            }
          },
        });
        results[index] = res;
      }
    };

    const workers = [];
    const workerCount = Math.min(concurrency, files.length);
    for (let w = 0; w < workerCount; w++) {
      workers.push(worker());
    }

    await Promise.all(workers);
    return results;
  }

  /**
   * Safely delete a file from Firebase Storage by path
   */
  public async deleteFileByPath(filePath: string): Promise<boolean> {
    if (!filePath || !filePath.trim()) return true;
    try {
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
      return true;
    } catch (err: any) {
      if (err.code === 'storage/object-not-found') {
        return true;
      }
      console.warn('Failed to delete storage file by path:', filePath, err);
      return false;
    }
  }

  /**
   * Safely delete a file from Firebase Storage by download URL
   */
  public async deleteFileByUrl(fileUrl: string): Promise<boolean> {
    if (!fileUrl || !fileUrl.includes('firebasestorage.googleapis.com')) {
      return true;
    }
    try {
      const storageRef = ref(storage, fileUrl);
      await deleteObject(storageRef);
      return true;
    } catch (err: any) {
      if (err.code === 'storage/object-not-found') {
        return true;
      }
      console.warn('Failed to delete storage file by URL:', fileUrl, err);
      return false;
    }
  }
}

export const storageService = new StorageService();

