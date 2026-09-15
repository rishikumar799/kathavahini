import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Story, StoryCategory } from '../types';
import { MOCK_STORIES } from './mockData';
import { bookmarkService } from './bookmarkService';
import { deletionTracker } from './deletionTracker';

const GUEST_LIKES_STORAGE_KEY = 'kathavahini_guest_liked_story_ids';

function getGuestLikedIds(): string[] {
  try {
    const s = localStorage.getItem(GUEST_LIKES_STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function setGuestLikedIds(ids: string[]): void {
  try {
    localStorage.setItem(GUEST_LIKES_STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

class StoryService {
  /**
   * Fetch all published & public stories from Firestore
   */
  public async getAllPublishedStories(maxLimit: number = 60): Promise<Story[]> {
    try {
      await deletionTracker.init();
      // Query published stories
      const q = query(
        collection(db, 'stories'),
        where('status', 'in', ['published', 'approved']),
        limit(maxLimit)
      );
      const snap = await getDocs(q);

      const currentUid = auth.currentUser?.uid;
      const guestLikes = getGuestLikedIds();

      if (!snap.empty) {
        const stories: Story[] = [];

        for (const d of snap.docs) {
          if (deletionTracker.isDeleted(d.id)) {
            continue;
          }
          const data = d.data();
          if (data.deleted === true || data.status === 'deleted') {
            continue;
          }
          const storyId = d.id;

          // Strict Public Query Filter: Only published content with public visibility
          const status = data.status || 'published';
          const visibility = data.visibility || 'public';
          
          if (status !== 'published' && status !== 'approved') {
            continue;
          }
          if (visibility === 'hidden' || visibility === 'private') {
            continue;
          }

          // Check if bookmarked
          let isBookmarked = false;
          if (currentUid) {
            try {
              const bmSnap = await getDoc(doc(db, 'users', currentUid, 'bookmarks', storyId));
              isBookmarked = bmSnap.exists();
            } catch (e) {}
          }

          // Check if liked
          let isLiked = false;
          if (currentUid) {
            try {
              const likeSnap = await getDoc(doc(db, 'stories', storyId, 'likes', currentUid));
              isLiked = likeSnap.exists();
            } catch (e) {}
          } else {
            isLiked = guestLikes.includes(storyId);
          }

          stories.push({
            id: storyId,
            title: data.title || '',
            teluguTitle: data.teluguTitle || data.title || '',
            slug: data.slug || 'story',
            coverImage: data.coverImage || data.coverImageUrl || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
            excerpt: data.excerpt || '',
            teluguExcerpt: data.teluguExcerpt || data.excerpt || '',
            content: Array.isArray(data.content) ? data.content : [data.content || ''],
            authorId: data.authorId || '',
            authorName: data.authorName || data.authorPenName,
            author: data.author || {
              id: data.authorId || 'author',
              name: data.authorName || data.authorPenName || 'తెలుగు రచయిత',
              teluguName: data.authorPenName || data.authorName || 'తెలుగు రచయిత',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(data.authorId || 'auth'),
              bio: '',
              teluguBio: '',
              followersCount: 0,
              storiesCount: 1,
              novelsCount: 0,
              jokesCount: 0,
              joinedDate: '2026',
            },
            category: data.category || data.categoryName || 'జీవితం',
            tags: data.tags || [],
            rating: typeof data.rating === 'number' ? Number(data.rating.toFixed(1)) : 5.0,
            viewCount: data.viewsCount || data.viewCount || 0,
            likeCount: data.likesCount || data.likeCount || 0,
            bookmarkCount: data.bookmarksCount || data.bookmarkCount || 0,
            readingTimeMinutes: data.readingTimeMinutes || 3,
            publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate().toISOString().split('T')[0] : (data.publishedAt || new Date().toISOString().split('T')[0]),
            status: status,
            visibility: visibility,
            isLiked,
            isBookmarked,
            submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toDate().toISOString() : data.submittedAt,
            reviewedAt: data.reviewedAt instanceof Timestamp ? data.reviewedAt.toDate().toISOString() : data.reviewedAt,
          });
        }

        // Merge with initial catalog to ensure rich initial reading experience
        const map = new Map<string, Story>();
        MOCK_STORIES.filter(s => !deletionTracker.isDeleted(s.id)).forEach(s => {
          map.set(s.id, {
            ...s,
            isLiked: currentUid ? s.isLiked : guestLikes.includes(s.id)
          });
        });
        stories.forEach(s => map.set(s.id, s));
        return Array.from(map.values()).filter(s => !deletionTracker.isDeleted(s.id));
      }
    } catch (err) {
      console.warn('Could not query published stories from Firestore, using baseline catalog:', err);
    }

    const guestLikes = getGuestLikedIds();
    return MOCK_STORIES
      .filter(s => !deletionTracker.isDeleted(s.id))
      .map(s => ({
        ...s,
        isLiked: guestLikes.includes(s.id)
      }));
  }

  /**
   * Real-time subscription to published stories from Firestore.
   * Immediately notifies whenever any story is published, updated, hidden, or deleted.
   */
  public subscribePublishedStories(callback: (stories: Story[]) => void): () => void {
    // 1. Initial push
    this.getAllPublishedStories().then(callback).catch(() => {});

    try {
      const q = query(
        collection(db, 'stories'),
        where('status', 'in', ['published', 'approved']),
        limit(80)
      );

      const unsubscribeSnapshot = onSnapshot(q, async () => {
        try {
          const stories = await this.getAllPublishedStories();
          callback(stories);
        } catch (e) {}
      }, (err) => {
        console.warn('Real-time story subscriber note:', err);
      });

      const handleStoryEvent = () => {
        this.getAllPublishedStories().then(callback).catch(() => {});
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('kathavahini:story-deleted', handleStoryEvent);
        window.addEventListener('kathavahini:story-liked', handleStoryEvent);
        window.addEventListener('kathavahini:story-rated', handleStoryEvent);
        window.addEventListener('kathavahini:story-viewed', handleStoryEvent);
        window.addEventListener('kathavahini:refresh-content', handleStoryEvent);
      }

      return () => {
        unsubscribeSnapshot();
        if (typeof window !== 'undefined') {
          window.removeEventListener('kathavahini:story-deleted', handleStoryEvent);
          window.removeEventListener('kathavahini:story-liked', handleStoryEvent);
          window.removeEventListener('kathavahini:story-rated', handleStoryEvent);
          window.removeEventListener('kathavahini:story-viewed', handleStoryEvent);
          window.removeEventListener('kathavahini:refresh-content', handleStoryEvent);
        }
      };
    } catch (e) {
      console.warn('Could not establish real-time stories snapshot:', e);
      return () => {};
    }
  }

  public async getTrendingStories(): Promise<Story[]> {
    const stories = await this.getAllPublishedStories();
    return [...stories].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  }

  public async getPopularStoriesThisWeek(): Promise<Story[]> {
    const stories = await this.getAllPublishedStories();
    return [...stories].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
  }

  public async getNewReleases(): Promise<Story[]> {
    const stories = await this.getAllPublishedStories();
    return [...stories].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  public async getStoriesByCategory(category: StoryCategory): Promise<Story[]> {
    const stories = await this.getAllPublishedStories();
    return stories.filter(s => s.category === category);
  }

  /**
   * Record real view for a story with session deduplication
   */
  public async recordStoryView(storyId: string): Promise<number> {
    if (!storyId || deletionTracker.isDeleted(storyId)) return 0;

    const sessionKey = `kathavahini_viewed_${storyId}`;
    const alreadyViewedInSession = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(sessionKey);

    if (alreadyViewedInSession) {
      // Return existing view count without artificial inflation
      const current = await this.getStoryById(storyId);
      return current?.viewCount || 0;
    }

    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(sessionKey, 'true');
      }

      // Persist real view increment in Firestore
      const storyRef = doc(db, 'stories', storyId);
      await setDoc(storyRef, {
        viewCount: increment(1),
        viewsCount: increment(1),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Notify app in real time
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kathavahini:story-viewed', {
          detail: { storyId }
        }));
      }

      const updated = await this.getStoryById(storyId);
      return updated?.viewCount || 0;
    } catch (err) {
      console.warn('Error recording view count in Firestore:', err);
      return 0;
    }
  }

  public async getStoryById(id: string): Promise<Story | undefined> {
    if (deletionTracker.isDeleted(id)) {
      return undefined;
    }
    const guestLikes = getGuestLikedIds();

    try {
      const snap = await getDoc(doc(db, 'stories', id));
      if (snap.exists()) {
        const data = snap.data();
        if (data.deleted === true || data.status === 'deleted') {
          return undefined;
        }
        const currentUid = auth.currentUser?.uid;

        let isBookmarked = false;
        if (currentUid) {
          try {
            const bmSnap = await getDoc(doc(db, 'users', currentUid, 'bookmarks', id));
            isBookmarked = bmSnap.exists();
          } catch (e) {}
        }

        let isLiked = false;
        if (currentUid) {
          try {
            const likeSnap = await getDoc(doc(db, 'stories', id, 'likes', currentUid));
            isLiked = likeSnap.exists();
          } catch (e) {}
        } else {
          isLiked = guestLikes.includes(id);
        }

        return {
          id: snap.id,
          title: data.title || '',
          teluguTitle: data.teluguTitle || data.title || '',
          slug: data.slug || 'story',
          coverImage: data.coverImage || data.coverImageUrl || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
          excerpt: data.excerpt || '',
          teluguExcerpt: data.teluguExcerpt || data.excerpt || '',
          content: Array.isArray(data.content) ? data.content : [data.content || ''],
          authorId: data.authorId || '',
          authorName: data.authorName,
          author: data.author || {
            id: data.authorId || 'author',
            name: data.authorName || 'తెలుగు రచయిత',
            teluguName: data.authorName || 'తెలుగు రచయిత',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(data.authorId || 'auth'),
            bio: '',
            teluguBio: '',
            followersCount: 0,
            storiesCount: 1,
            novelsCount: 0,
            jokesCount: 0,
            joinedDate: '2026',
          },
          category: data.category || data.categoryName || 'జీవితం',
          tags: data.tags || [],
          rating: typeof data.rating === 'number' ? Number(data.rating.toFixed(1)) : 5.0,
          viewCount: data.viewsCount || data.viewCount || 0,
          likeCount: data.likesCount || data.likeCount || 0,
          bookmarkCount: data.bookmarksCount || data.bookmarkCount || 0,
          readingTimeMinutes: data.readingTimeMinutes || 3,
          publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate().toISOString().split('T')[0] : (data.publishedAt || ''),
          status: data.status || 'published',
          isLiked,
          isBookmarked,
        };
      }
    } catch (err) {
      console.warn(`Error fetching story ${id} from Firestore:`, err);
    }

    const baseline = MOCK_STORIES.find(s => s.id === id && !deletionTracker.isDeleted(s.id));
    if (baseline) {
      return {
        ...baseline,
        isLiked: guestLikes.includes(baseline.id)
      };
    }
    return undefined;
  }

  /**
   * Toggle Like for both authenticated and guest readers
   * Path: stories/{storyId}/likes/{uid} or localStorage for guests
   */
  public async toggleLike(storyId: string): Promise<{ isLiked: boolean; newCount: number }> {
    const user = auth.currentUser;
    let isLiked = false;
    let delta = 0;

    if (!user) {
      // Real guest like handled with local deduplication + Firestore increment
      const guestLikes = getGuestLikedIds();
      if (guestLikes.includes(storyId)) {
        // Unlike
        setGuestLikedIds(guestLikes.filter(id => id !== storyId));
        isLiked = false;
        delta = -1;
      } else {
        // Like
        guestLikes.push(storyId);
        setGuestLikedIds(guestLikes);
        isLiked = true;
        delta = 1;
      }
    } else {
      // Authenticated user like
      const likeRef = doc(db, 'stories', storyId, 'likes', user.uid);
      const likeSnap = await getDoc(likeRef);

      if (likeSnap.exists()) {
        await deleteDoc(likeRef);
        // Also remove from user's likedStories index
        try {
          await deleteDoc(doc(db, 'users', user.uid, 'likedStories', storyId));
        } catch {}
        isLiked = false;
        delta = -1;
      } else {
        await setDoc(likeRef, {
          userId: user.uid,
          userName: user.displayName || 'పాఠకుడు',
          likedAt: serverTimestamp(),
        }, { merge: true });
        // Also record in user's likedStories index
        try {
          await setDoc(doc(db, 'users', user.uid, 'likedStories', storyId), {
            storyId,
            likedAt: serverTimestamp(),
          }, { merge: true });
        } catch {}
        isLiked = true;
        delta = 1;
      }
    }

    // Save increment/decrement to Firestore story document
    try {
      const storyRef = doc(db, 'stories', storyId);
      await setDoc(storyRef, {
        likesCount: increment(delta),
        likeCount: increment(delta),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.warn('Silent like count update to Firestore:', e);
    }

    // Read updated like count
    const story = await this.getStoryById(storyId);
    const newCount = Math.max(0, story?.likeCount || 0);

    // Broadcast real-time like event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kathavahini:story-liked', {
        detail: { storyId, isLiked, newCount }
      }));
    }

    return { isLiked, newCount };
  }

  /**
   * Toggle bookmark via BookmarkService
   */
  public async toggleBookmark(storyId: string): Promise<boolean> {
    const story = await this.getStoryById(storyId);
    if (!story) return false;
    return await bookmarkService.toggleBookmark(story);
  }

  public async searchStories(queryText: string, category?: string): Promise<Story[]> {
    const stories = await this.getAllPublishedStories();
    const q = queryText.toLowerCase().trim();
    return stories.filter(s => {
      const matchesCategory = !category || s.category === category;
      const matchesQuery = !q ||
        s.title.toLowerCase().includes(q) ||
        s.teluguTitle.includes(q) ||
        s.author.name.toLowerCase().includes(q) ||
        s.author.teluguName.includes(q) ||
        s.tags.some(t => t.includes(q));
      return matchesCategory && matchesQuery;
    });
  }
}

export const storyService = new StoryService();

