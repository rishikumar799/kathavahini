import {
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  increment,
  query,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Comment } from '../types';

export class CommentService {
  /**
   * Fetch comments for a story
   * Path: stories/{storyId}/comments/{commentId}
   */
  public async getStoryComments(storyId: string, maxLimit: number = 50): Promise<Comment[]> {
    try {
      const q = query(
        collection(db, 'stories', storyId, 'comments'),
        orderBy('createdAt', 'desc'),
        limit(maxLimit)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          storyId,
          user: {
            id: data.userId || '',
            name: data.userName || 'తెలుగు పాఠకుడు',
            avatar: data.userPhotoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.userId || d.id)}`,
          },
          content: data.text || data.content || '',
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
          likes: data.likes || 0,
        };
      });
    } catch (err) {
      console.warn(`Error fetching comments for story ${storyId}:`, err);
      return [];
    }
  }

  /**
   * Add a comment to a story
   * Path: stories/{storyId}/comments
   */
  public async addComment(storyId: string, text: string): Promise<Comment> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('వ్యాఖ్యానించడానికి (Comment) ముందుగా లాగిన్ చేయండి.');
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      throw new Error('దయచేసి మీ వ్యాఖ్యను నమోదు చేయండి.');
    }

    const commentData = {
      storyId,
      userId: user.uid,
      userName: user.displayName || (user.email ? user.email.split('@')[0] : 'తెలుగు పాఠకుడు'),
      userPhotoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.uid)}`,
      text: trimmedText,
      status: 'visible' as const,
      likes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'stories', storyId, 'comments'), commentData);

    // Increment story commentsCount
    try {
      await updateDoc(doc(db, 'stories', storyId), {
        commentsCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Silent commentsCount increment on story:', err);
    }

    // Increment user commentsCount
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        commentsCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Silent commentsCount increment on user:', err);
    }

    return {
      id: docRef.id,
      storyId,
      user: {
        id: user.uid,
        name: commentData.userName,
        avatar: commentData.userPhotoURL,
      },
      content: trimmedText,
      createdAt: new Date().toISOString(),
      likes: 0,
    };
  }

  /**
   * Hide / moderate a comment (Admin / Author)
   */
  public async hideComment(storyId: string, commentId: string): Promise<void> {
    await updateDoc(doc(db, 'stories', storyId, 'comments', commentId), {
      status: 'hidden',
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Delete a comment
   */
  public async deleteComment(storyId: string, commentId: string): Promise<void> {
    await deleteDoc(doc(db, 'stories', storyId, 'comments', commentId));

    try {
      await updateDoc(doc(db, 'stories', storyId), {
        commentsCount: increment(-1),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Silent commentsCount decrement on story:', err);
    }
  }
}

export const commentService = new CommentService();
