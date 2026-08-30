import {
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CategoryItem } from '../types';
import { MOCK_CATEGORIES } from './mockData';

const DEFAULT_CATEGORY_ITEMS: CategoryItem[] = MOCK_CATEGORIES.map((c, i) => ({
  id: `cat-${i + 1}`,
  name: c.name,
  teluguName: c.name,
  description: c.description,
  storyCount: c.count || 0,
  status: 'active',
}));

export class CategoryService {
  /**
   * Fetch categories from Firestore (falling back to predefined default list if Firestore is empty)
   */
  public async getCategories(): Promise<CategoryItem[]> {
    try {
      const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
      const snap = await getDocs(q);

      if (!snap.empty) {
        return snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || '',
            teluguName: data.teluguName || data.name || '',
            description: data.description || '',
            storyCount: data.storyCount || 0,
            status: data.status || 'active',
          };
        });
      }
    } catch (err) {
      console.warn('Error fetching categories from Firestore:', err);
    }

    return DEFAULT_CATEGORY_ITEMS;
  }

  /**
   * Create or update a category (Admin)
   */
  public async saveCategory(category: CategoryItem): Promise<void> {
    const docRef = doc(db, 'categories', category.id);
    await setDoc(docRef, {
      id: category.id,
      name: category.name,
      teluguName: category.teluguName,
      description: category.description || '',
      storyCount: category.storyCount || 0,
      status: category.status || 'active',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });
  }

  /**
   * Delete a category (Admin)
   */
  public async deleteCategory(categoryId: string): Promise<void> {
    await deleteDoc(doc(db, 'categories', categoryId));
  }
}

export const categoryService = new CategoryService();
