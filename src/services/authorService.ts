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
  private pickBestAvatar(uData: any, wData: any, aData?: any): string | undefined {
    const candidates = [
      uData?.photoURL,
      uData?.profileImageURL,
      uData?.avatar,
      wData?.photoURL,
      wData?.profileImageURL,
      wData?.avatar,
      aData?.photoURL,
      aData?.profileImageURL,
      aData?.avatar,
    ].filter((v): v is string => typeof v === 'string' && v.trim().length > 0 && !v.startsWith('blob:'));

    const custom = candidates.find(
      c => c.startsWith('data:image/') || (c.startsWith('http') && !c.includes('api.dicebear.com') && !c.includes('ui-avatars.com'))
    );
    return custom || candidates[0];
  }

  /**
   * Fetch all authors from top-level `writers` and `authors` collection
   */
  public async getAuthors(maxLimit: number = 50): Promise<Author[]> {
    try {
      const currentUid = auth.currentUser?.uid;

      // 1. Try querying verified writers + follower counts + user following in parallel
      const [writersSnap, followedIds, followerCounts] = await Promise.all([
        getDocs(query(collection(db, 'writers'), limit(maxLimit))),
        currentUid ? followingService.getUserFollowing(currentUid) : Promise.resolve([] as string[]),
        followingService.getAllFollowerCounts(),
      ]);

      if (!writersSnap.empty) {
        // Check companion users collection in case writer uploaded a custom profile image
        const usersMap = new Map<string, any>();
        try {
          const userDocs = await Promise.all(
            writersSnap.docs.map(d => getDoc(doc(db, 'users', d.id)).catch(() => null))
          );
          userDocs.forEach(ud => {
            if (ud?.exists()) {
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
          const candidateAvatar = this.pickBestAvatar(uData, data);
          const name = data.displayName || data.penName || data.name || uData.displayName || 'రచయిత';
          const teluguName = data.teluguName || uData.teluguName || data.penName || data.displayName || data.name || 'రచయిత';
          const realFollowers = Math.max(
            followerCounts[authorId] || 0,
            typeof data.followersCount === 'number' ? data.followersCount : 0,
            typeof uData.followersCount === 'number' ? uData.followersCount : 0
          );
          return {
            id: authorId,
            name,
            teluguName,
            avatar: resolveAvatarUrl(candidateAvatar, teluguName || name),
            coverImage: data.coverImage || data.coverImageUrl || uData.coverImage || uData.coverImageUrl,
            bio: data.bio || uData.bio || 'కథావాహిని అధికారిక రచయిత',
            teluguBio: data.teluguBio || data.bio || uData.teluguBio || uData.bio || 'కథావాహిని అధికారిక రచయిత',
            followersCount: realFollowers,
            storiesCount: data.publishedStoriesCount || data.storiesCount || uData.publishedStoriesCount || uData.publishedCount || 0,
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
        return snap.docs.map(d => {
          const data = d.data();
          const authorId = d.id;
          const name = data.name || data.displayName || '';
          const teluguName = data.teluguName || data.penName || data.displayName || data.name || '';
          const realFollowers = Math.max(
            followerCounts[authorId] || 0,
            typeof data.followersCount === 'number' ? data.followersCount : 0
          );
          return {
            id: authorId,
            name,
            teluguName,
            avatar: resolveAvatarUrl(data.photoURL || data.avatar, teluguName || name),
            coverImage: data.coverImage || data.coverImageUrl,
            bio: data.bio || '',
            teluguBio: data.teluguBio || data.bio || '',
            followersCount: realFollowers,
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
   * Merges writers/{id}, authors/{id}, and users/{id} in parallel with real follower count
   */
  public async getAuthorById(id: string): Promise<Author | undefined> {
    if (!id) return undefined;
    const currentUid = auth.currentUser?.uid;

    try {
      const [writerSnap, authorSnap, userSnap, isFollowed, followerCounts] = await Promise.all([
        getDoc(doc(db, 'writers', id)).catch(() => null),
        getDoc(doc(db, 'authors', id)).catch(() => null),
        getDoc(doc(db, 'users', id)).catch(() => null),
        currentUid ? followingService.isFollowing(id, currentUid) : Promise.resolve(false),
        followingService.getAllFollowerCounts(),
      ]);

      const wData = writerSnap?.exists() ? writerSnap.data() : null;
      const aData = authorSnap?.exists() ? authorSnap.data() : null;
      const uData = userSnap?.exists() ? userSnap.data() : null;

      if (wData || aData || uData) {
        const primary = wData || aData || uData || {};
        const name =
          wData?.displayName ||
          wData?.penName ||
          wData?.name ||
          uData?.displayName ||
          uData?.penName ||
          uData?.name ||
          aData?.name ||
          aData?.displayName ||
          'రచయిత';
        const teluguName =
          wData?.teluguName ||
          uData?.teluguName ||
          aData?.teluguName ||
          wData?.penName ||
          uData?.penName ||
          wData?.displayName ||
          uData?.displayName ||
          name;

        const candidateAvatar = this.pickBestAvatar(uData, wData, aData);
        const realFollowers = Math.max(
          followerCounts[id] || 0,
          typeof wData?.followersCount === 'number' ? wData.followersCount : 0,
          typeof aData?.followersCount === 'number' ? aData.followersCount : 0,
          typeof uData?.followersCount === 'number' ? uData.followersCount : 0
        );

        const createdAt = wData?.createdAt || aData?.createdAt || uData?.createdAt;

        return {
          id,
          name,
          teluguName,
          avatar: resolveAvatarUrl(candidateAvatar, teluguName || name),
          coverImage: wData?.coverImage || wData?.coverImageUrl || aData?.coverImage || uData?.coverImage,
          bio: wData?.bio || uData?.bio || aData?.bio || 'కథావాహిని రచయిత',
          teluguBio: wData?.teluguBio || wData?.bio || uData?.teluguBio || uData?.bio || aData?.teluguBio || aData?.bio || 'కథావాహిని రచయిత',
          followersCount: realFollowers,
          storiesCount:
            wData?.publishedStoriesCount ||
            wData?.storiesCount ||
            uData?.publishedStoriesCount ||
            uData?.publishedCount ||
            aData?.publishedStoriesCount ||
            aData?.storiesCount ||
            0,
          novelsCount: wData?.publishedNovelsCount || wData?.novelsCount || aData?.publishedNovelsCount || 0,
          jokesCount: primary.jokesCount || 0,
          isVerified: wData ? wData.verified !== false : (aData ? aData.isVerified !== false : (uData?.role === 'writer' && uData?.status === 'active')),
          isFollowing: isFollowed,
          joinedDate: createdAt instanceof Timestamp ? createdAt.toDate().getFullYear().toString() : '2026',
          location: wData?.location || uData?.location || aData?.location || 'ఆంధ్రప్రదేశ్ / తెలంగాణ',
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
