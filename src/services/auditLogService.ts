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
import { sanitizeFirestoreData } from '../utils/firestoreSanitizer';
import { AdminAuditLog } from '../types';

export class AuditLogService {
  /**
   * Create an immutable audit log record
   * Path: adminAuditLogs/{logId}
   */
  public async logAction(logData: {
    action: string;
    targetType: AdminAuditLog['targetType'];
    targetId: string;
    targetTitle?: string;
    previousStatus?: string;
    newStatus?: string;
    reason?: string;
    metadata?: Record<string, any>;
  }): Promise<string> {
    try {
      const adminUser = auth.currentUser;
      const cleanMetadata = logData.metadata ? sanitizeFirestoreData(logData.metadata) : undefined;
      
      const payload: Record<string, any> = {
        action: logData.action,
        targetType: logData.targetType,
        targetId: logData.targetId,
        adminUid: adminUser?.uid || 'system_admin',
        adminEmail: adminUser?.email || 'thekathavahini@gmail.com',
        createdAt: serverTimestamp(),
      };

      if (logData.targetTitle) payload.targetTitle = logData.targetTitle;
      if (logData.previousStatus) payload.previousStatus = logData.previousStatus;
      if (logData.newStatus) payload.newStatus = logData.newStatus;
      if (logData.reason) payload.reason = logData.reason;
      if (cleanMetadata && Object.keys(cleanMetadata).length > 0) {
        payload.metadata = cleanMetadata;
      }

      const cleanPayload = sanitizeFirestoreData(payload);
      const docRef = await addDoc(collection(db, 'adminAuditLogs'), cleanPayload);
      return docRef.id;
    } catch (err) {
      console.warn('[AuditLogService] Non-fatal audit log creation notice:', err);
      return `local-audit-${Date.now()}`;
    }
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
