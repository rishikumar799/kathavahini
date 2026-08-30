import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
  serverTimestamp,
  updateDoc,
  increment,
  query,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Story } from '../types';

export class BookmarkService {
  /**
   * Check if a story is bookmarked by current user in `users/{uid}/bookmarks/{storyId}`
   */
  public async isBookmarked(storyId: string, uid?: string): Promise<boolean> {
    const currentUid = uid || auth.currentUser?.uid;
    if (!currentUid) return false;

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
   * Toggle bookmark in `users/{uid}/bookmarks/{storyId}`
   */
  public async toggleBookmark(story: Story, uid?: string): Promise<boolean> {
    const currentUid = uid || auth.currentUser?.uid;
    if (!currentUid) {
      throw new Error('కథలను దాచుకోవడానికి (Bookmark) ముందుగా లాగిన్ చేయండి.');
    }

    const bookmarkRef = doc(db, 'users', currentUid, 'bookmarks', story.id);
    const snap = await getDoc(bookmarkRef);

    if (snap.exists()) {
      // Remove bookmark
      await deleteDoc(bookmarkRef);
      
      // Decrement bookmark counter on user document safely
      try {
        await updateDoc(doc(db, 'users', currentUid), {
          bookmarksCount: increment(-1),
          savedStoriesCount: increment(-1),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Silent user bookmark count decrement:', err);
      }

      // Decrement bookmark counter on story document
      try {
        await updateDoc(doc(db, 'stories', story.id), {
          bookmarksCount: increment(-1),
          bookmarkCount: increment(-1),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Silent story bookmark count decrement:', err);
      }

      return false;
    } else {
      // Add bookmark
      await setDoc(bookmarkRef, {
        storyId: story.id,
        title: story.title,
        teluguTitle: story.teluguTitle || story.title,
        coverImage: story.coverImage || '',
        category: story.category || 'జీవితం',
        savedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      // Increment user bookmark counter
      try {
        await updateDoc(doc(db, 'users', currentUid), {
          bookmarksCount: increment(1),
          savedStoriesCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Silent user bookmark count increment:', err);
      }

      // Increment story bookmark counter
      try {
        await updateDoc(doc(db, 'stories', story.id), {
          bookmarksCount: increment(1),
          bookmarkCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Silent story bookmark count increment:', err);
      }

      return true;
    }
  }

  /**
   * Get all bookmarked stories for a user
   */
  public async getUserBookmarks(uid?: string): Promise<{ storyId: string; savedAt: any }[]> {
    const currentUid = uid || auth.currentUser?.uid;
    if (!currentUid) return [];

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
    } catch (err) {
      console.warn('Error fetching bookmarks:', err);
      return [];
    }
  }
}

export const bookmarkService = new BookmarkService();
