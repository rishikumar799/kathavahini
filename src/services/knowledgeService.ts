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
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { KnowledgeArticle } from '../types';
import { MOCK_KNOWLEDGE_ARTICLES } from './mockData';

export class KnowledgeService {
  /**
   * Fetch all published knowledge articles
   */
  public async getArticles(maxLimit: number = 30): Promise<KnowledgeArticle[]> {
    try {
      const q = query(collection(db, 'knowledge'), limit(maxLimit));
      const snap = await getDocs(q);

      if (!snap.empty) {
        return snap.docs.map(d => {
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
      }
    } catch (err) {
      console.warn('Error fetching knowledge from Firestore:', err);
    }

    return MOCK_KNOWLEDGE_ARTICLES;
  }

  /**
   * Fetch article by ID
   */
  public async getArticleById(id: string): Promise<KnowledgeArticle | null> {
    try {
      const snap = await getDoc(doc(db, 'knowledge', id));
      if (snap.exists()) {
        const data = snap.data();
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

    const fallback = MOCK_KNOWLEDGE_ARTICLES.find(a => a.id === id);
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
  }

  /**
   * Delete knowledge article (Admin)
   */
  public async deleteArticle(id: string): Promise<void> {
    await deleteDoc(doc(db, 'knowledge', id));
  }
}

export const knowledgeService = new KnowledgeService();
