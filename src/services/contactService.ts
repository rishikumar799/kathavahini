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
import { ContactSubmission } from '../types';

export class ContactService {
  /**
   * Submit a contact message
   * Path: contactSubmissions/{submissionId}
   */
  public async submitContactMessage(data: Omit<ContactSubmission, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const user = auth.currentUser;
    const docRef = await addDoc(collection(db, 'contactSubmissions'), {
      ...data,
      userId: user?.uid || data.userId || null,
      status: 'unread',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  /**
   * Get all contact submissions (Admin)
   */
  public async getAllSubmissions(maxLimit: number = 50): Promise<ContactSubmission[]> {
    try {
      const q = query(
        collection(db, 'contactSubmissions'),
        orderBy('createdAt', 'desc'),
        limit(maxLimit)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || '',
          email: data.email || '',
          subject: data.subject || '',
          message: data.message || '',
          userId: data.userId,
          status: data.status || 'unread',
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        };
      });
    } catch (err) {
      console.warn('Error fetching contact submissions:', err);
      return [];
    }
  }

  /**
   * Mark submission as read / replied (Admin)
   */
  public async updateSubmissionStatus(submissionId: string, status: 'unread' | 'read' | 'resolved'): Promise<void> {
    const user = auth.currentUser;
    await updateDoc(doc(db, 'contactSubmissions', submissionId), {
      status,
      handledBy: user?.uid || null,
      updatedAt: serverTimestamp(),
    });
  }
}

export const contactService = new ContactService();
