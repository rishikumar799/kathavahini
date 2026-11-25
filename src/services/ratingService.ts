import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { sanitizeFirestoreData } from '../utils/firestoreSanitizer';

export interface StoryRatingData {
  averageRating: number;
  ratingsCount: number;
  userRating: number;
  hasRated: boolean;
}

const GUEST_RATINGS_STORAGE_KEY = 'kathavahini_guest_story_ratings';

class RatingService {
  private inflightRatings = new Map<string, Promise<StoryRatingData>>();

  private getGuestRatings(): Record<string, number> {
    try {
      const stored = localStorage.getItem(GUEST_RATINGS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private saveGuestRating(storyId: string, rating: number): void {
    try {
      const current = this.getGuestRatings();
      current[storyId] = rating;
      localStorage.setItem(GUEST_RATINGS_STORAGE_KEY, JSON.stringify(current));
    } catch {}
  }

  /**
   * Fetch accurate rating details for a story. Never defaults unrated stories to 5.0.
   */
  public async getStoryRating(storyId: string, customUid?: string): Promise<StoryRatingData> {
    const currentUid = customUid || auth.currentUser?.uid;
    let userRating = 0;

    if (currentUid) {
      try {
        const ratingDoc = await getDoc(doc(db, 'stories', storyId, 'ratings', currentUid));
        if (ratingDoc.exists()) {
          const val = Number(ratingDoc.data().rating || 0);
          userRating = val >= 1 && val <= 5 ? val : 0;
        }
      } catch (err) {
        console.warn('Error fetching user rating:', err);
      }
    } else {
      const guestRatings = this.getGuestRatings();
      const val = Number(guestRatings[storyId] || 0);
      userRating = val >= 1 && val <= 5 ? val : 0;
    }

    try {
      const storyDoc = await getDoc(doc(db, 'stories', storyId));
      if (storyDoc.exists()) {
        const data = storyDoc.data();
        const ratingsCount =
          typeof data.ratingsCount === 'number'
            ? Math.max(0, data.ratingsCount)
            : typeof data.ratingCount === 'number'
            ? Math.max(0, data.ratingCount)
            : 0;
        const averageRating =
          ratingsCount > 0 && typeof data.rating === 'number' && data.rating > 0 && data.rating <= 5
            ? Number(data.rating.toFixed(1))
            : 0;
        return {
          averageRating,
          ratingsCount,
          userRating,
          hasRated: userRating > 0,
        };
      }
    } catch (err) {
      console.warn('Error fetching story rating from Firestore:', err);
    }

    return {
      averageRating: 0,
      ratingsCount: 0,
      userRating,
      hasRated: userRating > 0,
    };
  }

  /**
   * Rate a story (1 to 5 stars) atomically via Firestore transaction.
   * Preserves existing historical rating records, never seeds fake 15-vote averages,
   * and updates cleanly if a reader revises their rating.
   */
  public async rateStory(
    storyId: string,
    ratingValue: number,
    customUid?: string,
    customName?: string
  ): Promise<StoryRatingData> {
    const existing = this.inflightRatings.get(storyId);
    if (existing) return existing;

    const rating = Math.max(1, Math.min(5, Math.round(ratingValue)));
    const currentUid = customUid || auth.currentUser?.uid;
    const currentUserName = customName || auth.currentUser?.displayName || 'పాఠకుడు';

    const task = (async () => {
      const storyRef = doc(db, 'stories', storyId);
      const guestPrevRating = !currentUid ? Number(this.getGuestRatings()[storyId] || 0) : 0;

      const txResult = await runTransaction(db, async (tx) => {
        const storySnap = await tx.get(storyRef);
        if (!storySnap.exists()) {
          throw new Error('కథ కనుగొనబడలేదు. రేటింగ్ సేవ్ చేయలేకపోయాము.');
        }

        let prevUserRating = guestPrevRating;
        const userRatingRef = currentUid ? doc(db, 'stories', storyId, 'ratings', currentUid) : null;
        if (userRatingRef) {
          const existingRatingSnap = await tx.get(userRatingRef);
          if (existingRatingSnap.exists()) {
            const val = Number(existingRatingSnap.data().rating || 0);
            prevUserRating = val >= 1 && val <= 5 ? val : 0;
          }
        }

        const data = storySnap.data();
        const rawCount =
          typeof data.ratingsCount === 'number'
            ? Math.max(0, data.ratingsCount)
            : typeof data.ratingCount === 'number'
            ? Math.max(0, data.ratingCount)
            : 0;
        const rawAvg = typeof data.rating === 'number' && data.rating > 0 && data.rating <= 5 ? data.rating : 0;
        const currentCount = rawCount;
        const currentSum =
          typeof data.ratingsSum === 'number' && data.ratingsSum >= 0 && currentCount > 0
            ? data.ratingsSum
            : currentCount > 0
            ? Number((currentCount * rawAvg).toFixed(2))
            : 0;

        let newCount = currentCount;
        let newSum = currentSum;

        if (prevUserRating > 0 && currentCount > 0) {
          newSum = Math.max(1, currentSum - prevUserRating + rating);
        } else {
          newCount = currentCount + 1;
          newSum = currentSum + rating;
        }

        const newAverage = Number(Math.min(5, Math.max(1, newSum / Math.max(1, newCount))).toFixed(1));

        tx.update(storyRef, sanitizeFirestoreData({
          rating: newAverage,
          ratingsCount: newCount,
          ratingsSum: Number(newSum.toFixed(2)),
          updatedAt: serverTimestamp(),
        }));

        if (userRatingRef && currentUid) {
          tx.set(userRatingRef, sanitizeFirestoreData({
            userId: currentUid,
            userName: currentUserName,
            rating,
            updatedAt: serverTimestamp(),
          }), { merge: true });
        }

        return {
          averageRating: newAverage,
          ratingsCount: newCount,
          userRating: rating,
          hasRated: true,
        };
      });

      if (!currentUid) {
        this.saveGuestRating(storyId, rating);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kathavahini:story-rated', {
          detail: {
            storyId,
            rating: txResult.averageRating,
            ratingsCount: txResult.ratingsCount,
            userRating: txResult.userRating,
          },
        }));
      }

      return txResult;
    })();

    this.inflightRatings.set(storyId, task);
    try {
      return await task;
    } finally {
      this.inflightRatings.delete(storyId);
    }
  }
}

export const ratingService = new RatingService();

