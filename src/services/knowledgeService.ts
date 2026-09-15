import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  query,
  limit,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { KnowledgeArticle } from '../types';
import { MOCK_KNOWLEDGE_ARTICLES } from './mockData';
import { deletionTracker } from './deletionTracker';

export class KnowledgeService {
  /**
   * Real-time subscription to knowledge articles
   */
  public subscribeArticles(callback: (articles: KnowledgeArticle[]) => void): () => void {
    this.getArticles().then(callback).catch(() => {});

    try {
      const q = query(collection(db, 'knowledge'), limit(50));
      const unsubscribe = onSnapshot(q, async () => {
        try {
          const articles = await this.getArticles();
          callback(articles);
        } catch (e) {}
      }, (err) => {
        console.warn('Real-time knowledge subscriber note:', err);
      });

      const handleRefresh = () => {
        this.getArticles().then(callback).catch(() => {});
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
      console.warn('Could not establish real-time knowledge snapshot:', e);
      return () => {};
    }
  }

  /**
   * Fetch all published knowledge articles
   */
  public async getArticles(maxLimit: number = 30): Promise<KnowledgeArticle[]> {
    try {
      await deletionTracker.init();
      const q = query(collection(db, 'knowledge'), limit(maxLimit));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const firestoreArticles: KnowledgeArticle[] = snap.docs
          .filter(d => !deletionTracker.isDeleted(d.id) && !d.data()?.deleted && d.data()?.status !== 'deleted')
          .map(d => {
            const data = d.data();
            return {
              id: d.id,
              title: data.title || '',
              teluguTitle: data.teluguTitle || data.title || '',
              category: data.category || 'సాహిత్యం',
              summary: data.summary || data.excerpt || '',
              content: Array.isArray(data.content) ? data.content : [data.content || ''],
              authorName: data.authorName || 'కథావాహిని సంపాదక వర్గం',
              readTimeMinutes: data.readTimeMinutes || 5,
              publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate().toISOString() : (data.publishedAt || new Date().toISOString()),
              coverImage: data.coverImage || data.coverImageUrl || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
              tags: data.tags || [],
            };
          });

        const map = new Map<string, KnowledgeArticle>();
        MOCK_KNOWLEDGE_ARTICLES.filter(a => !deletionTracker.isDeleted(a.id)).forEach(a => map.set(a.id, a));
        firestoreArticles.forEach(a => map.set(a.id, a));
        return Array.from(map.values()).filter(a => !deletionTracker.isDeleted(a.id));
      }
    } catch (err) {
      console.warn('Error fetching knowledge from Firestore:', err);
    }

    return MOCK_KNOWLEDGE_ARTICLES.filter(a => !deletionTracker.isDeleted(a.id));
  }

  /**
   * Fetch article by ID
   */
  public async getArticleById(id: string): Promise<KnowledgeArticle | null> {
    if (deletionTracker.isDeleted(id)) return null;

    try {
      const snap = await getDoc(doc(db, 'knowledge', id));
      if (snap.exists()) {
        const data = snap.data();
        if (data.deleted === true || data.status === 'deleted') return null;
        return {
          id: snap.id,
          title: data.title || '',
          teluguTitle: data.teluguTitle || data.title || '',
          category: data.category || 'సాహిత్యం',
          summary: data.summary || data.excerpt || '',
          content: Array.isArray(data.content) ? data.content : [data.content || ''],
          authorName: data.authorName || 'కథావాహిని సంపాదక వర్గం',
          readTimeMinutes: data.readTimeMinutes || 5,
          publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate().toISOString() : (data.publishedAt || new Date().toISOString()),
          coverImage: data.coverImage || data.coverImageUrl || '',
          tags: data.tags || [],
        };
      }
    } catch (err) {
      console.warn(`Error fetching knowledge article ${id}:`, err);
    }

    const fallback = MOCK_KNOWLEDGE_ARTICLES.find(a => a.id === id && !deletionTracker.isDeleted(a.id));
    return fallback || null;
  }

  /**
   * Create or update knowledge article (Admin)
   */
  public async saveArticle(article: KnowledgeArticle): Promise<void> {
    const docRef = doc(db, 'knowledge', article.id);
    await setDoc(docRef, {
      ...article,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kathavahini:refresh-content'));
    }
  }

  /**
   * Delete knowledge article (Admin)
   */
  public async deleteArticle(id: string, adminUid?: string): Promise<void> {
    await deletionTracker.markDeleted(id, 'knowledge', adminUid);
    try {
      await setDoc(doc(db, 'knowledge', id), {
        status: 'deleted',
        deleted: true,
        updatedAt: serverTimestamp(),
        deletedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kathavahini:refresh-content'));
      window.dispatchEvent(new CustomEvent('kathavahini:item-deleted', { detail: { id, type: 'knowledge' } }));
    }
  }
}

export const knowledgeService = new KnowledgeService();
