import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  serverTimestamp,
  query,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Author } from '../types';
import { MOCK_AUTHORS } from './mockData';
import { followingService } from './followingService';

class AuthorService {
  /**
   * Fetch all authors from top-level `writers` and `authors` collection
   */
  public async getAuthors(maxLimit: number = 50): Promise<Author[]> {
    try {
      // 1. Try querying verified writers
      const writersSnap = await getDocs(query(collection(db, 'writers'), limit(maxLimit)));
      if (!writersSnap.empty) {
        const currentUid = auth.currentUser?.uid;
        const followedIds = currentUid ? await followingService.getUserFollowing(currentUid) : [];

        return writersSnap.docs.map(d => {
          const data = d.data();
          const authorId = d.id;
          return {
            id: authorId,
            name: data.displayName || data.penName || data.name || 'రచయిత',
            teluguName: data.penName || data.teluguName || data.displayName || data.name || 'రచయిత',
            avatar: data.photoURL || data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorId)}`,
            coverImage: data.coverImage || data.coverImageUrl,
            bio: data.bio || 'కథావాహిని అధికారిక రచయిత',
            teluguBio: data.teluguBio || data.bio || 'కథావాహిని అధికారిక రచయిత',
            followersCount: data.followersCount || 0,
            storiesCount: data.publishedStoriesCount || data.storiesCount || 0,
            novelsCount: data.publishedNovelsCount || data.novelsCount || 0,
            jokesCount: data.jokesCount || 0,
            isVerified: data.verified !== false,
            isFollowing: followedIds.includes(authorId),
            joinedDate: data.createdAt instanceof Timestamp ? data.createdAt.toDate().getFullYear().toString() : '2026',
            location: data.location || 'ఆంధ్రప్రదేశ్ / తెలంగాణ',
          };
        });
      }

      // 2. Fallback to authors collection
      const snap = await getDocs(query(collection(db, 'authors'), limit(maxLimit)));
      if (!snap.empty) {
        const currentUid = auth.currentUser?.uid;
        const followedIds = currentUid ? await followingService.getUserFollowing(currentUid) : [];

        return snap.docs.map(d => {
          const data = d.data();
          const authorId = d.id;
          return {
            id: authorId,
            name: data.name || data.displayName || '',
            teluguName: data.teluguName || data.penName || data.displayName || data.name || '',
            avatar: data.photoURL || data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorId)}`,
            coverImage: data.coverImage || data.coverImageUrl,
            bio: data.bio || '',
            teluguBio: data.teluguBio || data.bio || '',
            followersCount: data.followersCount || 0,
            storiesCount: data.publishedStoriesCount || data.storiesCount || 0,
            novelsCount: data.publishedNovelsCount || data.novelsCount || 0,
            jokesCount: data.jokesCount || 0,
            isVerified: data.isVerified !== undefined ? data.isVerified : true,
            isFollowing: followedIds.includes(authorId),
            joinedDate: data.createdAt instanceof Timestamp ? data.createdAt.toDate().getFullYear().toString() : '2026',
            location: data.location || 'తెలంగాణ / ఆంధ్రప్రదేశ్',
          };
        });
      }
    } catch (err) {
      console.warn('Error fetching authors/writers from Firestore:', err);
    }

    return MOCK_AUTHORS;
  }

  /**
   * Fetch featured authors
   */
  public async getFeaturedAuthors(): Promise<Author[]> {
    const authors = await this.getAuthors();
    return [...authors].sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0));
  }

  /**
   * Get single author by ID
   */
  public async getAuthorById(id: string): Promise<Author | undefined> {
    try {
      const snap = await getDoc(doc(db, 'authors', id));
      if (snap.exists()) {
        const data = snap.data();
        const currentUid = auth.currentUser?.uid;
        const isFollowed = currentUid ? await followingService.isFollowing(id, currentUid) : false;

        return {
          id: snap.id,
          name: data.name || data.displayName || '',
          teluguName: data.teluguName || data.penName || data.displayName || data.name || '',
          avatar: data.photoURL || data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(id)}`,
          coverImage: data.coverImage || data.coverImageUrl,
          bio: data.bio || '',
          teluguBio: data.teluguBio || data.bio || '',
          followersCount: data.followersCount || 0,
          storiesCount: data.publishedStoriesCount || data.storiesCount || 0,
          novelsCount: data.publishedNovelsCount || data.novelsCount || 0,
          jokesCount: data.jokesCount || 0,
          isVerified: data.isVerified !== undefined ? data.isVerified : true,
          isFollowing: isFollowed,
          joinedDate: data.createdAt instanceof Timestamp ? data.createdAt.toDate().getFullYear().toString() : '2026',
          location: data.location,
        };
      }
    } catch (err) {
      console.warn(`Error fetching author ${id} from Firestore:`, err);
    }

    const fallback = MOCK_AUTHORS.find(a => a.id === id);
    return fallback;
  }

  /**
   * Toggle follow author
   */
  public async toggleFollow(authorId: string): Promise<boolean> {
    return await followingService.toggleFollow(authorId);
  }

  /**
   * Upsert Author document in top-level `authors/{uid}`
   */
  public async syncAuthorDocument(author: Partial<Author> & { id: string }): Promise<void> {
    const authorRef = doc(db, 'authors', author.id);
    await setDoc(authorRef, {
      uid: author.id,
      writerId: author.id,
      userId: author.id,
      name: author.name || author.teluguName || '',
      penName: author.teluguName || author.name || '',
      displayName: author.teluguName || author.name || '',
      photoURL: author.avatar || '',
      bio: author.bio || author.teluguBio || '',
      teluguBio: author.teluguBio || author.bio || '',
      followersCount: author.followersCount || 0,
      publishedStoriesCount: author.storiesCount || 0,
      publishedNovelsCount: author.novelsCount || 0,
      isVerified: true,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
}

export const authorService = new AuthorService();
