import {
  addDoc,
  getDocs,
  collection,
  serverTimestamp,
  query,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { AdminAuditLog } from '../types';

export class AuditLogService {
  /**
   * Create an immutable audit log record
   * Path: adminAuditLogs/{logId}
   */
  public async logAction(logData: {
    action: string;
    targetType: 'writer_application' | 'story' | 'novel' | 'episode' | 'joke' | 'knowledge' | 'comment' | 'user' | 'category' | 'report' | 'contact' | 'system';
    targetId: string;
    targetTitle?: string;
    previousStatus?: string;
    newStatus?: string;
    reason?: string;
    metadata?: Record<string, any>;
  }): Promise<string> {
    const adminUser = auth.currentUser;
    const docRef = await addDoc(collection(db, 'adminAuditLogs'), {
      ...logData,
      adminUid: adminUser?.uid || 'system_admin',
      adminEmail: adminUser?.email || 'kathavahini@gmail.com',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  /**
   * Fetch audit logs for Super Admin dashboard
   */
  public async getAuditLogs(maxLimit: number = 100): Promise<AdminAuditLog[]> {
    try {
      const q = query(
        collection(db, 'adminAuditLogs'),
        orderBy('createdAt', 'desc'),
        limit(maxLimit)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          adminUid: data.adminUid || '',
          adminEmail: data.adminEmail || '',
          action: data.action || '',
          targetType: data.targetType || 'story',
          targetId: data.targetId || '',
          targetTitle: data.targetTitle || '',
          metadata: data.metadata || {},
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        };
      });
    } catch (err) {
      console.warn('Error fetching audit logs:', err);
      return [];
    }
  }
}

export const auditLogService = new AuditLogService();
