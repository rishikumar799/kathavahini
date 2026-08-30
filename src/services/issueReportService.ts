import {
  doc,
  getDocs,
  addDoc,
  updateDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { IssueReport } from '../types';

export class IssueReportService {
  /**
   * Submit an issue report
   * Path: issueReports/{reportId}
   */
  public async submitReport(report: Omit<IssueReport, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const user = auth.currentUser;
    const docRef = await addDoc(collection(db, 'issueReports'), {
      ...report,
      userId: user?.uid || report.userId || null,
      name: report.name || user?.displayName || 'అజ్ఞాత వినియోగదారుడు',
      email: report.email || user?.email || '',
      status: 'pending',
      priority: 'normal',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  /**
   * Get all issue reports (Admin)
   */
  public async getAllReports(maxLimit: number = 50): Promise<IssueReport[]> {
    try {
      const q = query(
        collection(db, 'issueReports'),
        orderBy('createdAt', 'desc'),
        limit(maxLimit)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          issueType: data.issueType || 'other',
          contentReference: data.contentReference || data.contentId || '',
          description: data.description || '',
          name: data.name || '',
          email: data.email || '',
          userId: data.userId,
          status: data.status || 'pending',
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        };
      });
    } catch (err) {
      console.warn('Error fetching issue reports:', err);
      return [];
    }
  }

  /**
   * Update report status (Admin)
   */
  public async updateReportStatus(reportId: string, status: 'pending' | 'reviewed' | 'resolved', adminNotes?: string): Promise<void> {
    const user = auth.currentUser;
    await updateDoc(doc(db, 'issueReports', reportId), {
      status,
      adminNotes: adminNotes || null,
      resolvedAt: status === 'resolved' ? serverTimestamp() : null,
      resolvedBy: status === 'resolved' ? (user?.uid || null) : null,
      updatedAt: serverTimestamp(),
    });
  }
}

export const issueReportService = new IssueReportService();
