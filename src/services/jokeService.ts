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
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Joke } from '../types';
import { MOCK_JOKES, MOCK_AUTHORS } from './mockData';

class JokeService {
  /**
   * Fetch jokes from top-level `jokes` collection
   */
  public async getJokes(category?: string, maxLimit: number = 50): Promise<Joke[]> {
    try {
      const q = query(collection(db, 'jokes'), limit(maxLimit));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const firestoreJokes: Joke[] = snap.docs.map(d => {
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
        MOCK_JOKES.forEach(j => map.set(j.id, j));
        firestoreJokes.forEach(j => map.set(j.id, j));
        const allJokes = Array.from(map.values());

        if (category && category !== 'అన్నీ') {
          return allJokes.filter(j => j.category === category);
        }
        return allJokes.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      }
    } catch (err) {
      console.warn('Error fetching jokes from Firestore:', err);
    }

    if (category && category !== 'అన్నీ') {
      return MOCK_JOKES.filter(j => j.category === category);
    }
    return [...MOCK_JOKES].sort((a, b) => b.likeCount - a.likeCount);
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
