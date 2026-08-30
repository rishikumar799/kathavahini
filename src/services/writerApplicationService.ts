import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  collection,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { WriterApplication } from '../types';

export class WriterApplicationService {
  /**
   * Submit a Writer Application
   * Path: writerApplications/{applicationId}
   */
  public async submitApplication(data: Omit<WriterApplication, 'id' | 'status' | 'submittedAt'>): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('రచయితగా దరఖాస్తు చేసుకోవడానికి ముందుగా లాగిన్ చేయండి.');
    }

    if (!data.bio?.trim()) {
      throw new Error('దయచేసి రచయిత పరిచయం / బయో రాయండి.');
    }
    if (!data.sampleText?.trim() && !data.sampleWriting?.trim()) {
      throw new Error('రచన యొక్క నమూనా (కనీసం 50 అక్షరాలు) రాయండి.');
    }
    if (!data.agreementAccepted) {
      throw new Error('రచయిత నియమ నిబంధనల ఒప్పందాన్ని తప్పనిసరిగా ఆమోదించాలి.');
    }

    const appPayload = {
      ...data,
      applicantUid: user.uid,
      email: user.email || data.email,
      fullName: data.fullName || user.displayName || '',
      penName: data.penName || data.displayName || data.fullName || '',
      sampleExcerpt: data.sampleText || data.sampleWriting || '',
      sampleWriting: data.sampleWriting || data.sampleText || '',
      sampleText: data.sampleText || data.sampleWriting || '',
      agreementAccepted: true,
      agreementVersion: data.agreementVersion || '1.0',
      agreementAcceptedAt: serverTimestamp(),
      agreementAcceptedByUid: user.uid,
      status: 'pending' as const,
      submittedAt: serverTimestamp(),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
      adminNotes: null,
    };

    const docRef = await addDoc(collection(db, 'writerApplications'), appPayload);
    return docRef.id;
  }

  /**
   * Get an application submitted by a specific user
   */
  public async getUserApplication(applicantUid: string): Promise<WriterApplication | null> {
    try {
      const q = query(
        collection(db, 'writerApplications'),
        where('applicantUid', '==', applicantUid),
        orderBy('submittedAt', 'desc'),
        limit(1)
      );
      const snap = await getDocs(q);

      if (snap.empty) return null;

      const d: any = snap.docs[0].data();
      return {
        id: snap.docs[0].id,
        applicantUid: d.applicantUid,
        applicantType: d.applicantType || 'new_registration',
        fullName: d.fullName || d.name || d.displayName || '',
        penName: d.penName || d.displayName || '',
        displayName: d.displayName || d.penName || d.fullName || '',
        email: d.email || '',
        mobileNumber: d.mobileNumber || d.phone,
        phone: d.phone || d.mobileNumber,
        username: d.username,
        city: d.city,
        bio: d.bio || '',
        writingExperience: d.writingExperience || d.experience || '',
        experience: d.experience || d.writingExperience || '',
        genres: d.genres || d.categories || [],
        categories: d.categories || d.genres || [],
        reasonForApplying: d.reasonForApplying || d.reason || '',
        reason: d.reason || d.reasonForApplying || '',
        sampleWriting: d.sampleWriting || d.sampleText || '',
        sampleText: d.sampleText || d.sampleWriting || '',
        agreementAccepted: d.agreementAccepted !== undefined ? d.agreementAccepted : true,
        agreementVersion: d.agreementVersion || '1.0',
        agreementAcceptedAt: d.agreementAcceptedAt instanceof Timestamp ? d.agreementAcceptedAt.toDate().toISOString() : d.agreementAcceptedAt,
        status: d.status || 'pending',
        submittedAt: d.submittedAt instanceof Timestamp ? d.submittedAt.toDate().toISOString() : d.submittedAt || new Date().toISOString(),
        reviewedAt: d.reviewedAt instanceof Timestamp ? d.reviewedAt.toDate().toISOString() : d.reviewedAt,
        reviewedBy: d.reviewedBy,
        rejectionReason: d.rejectionReason,
      };
    } catch (err) {
      console.warn(`Error getting user application for ${applicantUid}:`, err);
      return null;
    }
  }

  /**
   * Get all writer applications (for Admin dashboard)
   */
  public async getAllApplications(statusFilter?: 'pending' | 'approved' | 'rejected'): Promise<WriterApplication[]> {
    try {
      let q;
      if (statusFilter) {
        q = query(
          collection(db, 'writerApplications'),
          where('status', '==', statusFilter),
          orderBy('submittedAt', 'desc'),
          limit(100)
        );
      } else {
        q = query(
          collection(db, 'writerApplications'),
          orderBy('submittedAt', 'desc'),
          limit(100)
        );
      }

      const snap = await getDocs(q);
      return snap.docs.map(docSnap => {
        const d: any = docSnap.data();
        return {
          id: docSnap.id,
          applicantUid: d.applicantUid,
          applicantType: d.applicantType || 'new_registration',
          fullName: d.fullName || d.name || d.displayName || '',
          penName: d.penName || d.displayName || '',
          displayName: d.displayName || d.penName || d.fullName || '',
          email: d.email || '',
          mobileNumber: d.mobileNumber || d.phone,
          phone: d.phone || d.mobileNumber,
          username: d.username,
          city: d.city,
          bio: d.bio || '',
          writingExperience: d.writingExperience || d.experience || '',
          experience: d.experience || d.writingExperience || '',
          genres: d.genres || d.categories || [],
          categories: d.categories || d.genres || [],
          reasonForApplying: d.reasonForApplying || d.reason || '',
          reason: d.reason || d.reasonForApplying || '',
          sampleWriting: d.sampleWriting || d.sampleText || '',
          sampleText: d.sampleText || d.sampleWriting || '',
          agreementAccepted: d.agreementAccepted !== undefined ? d.agreementAccepted : true,
          agreementVersion: d.agreementVersion || '1.0',
          agreementAcceptedAt: d.agreementAcceptedAt instanceof Timestamp ? d.agreementAcceptedAt.toDate().toISOString() : d.agreementAcceptedAt,
          status: d.status || 'pending',
          submittedAt: d.submittedAt instanceof Timestamp ? d.submittedAt.toDate().toISOString() : d.submittedAt || new Date().toISOString(),
          reviewedAt: d.reviewedAt instanceof Timestamp ? d.reviewedAt.toDate().toISOString() : d.reviewedAt,
          reviewedBy: d.reviewedBy,
          rejectionReason: d.rejectionReason,
        };
      });
    } catch (err) {
      console.warn('Error fetching all applications:', err);
      return [];
    }
  }
}

export const writerApplicationService = new WriterApplicationService();
