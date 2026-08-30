import {
  doc,
  getDocs,
  setDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Story, Novel, ReadingHistoryItem } from '../types';
import { MOCK_STORIES, MOCK_NOVELS, MOCK_READING_HISTORY } from './mockData';
import { storyService } from './storyService';
import { bookmarkService } from './bookmarkService';

class LibraryService {
  private inMemoryHistory: ReadingHistoryItem[] = [...MOCK_READING_HISTORY];

  public async getSavedStories(): Promise<Story[]> {
    const user = auth.currentUser;
    if (!user) {
      return [MOCK_STORIES[0], MOCK_STORIES[1]];
    }

    try {
      const bookmarks = await bookmarkService.getUserBookmarks(user.uid);
      if (bookmarks.length > 0) {
        const allStories = await storyService.getAllPublishedStories();
        const savedMap = new Map<string, Story>();
        bookmarks.forEach(bm => {
          const story = allStories.find(s => s.id === bm.storyId);
          if (story) {
            savedMap.set(story.id, { ...story, isBookmarked: true });
          }
        });
        return Array.from(savedMap.values());
      }
    } catch (err) {
      console.warn('Error fetching saved stories:', err);
    }

    return [MOCK_STORIES[0], MOCK_STORIES[1]];
  }

  public async getSavedNovels(): Promise<Novel[]> {
    return [MOCK_NOVELS[0]];
  }

  public async getReadingHistory(): Promise<ReadingHistoryItem[]> {
    const user = auth.currentUser;
    if (!user) {
      return this.inMemoryHistory;
    }

    try {
      const q = query(
        collection(db, 'users', user.uid, 'readingHistory'),
        orderBy('lastReadAt', 'desc'),
        limit(20)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const allStories = await storyService.getAllPublishedStories();
        return snap.docs.map(d => {
          const data = d.data();
          const story = allStories.find(s => s.id === data.storyId) || MOCK_STORIES[0];
          return {
            storyId: data.storyId,
            story,
            progressPercent: data.progressPercent || 0,
            lastReadAt: data.lastReadAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          };
        });
      }
    } catch (err) {
      console.warn('Error fetching reading history:', err);
    }

    return this.inMemoryHistory;
  }

  public async updateProgress(storyId: string, progressPercent: number): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'readingHistory', storyId), {
          storyId,
          progressPercent,
          lastReadAt: serverTimestamp(),
        }, { merge: true });
      } catch (e) {}
    }

    const existing = this.inMemoryHistory.find(item => item.storyId === storyId);
    if (existing) {
      existing.progressPercent = progressPercent;
      existing.lastReadAt = new Date().toISOString();
    } else {
      const story = MOCK_STORIES.find(s => s.id === storyId);
      if (story) {
        this.inMemoryHistory.unshift({
          storyId,
          story,
          progressPercent,
          lastReadAt: new Date().toISOString(),
        });
      }
    }
  }

  public async toggleSave(story: Story): Promise<boolean> {
    return await bookmarkService.toggleBookmark(story);
  }
}

export const libraryService = new LibraryService();
