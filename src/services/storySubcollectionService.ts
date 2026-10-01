import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StoryImagePage, SourceDocumentInfo, Episode } from '../types';
import { sanitizeFirestoreData } from '../utils/firestoreSanitizer';
import { storageService } from './storageService';

/**
 * StorySubcollectionService
 * Manages lightweight subcollections for scalable long-form stories:
 * - stories/{storyId}/pages/{pageId}
 * - stories/{storyId}/documents/{docId}
 * - stories/{storyId}/episodes/{episodeId}
 * - stories/{storyId}/episodes/{episodeId}/pages/{pageId}
 * 
 * Guarantees that root story documents never exceed Firestore 1 MiB limit
 * while keeping 100+ image pages, bulk documents, and episodes ordered and performant.
 */
export class StorySubcollectionService {
  /**
   * Save or update all image pages in subcollection: stories/{storyId}/pages/{pageId}
   * Stores strictly lightweight metadata documents.
   */
  public async saveStoryPages(
    storyId: string,
    pages: StoryImagePage[],
    ownerId?: string
  ): Promise<void> {
    if (!storyId || !Array.isArray(pages)) return;

    const batch = writeBatch(db);
    const pagesColl = collection(db, 'stories', storyId, 'pages');

    // 1. Write each page with explicit sequential order
    pages.forEach((page, idx) => {
      const pageId = page.id || `page-${String(idx + 1).padStart(3, '0')}`;
      const pageRef = doc(pagesColl, pageId);
      const pageDoc = {
        id: pageId,
        pageId,
        storyId,
        order: idx + 1,
        pageNumber: idx + 1,
        imageUrl: page.imageUrl || '',
        downloadURL: page.imageUrl || '',
        storagePath: page.imagePath || '',
        imagePath: page.imagePath || '',
        caption: page.caption || '',
        altText: page.altText || `పేజీ ${idx + 1}`,
        fileName: page.imageMetadata?.fileName || `page_${idx + 1}.jpg`,
        mimeType: page.imageMetadata?.contentType || 'image/jpeg',
        fileSize: page.imageMetadata?.size || 0,
        imageMetadata: page.imageMetadata || null,
        ownerId: ownerId || null,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      batch.set(pageRef, sanitizeFirestoreData(pageDoc), { merge: true });
    });

    await batch.commit();
  }

  /**
   * Load image pages ordered deterministically by numeric `order asc`
   */
  public async loadStoryPages(storyId: string): Promise<StoryImagePage[]> {
    if (!storyId) return [];
    try {
      const pagesColl = collection(db, 'stories', storyId, 'pages');
      const q = query(pagesColl, orderBy('order', 'asc'));
      const snap = await getDocs(q);

      if (snap.empty) {
        // Fallback check: attempt without orderBy in case index is creating
        const rawSnap = await getDocs(pagesColl);
        if (!rawSnap.empty) {
          const list = rawSnap.docs.map(d => {
            const data = d.data();
            return {
              id: d.id,
              pageNumber: data.pageNumber || data.order || 1,
              imageUrl: data.imageUrl || data.downloadURL || '',
              imagePath: data.imagePath || data.storagePath || '',
              caption: data.caption || '',
              altText: data.altText || `పేజీ ${data.pageNumber || 1}`,
              imageMetadata: data.imageMetadata || undefined,
            } as StoryImagePage;
          });
          return list.sort((a, b) => a.pageNumber - b.pageNumber);
        }
        return [];
      }

      return snap.docs.map((d, idx) => {
        const data = d.data();
        return {
          id: d.id,
          pageNumber: data.pageNumber || data.order || idx + 1,
          imageUrl: data.imageUrl || data.downloadURL || '',
          imagePath: data.imagePath || data.storagePath || '',
          caption: data.caption || '',
          altText: data.altText || `పేజీ ${data.pageNumber || idx + 1}`,
          imageMetadata: data.imageMetadata || undefined,
        } as StoryImagePage;
      });
    } catch (err) {
      console.warn(`Error loading pages subcollection for story ${storyId}:`, err);
      return [];
    }
  }

  /**
   * Reorder pages in batch without re-uploading files or duplicating Storage objects
   */
  public async reorderStoryPages(
    storyId: string,
    orderedPageIds: string[],
    ownerId?: string
  ): Promise<void> {
    if (!storyId || orderedPageIds.length === 0) return;

    const batch = writeBatch(db);
    orderedPageIds.forEach((pageId, idx) => {
      const pageRef = doc(db, 'stories', storyId, 'pages', pageId);
      batch.update(pageRef, sanitizeFirestoreData({
        order: idx + 1,
        pageNumber: idx + 1,
        altText: `పేజీ ${idx + 1}`,
        updatedAt: serverTimestamp(),
      }));
    });

    await batch.commit();
  }

  /**
   * Delete single page document and cleanup storage object
   */
  public async deleteStoryPage(
    storyId: string,
    pageId: string,
    storagePath?: string
  ): Promise<void> {
    try {
      const pageRef = doc(db, 'stories', storyId, 'pages', pageId);
      await deleteDoc(pageRef);

      if (storagePath) {
        await storageService.deleteFileByPath(storagePath).catch(() => {});
      }
    } catch (err) {
      console.warn(`Error deleting page ${pageId} for story ${storyId}:`, err);
    }
  }

  /**
   * Save attached original document metadata into subcollection: stories/{storyId}/documents/{docId}
   */
  public async saveStoryDocument(
    storyId: string,
    docInfo: SourceDocumentInfo,
    ownerId?: string
  ): Promise<string> {
    const docId = `doc-${Date.now()}`;
    const docRef = doc(db, 'stories', storyId, 'documents', docId);

    await setDoc(docRef, sanitizeFirestoreData({
      id: docId,
      documentId: docId,
      storyId,
      fileName: docInfo.name,
      originalFileName: docInfo.name,
      storagePath: docInfo.storagePath || '',
      downloadURL: docInfo.storageUrl || '',
      storageUrl: docInfo.storageUrl || '',
      mimeType: docInfo.type || 'application/pdf',
      documentType: docInfo.type || 'application/pdf',
      fileSize: docInfo.size || 0,
      isScanned: !!docInfo.isScanned,
      pageCount: docInfo.pageCount || null,
      ownerId: ownerId || null,
      uploadedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }));

    return docId;
  }

  /**
   * Load attached original document info from subcollection
   */
  public async loadStoryDocument(storyId: string): Promise<SourceDocumentInfo | null> {
    try {
      const docsColl = collection(db, 'stories', storyId, 'documents');
      const snap = await getDocs(docsColl);
      if (snap.empty) return null;

      const d = snap.docs[0].data();
      return {
        name: d.fileName || d.originalFileName || 'కథా పత్రం',
        type: d.mimeType || d.documentType || 'pdf',
        size: d.fileSize || 0,
        storageUrl: d.downloadURL || d.storageUrl || '',
        storagePath: d.storagePath || '',
        isScanned: d.isScanned || false,
        pageCount: d.pageCount || undefined,
        uploadedAt: d.uploadedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    } catch (err) {
      console.warn(`Error loading document subcollection for story ${storyId}:`, err);
      return null;
    }
  }

  /**
   * Save story episode into subcollection: stories/{storyId}/episodes/{episodeId}
   */
  public async saveStoryEpisode(
    storyId: string,
    episode: Episode,
    ownerId?: string
  ): Promise<void> {
    const episodeId = episode.id || `ep-${String(episode.episodeNumber).padStart(3, '0')}`;
    const epRef = doc(db, 'stories', storyId, 'episodes', episodeId);

    await setDoc(epRef, sanitizeFirestoreData({
      id: episodeId,
      episodeId,
      storyId,
      episodeNumber: episode.episodeNumber,
      order: episode.episodeNumber,
      title: episode.title,
      teluguTitle: episode.teluguTitle || episode.title,
      content: Array.isArray(episode.content) ? episode.content : [episode.content || ''],
      authorId: episode.authorId || ownerId || '',
      authorName: episode.authorName || '',
      status: episode.status || 'published',
      visibility: episode.visibility || 'public',
      readingTimeMinutes: episode.readingTimeMinutes || 3,
      ownerId: ownerId || episode.authorId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }), { merge: true });
  }

  /**
   * Load episodes for story in numeric order
   */
  public async loadStoryEpisodes(storyId: string): Promise<Episode[]> {
    try {
      const epsColl = collection(db, 'stories', storyId, 'episodes');
      const q = query(epsColl, orderBy('episodeNumber', 'asc'));
      const snap = await getDocs(q);

      if (snap.empty) return [];

      return snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          novelId: storyId,
          episodeNumber: data.episodeNumber || data.order || 1,
          title: data.title || '',
          teluguTitle: data.teluguTitle || data.title || '',
          content: Array.isArray(data.content) ? data.content : [data.content || ''],
          authorId: data.authorId || data.ownerId || '',
          authorName: data.authorName || '',
          status: data.status || 'published',
          visibility: data.visibility || 'public',
          readingTimeMinutes: data.readingTimeMinutes || 3,
          publishedAt: data.publishedAt || '',
        } as Episode;
      });
    } catch (err) {
      console.warn(`Error loading episodes for story ${storyId}:`, err);
      return [];
    }
  }
}

export const storySubcollectionService = new StorySubcollectionService();
