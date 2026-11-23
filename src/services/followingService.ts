import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
  collectionGroup,
  serverTimestamp,
  updateDoc,
  increment,
  query,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { sanitizeFirestoreData } from '../utils/firestoreSanitizer';

export class FollowingService {
  private followerCountsCache: { data: Record<string, number>; ts: number } | null = null;
  private inflightFollowerCounts: Promise<Record<string, number>> | null = null;
  private readonly CACHE_TTL_MS = 10_000;

  public invalidateFollowerCountsCache(): void {
    this.followerCountsCache = null;
  }

  /**
   * Fetch accurate live follower counts for all authors via a single collectionGroup('following') query.
   * Ensures accurate counts even if counter fields on writers/{id} were blocked by older rules or never initialized.
   */
  public async getAllFollowerCounts(forceRefresh = false): Promise<Record<string, number>> {
    if (!forceRefresh && this.followerCountsCache && Date.now() - this.followerCountsCache.ts < this.CACHE_TTL_MS) {
      return this.followerCountsCache.data;
    }
    if (!forceRefresh && this.inflightFollowerCounts) {
      return this.inflightFollowerCounts;
    }

    const fetchPromise = (async () => {
      const counts: Record<string, number> = {};
      try {
        const cgSnap = await getDocs(collectionGroup(db, 'following'));
        cgSnap.docs.forEach(d => {
          const data = d.data();
          const targetId = (typeof data?.authorId === 'string' && data.authorId.trim()) ? data.authorId.trim() : d.id;
          if (targetId) {
            counts[targetId] = (counts[targetId] || 0) + 1;
          }
        });
      } catch (err) {
        console.warn('Error querying collectionGroup(following):', err);
      }
      this.followerCountsCache = { data: counts, ts: Date.now() };
      return counts;
    })();

    this.inflightFollowerCounts = fetchPromise;
    try {
      return await fetchPromise;
    } finally {
      this.inflightFollowerCounts = null;
    }
  }

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
      this.invalidateFollowerCountsCache();

      // Best-effort counter updates (in parallel, never blocking)
      await Promise.allSettled([
        updateDoc(doc(db, 'users', currentUid), sanitizeFirestoreData({
          followingCount: increment(-1),
          updatedAt: serverTimestamp(),
        })),
        updateDoc(doc(db, 'authors', authorId), sanitizeFirestoreData({
          followersCount: increment(-1),
          updatedAt: serverTimestamp(),
        })),
        updateDoc(doc(db, 'writers', authorId), sanitizeFirestoreData({
          followersCount: increment(-1),
          updatedAt: serverTimestamp(),
        })),
        updateDoc(doc(db, 'users', authorId), sanitizeFirestoreData({
          followersCount: increment(-1),
          updatedAt: serverTimestamp(),
        })),
      ]);

      return false;
    } else {
      // Follow
      await setDoc(followRef, sanitizeFirestoreData({
        authorId,
        authorName: authorName || '',
        followerId: currentUid,
        followedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }));
      this.invalidateFollowerCountsCache();

      // Best-effort counter updates (in parallel, never blocking)
      await Promise.allSettled([
        updateDoc(doc(db, 'users', currentUid), sanitizeFirestoreData({
          followingCount: increment(1),
          updatedAt: serverTimestamp(),
        })),
        updateDoc(doc(db, 'authors', authorId), sanitizeFirestoreData({
          followersCount: increment(1),
          updatedAt: serverTimestamp(),
        })),
        updateDoc(doc(db, 'writers', authorId), sanitizeFirestoreData({
          followersCount: increment(1),
          updatedAt: serverTimestamp(),
        })),
        updateDoc(doc(db, 'users', authorId), sanitizeFirestoreData({
          followersCount: increment(1),
          updatedAt: serverTimestamp(),
        })),
      ]);

      return true;
    }
  }

  /**
   * Get accurate followers count for an author combining real follow edges and stored counters
   */
  public async getAuthorFollowersCount(authorId: string, forceRefresh = false): Promise<number> {
    let realEdgeCount = 0;
    try {
      const allCounts = await this.getAllFollowerCounts(forceRefresh);
      realEdgeCount = allCounts[authorId] || 0;
    } catch {}

    let storedCount = 0;
    try {
      const [authorSnap, writerSnap, userSnap] = await Promise.all([
        getDoc(doc(db, 'authors', authorId)).catch(() => null),
        getDoc(doc(db, 'writers', authorId)).catch(() => null),
        getDoc(doc(db, 'users', authorId)).catch(() => null),
      ]);
      const counts = [
        authorSnap?.exists() && typeof authorSnap.data().followersCount === 'number' ? authorSnap.data().followersCount : 0,
        writerSnap?.exists() && typeof writerSnap.data().followersCount === 'number' ? writerSnap.data().followersCount : 0,
        userSnap?.exists() && typeof userSnap.data().followersCount === 'number' ? userSnap.data().followersCount : 0,
      ];
      storedCount = Math.max(0, ...counts);
    } catch (err) {
      console.warn('Error reading author followers count:', err);
    }

    return Math.max(realEdgeCount, storedCount);
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
      try {
        const snap = await getDocs(collection(db, 'users', currentUid, 'following'));
        return snap.docs.map(d => d.id);
      } catch (e) {
        console.warn('Error fetching following list:', err);
        return [];
      }
    }
  }
}

export const followingService = new FollowingService();
