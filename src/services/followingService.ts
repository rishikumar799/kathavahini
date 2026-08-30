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

export class FollowingService {
  /**
   * Check if the current user is following an author
   * Path: users/{uid}/following/{authorId}
   */
  public async isFollowing(authorId: string, uid?: string): Promise<boolean> {
    const currentUid = uid || auth.currentUser?.uid;
    if (!currentUid) return false;

    try {
      const followRef = doc(db, 'users', currentUid, 'following', authorId);
      const snap = await getDoc(followRef);
      return snap.exists();
    } catch (err) {
      console.warn('Error checking following status:', err);
      return false;
    }
  }

  /**
   * Toggle follow author
   */
  public async toggleFollow(authorId: string, authorName?: string, uid?: string): Promise<boolean> {
    const currentUid = uid || auth.currentUser?.uid;
    if (!currentUid) {
      throw new Error('రచయితలను అనుసరించడానికి (Follow) ముందుగా లాగిన్ చేయండి.');
    }

    const followRef = doc(db, 'users', currentUid, 'following', authorId);
    const snap = await getDoc(followRef);

    if (snap.exists()) {
      // Unfollow
      await deleteDoc(followRef);

      // Decrement user's followingCount
      try {
        await updateDoc(doc(db, 'users', currentUid), {
          followingCount: increment(-1),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Silent user following decrement:', err);
      }

      // Decrement author's followersCount
      try {
        await updateDoc(doc(db, 'authors', authorId), {
          followersCount: increment(-1),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Silent author followers decrement:', err);
      }

      return false;
    } else {
      // Follow
      await setDoc(followRef, {
        authorId,
        authorName: authorName || '',
        followedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      // Increment user's followingCount
      try {
        await updateDoc(doc(db, 'users', currentUid), {
          followingCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Silent user following increment:', err);
      }

      // Increment author's followersCount
      try {
        await updateDoc(doc(db, 'authors', authorId), {
          followersCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Silent author followers increment:', err);
      }

      return true;
    }
  }

  /**
   * Get all followed authors for a user
   */
  public async getUserFollowing(uid?: string): Promise<string[]> {
    const currentUid = uid || auth.currentUser?.uid;
    if (!currentUid) return [];

    try {
      const q = query(
        collection(db, 'users', currentUid, 'following'),
        orderBy('followedAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => d.id);
    } catch (err) {
      console.warn('Error fetching following list:', err);
      return [];
    }
  }
}

export const followingService = new FollowingService();
