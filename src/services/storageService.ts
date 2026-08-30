import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '../lib/firebase';

export class StorageService {
  /**
   * Upload user profile avatar
   * Path: users/{uid}/profile/{file}
   */
  public async uploadProfileImage(uid: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `users/${uid}/profile/avatar_${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, filePath);
    
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: uid,
        timestamp: new Date().toISOString(),
      },
    });

    return await getDownloadURL(snapshot.ref);
  }

  /**
   * Upload writer / author cover or profile image
   * Path: writers/{uid}/profile/{file}
   */
  public async uploadWriterImage(uid: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `writers/${uid}/profile/writer_${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, filePath);
    
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: uid,
      },
    });

    return await getDownloadURL(snapshot.ref);
  }

  /**
   * Upload story cover image
   * Path: stories/{storyId}/cover/{file}
   */
  public async uploadStoryCover(storyId: string, file: File): Promise<string> {
    const uid = auth.currentUser?.uid || 'anonymous';
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `stories/${storyId}/cover/cover_${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, filePath);
    
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: uid,
        storyId,
      },
    });

    return await getDownloadURL(snapshot.ref);
  }

  /**
   * Upload novel cover image
   * Path: novels/{novelId}/cover/{file}
   */
  public async uploadNovelCover(novelId: string, file: File): Promise<string> {
    const uid = auth.currentUser?.uid || 'anonymous';
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `novels/${novelId}/cover/cover_${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, filePath);
    
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: uid,
        novelId,
      },
    });

    return await getDownloadURL(snapshot.ref);
  }

  /**
   * Upload knowledge article cover image
   * Path: knowledge/{knowledgeId}/cover/{file}
   */
  public async uploadKnowledgeCover(knowledgeId: string, file: File): Promise<string> {
    const uid = auth.currentUser?.uid || 'anonymous';
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `knowledge/${knowledgeId}/cover/cover_${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, filePath);
    
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: uid,
        knowledgeId,
      },
    });

    return await getDownloadURL(snapshot.ref);
  }
}

export const storageService = new StorageService();
