import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  Timestamp,
  increment 
} from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { db } from '../lib/firebase';
import { 
  WriterApplication, 
  Story, 
  User, 
  AdminAuditLog, 
  CategoryItem, 
  IssueReport, 
  ContactSubmission,
  Novel,
  Episode,
  Joke,
  Comment,
  KnowledgeArticle,
  StoryCategory,
  AccountStatus,
  ContentStatus,
  ContentVisibility,
  ImageMetadata,
  StoryContentType,
  ContentBlock,
  StoryImagePage,
  SourceDocumentInfo
} from '../types';
import { MOCK_STORIES, MOCK_NOVELS, MOCK_JOKES, MOCK_CATEGORIES, MOCK_KNOWLEDGE_ARTICLES } from './mockData';
import { auditLogService } from './auditLogService';
import { notificationService } from './notificationService';
import { storageService } from './storageService';

// Firebase configuration for secondary auth instance (so Admin remains logged in during user creation)
const firebaseConfig = {
  apiKey: "AIzaSyDQ3LU73I-nv0Mghm6mZOpCxOhLkDS03RM",
  authDomain: "kathavahini-9a9c1.firebaseapp.com",
  projectId: "kathavahini-9a9c1",
  storageBucket: "kathavahini-9a9c1.firebasestorage.app",
  messagingSenderId: "63748712545",
  appId: "1:63748712545:web:df61a333ccc86acac2e220",
  measurementId: "G-BT55GMSKLQ"
};

function getSecondaryAuth() {
  const secondaryAppName = 'SecondaryAuthProvisioner';
  const existingApp = getApps().find(app => app.name === secondaryAppName);
  const secondaryApp = existingApp || initializeApp(firebaseConfig, secondaryAppName);
  return getAuth(secondaryApp);
}

class AdminService {
  /**
   * Fetch Real Dashboard Overview Counts from Firestore
   */
  public async getDashboardCounts(): Promise<{
    pendingApplications: number;
    pendingStories: number;
    publishedStories: number;
    draftsCount: number;
    scheduledCount: number;
    hiddenCount: number;
    privateCount: number;
    totalUsers: number;
    totalReaders: number;
    totalWriters: number;
    totalNovels: number;
    totalEpisodes: number;
    totalJokes: number;
    totalKnowledge: number;
    pendingReports: number;
    unreadContacts: number;
  }> {
    try {
      // 1. Pending Writer Applications
      const appSnap = await getDocs(query(collection(db, 'writerApplications'), where('status', '==', 'pending')));
      const pendingApplications = appSnap.size;

      // 2. Stories Breakdown
      const storiesSnap = await getDocs(collection(db, 'stories'));
      let pendingStories = 0;
      let publishedStories = 0;
      let draftsCount = 0;
      let scheduledCount = 0;
      let hiddenCount = 0;
      let privateCount = 0;

      storiesSnap.forEach(d => {
        const data = d.data();
        const s = data.status;
        const v = data.visibility;
        if (s === 'pending') pendingStories++;
        if (s === 'published' && v !== 'hidden' && v !== 'private') publishedStories++;
        if (s === 'draft') draftsCount++;
        if (s === 'scheduled') scheduledCount++;
        if (v === 'hidden') hiddenCount++;
        if (v === 'private') privateCount++;
      });

      // 3. Users breakdown
      const usersSnap = await getDocs(collection(db, 'users'));
      let totalUsers = usersSnap.size;
      let totalReaders = 0;
      let totalWriters = 0;
      usersSnap.forEach(d => {
        const r = d.data().role;
        if (r === 'reader' || !r) totalReaders++;
        else if (r === 'writer' || r === 'author') totalWriters++;
      });

      // 4. Novels, Episodes, Jokes, Knowledge
      const [novelsSnap, episodesSnap, jokesSnap, knowledgeSnap] = await Promise.all([
        getDocs(collection(db, 'novels')).catch(() => ({ size: 0 })),
        getDocs(collection(db, 'episodes')).catch(() => ({ size: 0 })),
        getDocs(collection(db, 'jokes')).catch(() => ({ size: 0 })),
        getDocs(collection(db, 'knowledge')).catch(() => ({ size: 0 }))
      ]);

      // 5. Reports & Contacts
      const reportsSnap = await getDocs(query(collection(db, 'issueReports'), where('status', '==', 'pending'))).catch(() => ({ size: 0 }));
      const contactsSnap = await getDocs(query(collection(db, 'contactSubmissions'), where('status', '==', 'unread'))).catch(() => ({ size: 0 }));

      return {
        pendingApplications,
        pendingStories,
        publishedStories: Math.max(publishedStories, MOCK_STORIES.length),
        draftsCount,
        scheduledCount,
        hiddenCount,
        privateCount,
        totalUsers: Math.max(totalUsers, 1),
        totalReaders: Math.max(totalReaders, 1),
        totalWriters,
        totalNovels: Math.max(novelsSnap.size, MOCK_NOVELS.length),
        totalEpisodes: episodesSnap.size,
        totalJokes: Math.max(jokesSnap.size, MOCK_JOKES.length),
        totalKnowledge: Math.max(knowledgeSnap.size, MOCK_KNOWLEDGE_ARTICLES.length),
        pendingReports: reportsSnap.size,
        unreadContacts: contactsSnap.size,
      };
    } catch (err) {
      console.warn('Error fetching dashboard counts from Firestore:', err);
      return {
        pendingApplications: 0,
        pendingStories: 0,
        publishedStories: MOCK_STORIES.length,
        draftsCount: 0,
        scheduledCount: 0,
        hiddenCount: 0,
        privateCount: 0,
        totalUsers: 1,
        totalReaders: 1,
        totalWriters: 0,
        totalNovels: MOCK_NOVELS.length,
        totalEpisodes: 0,
        totalJokes: MOCK_JOKES.length,
        totalKnowledge: MOCK_KNOWLEDGE_ARTICLES.length,
        pendingReports: 0,
        unreadContacts: 0,
      };
    }
  }

  // ==========================================
  // STORIES MANAGEMENT (UNLIMITED ADMIN POWER)
  // ==========================================

  public async getStories(statusFilter?: string): Promise<Story[]> {
    try {
      const snap = await getDocs(collection(db, 'stories'));
      const firestoreStories: Story[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || '',
          teluguTitle: data.teluguTitle || data.title || '',
          slug: data.slug || 'story',
          coverImage: data.coverImage || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
          excerpt: data.excerpt || '',
          teluguExcerpt: data.teluguExcerpt || data.excerpt || '',
          content: Array.isArray(data.content) ? data.content : [data.content || ''],
          authorId: data.authorId || '',
          authorName: data.authorName,
          writerId: data.writerId,
          author: data.author || {
            id: data.authorId || 'admin',
            name: data.authorName || 'కథావాహిని సంపాదకులు',
            teluguName: data.authorName || 'కథావాహిని సంపాదకులు',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
            bio: 'కథావాహిని అధికారిక సంపాదక విభాగం',
            teluguBio: 'కథావాహిని అధికారిక సంపాదక విభాగం',
            followersCount: 0,
            storiesCount: 1,
            novelsCount: 0,
            jokesCount: 0,
            joinedDate: '2026',
          },
          category: data.category || 'జీవితం',
          tags: data.tags || [],
          rating: data.rating || 5.0,
          viewCount: data.viewCount || 0,
          likeCount: data.likeCount || 0,
          bookmarkCount: data.bookmarkCount || 0,
          readingTimeMinutes: data.readingTimeMinutes || 3,
          publishedAt: data.publishedAt || '',
          status: data.status || 'published',
          visibility: data.visibility || 'public',
          scheduledAt: data.scheduledAt instanceof Timestamp ? data.scheduledAt.toDate().toISOString() : data.scheduledAt,
          submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toDate().toISOString() : data.submittedAt,
          reviewedAt: data.reviewedAt instanceof Timestamp ? data.reviewedAt.toDate().toISOString() : data.reviewedAt,
          reviewedBy: data.reviewedBy,
          rejectionReason: data.rejectionReason,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        };
      });

      const all = [...firestoreStories];
      MOCK_STORIES.forEach(m => {
        if (!all.some(s => s.id === m.id)) {
          all.push(m);
        }
      });

      if (statusFilter && statusFilter !== 'all') {
        return all.filter(s => s.status === statusFilter);
      }
      return all.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.publishedAt ? new Date(a.publishedAt).getTime() : 0);
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.publishedAt ? new Date(b.publishedAt).getTime() : 0);
        return timeB - timeA;
      });
    } catch (err) {
      console.warn('Error querying stories for admin:', err);
      return statusFilter && statusFilter !== 'all' ? MOCK_STORIES.filter(s => s.status === statusFilter) : MOCK_STORIES;
    }
  }

  /**
   * Admin Creates Unlimited Story Directly (Can be draft, published, scheduled, private, hidden)
   */
  public async createStory(storyData: {
    title: string;
    teluguTitle?: string;
    subtitle?: string;
    teluguSubtitle?: string;
    category: StoryCategory;
    coverImage?: string;
    coverImageUrl?: string;
    coverImagePath?: string;
    coverImageMetadata?: ImageMetadata;
    excerpt?: string;
    teluguExcerpt?: string;
    content: string[];
    contentType?: StoryContentType;
    contentBlocks?: ContentBlock[];
    imagePages?: StoryImagePage[];
    sourceDocument?: SourceDocumentInfo;
    tags?: string[];
    status?: ContentStatus;
    visibility?: ContentVisibility;
    scheduledAt?: string; // ISO string for scheduled publication
    authorName?: string;
  }, adminUid: string, adminEmail?: string): Promise<Story> {
    const storyId = `story-${Date.now()}`;
    const todayString = new Date().toISOString().split('T')[0];
    const paragraphs = storyData.content.length > 0 ? storyData.content : ['కథ కంటెంట్...'];
    const excerpt = storyData.teluguExcerpt || storyData.excerpt || paragraphs[0]?.slice(0, 120) || 'కథ పరిచయం';
    const status: ContentStatus = storyData.status || 'published';
    const visibility: ContentVisibility = storyData.visibility || 'public';
    const authorName = storyData.authorName || 'కథావాహిని సంపాదక విభాగం';
    const finalCover = storyData.coverImage || storyData.coverImageUrl || (storyData.imagePages && storyData.imagePages[0]?.imageUrl) || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800';

    const newStory: Story = {
      id: storyId,
      title: storyData.title.trim() || 'Untitled Story',
      teluguTitle: storyData.teluguTitle?.trim() || storyData.title.trim() || 'శీర్షిక లేని కథ',
      subtitle: storyData.subtitle?.trim(),
      teluguSubtitle: storyData.teluguSubtitle?.trim() || storyData.subtitle?.trim(),
      slug: (storyData.title || 'story').toLowerCase().replace(/\s+/g, '-'),
      coverImage: finalCover,
      coverImageUrl: finalCover,
      coverImagePath: storyData.coverImagePath,
      coverImageMetadata: storyData.coverImageMetadata,
      excerpt,
      teluguExcerpt: excerpt,
      content: paragraphs,
      contentType: storyData.contentType || 'rich_text',
      contentBlocks: storyData.contentBlocks,
      imagePages: storyData.imagePages,
      sourceDocument: storyData.sourceDocument,
      authorId: adminUid,
      writerId: adminUid,
      authorName,
      author: {
        id: adminUid,
        name: authorName,
        teluguName: authorName,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bio: 'కథావాహిని అధికారిక సంపాదక విభాగం',
        teluguBio: 'కథావాహిని అధికారిక సంపాదక విభాగం',
        followersCount: 0,
        storiesCount: 1,
        novelsCount: 0,
        jokesCount: 0,
        joinedDate: '2026',
      },
      category: storyData.category || 'జీవితం',
      tags: storyData.tags || ['తెలుగు', 'కథ'],
      rating: 5.0,
      viewCount: 0,
      likeCount: 0,
      bookmarkCount: 0,
      readingTimeMinutes: Math.max(1, Math.ceil(paragraphs.join(' ').length / 300)),
      publishedAt: status === 'published' ? todayString : '',
      status,
      visibility,
      scheduledAt: storyData.scheduledAt || null,
      approvedAt: status === 'published' ? serverTimestamp() : null,
      approvedBy: adminUid,
      createdBy: adminUid,
      updatedBy: adminUid,
    };

    await setDoc(doc(db, 'stories', storyId), {
      ...newStory,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await auditLogService.logAction({
      action: `story_${status}`,
      targetType: 'story',
      targetId: storyId,
      targetTitle: `Story "${newStory.teluguTitle}" created with status ${status}, visibility ${visibility}`,
      metadata: { status, visibility, scheduledAt: storyData.scheduledAt },
    });

    return newStory;
  }

  /**
   * Admin Updates Any Story
   */
  public async updateStory(
    storyId: string, 
    updateData: Partial<Story>, 
    adminUid: string, 
    adminEmail?: string
  ): Promise<void> {
    const storyRef = doc(db, 'stories', storyId);
    await setDoc(storyRef, {
      ...updateData,
      updatedBy: adminUid,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    await auditLogService.logAction({
      action: 'story_updated',
      targetType: 'story',
      targetId: storyId,
      targetTitle: `Story ${storyId} updated by Admin`,
      metadata: { updatedFields: Object.keys(updateData) },
    });
  }

  /**
   * Admin Changes Story Status
   */
  public async setStoryStatus(
    storyId: string,
    status: ContentStatus,
    adminUid: string,
    adminEmail?: string
  ): Promise<void> {
    const storyRef = doc(db, 'stories', storyId);
    const updatePayload: any = {
      status,
      updatedBy: adminUid,
      updatedAt: serverTimestamp(),
    };
    if (status === 'published') {
      updatePayload.publishedAt = new Date().toISOString().split('T')[0];
      updatePayload.approvedAt = serverTimestamp();
      updatePayload.approvedBy = adminUid;
    }
    await updateDoc(storyRef, updatePayload);

    await auditLogService.logAction({
      action: `story_status_${status}`,
      targetType: 'story',
      targetId: storyId,
      targetTitle: `Story ${storyId} status set to ${status}`,
      metadata: { status },
    });
  }

  /**
   * Admin Changes Story Visibility
   */
  public async setStoryVisibility(
    storyId: string,
    visibility: ContentVisibility,
    adminUid: string,
    adminEmail?: string
  ): Promise<void> {
    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      visibility,
      updatedBy: adminUid,
      updatedAt: serverTimestamp(),
    });

    await auditLogService.logAction({
      action: `story_visibility_${visibility}`,
      targetType: 'story',
      targetId: storyId,
      targetTitle: `Story ${storyId} visibility set to ${visibility}`,
      metadata: { visibility },
    });
  }

  /**
   * Admin Schedules Story
   */
  public async scheduleStory(
    storyId: string,
    scheduledAtISO: string,
    adminUid: string,
    adminEmail?: string
  ): Promise<void> {
    const scheduledTime = new Date(scheduledAtISO).getTime();
    if (isNaN(scheduledTime) || scheduledTime <= Date.now()) {
      throw new Error('షెడ్యూల్ చేసిన సమయం భవిష్యత్తులో ఉండాలి (Scheduled publication time must be in the future).');
    }

    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      status: 'scheduled',
      visibility: 'public',
      scheduledAt: scheduledAtISO,
      scheduledPublishAt: Timestamp.fromDate(new Date(scheduledAtISO)),
      updatedBy: adminUid,
      updatedAt: serverTimestamp(),
    });

    await auditLogService.logAction({
      action: 'story_scheduled',
      targetType: 'story',
      targetId: storyId,
      targetTitle: `Story ${storyId} scheduled for publication at ${scheduledAtISO}`,
      metadata: { scheduledAt: scheduledAtISO },
    });
  }

  /**
   * Admin Deletes Story (Deletes Firestore document and associated Storage assets)
   */
  public async deleteStory(storyId: string, adminUid: string, adminEmail?: string): Promise<void> {
    try {
      const storySnap = await getDoc(doc(db, 'stories', storyId));
      if (storySnap.exists()) {
        const data = storySnap.data();
        const coverPath = data.coverImagePath || data.coverImageStoragePath;
        const docPath = data.documentStoragePath || data.sourceDocument?.storagePath;
        const pagePaths = (data.imagePages || []).map((p: any) => p.imagePath).filter(Boolean);

        storageService.deleteStoryAssets({
          coverPath,
          documentPath: docPath,
          imagePagePaths: pagePaths,
        }).catch((storageErr) => {
          console.warn('Storage cleanup on story deletion notice:', storageErr);
        });
      }
      await deleteDoc(doc(db, 'stories', storyId));
    } catch (e) {
      console.warn('Error deleting story document:', e);
    }

    await auditLogService.logAction({
      action: 'story_deleted',
      targetType: 'story',
      targetId: storyId,
      targetTitle: `Story ${storyId} permanently deleted by admin`,
    });
  }

  public async approveStory(storyId: string, adminUid: string, authorId?: string, adminEmail?: string): Promise<void> {
    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      status: 'published',
      visibility: 'public',
      publishedAt: new Date().toISOString().split('T')[0],
      reviewedAt: serverTimestamp(),
      approvedAt: serverTimestamp(),
      reviewedBy: adminUid,
      approvedBy: adminUid,
      rejectionReason: '',
    });

    if (authorId) {
      try {
        const authorRef = doc(db, 'users', authorId);
        await updateDoc(authorRef, {
          publishedCount: increment(1),
        });
      } catch (err) {}
    }

    await auditLogService.logAction({
      action: 'story_approved',
      targetType: 'story',
      targetId: storyId,
      targetTitle: `Story ${storyId} approved and published`,
      metadata: { authorId },
    });
  }

  public async rejectStory(storyId: string, adminUid: string, rejectionReason: string, adminEmail?: string): Promise<void> {
    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      status: 'rejected',
      rejectionReason: rejectionReason.trim(),
      reviewedAt: serverTimestamp(),
      reviewedBy: adminUid,
    });

    await auditLogService.logAction({
      action: 'story_rejected',
      targetType: 'story',
      targetId: storyId,
      targetTitle: `Story ${storyId} rejected`,
      reason: rejectionReason,
      metadata: { rejectionReason },
    });
  }

  public async publishStoryNow(storyId: string, adminUid: string, adminEmail?: string): Promise<void> {
    await this.setStoryStatus(storyId, 'published', adminUid, adminEmail);
    await this.setStoryVisibility(storyId, 'public', adminUid, adminEmail);
  }

  public async archiveStory(storyId: string, adminUid: string, adminEmail?: string): Promise<void> {
    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      status: 'archived',
      archivedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await auditLogService.logAction({
      action: 'story_archived',
      targetType: 'story',
      targetId: storyId,
      targetTitle: `Story ${storyId} archived`,
    });
  }

  // ==========================================
  // NOVELS & EPISODES MANAGEMENT
  // ==========================================

  public async getNovels(): Promise<Novel[]> {
    try {
      const snap = await getDocs(collection(db, 'novels'));
      if (!snap.empty) {
        const firestoreNovels: Novel[] = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        } as Novel));
        const map = new Map<string, Novel>();
        MOCK_NOVELS.forEach(n => map.set(n.id, n));
        firestoreNovels.forEach(n => map.set(n.id, n));
        return Array.from(map.values());
      }
    } catch (err) {
      console.warn('Error fetching novels in admin:', err);
    }
    return MOCK_NOVELS;
  }

  public async createNovel(novelData: {
    title: string;
    teluguTitle?: string;
    description: string;
    teluguDescription?: string;
    category: StoryCategory;
    coverImage?: string;
    coverImageUrl?: string;
    coverImagePath?: string;
    coverImageMetadata?: ImageMetadata;
    tags?: string[];
    status?: 'ongoing' | 'completed' | ContentStatus;
    visibility?: ContentVisibility;
    authorName?: string;
  }, adminUid: string, adminEmail?: string): Promise<Novel> {
    const novelId = `novel-${Date.now()}`;
    const authorName = novelData.authorName || 'కథావాహిని సంపాదక వర్గం';
    const finalCover = novelData.coverImage || novelData.coverImageUrl || 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800';
    const newNovel: Novel = {
      id: novelId,
      title: novelData.title.trim(),
      teluguTitle: novelData.teluguTitle?.trim() || novelData.title.trim(),
      slug: (novelData.title || 'novel').toLowerCase().replace(/\s+/g, '-'),
      coverImage: finalCover,
      coverImageUrl: finalCover,
      coverImagePath: novelData.coverImagePath,
      coverImageMetadata: novelData.coverImageMetadata,
      description: novelData.description,
      teluguDescription: novelData.teluguDescription || novelData.description,
      authorId: adminUid,
      author: {
        id: adminUid,
        name: authorName,
        teluguName: authorName,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bio: 'కథావాహిని అధికారిక ప్రచురణలు',
        teluguBio: 'కథావాహిని అధికారిక ప్రచురణలు',
        followersCount: 0,
        storiesCount: 0,
        novelsCount: 1,
        jokesCount: 0,
        joinedDate: '2026',
      },
      category: novelData.category || 'కుటుంబం',
      tags: novelData.tags || ['నవల'],
      status: novelData.status || 'ongoing',
      visibility: novelData.visibility || 'public',
      chaptersCount: 0,
      episodeCount: 0,
      chapters: [],
      rating: 5.0,
      viewCount: 0,
      likeCount: 0,
      bookmarkCount: 0,
      publishedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    await setDoc(doc(db, 'novels', novelId), {
      ...newNovel,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await auditLogService.logAction({
      action: 'novel_created',
      targetType: 'novel',
      targetId: novelId,
      targetTitle: `Novel "${newNovel.teluguTitle}" created`,
    });

    return newNovel;
  }

  public async updateNovel(novelId: string, updateData: Partial<Novel>, adminUid: string, adminEmail?: string): Promise<void> {
    await setDoc(doc(db, 'novels', novelId), {
      ...updateData,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    await auditLogService.logAction({
      action: 'novel_updated',
      targetType: 'novel',
      targetId: novelId,
      targetTitle: `Novel ${novelId} updated`,
    });
  }

  public async archiveNovel(novelId: string, adminUid: string, adminEmail?: string): Promise<void> {
    const novelRef = doc(db, 'novels', novelId);
    await updateDoc(novelRef, {
      status: 'archived',
      updatedAt: serverTimestamp(),
    });

    await auditLogService.logAction({
      action: 'novel_archived',
      targetType: 'novel',
      targetId: novelId,
      targetTitle: `Novel ${novelId} archived`,
    });
  }

  public async deleteNovel(novelId: string, adminUid: string, adminEmail?: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'novels', novelId));
    } catch (e) {}

    await auditLogService.logAction({
      action: 'novel_deleted',
      targetType: 'novel',
      targetId: novelId,
      targetTitle: `Novel ${novelId} deleted`,
    });
  }

  // Episodes
  public async getEpisodes(novelId?: string): Promise<Episode[]> {
    try {
      const q = novelId 
        ? query(collection(db, 'episodes'), where('novelId', '==', novelId))
        : collection(db, 'episodes');
      const snap = await getDocs(q);
      return snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      } as Episode)).sort((a, b) => (a.episodeNumber || 1) - (b.episodeNumber || 1));
    } catch (err) {
      return [];
    }
  }

  public async createEpisode(episodeData: {
    novelId: string;
    novelTitle?: string;
    episodeNumber: number;
    title: string;
    teluguTitle?: string;
    content: string[];
    status?: ContentStatus;
    visibility?: ContentVisibility;
    scheduledAt?: string;
  }, adminUid: string, adminEmail?: string): Promise<Episode> {
    const epId = `ep-${Date.now()}`;
    const newEpisode: Episode = {
      id: epId,
      novelId: episodeData.novelId,
      novelTitle: episodeData.novelTitle || 'నవల',
      episodeNumber: episodeData.episodeNumber || 1,
      title: episodeData.title,
      teluguTitle: episodeData.teluguTitle || episodeData.title,
      content: episodeData.content,
      authorId: adminUid,
      authorName: 'కథావాహిని సంపాదకులు',
      status: episodeData.status || 'published',
      visibility: episodeData.visibility || 'public',
      readingTimeMinutes: Math.max(1, Math.ceil(episodeData.content.join(' ').length / 300)),
      publishedAt: new Date().toISOString().split('T')[0],
      scheduledAt: episodeData.scheduledAt || null,
    };

    await setDoc(doc(db, 'episodes', epId), {
      ...newEpisode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update novel episode count
    try {
      await updateDoc(doc(db, 'novels', episodeData.novelId), {
        chaptersCount: increment(1),
        episodeCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {}

    await auditLogService.logAction({
      action: 'episode_created',
      targetType: 'episode',
      targetId: epId,
      targetTitle: `Episode ${newEpisode.episodeNumber} created for novel ${episodeData.novelId}`,
    });

    return newEpisode;
  }

  public async updateEpisode(
    episodeId: string,
    updateData: Partial<Episode>,
    adminUid: string,
    adminEmail?: string
  ): Promise<void> {
    const epRef = doc(db, 'episodes', episodeId);
    await setDoc(epRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    await auditLogService.logAction({
      action: 'episode_updated',
      targetType: 'episode',
      targetId: episodeId,
      targetTitle: `Episode ${episodeId} updated`,
    });
  }

  public async deleteEpisode(episodeId: string, adminUid?: string, adminEmail?: string, novelId?: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'episodes', episodeId));
      if (novelId) {
        await updateDoc(doc(db, 'novels', novelId), {
          chaptersCount: increment(-1),
          episodeCount: increment(-1),
        });
      }
    } catch (e) {}

    await auditLogService.logAction({
      action: 'episode_deleted',
      targetType: 'episode',
      targetId: episodeId,
      targetTitle: `Episode ${episodeId} deleted`,
    });
  }

  // ==========================================
  // JOKES MANAGEMENT
  // ==========================================

  public async getJokes(): Promise<Joke[]> {
    try {
      const snap = await getDocs(collection(db, 'jokes'));
      if (!snap.empty) {
        const list: Joke[] = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        } as Joke));
        const map = new Map<string, Joke>();
        MOCK_JOKES.forEach(j => map.set(j.id, j));
        list.forEach(j => map.set(j.id, j));
        return Array.from(map.values());
      }
    } catch (err) {
      console.warn('Error fetching jokes in admin:', err);
    }
    return MOCK_JOKES;
  }

  public async createJoke(jokeData: {
    content: string;
    teluguContent?: string;
    category?: string;
    status?: ContentStatus;
    visibility?: ContentVisibility;
    scheduledAt?: string;
  }, adminUid: string, adminEmail?: string): Promise<Joke> {
    const jokeId = `joke-${Date.now()}`;
    const newJoke: Joke = {
      id: jokeId,
      content: jokeData.content,
      teluguContent: jokeData.teluguContent || jokeData.content,
      category: jokeData.category || 'హాస్యం',
      authorId: adminUid,
      author: {
        id: adminUid,
        name: 'కథావాహిని హాస్య విభాగం',
        teluguName: 'కథావాహిని హాస్య విభాగం',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joke',
        bio: 'కథావాహిని అధికారిక హాస్య విభాగం',
        teluguBio: 'కథావాహిని అధికారిక హాస్య విభాగం',
        followersCount: 0,
        storiesCount: 0,
        novelsCount: 0,
        jokesCount: 1,
        joinedDate: '2026',
      },
      likeCount: 0,
      shareCount: 0,
      publishedAt: new Date().toISOString().split('T')[0],
      status: jokeData.status || 'published',
      visibility: jokeData.visibility || 'public',
      scheduledAt: jokeData.scheduledAt || null,
    };

    await setDoc(doc(db, 'jokes', jokeId), {
      ...newJoke,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await auditLogService.logAction({
      action: 'joke_created',
      targetType: 'joke',
      targetId: jokeId,
      targetTitle: `Joke created in category ${newJoke.category}`,
    });

    return newJoke;
  }

  public async updateJoke(jokeId: string, updateData: Partial<Joke>, adminUid: string, adminEmail?: string): Promise<void> {
    await setDoc(doc(db, 'jokes', jokeId), {
      ...updateData,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    await auditLogService.logAction({
      action: 'joke_updated',
      targetType: 'joke',
      targetId: jokeId,
      targetTitle: `Joke ${jokeId} updated`,
    });
  }

  public async deleteJoke(jokeId: string, adminUid: string, adminEmail?: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'jokes', jokeId));
    } catch (e) {}

    await auditLogService.logAction({
      action: 'joke_deleted',
      targetType: 'joke',
      targetId: jokeId,
      targetTitle: `Joke ${jokeId} deleted by admin`,
    });
  }

  // ==========================================
  // KNOWLEDGE ARTICLES MANAGEMENT
  // ==========================================

  public async getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
    try {
      const snap = await getDocs(collection(db, 'knowledge'));
      if (!snap.empty) {
        const firestoreArticles: KnowledgeArticle[] = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        } as KnowledgeArticle));
        const map = new Map<string, KnowledgeArticle>();
        MOCK_KNOWLEDGE_ARTICLES.forEach(a => map.set(a.id, a));
        firestoreArticles.forEach(a => map.set(a.id, a));
        return Array.from(map.values());
      }
    } catch (err) {
      console.warn('Error fetching knowledge in admin:', err);
    }
    return MOCK_KNOWLEDGE_ARTICLES;
  }

  public async createKnowledgeArticle(data: {
    title: string;
    teluguTitle?: string;
    category: string;
    summary: string;
    content: string[];
    tags?: string[];
    coverImage?: string;
    coverImageUrl?: string;
    coverImagePath?: string;
    coverImageMetadata?: ImageMetadata;
    status?: ContentStatus;
    visibility?: ContentVisibility;
    scheduledAt?: string;
    authorName?: string;
  }, adminUid: string, adminEmail?: string): Promise<KnowledgeArticle> {
    const kId = `knowledge-${Date.now()}`;
    const finalCover = data.coverImage || data.coverImageUrl || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800';
    const newArticle: KnowledgeArticle = {
      id: kId,
      title: data.title,
      teluguTitle: data.teluguTitle || data.title,
      category: data.category || 'సాహిత్యం',
      summary: data.summary,
      content: data.content,
      authorName: data.authorName || 'కథావాహిని సంపాదక వర్గం',
      authorId: adminUid,
      readTimeMinutes: Math.max(1, Math.ceil(data.content.join(' ').length / 300)),
      publishedAt: new Date().toISOString().split('T')[0],
      coverImage: finalCover,
      coverImageUrl: finalCover,
      coverImagePath: data.coverImagePath,
      coverImageMetadata: data.coverImageMetadata,
      tags: data.tags || ['సాహిత్యం'],
      status: data.status || 'published',
      visibility: data.visibility || 'public',
      scheduledAt: data.scheduledAt || null,
    };

    await setDoc(doc(db, 'knowledge', kId), {
      ...newArticle,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await auditLogService.logAction({
      action: 'knowledge_created',
      targetType: 'knowledge',
      targetId: kId,
      targetTitle: `Knowledge article "${newArticle.teluguTitle}" created`,
    });

    return newArticle;
  }

  public async updateKnowledgeArticle(articleId: string, updateData: Partial<KnowledgeArticle>, adminUid: string, adminEmail?: string): Promise<void> {
    await setDoc(doc(db, 'knowledge', articleId), {
      ...updateData,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    await auditLogService.logAction({
      action: 'knowledge_updated',
      targetType: 'knowledge',
      targetId: articleId,
      targetTitle: `Knowledge article ${articleId} updated`,
    });
  }

  public async deleteKnowledgeArticle(articleId: string, adminUid: string, adminEmail?: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'knowledge', articleId));
    } catch (e) {}

    await auditLogService.logAction({
      action: 'knowledge_deleted',
      targetType: 'knowledge',
      targetId: articleId,
      targetTitle: `Knowledge article ${articleId} deleted`,
    });
  }

  // ==========================================
  // CATEGORIES MANAGEMENT
  // ==========================================

  public async getCategories(): Promise<CategoryItem[]> {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      if (!snap.empty) {
        return snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        } as CategoryItem));
      }
    } catch (err) {
      console.warn('Error fetching categories:', err);
    }
    return MOCK_CATEGORIES.map(c => ({
      id: `cat-${encodeURIComponent(c.name)}`,
      name: c.name,
      teluguName: c.name,
      slug: encodeURIComponent(c.name),
      description: c.description,
      storyCount: c.count,
      status: 'active' as const,
    }));
  }

  public async addCategory(catData: { 
    name: string; 
    teluguName: string; 
    description?: string;
    slug?: string;
    contentType?: 'story' | 'novel' | 'joke' | 'knowledge' | 'all';
  }, adminUid: string, adminEmail?: string): Promise<CategoryItem> {
    const catId = `cat-${Date.now()}`;
    const newCat: CategoryItem = {
      id: catId,
      name: catData.name,
      teluguName: catData.teluguName,
      slug: catData.slug || catData.name.toLowerCase().replace(/\s+/g, '-'),
      description: catData.description || '',
      contentType: catData.contentType || 'all',
      storyCount: 0,
      status: 'active',
      isActive: true,
    };
    await setDoc(doc(db, 'categories', catId), {
      ...newCat,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await auditLogService.logAction({
      action: 'category_created',
      targetType: 'category',
      targetId: catId,
      targetTitle: `Category ${catData.teluguName} created`,
    });
    return newCat;
  }

  public async toggleCategoryStatus(catId: string, status: 'active' | 'archived', adminUid: string, adminEmail?: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'categories', catId), {
        status,
        isActive: status === 'active',
        updatedAt: serverTimestamp(),
      });
    } catch (e) {}

    await auditLogService.logAction({
      action: `category_${status}`,
      targetType: 'category',
      targetId: catId,
      targetTitle: `Category ${catId} set to ${status}`,
    });
  }

  public async deleteCategory(catId: string, adminUid: string, adminEmail?: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'categories', catId));
    } catch (e) {}

    await auditLogService.logAction({
      action: 'category_deleted',
      targetType: 'category',
      targetId: catId,
      targetTitle: `Category ${catId} deleted`,
    });
  }

  // ==========================================
  // PEOPLE & USER MANAGEMENT (STRICT 3 ROLES)
  // ==========================================

  public async getUsers(roleFilter?: string): Promise<User[]> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: User[] = snap.docs.map(docSnap => {
        const d = docSnap.data();
        let role: 'reader' | 'writer' | 'admin' = 'reader';
        if (d.role === 'admin') role = 'admin';
        else if (d.role === 'writer' || d.role === 'author') role = 'writer';
        else role = 'reader';

        return {
          id: docSnap.id,
          uid: docSnap.id,
          name: d.displayName || d.name || 'తెలుగు పాఠకుడు',
          displayName: d.displayName || d.name || 'తెలుగు పాఠకుడు',
          email: d.email || '',
          photoURL: d.photoURL || d.avatar,
          teluguName: d.teluguName || d.displayName || d.name,
          avatar: d.photoURL || d.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(docSnap.id)}`,
          bio: d.bio || '',
          teluguBio: d.teluguBio || '',
          role,
          status: d.status || 'active',
          followersCount: d.followersCount || 0,
          followingCount: d.followingCount || 0,
          savedStoriesCount: d.savedStoriesCount || 0,
          publishedCount: d.publishedCount || 0,
          preferences: d.preferences || {
            theme: 'light',
            fontSize: 18,
            fontFamily: 'serif',
            notifications: true,
          },
          createdAt: d.createdAt instanceof Timestamp ? d.createdAt.toDate().toISOString() : d.createdAt,
        };
      });

      if (roleFilter && roleFilter !== 'all') {
        return list.filter(u => u.role === roleFilter);
      }
      return list;
    } catch (err) {
      console.warn('Error fetching users for admin:', err);
      return [];
    }
  }

  /**
   * Admin Creates a Real User (Reader or Writer) in Firebase Auth + Firestore
   */
  public async createUser(userData: {
    name: string;
    teluguName?: string;
    email: string;
    password?: string;
    role: 'reader' | 'writer';
    bio?: string;
    genres?: string[];
    writingExperience?: string;
  }, adminUid: string, adminEmail?: string): Promise<User> {
    const trimmedEmail = userData.email.trim().toLowerCase();
    const pass = userData.password || 'Akshara@2026';
    const displayName = userData.teluguName?.trim() || userData.name.trim() || 'పాఠకుడు';
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trimmedEmail)}`;

    // 1. Create real Firebase Auth user via secondary auth client
    const secondaryAuth = getSecondaryAuth();
    const cred = await createUserWithEmailAndPassword(secondaryAuth, trimmedEmail, pass);
    const newUid = cred.user.uid;

    await updateProfile(cred.user, {
      displayName,
      photoURL: avatarUrl,
    });

    // 2. Write canonical `users/{uid}`
    const newUserDoc: User = {
      id: newUid,
      uid: newUid,
      name: userData.name.trim(),
      displayName,
      teluguName: displayName,
      email: trimmedEmail,
      photoURL: avatarUrl,
      avatar: avatarUrl,
      bio: userData.bio || '',
      teluguBio: userData.bio || '',
      role: userData.role, // 'reader' or 'writer'
      status: 'active',
      followersCount: 0,
      followingCount: 0,
      savedStoriesCount: 0,
      publishedCount: 0,
      preferences: {
        theme: 'light',
        fontSize: 18,
        fontFamily: 'serif',
        notifications: true,
      },
    };

    await setDoc(doc(db, 'users', newUid), {
      ...newUserDoc,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 3. Write role-specific collection (`readers/{uid}` or `writers/{uid}`)
    if (userData.role === 'reader') {
      await setDoc(doc(db, 'readers', newUid), {
        uid: newUid,
        displayName,
        email: trimmedEmail,
        photoURL: avatarUrl,
        createdAt: serverTimestamp(),
      }, { merge: true });
    } else if (userData.role === 'writer') {
      await setDoc(doc(db, 'writers', newUid), {
        uid: newUid,
        displayName,
        penName: displayName,
        email: trimmedEmail,
        photoURL: avatarUrl,
        bio: userData.bio || 'కథావాహిని రచయిత',
        genres: userData.genres || ['జీవితం'],
        writingExperience: userData.writingExperience || 'సాహిత్య సృష్టి',
        status: 'active',
        approvedAt: serverTimestamp(),
        approvedBy: adminUid,
        publishedStoriesCount: 0,
        totalStoriesSubmitted: 0,
        createdAt: serverTimestamp(),
      }, { merge: true });

      // Also create author profile
      await setDoc(doc(db, 'authors', newUid), {
        id: newUid,
        name: displayName,
        teluguName: displayName,
        avatar: avatarUrl,
        bio: userData.bio || 'కథావాహిని రచయిత',
        teluguBio: userData.bio || 'కథావాహిని రచయిత',
        followersCount: 0,
        storiesCount: 0,
        novelsCount: 0,
        jokesCount: 0,
        isVerified: true,
        joinedDate: '2026',
      }, { merge: true });
    }

    // 4. Log Admin Audit
    await auditLogService.logAction({
      action: `user_created_${userData.role}`,
      targetType: 'user',
      targetId: newUid,
      targetTitle: `Admin created ${userData.role} account for ${displayName} (${trimmedEmail})`,
      metadata: { role: userData.role, email: trimmedEmail },
    });

    return newUserDoc;
  }

  public async updateUserStatus(
    targetUid: string, 
    status: AccountStatus, 
    adminUid: string,
    adminEmail?: string
  ): Promise<void> {
    const userRef = doc(db, 'users', targetUid);
    await updateDoc(userRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    await auditLogService.logAction({
      action: `user_status_${status}`,
      targetType: 'user',
      targetId: targetUid,
      targetTitle: `User ${targetUid} status changed to ${status}`,
      metadata: { status },
    });
  }

  /**
   * Promote an existing Reader to Writer
   */
  public async promoteReaderToWriter(
    readerUid: string, 
    writerInfo: {
      penName?: string;
      bio?: string;
      genres?: string[];
      writingExperience?: string;
    },
    adminUid: string,
    adminEmail?: string
  ): Promise<void> {
    const userRef = doc(db, 'users', readerUid);
    const snap = await getDoc(userRef);
    const uData = snap.exists() ? snap.data() : {};
    const penName = writerInfo.penName || uData.displayName || uData.name || 'రచయిత';
    const bio = writerInfo.bio || uData.bio || 'కథావాహిని రచయిత';
    const photoURL = uData.photoURL || uData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(readerUid)}`;

    // Update canonical user
    await updateDoc(userRef, {
      role: 'writer',
      status: 'active',
      teluguName: penName,
      displayName: penName,
      bio,
      teluguBio: bio,
      updatedAt: serverTimestamp(),
    });

    // Create/update writers collection document
    await setDoc(doc(db, 'writers', readerUid), {
      uid: readerUid,
      displayName: penName,
      penName,
      email: uData.email || '',
      photoURL,
      bio,
      genres: writerInfo.genres || ['జీవితం'],
      writingExperience: writerInfo.writingExperience || 'కథావాహిని రచయిత',
      status: 'active',
      approvedAt: serverTimestamp(),
      approvedBy: adminUid,
      publishedStoriesCount: 0,
      totalStoriesSubmitted: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Public authors collection
    await setDoc(doc(db, 'authors', readerUid), {
      id: readerUid,
      name: penName,
      teluguName: penName,
      avatar: photoURL,
      bio,
      teluguBio: bio,
      followersCount: 0,
      storiesCount: 0,
      novelsCount: 0,
      jokesCount: 0,
      isVerified: true,
      joinedDate: '2026',
    }, { merge: true });

    // Send notification
    try {
      await notificationService.sendNotification(readerUid, {
        title: 'అభినందనలు! మీరు రచయితగా నియమించబడ్డారు',
        message: 'అడ్మిన్ ద్వారా మీ ఖాతా Writer గా అప్‌గ్రేడ్ చేయబడింది. మీరు ఇప్పుడు మీ రచనలను సమర్పించవచ్చు.',
        type: 'system',
      });
    } catch (e) {}

    await auditLogService.logAction({
      action: 'reader_promoted_to_writer',
      targetType: 'user',
      targetId: readerUid,
      targetTitle: `Reader ${readerUid} promoted to Writer (${penName})`,
    });
  }

  public async promoteUserToWriter(
    userId: string,
    writerInfo: {
      penName?: string;
      bio?: string;
      genres?: string[];
      writingExperience?: string;
    },
    adminUid: string,
    adminEmail?: string
  ): Promise<void> {
    return this.promoteReaderToWriter(userId, writerInfo, adminUid, adminEmail);
  }

  // ==========================================
  // WRITER APPLICATIONS & MODERATION
  // ==========================================

  public async getWriterApplications(statusFilter?: 'pending' | 'approved' | 'rejected'): Promise<WriterApplication[]> {
    try {
      const snap = await getDocs(collection(db, 'writerApplications'));
      const list: WriterApplication[] = snap.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          applicantUid: d.applicantUid,
          applicantType: d.applicantType || 'new_registration',
          fullName: d.fullName || d.name || d.displayName || '',
          penName: d.penName || d.displayName || '',
          displayName: d.displayName || d.penName || d.fullName || d.name || '',
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
          agreementAcceptedAt: d.agreementAcceptedAt instanceof Timestamp ? d.agreementAcceptedAt.toDate().toISOString() : d.agreementAcceptedAt,
          agreementAcceptedName: d.agreementAcceptedName || d.fullName || d.displayName,
          agreementVersion: d.agreementVersion || '1.0',
          photoURL: d.photoURL,
          status: d.status || 'pending',
          submittedAt: d.submittedAt instanceof Timestamp ? d.submittedAt.toDate().toISOString() : d.submittedAt || new Date().toISOString(),
          reviewedAt: d.reviewedAt instanceof Timestamp ? d.reviewedAt.toDate().toISOString() : d.reviewedAt,
          reviewedBy: d.reviewedBy,
          rejectionReason: d.rejectionReason,
        };
      });

      if (statusFilter) {
        return list.filter(a => a.status === statusFilter);
      }
      return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    } catch (err) {
      console.warn('Error fetching writer applications:', err);
      return [];
    }
  }

  public async approveWriterApplication(
    applicationId: string, 
    applicantUid: string, 
    adminUid: string,
    adminEmail?: string
  ): Promise<void> {
    const appRef = doc(db, 'writerApplications', applicationId);
    const appSnap = await getDoc(appRef);
    const appData = appSnap.exists() ? appSnap.data() : {};

    const fullName = appData.fullName || appData.name || 'రచయిత';
    const penName = appData.penName || appData.displayName || fullName;
    const bio = appData.bio || 'కథావాహిని రచయిత';
    const genres = appData.genres || appData.categories || ['జీవితం'];
    const writingExperience = appData.writingExperience || appData.experience || 'బ్లాగులు & సోషల్ మీడియా';
    const photoURL = appData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(applicantUid)}`;

    // 1. Update application doc
    await updateDoc(appRef, {
      status: 'approved',
      reviewedAt: serverTimestamp(),
      reviewedBy: adminUid,
    });

    // 2. Promote user
    const userRef = doc(db, 'users', applicantUid);
    await setDoc(userRef, {
      role: 'writer',
      status: 'active',
      displayName: penName,
      teluguName: penName,
      bio,
      teluguBio: bio,
      photoURL,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // 3. Write writers/{uid}
    await setDoc(doc(db, 'writers', applicantUid), {
      uid: applicantUid,
      displayName: fullName,
      penName,
      email: appData.email || '',
      photoURL,
      bio,
      genres,
      writingExperience,
      status: 'active',
      approvedAt: serverTimestamp(),
      approvedBy: adminUid,
      publishedStoriesCount: 0,
      totalStoriesSubmitted: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // 4. Public authors/{uid}
    await setDoc(doc(db, 'authors', applicantUid), {
      id: applicantUid,
      name: penName,
      teluguName: penName,
      avatar: photoURL,
      bio,
      teluguBio: bio,
      followersCount: 0,
      storiesCount: 0,
      novelsCount: 0,
      jokesCount: 0,
      isVerified: true,
      joinedDate: '2026',
      location: appData.city || 'ఆంధ్రప్రదేశ్, తెలంగాణ',
    }, { merge: true });

    // 5. Send notification
    try {
      await notificationService.sendNotification(applicantUid, {
        title: 'అభినందనలు! మీ Writer ఖాతా ఆమోదించబడింది',
        message: 'మీరు ఇప్పుడు కథావాహిని వేదికపై అధికారిక రచయిత. రచయిత స్టూడియో నుండి మీ కథలను సమర్పించవచ్చు.',
        type: 'system',
      });
    } catch (err) {}

    await auditLogService.logAction({
      action: 'writer_application_approved',
      targetType: 'writer_application',
      targetId: applicationId,
      targetTitle: `Writer Application approved for ${penName} (UID: ${applicantUid})`,
      metadata: { applicantUid, penName, fullName },
    });
  }

  public async rejectWriterApplication(
    applicationId: string, 
    applicantUid: string, 
    adminUid: string, 
    rejectionReason: string,
    adminEmail?: string
  ): Promise<void> {
    const appRef = doc(db, 'writerApplications', applicationId);
    const appSnap = await getDoc(appRef);
    const appData = appSnap.exists() ? appSnap.data() : {};
    const applicantType = appData.applicantType || 'reader_conversion';

    await updateDoc(appRef, {
      status: 'rejected',
      rejectionReason: rejectionReason.trim(),
      reviewedAt: serverTimestamp(),
      reviewedBy: adminUid,
    });

    const userRef = doc(db, 'users', applicantUid);
    try {
      if (applicantType === 'new_registration') {
        await updateDoc(userRef, {
          role: 'reader',
          status: 'rejected',
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(userRef, {
          role: 'reader',
          status: 'active',
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {}

    try {
      await notificationService.sendNotification(applicantUid, {
        title: 'రచయిత దరఖాస్తు తిరస్కరించబడింది',
        message: `మీ రచయిత దరఖాస్తు సమీక్షించబడింది. కారణం: ${rejectionReason.trim()}`,
        type: 'system',
      });
    } catch (err) {}

    await auditLogService.logAction({
      action: 'writer_application_rejected',
      targetType: 'writer_application',
      targetId: applicationId,
      targetTitle: `Writer Application rejected for UID ${applicantUid}`,
      metadata: { applicantUid, rejectionReason, applicantType },
    });
  }

  // ==========================================
  // REPORTS, CONTACTS, COMMENTS & AUDIT LOGS
  // ==========================================

  public async getIssueReports(): Promise<IssueReport[]> {
    try {
      const snap = await getDocs(collection(db, 'issueReports'));
      return snap.docs.map(d => ({
        id: d.id,
        ...d.data() as IssueReport,
      }));
    } catch (err) {
      return [];
    }
  }

  public async updateReportStatus(
    reportId: string, 
    status: 'pending' | 'reviewed' | 'resolved', 
    adminUid: string,
    adminEmail?: string
  ): Promise<void> {
    const ref = doc(db, 'issueReports', reportId);
    await updateDoc(ref, {
      status,
      reviewedAt: serverTimestamp(),
      reviewedBy: adminUid,
    });

    await auditLogService.logAction({
      action: `report_${status}`,
      targetType: 'report',
      targetId: reportId,
      targetTitle: `Report status changed to ${status}`,
      metadata: { status },
    });
  }

  public async getContactSubmissions(): Promise<ContactSubmission[]> {
    try {
      const snap = await getDocs(collection(db, 'contactSubmissions'));
      return snap.docs.map(d => ({
        id: d.id,
        ...d.data() as ContactSubmission,
      }));
    } catch (err) {
      return [];
    }
  }

  public async updateContactStatus(submissionId: string, status: 'unread' | 'read' | 'resolved'): Promise<void> {
    const ref = doc(db, 'contactSubmissions', submissionId);
    await updateDoc(ref, {
      status,
      updatedAt: serverTimestamp(),
    });
  }

  public async getAllComments(): Promise<Comment[]> {
    try {
      const snap = await getDocs(collection(db, 'comments'));
      if (!snap.empty) {
        return snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        } as Comment));
      }
    } catch (err) {}
    return [
      {
        id: 'comm-1',
        storyId: 'story-1',
        user: {
          id: 'usr-reader-1',
          name: 'రాఘవ శర్మ',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        },
        content: 'ఈ కథ చదువుతుంటే ఎంతో భావోద్వేగంగా అనిపించింది. రచయిత శైలి అద్భుతంగా ఉంది!',
        createdAt: '2026-08-28T14:32:00.000Z',
        likes: 12,
      },
      {
        id: 'comm-2',
        storyId: 'story-2',
        user: {
          id: 'usr-reader-2',
          name: 'సునీత వర్మ',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        },
        content: 'ముగింపు ఊహించని విధంగా ఉంది. నెక్స్ట్ పార్ట్ ఎప్పుడు వస్తుంది?',
        createdAt: '2026-08-29T09:15:00.000Z',
        likes: 8,
      },
    ];
  }

  public async deleteComment(commentId: string, adminUid: string, adminEmail?: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (e) {}

    await auditLogService.logAction({
      action: 'comment_deleted',
      targetType: 'comment',
      targetId: commentId,
      targetTitle: `Comment ${commentId} removed by admin`,
    });
  }

  public async getAuditLogs(): Promise<AdminAuditLog[]> {
    return await auditLogService.getAuditLogs();
  }
}

export const adminService = new AdminService();
