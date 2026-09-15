import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  Timestamp
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../lib/firebase';
import {
  Announcement,
  AnnouncementAudience,
  AnnouncementStatus,
  AnnouncementPriority,
  AnnouncementFrequency,
  AnnouncementContentType,
  AnnouncementLayout,
  User
} from '../types';
import { auditLogService } from './auditLogService';

const COLLECTION_NAME = 'announcements';
const ADMIN_EMAIL = 'thekathavahini@gmail.com';

class AnnouncementService {
  /**
   * Strictly verify that the user is the Kathavahini Admin
   */
  public isAuthorizedAdmin(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'admin' && user.email === ADMIN_EMAIL;
  }

  private assertAdmin(user: User | null) {
    if (!this.isAuthorizedAdmin(user)) {
      throw new Error('అనధికార యాక్సెస్: ప్రకటనలను నిర్వహించడానికి కేవలం కథావాహిని అడ్మిన్‌కు (thekathavahini@gmail.com) మాత్రమే అనుమతి ఉంది.');
    }
  }

  /**
   * Helper to convert Firestore timestamp or string to milliseconds
   */
  private toMillis(ts: any): number {
    if (!ts) return 0;
    if (ts instanceof Timestamp) return ts.toMillis();
    if (typeof ts?.toDate === 'function') return ts.toDate().getTime();
    if (typeof ts === 'number') return ts;
    const parsed = new Date(ts).getTime();
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Get all announcements for the Admin CMS
   */
  public async getAllAnnouncements(
    statusFilter?: AnnouncementStatus | 'all',
    audienceFilter?: AnnouncementAudience | 'all'
  ): Promise<Announcement[]> {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const snap = await getDocs(colRef);

      let list: Announcement[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
        } as Announcement;
      });

      // Sort newest first
      list.sort((a, b) => this.toMillis(b.createdAt) - this.toMillis(a.createdAt));

      // Apply in-memory filters
      if (statusFilter && statusFilter !== 'all') {
        list = list.filter(item => item.status === statusFilter);
      }
      if (audienceFilter && audienceFilter !== 'all') {
        list = list.filter(item => item.audience === audienceFilter);
      }

      return list;
    } catch (err) {
      console.error('Error fetching announcements for admin:', err);
      return [];
    }
  }

  /**
   * Get active announcements for public website display
   * Strictly filters by:
   * 1. Status (published or scheduled whose time has arrived)
   * 2. Start Date & End Date
   * 3. Audience (Everyone, Readers only, Writers only, Readers + Writers)
   * 4. User Dismissal History (Session, Day, or Until Dismissed)
   * 5. Sorts by Priority (High > Normal > Low) then newest
   */
  public async getActiveAnnouncementsForUser(user: User | null): Promise<Announcement[]> {
    try {
      const now = Date.now();
      const colRef = collection(db, COLLECTION_NAME);
      const snap = await getDocs(colRef);

      const activeCandidates: Announcement[] = [];

      for (const d of snap.docs) {
        const item = { id: d.id, ...d.data() } as Announcement;

        // 1. Status Check
        if (item.status === 'draft' || item.status === 'hidden' || item.status === 'archived') {
          continue;
        }

        // Check Scheduled Time
        if (item.status === 'scheduled') {
          const scheduledTime = this.toMillis(item.scheduledAt || item.startAt);
          if (scheduledTime > 0 && scheduledTime > now) {
            // Future announcement, not yet active
            continue;
          }
        }

        // Check Start Time
        if (item.startAt) {
          const startTime = this.toMillis(item.startAt);
          if (startTime > 0 && startTime > now) {
            continue;
          }
        }

        // Check End Time (Expiration)
        if (item.endAt) {
          const endTime = this.toMillis(item.endAt);
          if (endTime > 0 && endTime <= now) {
            continue;
          }
        }

        // 2. Audience Check (Strictly per Specification 16)
        const isGuest = !user;
        const isReader = Boolean(user && user.role === 'reader');
        const isApprovedWriter = Boolean(user && user.role === 'writer' && user.status === 'active');
        const isAdminUser = Boolean(user && user.role === 'admin');

        let isAudienceMatched = false;

        switch (item.audience) {
          case 'everyone':
            // Guest ✓, Reader ✓, Approved Writer ✓, Admin ✓
            isAudienceMatched = true;
            break;

          case 'readers':
            // Guest ✗, Reader ✓, Approved Writer ✗, Pending Writer ✗, Banned ✗
            isAudienceMatched = isReader || isAdminUser;
            break;

          case 'writers':
            // Guest ✗, Reader ✗, Approved Writer ✓, Pending Writer ✗, Banned ✗
            isAudienceMatched = isApprovedWriter || isAdminUser;
            break;

          case 'readers_and_writers':
            // Guest ✗, Reader ✓, Approved Writer ✓, Pending Writer ✗
            isAudienceMatched = isReader || isApprovedWriter || isAdminUser;
            break;

          default:
            isAudienceMatched = false;
        }

        if (!isAudienceMatched) {
          continue;
        }

        // 3. Dismissal Check
        const isDismissed = await this.checkIfDismissed(item, user);
        if (isDismissed) {
          continue;
        }

        activeCandidates.push(item);
      }

      // 4. Priority and Date Sorting
      // High (3) > Normal (2) > Low (1)
      const priorityWeight = (p: AnnouncementPriority) => {
        if (p === 'high') return 3;
        if (p === 'normal') return 2;
        return 1;
      };

      activeCandidates.sort((a, b) => {
        const weightDiff = priorityWeight(b.priority) - priorityWeight(a.priority);
        if (weightDiff !== 0) return weightDiff;
        return this.toMillis(b.updatedAt || b.createdAt) - this.toMillis(a.updatedAt || a.createdAt);
      });

      return activeCandidates;
    } catch (err) {
      console.warn('Silent announcement fetch fallback:', err);
      return [];
    }
  }

  /**
   * Check if an announcement was previously dismissed according to its frequency policy
   */
  private async checkIfDismissed(item: Announcement, user: User | null): Promise<boolean> {
    const annId = item.id;
    const freq = item.displayFrequency || 'once_per_session';

    // A. Every visit: Only dismissed if dismissed during current view cycle
    if (freq === 'every_visit') {
      try {
        return sessionStorage.getItem(`kv_ann_dismissed_visit_${annId}`) === 'true';
      } catch {
        return false;
      }
    }

    // B. Once per session: Stored in sessionStorage
    if (freq === 'once_per_session') {
      try {
        return sessionStorage.getItem(`kv_ann_dismissed_${annId}`) === 'true';
      } catch {
        return false;
      }
    }

    // C. Once per day: Stored in localStorage with 24-hour expiration
    if (freq === 'once_per_day') {
      try {
        const storedTsStr = localStorage.getItem(`kv_ann_dismissed_day_${annId}`);
        if (!storedTsStr) return false;
        const storedTs = parseInt(storedTsStr, 10);
        if (isNaN(storedTs)) return false;
        const now = Date.now();
        // If dismissed less than 24 hours ago, treat as dismissed
        return now - storedTs < 24 * 60 * 60 * 1000;
      } catch {
        return false;
      }
    }

    // D. Until dismissed: Permanently until new announcement or version
    if (freq === 'until_dismissed') {
      // Check local storage first
      try {
        if (localStorage.getItem(`kv_ann_dismissed_perm_${annId}`) === 'true') {
          return true;
        }
      } catch {}

      // If user is authenticated, check Firestore user subcollection
      if (user && user.id) {
        try {
          const dismissedDocRef = doc(db, 'users', user.id, 'dismissedAnnouncements', annId);
          const snap = await getDoc(dismissedDocRef);
          if (snap.exists()) {
            return true;
          }
        } catch (err) {
          // If Firestore read fails, fall back to local storage
        }
      }

      return false;
    }

    return false;
  }

  /**
   * Record announcement dismissal based on frequency
   */
  public async recordDismissal(
    announcementId: string,
    user: User | null,
    frequency: AnnouncementFrequency = 'once_per_session'
  ): Promise<void> {
    const now = Date.now();

    try {
      if (frequency === 'every_visit') {
        sessionStorage.setItem(`kv_ann_dismissed_visit_${announcementId}`, 'true');
      } else if (frequency === 'once_per_session') {
        sessionStorage.setItem(`kv_ann_dismissed_${announcementId}`, 'true');
      } else if (frequency === 'once_per_day') {
        localStorage.setItem(`kv_ann_dismissed_day_${announcementId}`, now.toString());
      } else if (frequency === 'until_dismissed') {
        localStorage.setItem(`kv_ann_dismissed_perm_${announcementId}`, 'true');

        // Persist to user record in Firestore if authenticated
        if (user && user.id) {
          const dismissedDocRef = doc(db, 'users', user.id, 'dismissedAnnouncements', announcementId);
          await setDoc(dismissedDocRef, {
            announcementId,
            dismissedAt: serverTimestamp(),
          });
        }
      }

      // Record lightweight metric without blocking
      this.recordMetric(announcementId, 'dismissals').catch(() => {});
    } catch (err) {
      console.warn('Could not record announcement dismissal:', err);
    }
  }

  /**
   * Record click metric when a user clicks the announcement button or link
   */
  public async recordClick(announcementId: string): Promise<void> {
    this.recordMetric(announcementId, 'clicks').catch(() => {});
  }

  /**
   * Record impression metric
   */
  public async recordImpression(announcementId: string): Promise<void> {
    this.recordMetric(announcementId, 'impressions').catch(() => {});
  }

  private async recordMetric(announcementId: string, field: 'impressions' | 'dismissals' | 'clicks') {
    try {
      const docRef = doc(db, COLLECTION_NAME, announcementId);
      await updateDoc(docRef, {
        [`metrics.${field}`]: increment(1),
      });
    } catch {
      // Metrics are non-critical and should never break or block the user
    }
  }

  /**
   * Create Announcement (Admin only)
   */
  public async createAnnouncement(
    data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
    adminUser: User | null
  ): Promise<string> {
    this.assertAdmin(adminUser);

    const newDocRef = doc(collection(db, COLLECTION_NAME));
    const now = serverTimestamp();

    const payload: any = {
      title: data.title.trim(),
      message: (data.message || '').trim(),
      contentType: data.contentType || 'text_only',
      layout: data.layout || 'text_only',
      audience: data.audience || 'everyone',
      status: data.status || 'published',
      priority: data.priority || 'normal',
      displayDelaySeconds: typeof data.displayDelaySeconds === 'number' ? data.displayDelaySeconds : 3,
      displayFrequency: data.displayFrequency || 'once_per_session',
      createdBy: adminUser?.email || ADMIN_EMAIL,
      createdAt: now,
      updatedAt: now,
      metrics: {
        impressions: 0,
        dismissals: 0,
        clicks: 0,
      }
    };

    if (data.imageURL) payload.imageURL = data.imageURL;
    if (data.imageStoragePath) payload.imageStoragePath = data.imageStoragePath;
    if (data.imageAltText) payload.imageAltText = data.imageAltText.trim();
    if (data.buttonText) payload.buttonText = data.buttonText.trim();
    if (data.buttonURL) payload.buttonURL = data.buttonURL.trim();
    if (data.startAt) payload.startAt = data.startAt;
    if (data.endAt) payload.endAt = data.endAt;
    if (data.scheduledAt) payload.scheduledAt = data.scheduledAt;
    if (data.status === 'published') payload.publishedAt = now;

    await setDoc(newDocRef, payload);

    // Audit log
    await auditLogService.logAction({
      action: 'announcement_created',
      targetType: 'announcement',
      targetId: newDocRef.id,
      targetTitle: `Announcement: "${payload.title}" (${payload.audience})`,
      metadata: {
        performedBy: adminUser?.id || 'admin',
        performedByEmail: adminUser?.email || ADMIN_EMAIL,
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kathavahini:announcements-updated'));
    }

    return newDocRef.id;
  }

  /**
   * Update Announcement (Admin only)
   */
  public async updateAnnouncement(
    id: string,
    data: Partial<Announcement>,
    adminUser: User | null
  ): Promise<void> {
    this.assertAdmin(adminUser);

    const docRef = doc(db, COLLECTION_NAME, id);
    const updatePayload: any = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    // Remove immutable fields if present
    delete updatePayload.id;
    delete updatePayload.createdAt;
    delete updatePayload.createdBy;

    if (data.status === 'published' && !data.publishedAt) {
      updatePayload.publishedAt = serverTimestamp();
    }

    await updateDoc(docRef, updatePayload);

    await auditLogService.logAction({
      action: 'announcement_updated',
      targetType: 'announcement',
      targetId: id,
      targetTitle: `Updated announcement: "${data.title || id}"`,
      metadata: {
        performedBy: adminUser?.id || 'admin',
        performedByEmail: adminUser?.email || ADMIN_EMAIL,
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kathavahini:announcements-updated'));
    }
  }

  /**
   * Delete Announcement (Admin only)
   */
  public async deleteAnnouncement(
    id: string,
    imageStoragePath: string | undefined,
    adminUser: User | null
  ): Promise<void> {
    this.assertAdmin(adminUser);

    // Delete image from storage if path exists
    if (imageStoragePath) {
      try {
        const fileRef = ref(storage, imageStoragePath);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('Could not delete announcement image from storage:', err);
      }
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);

    await auditLogService.logAction({
      action: 'announcement_deleted',
      targetType: 'announcement',
      targetId: id,
      targetTitle: `Deleted announcement ID: ${id}`,
      metadata: {
        performedBy: adminUser?.id || 'admin',
        performedByEmail: adminUser?.email || ADMIN_EMAIL,
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kathavahini:announcements-updated'));
    }
  }

  /**
   * Toggle announcement status (Admin only)
   */
  public async setStatus(
    id: string,
    status: AnnouncementStatus,
    adminUser: User | null
  ): Promise<void> {
    this.assertAdmin(adminUser);

    const docRef = doc(db, COLLECTION_NAME, id);
    const updatePayload: any = {
      status,
      updatedAt: serverTimestamp(),
    };
    if (status === 'published') {
      updatePayload.publishedAt = serverTimestamp();
    }

    await updateDoc(docRef, updatePayload);

    await auditLogService.logAction({
      action: 'announcement_status_changed',
      targetType: 'announcement',
      targetId: id,
      targetTitle: `Announcement status changed to ${status}`,
      newStatus: status,
      metadata: {
        performedBy: adminUser?.id || 'admin',
        performedByEmail: adminUser?.email || ADMIN_EMAIL,
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kathavahini:announcements-updated'));
    }
  }
}

export const announcementService = new AnnouncementService();
