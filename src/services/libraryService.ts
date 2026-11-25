import {
  doc,
  getDocs,
  setDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { sanitizeFirestoreData } from '../utils/firestoreSanitizer';
import { Story, Novel, ReadingHistoryItem } from '../types';
import { storyService } from './storyService';
import { bookmarkService } from './bookmarkService';
import { deletionTracker } from './deletionTracker';

class LibraryService {
  /**
   * Fetch the signed-in user's real saved/bookmarked stories.
   * Never returns fabricated mock bookmarks when logged out or when the user has 0 bookmarks.
   */
  public async getSavedStories(uid?: string): Promise<Story[]> {
    const currentUid = uid || auth.currentUser?.uid;
    if (!currentUid) {
      return [];
    }

    try {
      const bookmarks = await bookmarkService.getUserBookmarks(currentUid);
      if (bookmarks.length === 0) {
        return [];
      }

      const allStories = await storyService.getAllPublishedStories();
      const catalogMap = new Map<string, Story>();
      allStories.forEach(s => catalogMap.set(s.id, s));

      const missingIds: string[] = [];
      bookmarks.forEach(bm => {
        if (!deletionTracker.isDeleted(bm.storyId) && !catalogMap.has(bm.storyId)) {
          missingIds.push(bm.storyId);
        }
      });

      if (missingIds.length > 0) {
        const fetchedMissing = await Promise.all(
          missingIds.slice(0, 30).map(id => storyService.getStoryById(id).catch(() => undefined))
        );
        fetchedMissing.forEach(story => {
          if (story && !deletionTracker.isDeleted(story.id)) {
            catalogMap.set(story.id, story);
          }
        });
      }

      const savedMap = new Map<string, Story>();
      bookmarks.forEach(bm => {
        if (!deletionTracker.isDeleted(bm.storyId)) {
          const story = catalogMap.get(bm.storyId);
          if (story && !deletionTracker.isDeleted(story.id)) {
            savedMap.set(story.id, { ...story, isBookmarked: true });
          }
        }
      });

      return Array.from(savedMap.values());
    } catch (err) {
      console.warn('Error fetching saved stories:', err);
      return [];
    }
  }

  public async getSavedNovels(): Promise<Novel[]> {
    return [];
  }

  /**
   * Fetch the signed-in user's real reading history (never returns fake mock items).
   */
  public async getReadingHistory(uid?: string): Promise<ReadingHistoryItem[]> {
    const currentUid = uid || auth.currentUser?.uid;
    if (!currentUid) {
      return [];
    }

    try {
      const q = query(
        collection(db, 'users', currentUid, 'readingHistory'),
        orderBy('lastReadAt', 'desc'),
        limit(20)
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        return [];
      }

      const allStories = await storyService.getAllPublishedStories();
      const catalogMap = new Map<string, Story>();
      allStories.forEach(s => catalogMap.set(s.id, s));

      const validDocs = snap.docs.filter(d => {
        const sid = d.data().storyId || d.id;
        return Boolean(sid) && !deletionTracker.isDeleted(sid);
      });

      const missingIds = validDocs
        .map(d => d.data().storyId || d.id)
        .filter(sid => !catalogMap.has(sid));

      if (missingIds.length > 0) {
        const fetched = await Promise.all(
          missingIds.slice(0, 15).map(id => storyService.getStoryById(id).catch(() => undefined))
        );
        fetched.forEach(story => {
          if (story && !deletionTracker.isDeleted(story.id)) {
            catalogMap.set(story.id, story);
          }
        });
      }

      const items: ReadingHistoryItem[] = [];
      for (const d of validDocs) {
        const data = d.data();
        const sid = data.storyId || d.id;
        const story = catalogMap.get(sid);
        if (!story) continue;
        items.push({
          storyId: sid,
          story,
          progressPercent: typeof data.progressPercent === 'number' ? data.progressPercent : 0,
          lastReadAt: data.lastReadAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        });
      }

      return items;
    } catch (err) {
      console.warn('Error fetching reading history:', err);
      return [];
    }
  }

  public async updateProgress(storyId: string, progressPercent: number): Promise<void> {
    const user = auth.currentUser;
    if (!user || !storyId) return;

    try {
      await setDoc(doc(db, 'users', user.uid, 'readingHistory', storyId), sanitizeFirestoreData({
        storyId,
        progressPercent: Math.max(0, Math.min(100, Math.round(progressPercent))),
        lastReadAt: serverTimestamp(),
      }), { merge: true });
    } catch (e) {}
  }

  public async toggleSave(story: Story): Promise<boolean> {
    return await bookmarkService.toggleBookmark(story);
  }
}

export const libraryService = new LibraryService();

