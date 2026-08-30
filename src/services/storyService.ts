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
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Story, StoryCategory } from '../types';
import { MOCK_STORIES } from './mockData';
import { bookmarkService } from './bookmarkService';

class StoryService {
  /**
   * Fetch all published & public stories from Firestore
   */
  public async getAllPublishedStories(maxLimit: number = 60): Promise<Story[]> {
    try {
      // Query published stories
      const q = query(
        collection(db, 'stories'),
        where('status', 'in', ['published', 'approved']),
        limit(maxLimit)
      );
      const snap = await getDocs(q);

      const currentUid = auth.currentUser?.uid;

      if (!snap.empty) {
        const stories: Story[] = [];

        for (const d of snap.docs) {
          const data = d.data();
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
            } catch (e) {
              // ignore
            }
          }

          // Check if liked
          let isLiked = false;
          if (currentUid) {
            try {
              const likeSnap = await getDoc(doc(db, 'stories', storyId, 'likes', currentUid));
              isLiked = likeSnap.exists();
            } catch (e) {
              // ignore
            }
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
            rating: data.rating || 5.0,
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
        MOCK_STORIES.forEach(s => map.set(s.id, s));
        stories.forEach(s => map.set(s.id, s));
        return Array.from(map.values());
      }
    } catch (err) {
      console.warn('Could not query published stories from Firestore, using baseline catalog:', err);
    }

    return MOCK_STORIES;
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

  public async getStoryById(id: string): Promise<Story | undefined> {
    try {
      const snap = await getDoc(doc(db, 'stories', id));
      if (snap.exists()) {
        const data = snap.data();
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
        }

        // Increment view count
        try {
          await updateDoc(doc(db, 'stories', id), {
            viewsCount: increment(1),
            viewCount: increment(1),
          });
        } catch (e) {}

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
          rating: data.rating || 5.0,
          viewCount: (data.viewsCount || data.viewCount || 0) + 1,
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

    const baseline = MOCK_STORIES.find(s => s.id === id);
    return baseline;
  }

  /**
   * Toggle Like for authenticated and guest users
   * Path: stories/{storyId}/likes/{uid}
   */
  public async toggleLike(storyId: string): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) {
      // Guest like
      return true;
    }

    const likeRef = doc(db, 'stories', storyId, 'likes', user.uid);
    const likeSnap = await getDoc(likeRef);

    if (likeSnap.exists()) {
      // Remove like
      await deleteDoc(likeRef);
      try {
        await updateDoc(doc(db, 'stories', storyId), {
          likesCount: increment(-1),
          likeCount: increment(-1),
          updatedAt: serverTimestamp(),
        });
      } catch (e) {}
      return false;
    } else {
      // Add like
      await setDoc(likeRef, {
        userId: user.uid,
        userName: user.displayName || 'పాఠకుడు',
        likedAt: serverTimestamp(),
      });
      try {
        await updateDoc(doc(db, 'stories', storyId), {
          likesCount: increment(1),
          likeCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      } catch (e) {}
      return true;
    }
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
