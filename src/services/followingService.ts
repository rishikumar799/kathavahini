import {
  doc,
  getDoc,
  getDocs,
  runTransaction,
  collection,
  collectionGroup,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { sanitizeFirestoreData } from '../utils/firestoreSanitizer';

export class FollowingService {
  private followerCountsCache: { data: Record<string, number>; authoritative: boolean; ts: number } | null = null;
  private inflightFollowerCounts: Promise<{ counts: Record<string, number>; authoritative: boolean }> | null = null;
  private inflightToggles = new Map<string, Promise<boolean>>();
  private readonly CACHE_TTL_MS = 15_000;

  public invalidateFollowerCountsCache(): void {
    this.followerCountsCache = null;
  }

  public isFollowerCountCacheAuthoritative(): boolean {
    return Boolean(this.followerCountsCache?.authoritative);
  }

  /**
   * Fetch accurate live follower counts for all authors via a single collectionGroup('following') query.
   * Tracks whether the query succeeded so callers know when 0 is an authoritative count vs permission fallback.
   */
  public async getAllFollowerCountsDetailed(
    forceRefresh = false
  ): Promise<{ counts: Record<string, number>; authoritative: boolean }> {
    if (
      !forceRefresh &&
      this.followerCountsCache &&
      Date.now() - this.followerCountsCache.ts < this.CACHE_TTL_MS
    ) {
      return {
        counts: this.followerCountsCache.data,
        authoritative: this.followerCountsCache.authoritative,
      };
    }
    if (!forceRefresh && this.inflightFollowerCounts) {
      return this.inflightFollowerCounts;
    }

    const fetchPromise = (async () => {
      const counts: Record<string, number> = {};
      let authoritative = false;
      try {
        const cgSnap = await getDocs(collectionGroup(db, 'following'));
        authoritative = true;
        cgSnap.docs.forEach(d => {
          const data = d.data();
          const targetId =
            typeof data?.authorId === 'string' && data.authorId.trim()
              ? data.authorId.trim()
              : d.id;
          if (targetId) {
            counts[targetId] = (counts[targetId] || 0) + 1;
          }
        });
      } catch (err) {
        console.warn('Error querying collectionGroup(following):', err);
      }
      this.followerCountsCache = { data: counts, authoritative, ts: Date.now() };
      return { counts, authoritative };
    })();

    this.inflightFollowerCounts = fetchPromise;
    try {
      return await fetchPromise;
    } finally {
      this.inflightFollowerCounts = null;
    }
  }

  public async getAllFollowerCounts(forceRefresh = false): Promise<Record<string, number>> {
    const res = await this.getAllFollowerCountsDetailed(forceRefresh);
    return res.counts;
  }

  /**
   * Check if the current user is following an author
   * Path: users/{uid}/following/{authorId}
   */
  public async isFollowing(authorId: string, uid?: string): Promise<boolean> {
    const currentUid = uid || auth.currentUser?.uid;
    if (!currentUid || !authorId || currentUid === authorId) return false;

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
   * Transactional, race-safe toggle follow author.
   * Prevents self-following, duplicate follows, and negative follower counts.
   */
  public async toggleFollow(authorId: string, authorName?: string, uid?: string): Promise<boolean> {
    const currentUid = uid || auth.currentUser?.uid;
    if (!currentUid) {
      throw new Error('రచయితలను అనుసరించడానికి (Follow) ముందుగా లాగిన్ చేయండి.');
    }
    if (!authorId) {
      throw new Error('చెల్లుబాటు అయ్యే రచయిత ID లేదు.');
    }
    if (currentUid === authorId) {
      throw new Error('మిమ్మల్ని మీరు అనుసరించలేరు.');
    }

    const lockKey = `${currentUid}:${authorId}`;
    const existing = this.inflightToggles.get(lockKey);
    if (existing) return existing;

    const task = (async () => {
      const followRef = doc(db, 'users', currentUid, 'following', authorId);
      const currentUserRef = doc(db, 'users', currentUid);
      const writerRef = doc(db, 'writers', authorId);
      const authorRef = doc(db, 'authors', authorId);
      const targetUserRef = doc(db, 'users', authorId);

      const txResult = await runTransaction(db, async (tx) => {
        const [followSnap, curUserSnap, writerSnap, authorSnap, targetUserSnap] = await Promise.all([
          tx.get(followRef),
          tx.get(currentUserRef),
          tx.get(writerRef),
          tx.get(authorRef),
          tx.get(targetUserRef),
        ]);

        const currentlyFollowing = followSnap.exists();
        const delta = currentlyFollowing ? -1 : 1;
        const nextIsFollowing = !currentlyFollowing;

        if (currentlyFollowing) {
          tx.delete(followRef);
        } else {
          tx.set(followRef, sanitizeFirestoreData({
            authorId,
            authorName: authorName || '',
            followerId: currentUid,
            followedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          }));
        }

        if (curUserSnap.exists()) {
          const curFollowing = typeof curUserSnap.data().followingCount === 'number'
            ? curUserSnap.data().followingCount
            : 0;
          tx.update(currentUserRef, sanitizeFirestoreData({
            followingCount: Math.max(0, curFollowing + delta),
            updatedAt: serverTimestamp(),
          }));
        }

        let updatedFollowersCount = 0;

        if (writerSnap.exists()) {
          const cur = typeof writerSnap.data().followersCount === 'number'
            ? writerSnap.data().followersCount
            : 0;
          const next = Math.max(0, cur + delta);
          updatedFollowersCount = Math.max(updatedFollowersCount, next);
          tx.update(writerRef, sanitizeFirestoreData({
            followersCount: next,
            updatedAt: serverTimestamp(),
          }));
        }

        if (authorSnap.exists()) {
          const cur = typeof authorSnap.data().followersCount === 'number'
            ? authorSnap.data().followersCount
            : 0;
          const next = Math.max(0, cur + delta);
          updatedFollowersCount = Math.max(updatedFollowersCount, next);
          tx.update(authorRef, sanitizeFirestoreData({
            followersCount: next,
            updatedAt: serverTimestamp(),
          }));
        }

        if (targetUserSnap.exists()) {
          const cur = typeof targetUserSnap.data().followersCount === 'number'
            ? targetUserSnap.data().followersCount
            : 0;
          const next = Math.max(0, cur + delta);
          updatedFollowersCount = Math.max(updatedFollowersCount, next);
          tx.update(targetUserRef, sanitizeFirestoreData({
            followersCount: next,
            updatedAt: serverTimestamp(),
          }));
        }

        return { isFollowing: nextIsFollowing, fallbackCount: updatedFollowersCount };
      });

      this.invalidateFollowerCountsCache();
      const accurateCount = await this.getAuthorFollowersCount(authorId, true);
      const finalCount = Number.isFinite(accurateCount) ? accurateCount : txResult.fallbackCount;

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kathavahini:author-followed', {
          detail: { authorId, isFollowing: txResult.isFollowing, followersCount: finalCount },
        }));
      }

      return txResult.isFollowing;
    })();

    this.inflightToggles.set(lockKey, task);
    try {
      return await task;
    } finally {
      this.inflightToggles.delete(lockKey);
    }
  }

  /**
   * Get accurate followers count for an author.
   * When collectionGroup('following') succeeds, returns exact live edge count (so unfollows decrement cleanly to 0).
   */
  public async getAuthorFollowersCount(authorId: string, forceRefresh = false): Promise<number> {
    if (!authorId) return 0;

    try {
      const { counts, authoritative } = await this.getAllFollowerCountsDetailed(forceRefresh);
      if (authoritative) {
        return Math.max(0, counts[authorId] || 0);
      }
    } catch {}

    try {
      const [writerSnap, authorSnap, userSnap] = await Promise.all([
        getDoc(doc(db, 'writers', authorId)).catch(() => null),
        getDoc(doc(db, 'authors', authorId)).catch(() => null),
        getDoc(doc(db, 'users', authorId)).catch(() => null),
      ]);
      const counts = [
        writerSnap?.exists() && typeof writerSnap.data().followersCount === 'number' ? writerSnap.data().followersCount : 0,
        authorSnap?.exists() && typeof authorSnap.data().followersCount === 'number' ? authorSnap.data().followersCount : 0,
        userSnap?.exists() && typeof userSnap.data().followersCount === 'number' ? userSnap.data().followersCount : 0,
      ];
      return Math.max(0, ...counts);
    } catch (err) {
      console.warn('Error reading author followers count:', err);
      return 0;
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
    } catch {
      try {
        const snap = await getDocs(collection(db, 'users', currentUid, 'following'));
        return snap.docs.map(d => d.id);
      } catch (e) {
        console.warn('Error fetching following list:', e);
        return [];
      }
    }
  }
}

export const followingService = new FollowingService();

