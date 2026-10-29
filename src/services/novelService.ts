import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  query,
  where,
  limit,
  serverTimestamp,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sanitizeFirestoreData } from '../utils/firestoreSanitizer';
import { Novel, Chapter, Episode, ContentStatus, ContentVisibility } from '../types';
import { MOCK_NOVELS } from './mockData';
import { deletionTracker } from './deletionTracker';
import { resolveContentAuthor } from '../utils/authorResolver';

class NovelService {
  /**
   * Subscribe to real-time novel updates from Firestore
   */
  public subscribeNovels(callback: (novels: Novel[]) => void): () => void {
    this.getFeaturedNovels().then(callback).catch(() => {});

    try {
      const q = query(collection(db, 'novels'), limit(50));
      const unsubscribe = onSnapshot(q, async () => {
        try {
          const novels = await this.getFeaturedNovels();
          callback(novels);
        } catch (e) {}
      }, (err) => {
        console.warn('Real-time novels subscriber note:', err);
      });

      const handleRefresh = () => {
        this.getFeaturedNovels().then(callback).catch(() => {});
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('kathavahini:refresh-content', handleRefresh);
        window.addEventListener('kathavahini:item-deleted', handleRefresh);
      }

      return () => {
        unsubscribe();
        if (typeof window !== 'undefined') {
          window.removeEventListener('kathavahini:refresh-content', handleRefresh);
          window.removeEventListener('kathavahini:item-deleted', handleRefresh);
        }
      };
    } catch (e) {
      console.warn('Could not establish real-time novels snapshot:', e);
      return () => {};
    }
  }

  /**
   * Fetch all novels from top-level `novels` collection
   */
  public async getFeaturedNovels(maxLimit: number = 30): Promise<Novel[]> {
    try {
      await deletionTracker.init();
      const q = query(collection(db, 'novels'), limit(maxLimit));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const novels: Novel[] = [];
        for (const docSnap of snap.docs) {
          if (deletionTracker.isDeleted(docSnap.id)) continue;
          const data = docSnap.data();
          if (data.deleted === true || data.status === 'deleted') continue;
          if (data.visibility === 'hidden' || data.visibility === 'private') continue;
          const novelId = docSnap.id;

          // Fetch chapters subcollection
          const chapSnap = await getDocs(collection(db, 'novels', novelId, 'chapters'));
          const chapters: Chapter[] = chapSnap.docs
            .filter(c => !deletionTracker.isDeleted(c.id) && !c.data()?.deleted && c.data()?.status !== 'deleted')
            .map(c => {
              const cd = c.data();
              return {
                id: c.id,
                chapterNumber: cd.chapterNumber || 1,
                title: cd.title || '',
                teluguTitle: cd.teluguTitle || cd.title || '',
                content: Array.isArray(cd.content) ? cd.content : [cd.content || ''],
                readingTimeMinutes: cd.readingTimeMinutes || 5,
                publishedAt: cd.publishedAt instanceof Timestamp ? cd.publishedAt.toDate().toISOString().split('T')[0] : (cd.publishedAt || ''),
              };
            });

          novels.push({
            id: novelId,
            title: data.title || '',
            teluguTitle: data.teluguTitle || data.title || '',
            slug: data.slug || 'novel',
            coverImage: data.coverImage || data.coverImageUrl || 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800',
            description: data.description || '',
            teluguDescription: data.teluguDescription || data.description || '',
            authorId: data.authorId || '',
            author: resolveContentAuthor({ id: novelId, ...data }),
            category: data.category || 'కుటుంబం',
            tags: data.tags || ['నవల'],
            status: data.status || 'ongoing',
            chaptersCount: chapters.length || data.chaptersCount || 1,
            chapters: chapters.length > 0 ? chapters : (data.chapters || []),
            rating: data.rating || 5.0,
            viewCount: data.viewsCount || data.viewCount || 0,
            likeCount: data.likesCount || data.likeCount || 0,
            bookmarkCount: data.bookmarksCount || data.bookmarkCount || 0,
            publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate().toISOString().split('T')[0] : (data.publishedAt || ''),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString().split('T')[0] : (data.updatedAt || ''),
          });
        }

        // Merge with mock catalog (excluding any deleted ones)
        const map = new Map<string, Novel>();
        MOCK_NOVELS.filter(n => !deletionTracker.isDeleted(n.id)).forEach(n => map.set(n.id, n));
        novels.forEach(n => map.set(n.id, n));
        return Array.from(map.values())
          .filter(n => !deletionTracker.isDeleted(n.id) && (n as any).status !== 'deleted' && (n as any).status !== 'archived')
          .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      }
    } catch (err) {
      console.warn('Error fetching novels from Firestore:', err);
    }

    return MOCK_NOVELS.filter(n => !deletionTracker.isDeleted(n.id) && (n as any).status !== 'deleted' && (n as any).status !== 'archived');
  }

  public async getNovelById(id: string): Promise<Novel | undefined> {
    try {
      const snap = await getDoc(doc(db, 'novels', id));
      if (snap.exists()) {
        const data = snap.data();
        const chapSnap = await getDocs(collection(db, 'novels', id, 'chapters'));
        const chapters: Chapter[] = chapSnap.docs.map(c => {
          const cd = c.data();
          return {
            id: c.id,
            chapterNumber: cd.chapterNumber || 1,
            title: cd.title || '',
            teluguTitle: cd.teluguTitle || cd.title || '',
            content: Array.isArray(cd.content) ? cd.content : [cd.content || ''],
            readingTimeMinutes: cd.readingTimeMinutes || 5,
            publishedAt: cd.publishedAt instanceof Timestamp ? cd.publishedAt.toDate().toISOString().split('T')[0] : (cd.publishedAt || ''),
          };
        });

        return {
          id: snap.id,
          title: data.title || '',
          teluguTitle: data.teluguTitle || data.title || '',
          slug: data.slug || 'novel',
          coverImage: data.coverImage || data.coverImageUrl || 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800',
          description: data.description || '',
          teluguDescription: data.teluguDescription || data.description || '',
          authorId: data.authorId || '',
          author: resolveContentAuthor({ id: snap.id, ...data }),
          category: data.category || 'కుటుంబం',
          tags: data.tags || ['నవల'],
          status: data.status || 'ongoing',
          chaptersCount: chapters.length || data.chaptersCount || 1,
          chapters: chapters.length > 0 ? chapters : (data.chapters || []),
          rating: data.rating || 5.0,
          viewCount: data.viewsCount || data.viewCount || 0,
          likeCount: data.likesCount || data.likeCount || 0,
          bookmarkCount: data.bookmarksCount || data.bookmarkCount || 0,
          publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate().toISOString().split('T')[0] : (data.publishedAt || ''),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString().split('T')[0] : (data.updatedAt || ''),
        };
      }
    } catch (err) {
      console.warn(`Error fetching novel ${id}:`, err);
    }

    return MOCK_NOVELS.find(n => n.id === id);
  }

  public async getChapter(novelId: string, chapterId: string): Promise<{ novel: Novel; chapter: Chapter } | undefined> {
    const novel = await this.getNovelById(novelId);
    if (!novel) return undefined;
    const chapter = novel.chapters.find(c => c.id === chapterId);
    if (!chapter) return undefined;
    return { novel, chapter };
  }

  public async toggleBookmark(novelId: string): Promise<boolean> {
    const novel = await this.getNovelById(novelId);
    if (novel) {
      novel.isBookmarked = !novel.isBookmarked;
      return novel.isBookmarked;
    }
    return false;
  }

  public async createNovel(
    newNovel: Partial<Novel> & { firstChapterTitle?: string; firstChapterContent?: string[] },
    firstChapterContentParam?: string[],
    authorUser?: any
  ): Promise<Novel> {
    const novelId = `novel-${Date.now()}`;
    const authorId = authorUser?.id || newNovel.authorId || '';
    const authorDisplayName = authorUser?.penName || authorUser?.displayName || authorUser?.name || authorUser?.teluguName || (newNovel as any).authorName || 'కథావాహిని రచయిత';

    const rawContent = firstChapterContentParam || newNovel.firstChapterContent;
    const initialParagraphs = (rawContent && rawContent.length > 0)
      ? rawContent
      : ['మొదటి అధ్యాయం ఇక్కడ ప్రారంభమవుతుంది...'];

    const initialChapter: Chapter = {
      id: `chap-${Date.now()}`,
      chapterNumber: 1,
      title: 'Chapter 1',
      teluguTitle: newNovel.firstChapterTitle?.trim() || '1వ అధ్యాయం',
      content: initialParagraphs,
      readingTimeMinutes: Math.max(1, Math.ceil(initialParagraphs.join(' ').length / 300)),
      publishedAt: new Date().toISOString().split('T')[0],
    };

    const created: Novel = {
      id: novelId,
      title: newNovel.title || 'Untitled Novel',
      teluguTitle: newNovel.teluguTitle || newNovel.title || 'శీర్షిక లేని నవల',
      slug: (newNovel.title || 'novel').toLowerCase().replace(/\s+/g, '-'),
      coverImage: newNovel.coverImage || 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800',
      description: newNovel.description || 'New Telugu Novel',
      teluguDescription: newNovel.teluguDescription || newNovel.description || 'కొత్త తెలుగు నవల',
      authorId,
      author: resolveContentAuthor({ id: novelId, authorId, authorName: authorDisplayName, ...newNovel }),
      category: newNovel.category || 'కుటుంబం',
      tags: newNovel.tags || ['నవల'],
      status: newNovel.status || 'ongoing',
      chaptersCount: 1,
      chapters: [initialChapter],
      rating: 0,
      viewCount: 1,
      likeCount: 0,
      bookmarkCount: 0,
      publishedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    try {
      await setDoc(doc(db, 'novels', novelId), sanitizeFirestoreData({
        ...created,
        authorName: authorDisplayName,
        createdAt: serverTimestamp(),
      }));
      await setDoc(doc(db, 'novels', novelId, 'chapters', initialChapter.id), sanitizeFirestoreData({
        ...initialChapter,
        novelId,
        authorId,
        createdAt: serverTimestamp(),
      }));
    } catch (e) {
      console.warn('Silent note saving novel to Firestore:', e);
    }

    return created;
  }

  /**
   * Add a new sequential episode to an existing novel
   */
  public async addEpisodeToNovel(params: {
    novelId: string;
    episodeNumber: number;
    title: string;
    teluguTitle?: string;
    content: string[];
    authorUser?: any;
    readingTimeMinutes?: number;
  }): Promise<Episode> {
    const novel = await this.getNovelById(params.novelId);
    const novelTitle = novel?.teluguTitle || novel?.title || '';
    const authorId = params.authorUser?.id || novel?.authorId || '';
    const authorName = params.authorUser?.penName || params.authorUser?.displayName || params.authorUser?.name || (novel as any)?.authorName || 'కథావాహిని రచయిత';
    
    const epId = `ep-${Date.now()}`;
    const charCount = params.content.join(' ').length;
    const readingTime = params.readingTimeMinutes || Math.max(1, Math.ceil(charCount / 300));
    const publishedAt = new Date().toISOString().split('T')[0];

    const newEpisode: Episode = {
      id: epId,
      novelId: params.novelId,
      novelTitle,
      episodeNumber: params.episodeNumber,
      title: params.title || `Episode ${params.episodeNumber}`,
      teluguTitle: params.teluguTitle?.trim() || `${params.episodeNumber}వ భాగం`,
      content: params.content,
      authorId,
      authorName,
      status: 'published',
      visibility: 'public',
      readingTimeMinutes: readingTime,
      publishedAt,
    };

    // 1. Save to top-level episodes collection
    try {
      await setDoc(doc(db, 'episodes', epId), sanitizeFirestoreData({
        ...newEpisode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }));
    } catch (err) {
      console.warn('Note writing to episodes collection:', err);
    }

    // 2. Also save to subcollection chapters
    try {
      await setDoc(doc(db, 'novels', params.novelId, 'chapters', epId), sanitizeFirestoreData({
        id: epId,
        chapterNumber: params.episodeNumber,
        title: newEpisode.title,
        teluguTitle: newEpisode.teluguTitle,
        content: params.content,
        authorId,
        readingTimeMinutes: readingTime,
        publishedAt,
        createdAt: serverTimestamp(),
      }));

      // Increment chaptersCount on novel
      await updateDoc(doc(db, 'novels', params.novelId), sanitizeFirestoreData({
        chaptersCount: increment(1),
        updatedAt: serverTimestamp(),
      }));
    } catch (err) {
      console.warn('Note updating novel chapters subcollection:', err);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kathavahini:refresh-content'));
    }

    return newEpisode;
  }

  /**
   * Fetch published episodes for a specific novel in ascending sequence
   * Checks both top-level `episodes` collection and novel subcollection `chapters`
   */
  public async getEpisodesForNovel(novelId: string): Promise<Episode[]> {
    try {
      await deletionTracker.init();
      const episodesList: Episode[] = [];

      // 1. Query top-level `episodes` collection where novelId matches
      try {
        const epQuery = query(
          collection(db, 'episodes'),
          where('novelId', '==', novelId)
        );
        const epSnap = await getDocs(epQuery);
        for (const epDoc of epSnap.docs) {
          if (deletionTracker.isDeleted(epDoc.id)) continue;
          const data = epDoc.data();
          if (data.deleted === true || data.status === 'deleted') continue;
          if (data.visibility === 'hidden' || data.visibility === 'private') continue;
          if (data.status && data.status !== 'published') continue;

          episodesList.push({
            id: epDoc.id,
            novelId,
            novelTitle: data.novelTitle || '',
            episodeNumber: Number(data.episodeNumber) || 1,
            title: data.title || '',
            teluguTitle: data.teluguTitle || data.title || `${data.episodeNumber || 1}వ భాగం`,
            content: Array.isArray(data.content) ? data.content : [data.content || ''],
            authorId: data.authorId || '',
            authorName: data.authorName,
            status: 'published',
            visibility: 'public',
            readingTimeMinutes: data.readingTimeMinutes || 5,
            publishedAt: data.publishedAt instanceof Timestamp 
              ? data.publishedAt.toDate().toISOString().split('T')[0] 
              : (data.publishedAt || ''),
          });
        }
      } catch (err) {
        console.warn('Note querying top-level episodes collection:', err);
      }

      // 2. If episodes collection had results, sort them strictly ascending by episodeNumber
      if (episodesList.length > 0) {
        return episodesList.sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0));
      }

      // 3. Fallback: query subcollection `novels/{novelId}/chapters`
      try {
        const chapSnap = await getDocs(collection(db, 'novels', novelId, 'chapters'));
        const chapters: Episode[] = chapSnap.docs
          .filter(c => !deletionTracker.isDeleted(c.id) && !c.data()?.deleted && c.data()?.status !== 'deleted')
          .map(c => {
            const cd = c.data();
            return {
              id: c.id,
              novelId,
              episodeNumber: Number(cd.chapterNumber || cd.episodeNumber) || 1,
              title: cd.title || '',
              teluguTitle: cd.teluguTitle || cd.title || `${cd.chapterNumber || 1}వ అధ్యాయం`,
              content: Array.isArray(cd.content) ? cd.content : [cd.content || ''],
              authorId: cd.authorId || '',
              status: 'published',
              visibility: 'public',
              readingTimeMinutes: cd.readingTimeMinutes || 5,
              publishedAt: cd.publishedAt instanceof Timestamp 
                ? cd.publishedAt.toDate().toISOString().split('T')[0] 
                : (cd.publishedAt || ''),
            };
          });

        if (chapters.length > 0) {
          return chapters.sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0));
        }
      } catch (err) {
        console.warn('Note querying novel chapters subcollection:', err);
      }

      // 4. Fallback to mock novel's chapters if matched
      const mock = MOCK_NOVELS.find(n => n.id === novelId);
      if (mock && mock.chapters) {
        return mock.chapters.map(c => ({
          id: c.id,
          novelId,
          episodeNumber: c.chapterNumber,
          title: c.title,
          teluguTitle: c.teluguTitle,
          content: c.content,
          authorId: mock.authorId,
          status: 'published' as ContentStatus,
          visibility: 'public' as ContentVisibility,
          readingTimeMinutes: c.readingTimeMinutes,
          publishedAt: c.publishedAt,
        })).sort((a, b) => a.episodeNumber - b.episodeNumber);
      }

      return [];
    } catch (e) {
      console.warn('Error fetching episodes for novel:', e);
      return [];
    }
  }
}

export const novelService = new NovelService();
