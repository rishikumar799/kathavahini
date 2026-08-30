import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Novel, Chapter } from '../types';
import { MOCK_NOVELS } from './mockData';

class NovelService {
  /**
   * Fetch all novels from top-level `novels` collection
   */
  public async getFeaturedNovels(maxLimit: number = 30): Promise<Novel[]> {
    try {
      const q = query(collection(db, 'novels'), limit(maxLimit));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const novels: Novel[] = [];
        for (const docSnap of snap.docs) {
          const data = docSnap.data();
          const novelId = docSnap.id;

          // Fetch chapters subcollection
          const chapSnap = await getDocs(collection(db, 'novels', novelId, 'chapters'));
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

          novels.push({
            id: novelId,
            title: data.title || '',
            teluguTitle: data.teluguTitle || data.title || '',
            slug: data.slug || 'novel',
            coverImage: data.coverImage || data.coverImageUrl || 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800',
            description: data.description || '',
            teluguDescription: data.teluguDescription || data.description || '',
            authorId: data.authorId || '',
            author: data.author || MOCK_NOVELS[0].author,
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

        // Merge with mock catalog
        const map = new Map<string, Novel>();
        MOCK_NOVELS.forEach(n => map.set(n.id, n));
        novels.forEach(n => map.set(n.id, n));
        return Array.from(map.values()).sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      }
    } catch (err) {
      console.warn('Error fetching novels from Firestore:', err);
    }

    return MOCK_NOVELS;
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
          author: data.author || MOCK_NOVELS[0].author,
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

  public async createNovel(newNovel: Partial<Novel>): Promise<Novel> {
    const novelId = `novel-${Date.now()}`;
    const initialChapter: Chapter = {
      id: `chap-${Date.now()}`,
      chapterNumber: 1,
      title: 'Chapter 1',
      teluguTitle: '1వ అధ్యాయం',
      content: ['మొదటి అధ్యాయం ఇక్కడ ప్రారంభమవుతుంది...'],
      readingTimeMinutes: 5,
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
      authorId: newNovel.authorId || 'auth-1',
      author: newNovel.author || MOCK_NOVELS[0].author,
      category: newNovel.category || 'కుటుంబం',
      tags: newNovel.tags || ['నవల'],
      status: newNovel.status || 'ongoing',
      chaptersCount: (newNovel.chapters?.length) || 1,
      chapters: newNovel.chapters || [initialChapter],
      rating: 5.0,
      viewCount: 1,
      likeCount: 0,
      bookmarkCount: 0,
      publishedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    try {
      await setDoc(doc(db, 'novels', novelId), {
        ...created,
        createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, 'novels', novelId, 'chapters', initialChapter.id), initialChapter);
    } catch (e) {}

    return created;
  }
}

export const novelService = new NovelService();
