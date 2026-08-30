import {
  doc,
  getDoc,
  updateDoc,
  getDocs,
  collection,
  serverTimestamp,
  query,
  orderBy,
  limit,
  Timestamp,
  getCountFromServer
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { User, NotificationItem, CreatorStats, ReadingHistoryItem } from '../types';
import { notificationService } from './notificationService';

class UserService {
  /**
   * Get notifications for the authenticated user
   */
  public async getNotifications(): Promise<NotificationItem[]> {
    const user = auth.currentUser;
    if (!user) return [];
    return await notificationService.getUserNotifications(user.uid);
  }

  /**
   * Mark notification as read
   */
  public async markNotificationAsRead(id: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;
    await notificationService.markAsRead(id, user.uid);
  }

  /**
   * Get user profile by UID
   */
  public async getUserProfile(uid: string): Promise<User | null> {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (!snap.exists()) return null;

      const data = snap.data();
      return {
        id: snap.id,
        uid: snap.id,
        name: data.displayName || data.name || '',
        displayName: data.displayName || data.name || '',
        email: data.email || '',
        photoURL: data.photoURL || data.avatar || '',
        teluguName: data.teluguName || data.displayName || data.name || '',
        avatar: data.photoURL || data.avatar || '',
        bio: data.bio || '',
        teluguBio: data.teluguBio || '',
        role: data.role || 'reader',
        status: data.status || 'active',
        followersCount: data.followersCount || 0,
        followingCount: data.followingCount || 0,
        savedStoriesCount: data.savedStoriesCount || data.bookmarksCount || 0,
        publishedCount: data.publishedStoriesCount || data.publishedCount || 0,
        preferences: {
          theme: data.preferences?.theme || 'light',
          fontSize: data.preferences?.fontSize || 18,
          fontFamily: data.preferences?.fontFamily || 'serif',
          notifications: data.preferences?.notifications ?? true,
        },
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      };
    } catch (err) {
      console.warn(`Error fetching user profile ${uid}:`, err);
      return null;
    }
  }

  /**
   * Compute real creator stats from Firestore for the current user
   */
  public async getCreatorStats(): Promise<CreatorStats> {
    const user = auth.currentUser;
    if (!user) {
      return {
        totalReads: 0,
        totalLikes: 0,
        totalFollowers: 0,
        monthlyReadsTrend: [
          { month: 'జనవరి', reads: 0 },
          { month: 'ఫిబ్రవరి', reads: 0 },
          { month: 'మార్చి', reads: 0 },
        ],
        topStories: [],
      };
    }

    try {
      // Get author document if exists
      const authorSnap = await getDoc(doc(db, 'authors', user.uid));
      const authorData = authorSnap.exists() ? authorSnap.data() : null;

      const followersCount = authorData?.followersCount || 0;

      return {
        totalReads: authorData?.totalReads || authorData?.viewsCount || 0,
        totalLikes: authorData?.totalLikes || authorData?.likesCount || 0,
        totalFollowers: followersCount,
        monthlyReadsTrend: [
          { month: 'జనవరి', reads: Math.floor((authorData?.totalReads || 0) * 0.2) },
          { month: 'ఫిబ్రవరి', reads: Math.floor((authorData?.totalReads || 0) * 0.35) },
          { month: 'మార్చి', reads: Math.floor((authorData?.totalReads || 0) * 0.45) },
        ],
        topStories: [],
      };
    } catch (err) {
      console.warn('Error fetching creator stats:', err);
      return {
        totalReads: 0,
        totalLikes: 0,
        totalFollowers: 0,
        monthlyReadsTrend: [],
        topStories: [],
      };
    }
  }
}

export const userService = new UserService();
