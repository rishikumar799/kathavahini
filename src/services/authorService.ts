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
import { sanitizeFirestoreData } from '../utils/firestoreSanitizer';
import { Author } from '../types';
import { MOCK_AUTHORS } from './mockData';
import { followingService } from './followingService';
import { resolveAvatarUrl } from '../utils/avatarUtils';

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

        // Check companion users collection in case writer uploaded a custom profile image
        const usersMap = new Map<string, any>();
        try {
          const userDocs = await Promise.all(
            writersSnap.docs.map(d => getDoc(doc(db, 'users', d.id)))
          );
          userDocs.forEach(ud => {
            if (ud.exists()) {
              usersMap.set(ud.id, ud.data());
            }
          });
        } catch (e) {
          console.warn('Could not fetch companion user docs for writers:', e);
        }

        return writersSnap.docs.map(d => {
          const data = d.data();
          const authorId = d.id;
          const uData = usersMap.get(authorId) || {};
          const candidateAvatar = uData.photoURL || uData.avatar || uData.profileImageURL || data.photoURL || data.avatar;
          const name = data.displayName || data.penName || data.name || uData.displayName || 'రచయిత';
          const teluguName = data.teluguName || uData.teluguName || data.penName || data.displayName || data.name || 'రచయిత';
          return {
            id: authorId,
            name,
            teluguName,
            avatar: resolveAvatarUrl(candidateAvatar, teluguName || name),
            coverImage: data.coverImage || data.coverImageUrl,
            bio: data.bio || uData.bio || 'కథావాహిని అధికారిక రచయిత',
            teluguBio: data.teluguBio || data.bio || uData.teluguBio || uData.bio || 'కథావాహిని అధికారిక రచయిత',
            followersCount: data.followersCount || uData.followersCount || 0,
            storiesCount: data.publishedStoriesCount || data.storiesCount || 0,
            novelsCount: data.publishedNovelsCount || data.novelsCount || 0,
            jokesCount: data.jokesCount || 0,
            isVerified: data.verified !== false,
            isFollowing: followedIds.includes(authorId),
            joinedDate: data.createdAt instanceof Timestamp ? data.createdAt.toDate().getFullYear().toString() : '2026',
            location: data.location || uData.location || 'ఆంధ్రప్రదేశ్ / తెలంగాణ',
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
          const name = data.name || data.displayName || '';
          const teluguName = data.teluguName || data.penName || data.displayName || data.name || '';
          return {
            id: authorId,
            name,
            teluguName,
            avatar: resolveAvatarUrl(data.photoURL || data.avatar, teluguName || name),
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
   * Get single author or user public profile by ID
   * Checks writers/{id}, authors/{id}, then users/{id} safely without exposing private data
   */
  public async getAuthorById(id: string): Promise<Author | undefined> {
    if (!id) return undefined;
    const currentUid = auth.currentUser?.uid;

    try {
      // 1. Check writers collection
      const writerSnap = await getDoc(doc(db, 'writers', id));
      if (writerSnap.exists()) {
        const data = writerSnap.data();
        let uData: any = {};
        try {
          const userSnap = await getDoc(doc(db, 'users', id));
          if (userSnap.exists()) {
            uData = userSnap.data();
          }
        } catch (e) {}

        const isFollowed = currentUid ? await followingService.isFollowing(id, currentUid) : false;
        const name = data.displayName || data.penName || data.name || uData.displayName || 'రచయిత';
        const teluguName = data.teluguName || uData.teluguName || data.penName || data.displayName || data.name || 'రచయిత';
        const candidateAvatar = uData.photoURL || uData.avatar || uData.profileImageURL || data.photoURL || data.avatar;
        return {
          id: writerSnap.id,
          name,
          teluguName,
          avatar: resolveAvatarUrl(candidateAvatar, teluguName || name),
          coverImage: data.coverImage || data.coverImageUrl,
          bio: data.bio || uData.bio || 'కథావాహిని రచయిత',
          teluguBio: data.teluguBio || data.bio || uData.teluguBio || uData.bio || 'కథావాహిని రచయిత',
          followersCount: data.followersCount || uData.followersCount || 0,
          storiesCount: data.publishedStoriesCount || data.storiesCount || 0,
          novelsCount: data.publishedNovelsCount || data.novelsCount || 0,
          jokesCount: data.jokesCount || 0,
          isVerified: data.verified !== false,
          isFollowing: isFollowed,
          joinedDate: data.createdAt instanceof Timestamp ? data.createdAt.toDate().getFullYear().toString() : '2026',
          location: data.location || uData.location || 'ఆంధ్రప్రదేశ్ / తెలంగాణ',
        };
      }

      // 2. Check authors collection
      const authorSnap = await getDoc(doc(db, 'authors', id));
      if (authorSnap.exists()) {
        const data = authorSnap.data();
        const isFollowed = currentUid ? await followingService.isFollowing(id, currentUid) : false;
        const name = data.name || data.displayName || 'రచయిత';
        const teluguName = data.teluguName || data.penName || data.displayName || data.name || 'రచయిత';
        return {
          id: authorSnap.id,
          name,
          teluguName,
          avatar: resolveAvatarUrl(data.photoURL || data.avatar, teluguName || name),
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

      // 3. Check users collection (for any registered user/reader/writer profile)
      const userSnap = await getDoc(doc(db, 'users', id));
      if (userSnap.exists()) {
        const data = userSnap.data();
        const isFollowed = currentUid ? await followingService.isFollowing(id, currentUid) : false;
        const name = data.displayName || data.penName || data.name || 'పాఠకుడు';
        const teluguName = data.teluguName || data.penName || data.displayName || data.name || 'పాఠకుడు';
        return {
          id: userSnap.id,
          name,
          teluguName,
          avatar: resolveAvatarUrl(data.photoURL || data.avatar, teluguName || name),
          coverImage: data.coverImage || data.coverImageUrl,
          bio: data.bio || '',
          teluguBio: data.teluguBio || data.bio || '',
          followersCount: data.followersCount || 0,
          storiesCount: data.publishedStoriesCount || data.publishedCount || data.storiesCount || 0,
          novelsCount: data.publishedNovelsCount || data.novelsCount || 0,
          jokesCount: data.jokesCount || 0,
          isVerified: data.role === 'writer' && data.status === 'active',
          isFollowing: isFollowed,
          joinedDate: data.createdAt instanceof Timestamp ? data.createdAt.toDate().getFullYear().toString() : '2026',
          location: data.location,
        };
      }
    } catch (err) {
      console.warn(`Error fetching author/user ${id} from Firestore:`, err);
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
    await setDoc(authorRef, sanitizeFirestoreData({
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
    }), { merge: true });
  }
}

export const authorService = new AuthorService();
