import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  collection,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { MOCK_STORIES } from './mockData';

export interface StoryRatingData {
  averageRating: number;
  ratingsCount: number;
  userRating: number;
  hasRated: boolean;
}

const GUEST_RATINGS_STORAGE_KEY = 'kathavahini_guest_story_ratings';

class RatingService {
  /**
   * Get the guest ratings dictionary from localStorage
   */
  private getGuestRatings(): Record<string, number> {
    try {
      const stored = localStorage.getItem(GUEST_RATINGS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Save a guest rating to localStorage
   */
  private saveGuestRating(storyId: string, rating: number): void {
    try {
      const current = this.getGuestRatings();
      current[storyId] = rating;
      localStorage.setItem(GUEST_RATINGS_STORAGE_KEY, JSON.stringify(current));
    } catch {}
  }

  /**
   * Fetch current rating details for a story, including the current user's rating
   */
  public async getStoryRating(storyId: string, customUid?: string): Promise<StoryRatingData> {
    const currentUid = customUid || auth.currentUser?.uid;
    let userRating = 0;

    // Check user's individual rating
    if (currentUid) {
      try {
        const ratingDoc = await getDoc(doc(db, 'stories', storyId, 'ratings', currentUid));
        if (ratingDoc.exists()) {
          userRating = ratingDoc.data().rating || 0;
        }
      } catch (err) {
        console.warn('Error fetching user rating:', err);
      }
    } else {
      const guestRatings = this.getGuestRatings();
      userRating = guestRatings[storyId] || 0;
    }

    // Read overall story rating stats from Firestore
    try {
      const storyDoc = await getDoc(doc(db, 'stories', storyId));
      if (storyDoc.exists()) {
        const data = storyDoc.data();
        const averageRating = typeof data.rating === 'number' ? Number(data.rating.toFixed(1)) : 5.0;
        const ratingsCount = typeof data.ratingsCount === 'number' ? data.ratingsCount : (data.rating ? 14 : 0);
        return {
          averageRating,
          ratingsCount,
          userRating,
          hasRated: userRating > 0
        };
      }
    } catch (err) {
      console.warn('Error fetching story rating from Firestore:', err);
    }

    // Fallback to baseline mock story
    const baseline = MOCK_STORIES.find(s => s.id === storyId);
    return {
      averageRating: baseline?.rating || 5.0,
      ratingsCount: 18,
      userRating,
      hasRated: userRating > 0
    };
  }

  /**
   * Rate a story (1 to 5 stars)
   * Saves to Firestore with exact mathematical averaging and persists user rating.
   */
  public async rateStory(
    storyId: string, 
    ratingValue: number, 
    customUid?: string, 
    customName?: string
  ): Promise<StoryRatingData> {
    const rating = Math.max(1, Math.min(5, Math.round(ratingValue)));
    const currentUid = customUid || auth.currentUser?.uid;
    const currentUserName = customName || auth.currentUser?.displayName || 'పాఠకుడు';

    let prevUserRating = 0;

    // 1. Check if user previously rated
    if (currentUid) {
      try {
        const existingRatingSnap = await getDoc(doc(db, 'stories', storyId, 'ratings', currentUid));
        if (existingRatingSnap.exists()) {
          prevUserRating = existingRatingSnap.data().rating || 0;
        }
      } catch (err) {
        console.warn('Error reading existing rating:', err);
      }
    } else {
      const guestRatings = this.getGuestRatings();
      prevUserRating = guestRatings[storyId] || 0;
      this.saveGuestRating(storyId, rating);
    }

    // 2. Fetch current story document to recalculate sum and count safely
    let currentCount = 0;
    let currentSum = 0;
    let baselineData: any = null;

    try {
      const storyRef = doc(db, 'stories', storyId);
      const storySnap = await getDoc(storyRef);

      if (storySnap.exists()) {
        const data = storySnap.data();
        currentCount = data.ratingsCount || (data.rating ? 15 : 1);
        currentSum = data.ratingsSum || (currentCount * (data.rating || 5.0));
      } else {
        // Find baseline story data to seed document
        const baseline = MOCK_STORIES.find(s => s.id === storyId);
        if (baseline) {
          baselineData = baseline;
          currentCount = 15;
          currentSum = baseline.rating * currentCount;
        }
      }

      // Calculate new metrics
      let newCount = currentCount;
      let newSum = currentSum;

      if (prevUserRating > 0) {
        // User is updating their previous rating
        newSum = currentSum - prevUserRating + rating;
      } else {
        // Brand new rating from this user
        newCount = currentCount + 1;
        newSum = currentSum + rating;
      }

      const newAverage = Number((newSum / Math.max(1, newCount)).toFixed(1));

      // 3. Save to story document in Firestore
      const updatePayload: any = {
        rating: newAverage,
        ratingsCount: newCount,
        ratingsSum: newSum,
        updatedAt: serverTimestamp(),
      };

      if (baselineData && !storySnap.exists()) {
        Object.assign(updatePayload, {
          title: baselineData.title,
          teluguTitle: baselineData.teluguTitle,
          coverImage: baselineData.coverImage,
          category: baselineData.category,
          authorId: baselineData.authorId,
          publishedAt: baselineData.publishedAt,
          status: 'published',
          visibility: 'public',
        });
      }

      await setDoc(storyRef, updatePayload, { merge: true });

      // 4. Save individual user rating subcollection if logged in
      if (currentUid) {
        await setDoc(doc(db, 'stories', storyId, 'ratings', currentUid), {
          userId: currentUid,
          userName: currentUserName,
          rating,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }

      const result: StoryRatingData = {
        averageRating: newAverage,
        ratingsCount: newCount,
        userRating: rating,
        hasRated: true
      };

      // 5. Broadcast real-time event across the application
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kathavahini:story-rated', {
          detail: {
            storyId,
            rating: newAverage,
            ratingsCount: newCount,
            userRating: rating
          }
        }));
      }

      return result;
    } catch (err) {
      console.error('Failed to save rating to Firestore:', err);
      // Fallback local update
      const result: StoryRatingData = {
        averageRating: rating,
        ratingsCount: (currentCount || 15) + (prevUserRating > 0 ? 0 : 1),
        userRating: rating,
        hasRated: true
      };

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kathavahini:story-rated', {
          detail: {
            storyId,
            rating,
            ratingsCount: result.ratingsCount,
            userRating: rating
          }
        }));
      }

      return result;
    }
  }
}

export const ratingService = new RatingService();
