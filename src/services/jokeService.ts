import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  limit,
  serverTimestamp,
  increment,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Joke } from '../types';
import { MOCK_JOKES, MOCK_AUTHORS } from './mockData';
import { deletionTracker } from './deletionTracker';

class JokeService {
  /**
   * Real-time subscription to jokes from Firestore
   */
  public subscribeJokes(callback: (jokes: Joke[]) => void, category?: string): () => void {
    this.getJokes(category).then(callback).catch(() => {});

    try {
      const q = query(collection(db, 'jokes'), limit(60));
      const unsubscribe = onSnapshot(q, async () => {
        try {
          const jokes = await this.getJokes(category);
          callback(jokes);
        } catch (e) {}
      }, (err) => {
        console.warn('Real-time jokes subscriber note:', err);
      });

      const handleRefresh = () => {
        this.getJokes(category).then(callback).catch(() => {});
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
      console.warn('Could not establish real-time jokes snapshot:', e);
      return () => {};
    }
  }

  /**
   * Fetch jokes from top-level `jokes` collection
   */
  public async getJokes(category?: string, maxLimit: number = 50): Promise<Joke[]> {
    try {
      await deletionTracker.init();
      const q = query(collection(db, 'jokes'), limit(maxLimit));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const firestoreJokes: Joke[] = snap.docs
          .filter(d => !deletionTracker.isDeleted(d.id) && !d.data()?.deleted && d.data()?.status !== 'deleted')
          .map(d => {
            const data = d.data();
            return {
              id: d.id,
              content: data.content || data.teluguContent || '',
              category: data.category || 'హాస్యం',
              authorId: data.authorId || '',
              author: data.author || MOCK_AUTHORS[2],
              likeCount: data.likesCount || data.likeCount || 0,
              shareCount: data.shareCount || 0,
              publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate().toISOString().split('T')[0] : (data.publishedAt || ''),
            };
          });

        const map = new Map<string, Joke>();
        MOCK_JOKES.filter(j => !deletionTracker.isDeleted(j.id)).forEach(j => map.set(j.id, j));
        firestoreJokes.forEach(j => map.set(j.id, j));
        const allJokes = Array.from(map.values())
          .filter(j => !deletionTracker.isDeleted(j.id) && (j as any).status !== 'deleted' && (j as any).status !== 'archived');

        if (category && category !== 'అన్నీ') {
          return allJokes.filter(j => j.category === category);
        }
        return allJokes.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      }
    } catch (err) {
      console.warn('Error fetching jokes from Firestore:', err);
    }

    const baseline = MOCK_JOKES.filter(j => !deletionTracker.isDeleted(j.id));
    if (category && category !== 'అన్నీ') {
      return baseline.filter(j => j.category === category);
    }
    return [...baseline].sort((a, b) => b.likeCount - a.likeCount);
  }

  public async toggleLike(jokeId: string): Promise<boolean> {
    const user = auth.currentUser;
    try {
      await updateDoc(doc(db, 'jokes', jokeId), {
        likesCount: increment(1),
        likeCount: increment(1),
      });
      return true;
    } catch (err) {
      return true;
    }
  }

  public async publishJoke(content: string, category: string): Promise<Joke> {
    const user = auth.currentUser;
    const jokeId = `joke-${Date.now()}`;
    const newJoke: Joke = {
      id: jokeId,
      content,
      category,
      authorId: user?.uid || MOCK_AUTHORS[2].id,
      author: {
        id: user?.uid || MOCK_AUTHORS[2].id,
        name: user?.displayName || 'హాస్య ప్రియుడు',
        teluguName: user?.displayName || 'హాస్య ప్రియుడు',
        avatar: user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=joke',
        bio: 'హాస్య రచయిత',
        teluguBio: 'హాస్య రచయిత',
        followersCount: 0,
        storiesCount: 0,
        novelsCount: 0,
        jokesCount: 1,
        joinedDate: '2026',
      },
      likeCount: 1,
      shareCount: 0,
      publishedAt: new Date().toISOString().split('T')[0],
      isLiked: true,
    };

    try {
      await setDoc(doc(db, 'jokes', jokeId), {
        ...newJoke,
        createdAt: serverTimestamp(),
      });
    } catch (e) {}

    return newJoke;
  }
}

export const jokeService = new JokeService();
