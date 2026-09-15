import { doc, getDocs, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const STORAGE_KEY = 'kathavahini_deleted_entity_ids';

class DeletionTracker {
  private deletedIds: Set<string> = new Set<string>();
  private initialized: boolean = false;

  constructor() {
    // Read from localStorage on startup for zero-latency client state
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach(id => this.deletedIds.add(id));
        }
      }
    } catch (e) {
      // Ignore storage errors in restricted contexts
    }

    // Listen for storage events from other tabs/windows
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (Array.isArray(parsed)) {
              parsed.forEach(id => this.deletedIds.add(id));
              window.dispatchEvent(new CustomEvent('kathavahini:refresh-content'));
            }
          } catch (err) {}
        }
      });
    }
  }

  public async init(): Promise<Set<string>> {
    if (this.initialized) return this.deletedIds;
    try {
      const snap = await getDocs(collection(db, 'deletedItems'));
      snap.forEach(d => {
        this.deletedIds.add(d.id);
        const data = d.data();
        if (data.id) this.deletedIds.add(data.id);
      });
      this.syncToStorage();
      this.initialized = true;
    } catch (e) {
      console.warn('Could not sync deletedItems from Firestore, using local cache:', e);
    }
    return this.deletedIds;
  }

  public isDeleted(id: string): boolean {
    if (!id) return false;
    return this.deletedIds.has(id);
  }

  public async markDeleted(id: string, type: string = 'generic', adminUid?: string): Promise<void> {
    if (!id) return;
    this.deletedIds.add(id);
    this.syncToStorage();

    // Trigger instant UI synchronization across the app
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kathavahini:item-deleted', { detail: { id, type } }));
      if (type === 'story') {
        window.dispatchEvent(new CustomEvent('kathavahini:story-deleted', { detail: { storyId: id } }));
      }
      window.dispatchEvent(new CustomEvent('kathavahini:refresh-content'));
    }

    try {
      await setDoc(doc(db, 'deletedItems', id), {
        id,
        type,
        deletedAt: serverTimestamp(),
        deletedBy: adminUid || 'admin',
      }, { merge: true });
    } catch (e) {
      console.warn(`Could not record deletion of ${id} to Firestore:`, e);
    }
  }

  public filterDeleted<T extends { id: string }>(items: T[]): T[] {
    return items.filter(item => !this.isDeleted(item.id) && !(item as any).deleted && (item as any).status !== 'deleted');
  }

  public getDeletedIds(): Set<string> {
    return new Set(this.deletedIds);
  }

  private syncToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.deletedIds)));
    } catch (e) {}
  }
}

export const deletionTracker = new DeletionTracker();
