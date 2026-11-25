import {
  doc,
  getDoc,
  getDocs,
  runTransaction,
  collection,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { sanitizeFirestoreData } from '../utils/firestoreSanitizer';
import { Story } from '../types';

export class BookmarkService {
  private inflightBookmarks = new Map<string, Promise<boolean>>();

  /**
   * Check if a story is bookmarked by current user in `users/{uid}/bookmarks/{storyId}`
   */
  public async isBookmarked(storyId: string, uid?: string): Promise<boolean> {
    const currentUid = uid || auth.currentUser?.uid;
    if (!currentUid || !storyId) return false;

    try {
      const bookmarkRef = doc(db, 'users', currentUid, 'bookmarks', storyId);
      const snap = await getDoc(bookmarkRef);
      return snap.exists();
    } catch (err) {
      console.warn('Error checking bookmark:', err);
      return false;
    }
  }

  /**
   * Transactional, race-safe toggle bookmark in `users/{uid}/bookmarks/{storyId}`.
   * Prevents duplicate bookmarks, negative counters, and emits real-time UI sync events.
   */
  public async toggleBookmark(story: Story, uid?: string): Promise<boolean> {
    const currentUid = uid || auth.currentUser?.uid;
    if (!currentUid) {
      throw new Error('కథలను దాచుకోవడానికి (Bookmark) ముందుగా లాగిన్ చేయండి.');
    }

    const lockKey = `${currentUid}:${story.id}`;
    const existing = this.inflightBookmarks.get(lockKey);
    if (existing) return existing;

    const task = (async () => {
      const bookmarkRef = doc(db, 'users', currentUid, 'bookmarks', story.id);
      const userRef = doc(db, 'users', currentUid);
      const storyRef = doc(db, 'stories', story.id);

      const txResult = await runTransaction(db, async (tx) => {
        const [bmSnap, userSnap, storySnap] = await Promise.all([
          tx.get(bookmarkRef),
          tx.get(userRef),
          tx.get(storyRef),
        ]);

        const alreadyBookmarked = bmSnap.exists();
        const delta = alreadyBookmarked ? -1 : 1;
        const nextIsBookmarked = !alreadyBookmarked;

        if (alreadyBookmarked) {
          tx.delete(bookmarkRef);
        } else {
          tx.set(bookmarkRef, sanitizeFirestoreData({
            storyId: story.id,
            title: story.title,
            teluguTitle: story.teluguTitle || story.title,
            coverImage: story.coverImage || '',
            category: story.category || 'జీవితం',
            savedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          }));
        }

        if (userSnap.exists()) {
          const ud = userSnap.data();
          const curUserBm = Math.max(
            0,
            typeof ud.bookmarksCount === 'number' ? ud.bookmarksCount : 0,
            typeof ud.savedStoriesCount === 'number' ? ud.savedStoriesCount : 0
          );
          const nextUserBm = Math.max(0, curUserBm + delta);
          tx.update(userRef, sanitizeFirestoreData({
            bookmarksCount: nextUserBm,
            savedStoriesCount: nextUserBm,
            updatedAt: serverTimestamp(),
          }));
        }

        let nextStoryBmCount = Math.max(0, (story.bookmarkCount || 0) + delta);
        if (storySnap.exists()) {
          const sd = storySnap.data();
          const curStoryBm = Math.max(
            0,
            typeof sd.bookmarksCount === 'number' ? sd.bookmarksCount : 0,
            typeof sd.bookmarkCount === 'number' ? sd.bookmarkCount : 0
          );
          nextStoryBmCount = Math.max(0, curStoryBm + delta);
          tx.update(storyRef, sanitizeFirestoreData({
            bookmarksCount: nextStoryBmCount,
            bookmarkCount: nextStoryBmCount,
            updatedAt: serverTimestamp(),
          }));
        }

        return { isBookmarked: nextIsBookmarked, bookmarkCount: nextStoryBmCount };
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kathavahini:story-bookmarked', {
          detail: {
            storyId: story.id,
            isBookmarked: txResult.isBookmarked,
            bookmarkCount: txResult.bookmarkCount,
          },
        }));
      }

      return txResult.isBookmarked;
    })();

    this.inflightBookmarks.set(lockKey, task);
    try {
      return await task;
    } finally {
      this.inflightBookmarks.delete(lockKey);
    }
  }

  /**
   * Get all bookmarked stories for a user (falls back to unordered read so legacy bookmarks without savedAt are preserved)
   */
  public async getUserBookmarks(uid?: string): Promise<{ storyId: string; savedAt: any }[]> {
    const currentUid = uid || auth.currentUser?.uid;
    if (!currentUid) return [];

    try {
      const snap = await getDocs(collection(db, 'users', currentUid, 'bookmarks'));
      const items = snap.docs.map(d => {
        const data = d.data();
        return {
          storyId: (typeof data.storyId === 'string' && data.storyId.trim()) ? data.storyId.trim() : d.id,
          savedAt: data.savedAt || data.createdAt || null,
        };
      });
      // Sort newest-first in memory without excluding legacy documents missing savedAt
      items.sort((a, b) => {
        const aMs = a.savedAt?.toMillis ? a.savedAt.toMillis() : (a.savedAt ? new Date(a.savedAt).getTime() : 0);
        const bMs = b.savedAt?.toMillis ? b.savedAt.toMillis() : (b.savedAt ? new Date(b.savedAt).getTime() : 0);
        return bMs - aMs;
      });
      return items;
    } catch (err) {
      try {
        const q = query(
          collection(db, 'users', currentUid, 'bookmarks'),
          orderBy('savedAt', 'desc')
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({
          storyId: d.id,
          savedAt: d.data().savedAt,
        }));
      } catch (e) {
        console.warn('Error fetching bookmarks:', err, e);
        return [];
      }
    }
  }
}

export const bookmarkService = new BookmarkService();

