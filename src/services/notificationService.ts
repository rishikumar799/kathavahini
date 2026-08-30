import {
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { NotificationItem } from '../types';

export class NotificationService {
  /**
   * Fetch notifications for a user
   * Path: users/{uid}/notifications/{notificationId}
   */
  public async getUserNotifications(uid?: string, maxLimit: number = 30): Promise<NotificationItem[]> {
    const currentUid = uid || auth.currentUser?.uid;
    if (!currentUid) return [];

    try {
      const q = query(
        collection(db, 'users', currentUid, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(maxLimit)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(d => {
        const data = d.data();
        let timeStr = 'ఇప్పుడే';
        if (data.createdAt instanceof Timestamp) {
          timeStr = data.createdAt.toDate().toLocaleDateString('te-IN', { month: 'short', day: 'numeric' });
        } else if (data.time) {
          timeStr = data.time;
        }

        return {
          id: d.id,
          title: data.title || '',
          message: data.message || '',
          time: timeStr,
          read: data.read ?? false,
          type: data.type || 'system',
          linkId: data.linkId,
        };
      });
    } catch (err) {
      console.warn('Error fetching notifications:', err);
      return [];
    }
  }

  /**
   * Mark a notification as read
   */
  public async markAsRead(notificationId: string, uid?: string): Promise<void> {
    const currentUid = uid || auth.currentUser?.uid;
    if (!currentUid) return;

    try {
      await updateDoc(doc(db, 'users', currentUid, 'notifications', notificationId), {
        read: true,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Error marking notification as read:', err);
    }
  }

  /**
   * Send notification to a specific user
   */
  public async sendNotification(targetUid: string, notification: {
    title: string;
    message: string;
    type: 'story' | 'follower' | 'like' | 'system';
    linkId?: string;
  }): Promise<string> {
    const docRef = await addDoc(collection(db, 'users', targetUid, 'notifications'), {
      ...notification,
      read: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  /**
   * Delete a notification
   */
  public async deleteNotification(notificationId: string, uid?: string): Promise<void> {
    const currentUid = uid || auth.currentUser?.uid;
    if (!currentUid) return;

    await deleteDoc(doc(db, 'users', currentUid, 'notifications', notificationId));
  }
}

export const notificationService = new NotificationService();
