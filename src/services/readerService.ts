import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  collection,
  serverTimestamp,
  query,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ReaderProfile, User } from '../types';

export class ReaderService {
  /**
   * Fetch reader profile from top-level `readers/{uid}`
   */
  public async getReaderProfile(uid: string): Promise<ReaderProfile | null> {
    try {
      const snap = await getDoc(doc(db, 'readers', uid));
      if (!snap.exists()) return null;

      const d = snap.data();
      return {
        uid: d.uid || snap.id,
        displayName: d.displayName || '',
        email: d.email || '',
        photoURL: d.photoURL,
        bookmarksCount: d.bookmarksCount || 0,
        followingCount: d.followingCount || 0,
        commentsCount: d.commentsCount || 0,
        createdAt: d.createdAt instanceof Timestamp ? d.createdAt.toDate().toISOString() : d.createdAt,
        updatedAt: d.updatedAt instanceof Timestamp ? d.updatedAt.toDate().toISOString() : d.updatedAt,
      };
    } catch (err) {
      console.warn(`Error fetching reader profile ${uid}:`, err);
      return null;
    }
  }

  /**
   * Sync / upsert reader profile in top-level `readers/{uid}`
   */
  public async syncReaderProfile(user: User): Promise<void> {
    try {
      await setDoc(doc(db, 'readers', user.id), {
        uid: user.id,
        userId: user.id,
        displayName: user.displayName || user.name,
        email: user.email,
        photoURL: user.photoURL || user.avatar,
        role: 'reader',
        status: user.status || 'active',
        bookmarksCount: user.savedStoriesCount || 0,
        followingCount: user.followingCount || 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.warn('Error syncing reader document:', err);
    }
  }

  /**
   * Get all readers (for Super Admin dashboard)
   */
  public async getAllReaders(maxLimit: number = 50): Promise<ReaderProfile[]> {
    try {
      const q = query(collection(db, 'readers'), limit(maxLimit));
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const data = d.data();
        return {
          uid: d.id,
          displayName: data.displayName || data.name || '',
          email: data.email || '',
          photoURL: data.photoURL,
          bookmarksCount: data.bookmarksCount || 0,
          followingCount: data.followingCount || 0,
          commentsCount: data.commentsCount || 0,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        };
      });
    } catch (err) {
      console.warn('Error fetching all readers:', err);
      return [];
    }
  }
}

export const readerService = new ReaderService();
