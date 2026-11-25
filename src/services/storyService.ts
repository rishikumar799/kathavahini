import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  runTransaction,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { sanitizeFirestoreData } from '../utils/firestoreSanitizer';
import { loadStoryContentChunks } from '../utils/storyChunker';
import { storySubcollectionService } from './storySubcollectionService';
import { Story, StoryCategory } from '../types';
import { MOCK_STORIES } from './mockData';
import { bookmarkService } from './bookmarkService';
import { deletionTracker } from './deletionTracker';
import { resolveContentAuthor } from '../utils/authorResolver';

const GUEST_LIKES_STORAGE_KEY = 'kathavahini_guest_liked_story_ids';
const VIEW_DEDUP_STORAGE_KEY = 'kathavahini_view_timestamps_v1';
const VIEW_DEDUP_WINDOW_MS = 30 * 60 * 1000; // 30-minute genuine view deduplication window

function readViewTimestamps(): Record<string, number> {
  try {
    const raw = localStorage.getItem(VIEW_DEDUP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeViewTimestamp(key: string, ts: number): void {
  try {
    const map = readViewTimestamps();
    const cutoff = ts - 24 * 60 * 60 * 1000;
    for (const k of Object.keys(map)) {
      if (map[k] < cutoff) delete map[k];
    }
    map[key] = ts;
    localStorage.setItem(VIEW_DEDUP_STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

function parseTrueRating(data: any): { rating: number; ratingsCount: number } {
  const count =
    typeof data.ratingsCount === 'number'
      ? Math.max(0, data.ratingsCount)
      : typeof data.ratingCount === 'number'
      ? Math.max(0, data.ratingCount)
      : 0;
  const avg =
    count > 0 && typeof data.rating === 'number' && data.rating > 0 && data.rating <= 5
      ? Number(data.rating.toFixed(1))
      : 0;
  return { rating: avg, ratingsCount: count };
}

function readMetricCount(primary: unknown, secondary: unknown): number {
  const a = typeof primary === 'number' && Number.isFinite(primary) ? primary : 0;
  const b = typeof secondary === 'number' && Number.isFinite(secondary) ? secondary : 0;
  return Math.max(0, a, b);
}

function getGuestLikedIds(): string[] {
  try {
    const s = localStorage.getItem(GUEST_LIKES_STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function setGuestLikedIds(ids: string[]): void {
  try {
    localStorage.setItem(GUEST_LIKES_STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

class StoryService {
  private publishedCache: { data: Story[]; timestamp: number; uid: string | undefined } | null = null;
  private inflightPublishedPromise: Promise<Story[]> | null = null;
  private inflightViews = new Set<string>();
  private inflightLikes = new Map<string, Promise<{ isLiked: boolean; newCount: number }>>();
  private userLikedIdsCache: { uid: string; ids: Set<string>; ts: number } | null = null;
  private readonly CACHE_TTL_MS = 15000;

  public invalidateCache(): void {
    this.publishedCache = null;
  }

  public invalidateUserEngagementCache(): void {
    this.userLikedIdsCache = null;
    this.publishedCache = null;
  }

  private async getUserLikedStoryIds(uid: string): Promise<Set<string>> {
    if (
      this.userLikedIdsCache &&
      this.userLikedIdsCache.uid === uid &&
      Date.now() - this.userLikedIdsCache.ts < 30000
    ) {
      return new Set(this.userLikedIdsCache.ids);
    }
    const ids = new Set<string>();
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'likedStories'));
      snap.docs.forEach(d => ids.add(d.id));
    } catch {}
    this.userLikedIdsCache = { uid, ids, ts: Date.now() };
    return new Set(ids);
  }

  private updatePublishedCacheItem(storyId: string, updater: (s: Story) => Story): void {
    if (!this.publishedCache) return;
    this.publishedCache = {
      ...this.publishedCache,
      data: this.publishedCache.data.map(s => (s.id === storyId ? updater(s) : s)),
    };
  }

  /**
   * Map a Firestore QuerySnapshot directly to Story[] with 2 batched user queries total (zero N+1 waterfalls)
   */
  private async mapSnapshotToStories(snap: any): Promise<Story[]> {
    const currentUid = auth.currentUser?.uid;
    const guestLikes = getGuestLikedIds();

    if (snap.empty) {
      return MOCK_STORIES
        .filter(s => !deletionTracker.isDeleted(s.id))
        .map(s => ({
          ...s,
          isLiked: guestLikes.includes(s.id)
        }));
    }

    // Filter visible, published docs first
    const validDocs = snap.docs.filter((d: any) => {
      if (deletionTracker.isDeleted(d.id)) return false;
      const data = d.data();
      if (data.deleted === true || data.status === 'deleted') return false;
      const status = data.status || 'published';
      const visibility = data.visibility || 'public';
      if (status !== 'published' && status !== 'approved') return false;
      if (visibility === 'hidden' || visibility === 'private') return false;
      return true;
    });

    // Fetch user bookmarks and likedStories in TWO single collection queries instead of 60+ N+1 getDoc calls
    const bookmarkedIds = new Set<string>();
    let likedIds = new Set<string>();

    if (currentUid && validDocs.length > 0) {
      try {
        const [bmSnap, fetchedLikes] = await Promise.all([
          getDocs(collection(db, 'users', currentUid, 'bookmarks')).catch(() => null),
          this.getUserLikedStoryIds(currentUid),
        ]);
        if (bmSnap) {
          bmSnap.docs.forEach((b: any) => bookmarkedIds.add(b.id));
        }
        likedIds = fetchedLikes;
      } catch (e) {}
    }

    const stories: Story[] = validDocs.map((d: any) => {
      const data = d.data();
      const storyId = d.id;
      const status = data.status || 'published';
      const visibility = data.visibility || 'public';
      const isBookmarked = currentUid ? bookmarkedIds.has(storyId) : false;
      const isLiked = currentUid ? likedIds.has(storyId) : guestLikes.includes(storyId);
      const { rating, ratingsCount } = parseTrueRating(data);

      return {
        id: storyId,
        title: data.title || '',
        teluguTitle: data.teluguTitle || data.title || '',
        slug: data.slug || 'story',
        coverImage: data.coverImage || data.coverImageUrl || data.coverImageURL || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
        excerpt: data.excerpt || '',
        teluguExcerpt: data.teluguExcerpt || data.excerpt || '',
        content: Array.isArray(data.content) ? data.content : [data.content || ''],
        contentType: data.contentType || 'rich_text',
        contentBlocks: data.contentBlocks,
        imagePages: data.imagePages,
        sourceDocument: data.sourceDocument || (data.documentURL || data.documentUrl ? {
          name: data.documentFileName || data.fileName || 'Story Document',
          type: data.documentContentType || data.mimeType || 'pdf',
          size: data.documentSize || data.fileSize || 0,
          storageUrl: data.documentURL || data.documentUrl,
          storagePath: data.documentStoragePath || data.storagePath,
          isScanned: false,
          uploadedAt: data.uploadedAt || data.documentUploadedAt || new Date().toISOString(),
        } : undefined),
        authorId: data.authorId || '',
        authorName: data.authorName || data.authorPenName,
        author: resolveContentAuthor({ id: storyId, ...data }),
        category: data.category || data.categoryName || 'జీవితం',
        tags: data.tags || [],
        rating,
        ratingsCount,
        viewCount: readMetricCount(data.viewsCount, data.viewCount),
        likeCount: readMetricCount(data.likesCount, data.likeCount),
        bookmarkCount: readMetricCount(data.bookmarksCount, data.bookmarkCount),
        readingTimeMinutes: data.readingTimeMinutes || 3,
        publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate().toISOString().split('T')[0] : (data.publishedAt || new Date().toISOString().split('T')[0]),
        status: status,
        visibility: visibility,
        isLiked,
        isBookmarked,
        submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toDate().toISOString() : data.submittedAt,
        reviewedAt: data.reviewedAt instanceof Timestamp ? data.reviewedAt.toDate().toISOString() : data.reviewedAt,
      };
    });

    // Merge with initial catalog to ensure rich initial reading experience
    const map = new Map<string, Story>();
    MOCK_STORIES.filter(s => !deletionTracker.isDeleted(s.id)).forEach(s => {
      map.set(s.id, {
        ...s,
        isLiked: currentUid ? likedIds.has(s.id) : guestLikes.includes(s.id),
        isBookmarked: currentUid ? bookmarkedIds.has(s.id) : false,
      });
    });
    stories.forEach(s => map.set(s.id, s));
    return Array.from(map.values()).filter(s => !deletionTracker.isDeleted(s.id));
  }

  /**
   * Fetch all published & public stories from Firestore with deduplication & short cache
   */
  public async getAllPublishedStories(maxLimit: number = 60, forceRefresh: boolean = false): Promise<Story[]> {
    const currentUid = auth.currentUser?.uid;
    if (
      !forceRefresh &&
      this.publishedCache &&
      this.publishedCache.uid === currentUid &&
      Date.now() - this.publishedCache.timestamp < this.CACHE_TTL_MS
    ) {
      return this.publishedCache.data;
    }

    if (!forceRefresh && this.inflightPublishedPromise) {
      return this.inflightPublishedPromise;
    }

    const fetchPromise = (async () => {
      try {
        await deletionTracker.init();
        const q = query(
          collection(db, 'stories'),
          where('status', 'in', ['published', 'approved']),
          limit(maxLimit)
        );
        const snap = await getDocs(q);
        const result = await this.mapSnapshotToStories(snap);
        this.publishedCache = { data: result, timestamp: Date.now(), uid: currentUid };
        return result;
      } catch (err) {
        console.warn('Could not query published stories from Firestore, using baseline catalog:', err);
        const guestLikes = getGuestLikedIds();
        return MOCK_STORIES
          .filter(s => !deletionTracker.isDeleted(s.id))
          .map(s => ({
            ...s,
            isLiked: guestLikes.includes(s.id)
          }));
      } finally {
        this.inflightPublishedPromise = null;
      }
    })();

    this.inflightPublishedPromise = fetchPromise;
    return fetchPromise;
  }

  /**
   * Real-time subscription to published stories from Firestore.
   * Uses the onSnapshot QuerySnapshot directly so initial load + live updates perform 1 query instead of 6.
   */
  public subscribePublishedStories(callback: (stories: Story[]) => void): () => void {
    try {
      const q = query(
        collection(db, 'stories'),
        where('status', 'in', ['published', 'approved']),
        limit(60)
      );

      let isCancelled = false;

      const unsubscribeSnapshot = onSnapshot(q, async (snapshot) => {
        try {
          await deletionTracker.init();
          const stories = await this.mapSnapshotToStories(snapshot);
          if (!isCancelled) {
            this.publishedCache = { data: stories, timestamp: Date.now(), uid: auth.currentUser?.uid };
            callback(stories);
          }
        } catch (e) {}
      }, (err) => {
        console.warn('Real-time story subscriber note:', err);
        this.getAllPublishedStories().then(s => { if (!isCancelled) callback(s); }).catch(() => {});
      });

      const handleForceRefresh = () => {
        this.invalidateCache();
        this.getAllPublishedStories(60, true).then(s => { if (!isCancelled) callback(s); }).catch(() => {});
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('kathavahini:story-deleted', handleForceRefresh);
        window.addEventListener('kathavahini:refresh-content', handleForceRefresh);
      }

      return () => {
        isCancelled = true;
        unsubscribeSnapshot();
        if (typeof window !== 'undefined') {
          window.removeEventListener('kathavahini:story-deleted', handleForceRefresh);
          window.removeEventListener('kathavahini:refresh-content', handleForceRefresh);
        }
      };
    } catch (e) {
      console.warn('Could not establish real-time stories snapshot:', e);
      this.getAllPublishedStories().then(callback).catch(() => {});
      return () => {};
    }
  }

  public async getTrendingStories(): Promise<Story[]> {
    const stories = await this.getAllPublishedStories();
    return [...stories].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  }

  public async getPopularStoriesThisWeek(): Promise<Story[]> {
    const stories = await this.getAllPublishedStories();
    return [...stories].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
  }

  public async getNewReleases(): Promise<Story[]> {
    const stories = await this.getAllPublishedStories();
    return [...stories].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  public async getStoriesByCategory(category: StoryCategory): Promise<Story[]> {
    const stories = await this.getAllPublishedStories();
    return stories.filter(s => s.category === category);
  }

  /**
   * Record genuine story view with 30-minute per-viewer deduplication window and atomic Firestore increment.
   * Prevents React StrictMode double-fire, rapid refreshes, cross-tab spam, and ghost document creation.
   */
  public async recordStoryView(storyId: string): Promise<number> {
    if (!storyId || deletionTracker.isDeleted(storyId)) return 0;

    const viewerKey = `${auth.currentUser?.uid || 'guest'}_${storyId}`;
    if (this.inflightViews.has(viewerKey)) {
      const cached = this.publishedCache?.data.find(s => s.id === storyId);
      return cached?.viewCount || 0;
    }

    const now = Date.now();
    const viewTimestamps = readViewTimestamps();
    const lastViewedAt = viewTimestamps[viewerKey] || 0;
    const sessionKey = `kathavahini_viewed_${viewerKey}`;
    const viewedInSession = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(sessionKey) === '1';

    if (viewedInSession || (lastViewedAt > 0 && now - lastViewedAt < VIEW_DEDUP_WINDOW_MS)) {
      const cached = this.publishedCache?.data.find(s => s.id === storyId);
      return cached?.viewCount || 0;
    }

    this.inflightViews.add(viewerKey);
    try {
      const storyRef = doc(db, 'stories', storyId);
      const snap = await getDoc(storyRef);

      let targetRef = storyRef;
      let baseViews = 0;

      if (snap.exists()) {
        const d = snap.data();
        if (d.deleted === true || d.status === 'deleted') return 0;
        baseViews = readMetricCount(d.viewsCount, d.viewCount);
      } else {
        const epRef = doc(db, 'episodes', storyId);
        const epSnap = await getDoc(epRef);
        if (!epSnap.exists()) {
          return 0;
        }
        const ed = epSnap.data();
        if (ed.deleted === true || ed.status === 'deleted') return 0;
        targetRef = epRef;
        baseViews = readMetricCount(ed.viewsCount, ed.viewCount);
      }

      // Mark dedup window right before committing atomic increment
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(sessionKey, '1');
      }
      writeViewTimestamp(viewerKey, now);

      await updateDoc(targetRef, sanitizeFirestoreData({
        viewCount: increment(1),
        viewsCount: increment(1),
        updatedAt: serverTimestamp(),
      }));

      const updatedCount = baseViews + 1;
      this.updatePublishedCacheItem(storyId, s => ({
        ...s,
        viewCount: Math.max(s.viewCount || 0, updatedCount),
      }));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kathavahini:story-viewed', {
          detail: { storyId, viewCount: updatedCount }
        }));
      }

      return updatedCount;
    } catch (err) {
      console.warn('Error recording view count in Firestore:', err);
      return 0;
    } finally {
      this.inflightViews.delete(viewerKey);
    }
  }

  public async getStoryById(id: string): Promise<Story | undefined> {
    if (deletionTracker.isDeleted(id)) {
      return undefined;
    }
    const guestLikes = getGuestLikedIds();

    try {
      const snap = await getDoc(doc(db, 'stories', id));
      if (snap.exists()) {
        const data = snap.data();
        if (data.deleted === true || data.status === 'deleted') {
          return undefined;
        }
        const currentUid = auth.currentUser?.uid;

        let isBookmarked = false;
        if (currentUid) {
          try {
            const bmSnap = await getDoc(doc(db, 'users', currentUid, 'bookmarks', id));
            isBookmarked = bmSnap.exists();
          } catch (e) {}
        }

        let isLiked = false;
        if (currentUid) {
          try {
            const likeSnap = await getDoc(doc(db, 'stories', id, 'likes', currentUid));
            isLiked = likeSnap.exists();
          } catch (e) {}
        } else {
          isLiked = guestLikes.includes(id);
        }

        // Seamless chunk loading: try subcollection contentChunks first, fallback to main doc content
        let resolvedContent: string[] = [];
        const chunkedParas = await loadStoryContentChunks(id);
        if (chunkedParas && chunkedParas.length > 0) {
          resolvedContent = chunkedParas;
        } else if (Array.isArray(data.content) && data.content.length > 0) {
          resolvedContent = data.content;
        } else if (typeof data.content === 'string' && data.content.trim()) {
          resolvedContent = [data.content];
        }

        // Hydrate image pages from subcollection if needed for scalable image stories
        let resolvedImagePages = data.imagePages || [];
        if (data.contentType === 'image_pages' || !resolvedImagePages || resolvedImagePages.length === 0) {
          const subPages = await storySubcollectionService.loadStoryPages(id);
          if (subPages && subPages.length > 0) {
            resolvedImagePages = subPages;
          }
        }

        // Hydrate source document from subcollection if needed
        let resolvedDoc = data.sourceDocument || (data.documentURL || data.documentUrl ? {
          name: data.documentFileName || data.fileName || 'Story Document',
          type: data.documentContentType || data.mimeType || 'pdf',
          size: data.documentSize || data.fileSize || 0,
          storageUrl: data.documentURL || data.documentUrl,
          storagePath: data.documentStoragePath || data.storagePath,
          isScanned: false,
          uploadedAt: data.uploadedAt || data.documentUploadedAt || new Date().toISOString(),
        } : undefined);

        if (!resolvedDoc) {
          const subDoc = await storySubcollectionService.loadStoryDocument(id);
          if (subDoc) resolvedDoc = subDoc;
        }

        const { rating, ratingsCount } = parseTrueRating(data);

        return {
          id: snap.id,
          title: data.title || '',
          teluguTitle: data.teluguTitle || data.title || '',
          slug: data.slug || 'story',
          subtitle: data.subtitle || data.teluguSubtitle,
          teluguSubtitle: data.teluguSubtitle || data.subtitle,
          coverImage: data.coverImage || data.coverImageUrl || data.coverImageURL || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
          excerpt: data.excerpt || '',
          teluguExcerpt: data.teluguExcerpt || data.excerpt || '',
          content: resolvedContent,
          contentType: data.contentType || 'rich_text',
          contentBlocks: data.contentBlocks,
          imagePages: resolvedImagePages,
          sourceDocument: resolvedDoc,
          authorId: data.authorId || '',
          ownerId: data.ownerId || data.authorId || data.writerId,
          authorName: data.authorName,
          author: resolveContentAuthor({ id: data.id || id, ...data }),
          category: data.category || data.categoryName || 'జీవితం',
          tags: data.tags || [],
          rating,
          ratingsCount,
          viewCount: readMetricCount(data.viewsCount, data.viewCount),
          likeCount: readMetricCount(data.likesCount, data.likeCount),
          bookmarkCount: readMetricCount(data.bookmarksCount, data.bookmarkCount),
          readingTimeMinutes: data.readingTimeMinutes || 3,
          publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate().toISOString().split('T')[0] : (data.publishedAt || ''),
          status: data.status || 'published',
          novelId: data.novelId || data.parentNovelId,
          parentNovelId: data.parentNovelId || data.novelId,
          novelTitle: data.novelTitle,
          episodeNumber: data.episodeNumber ? Number(data.episodeNumber) : undefined,
          isLiked,
          isBookmarked,
        };
      }
    } catch (err) {
      console.warn(`Error fetching story ${id} from Firestore:`, err);
    }

    // Fallback: Check if the ID belongs to `episodes` collection
    try {
      const epSnap = await getDoc(doc(db, 'episodes', id));
      if (epSnap.exists()) {
        const epData = epSnap.data();
        if (epData.deleted !== true && epData.status !== 'deleted') {
          const parentNovelId = epData.novelId;
          let novel: any = null;
          if (parentNovelId) {
            const nSnap = await getDoc(doc(db, 'novels', parentNovelId));
            if (nSnap.exists()) novel = nSnap.data();
          }
          const content = Array.isArray(epData.content) ? epData.content : [epData.content || ''];
          const epNum = Number(epData.episodeNumber) || 1;
          const novelTeluguTitle = epData.novelTitle || novel?.teluguTitle || 'నవల';
          const epTeluguTitle = epData.teluguTitle || `${epNum}వ భాగం`;
          return {
            id: epSnap.id,
            title: epData.title || `${novel?.title || 'Novel'} - Episode ${epNum}`,
            teluguTitle: `${novelTeluguTitle} - ${epTeluguTitle}`,
            slug: novel?.slug || 'novel',
            coverImage: epData.coverImage || novel?.coverImage || 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800',
            excerpt: novel?.teluguDescription || epTeluguTitle,
            teluguExcerpt: novel?.teluguDescription || epTeluguTitle,
            content,
            authorId: epData.authorId || novel?.authorId || '',
            authorName: epData.authorName || novel?.authorName,
            author: resolveContentAuthor({ id: epSnap.id, ...epData, ...(novel || {}) }),
            category: novel?.category || 'కుటుంబం',
            tags: novel?.tags || ['నవల', 'ఎపిసోడ్'],
            rating: novel?.rating || 0,
            viewCount: epData.viewsCount || epData.viewCount || 0,
            likeCount: epData.likesCount || epData.likeCount || 0,
            bookmarkCount: epData.bookmarksCount || epData.bookmarkCount || 0,
            readingTimeMinutes: epData.readingTimeMinutes || Math.max(1, Math.ceil(content.join(' ').length / 300)),
            publishedAt: epData.publishedAt instanceof Timestamp ? epData.publishedAt.toDate().toISOString().split('T')[0] : (epData.publishedAt || ''),
            status: 'published',
            novelId: parentNovelId,
            parentNovelId,
            novelTitle: novelTeluguTitle,
            episodeNumber: epNum,
            isLiked: guestLikes.includes(epSnap.id),
            isBookmarked: false,
          };
        }
      }
    } catch (err) {
      console.warn('Note checking episodes collection in getStoryById:', err);
    }

    const baseline = MOCK_STORIES.find(s => s.id === id && !deletionTracker.isDeleted(s.id));
    if (baseline) {
      return {
        ...baseline,
        isLiked: guestLikes.includes(baseline.id)
      };
    }
    return undefined;
  }

  /**
   * Transactional, race-safe Toggle Like for both authenticated and guest readers.
   * Prevents duplicate likes, rapid double-click corruption, and negative counts.
   */
  public async toggleLike(storyId: string): Promise<{ isLiked: boolean; newCount: number }> {
    const inflight = this.inflightLikes.get(storyId);
    if (inflight) return inflight;

    const task = (async () => {
      const user = auth.currentUser;
      const storyRef = doc(db, 'stories', storyId);

      let resultIsLiked = false;
      let resultCount = 0;

      if (user) {
        const likeRef = doc(db, 'stories', storyId, 'likes', user.uid);
        const userLikedRef = doc(db, 'users', user.uid, 'likedStories', storyId);

        const txResult = await runTransaction(db, async (tx) => {
          const [storySnap, likeSnap] = await Promise.all([
            tx.get(storyRef),
            tx.get(likeRef),
          ]);

          const currentCount = storySnap.exists()
            ? readMetricCount(storySnap.data().likesCount, storySnap.data().likeCount)
            : 0;

          if (likeSnap.exists()) {
            const nextCount = Math.max(0, currentCount - 1);
            tx.delete(likeRef);
            tx.delete(userLikedRef);
            if (storySnap.exists()) {
              tx.update(storyRef, sanitizeFirestoreData({
                likesCount: nextCount,
                likeCount: nextCount,
                updatedAt: serverTimestamp(),
              }));
            }
            return { isLiked: false, newCount: nextCount };
          } else {
            const nextCount = currentCount + 1;
            tx.set(likeRef, sanitizeFirestoreData({
              userId: user.uid,
              userName: user.displayName || 'పాఠకుడు',
              likedAt: serverTimestamp(),
            }));
            tx.set(userLikedRef, sanitizeFirestoreData({
              storyId,
              likedAt: serverTimestamp(),
            }));
            if (storySnap.exists()) {
              tx.update(storyRef, sanitizeFirestoreData({
                likesCount: nextCount,
                likeCount: nextCount,
                updatedAt: serverTimestamp(),
              }));
            }
            return { isLiked: true, newCount: nextCount };
          }
        });

        resultIsLiked = txResult.isLiked;
        resultCount = txResult.newCount;

        if (this.userLikedIdsCache && this.userLikedIdsCache.uid === user.uid) {
          if (resultIsLiked) this.userLikedIdsCache.ids.add(storyId);
          else this.userLikedIdsCache.ids.delete(storyId);
        }
      } else {
        const guestLikes = getGuestLikedIds();
        const currentlyLiked = guestLikes.includes(storyId);
        const delta = currentlyLiked ? -1 : 1;
        resultIsLiked = !currentlyLiked;

        const nextGuestLikes = currentlyLiked
          ? guestLikes.filter(id => id !== storyId)
          : [...guestLikes, storyId];
        setGuestLikedIds(nextGuestLikes);

        try {
          resultCount = await runTransaction(db, async (tx) => {
            const storySnap = await tx.get(storyRef);
            if (!storySnap.exists()) return Math.max(0, delta);
            const currentCount = readMetricCount(storySnap.data().likesCount, storySnap.data().likeCount);
            const nextCount = Math.max(0, currentCount + delta);
            tx.update(storyRef, sanitizeFirestoreData({
              likesCount: nextCount,
              likeCount: nextCount,
              updatedAt: serverTimestamp(),
            }));
            return nextCount;
          });
        } catch (err) {
          console.warn('Guest like transaction fallback:', err);
          const cached = this.publishedCache?.data.find(s => s.id === storyId);
          resultCount = Math.max(0, (cached?.likeCount || 0) + delta);
        }
      }

      this.updatePublishedCacheItem(storyId, s => ({
        ...s,
        isLiked: resultIsLiked,
        likeCount: resultCount,
      }));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kathavahini:story-liked', {
          detail: { storyId, isLiked: resultIsLiked, newCount: resultCount }
        }));
      }

      return { isLiked: resultIsLiked, newCount: resultCount };
    })();

    this.inflightLikes.set(storyId, task);
    try {
      return await task;
    } finally {
      this.inflightLikes.delete(storyId);
    }
  }

  /**
   * Toggle bookmark via BookmarkService
   */
  public async toggleBookmark(storyId: string): Promise<boolean> {
    const story = await this.getStoryById(storyId);
    if (!story) return false;
    return await bookmarkService.toggleBookmark(story);
  }

  public async searchStories(queryText: string, category?: string): Promise<Story[]> {
    const stories = await this.getAllPublishedStories();
    const q = queryText.toLowerCase().trim();
    return stories.filter(s => {
      const matchesCategory = !category || s.category === category;
      const matchesQuery = !q ||
        s.title.toLowerCase().includes(q) ||
        s.teluguTitle.includes(q) ||
        s.author.name.toLowerCase().includes(q) ||
        s.author.teluguName.includes(q) ||
        s.tags.some(t => t.includes(q));
      return matchesCategory && matchesQuery;
    });
  }

  /**
   * Universal Update Story (For Admin or Story Author)
   */
  public async updateStory(storyId: string, updateData: Partial<Story>, userId?: string): Promise<void> {
    const currentUid = userId || auth.currentUser?.uid || 'anonymous';
    const storyRef = doc(db, 'stories', storyId);
    const sanitizedUpdate: any = { ...updateData };

    delete sanitizedUpdate.id;
    if (sanitizedUpdate.sourceDocument) {
      if (sanitizedUpdate.sourceDocument.storageUrl) {
        sanitizedUpdate.documentURL = sanitizedUpdate.sourceDocument.storageUrl;
        sanitizedUpdate.documentUrl = sanitizedUpdate.sourceDocument.storageUrl;
      }
      if (sanitizedUpdate.sourceDocument.name) {
        sanitizedUpdate.documentFileName = sanitizedUpdate.sourceDocument.name;
      }
    }

    if (updateData.content && Array.isArray(updateData.content)) {
      const { saveStoryContentChunks } = await import('../utils/storyChunker');
      await saveStoryContentChunks(storyId, updateData.content);
      sanitizedUpdate.content = [];
      sanitizedUpdate.hasChunks = true;
    }

    if (updateData.imagePages && Array.isArray(updateData.imagePages) && updateData.imagePages.length > 0) {
      await storySubcollectionService.saveStoryPages(storyId, updateData.imagePages, currentUid);
    }
    if (updateData.sourceDocument) {
      await storySubcollectionService.saveStoryDocument(storyId, updateData.sourceDocument, currentUid);
    }

    await setDoc(storyRef, sanitizeFirestoreData({
      ...sanitizedUpdate,
      updatedBy: currentUid,
      updatedAt: serverTimestamp(),
    }), { merge: true });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kathavahini:story-updated', {
        detail: { storyId, updatedBy: currentUid }
      }));
    }
  }

  /**
   * Universal Delete Story (For Admin or Story Author)
   */
  public async deleteStory(storyId: string, userId?: string): Promise<void> {
    const currentUid = userId || auth.currentUser?.uid || 'anonymous';
    await deletionTracker.markDeleted(storyId, 'story', currentUid);

    const storyRef = doc(db, 'stories', storyId);
    try {
      const { deleteStoryContentChunks } = await import('../utils/storyChunker');
      await deleteStoryContentChunks(storyId);
    } catch {}

    try {
      await deleteDoc(storyRef);
    } catch (e) {
      console.warn('Error removing firestore doc on story delete:', e);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kathavahini:story-deleted', {
        detail: { storyId, deletedBy: currentUid }
      }));
    }
  }
}

export const storyService = new StoryService();

