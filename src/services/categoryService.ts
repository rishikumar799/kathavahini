import {
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CategoryItem, StoryCategory } from '../types';
import { MOCK_CATEGORIES } from './mockData';
import { deletionTracker } from './deletionTracker';

export interface FormattedCategoryViewItem {
  id: string;
  name: StoryCategory;
  teluguName: string;
  description: string;
  icon: string;
  count: number;
  status: 'active' | 'archived' | 'deleted';
  isActive: boolean;
}

const CATEGORY_ICONS_MAP: Record<string, string> = {
  'ప్రేమ': 'Heart',
  'కుటుంబం': 'Users',
  'స్నేహం': 'Smile',
  'జీవితం': 'Compass',
  'ప్రేరణ': 'Zap',
  'హాస్యం': 'Laugh',
  'రహస్యం': 'Key',
  'థ్రిల్లర్': 'ShieldAlert',
  'ఫాంటసీ': 'Sparkles',
  'చారిత్రక': 'BookOpen',
  'భయం': 'Moon',
  'పిల్లల కథలు': 'Feather',
  'ఆధ్యాత్మికం': 'Sparkles',
  'సామాజికం': 'Users',
  'గ్రామీణ కథలు': 'Compass',
  'సాహిత్యం': 'BookOpen',
};

export function getCanonicalCategoryId(name: string): string {
  return `cat-${encodeURIComponent(name.trim())}`;
}

const DEFAULT_CATEGORY_ITEMS: CategoryItem[] = MOCK_CATEGORIES.map((c) => ({
  id: getCanonicalCategoryId(c.name),
  name: c.name,
  teluguName: c.name,
  description: c.description,
  icon: c.icon || CATEGORY_ICONS_MAP[c.name] || 'BookOpen',
  storyCount: c.count || 0,
  status: 'active',
  isActive: true,
}));

export class CategoryService {
  private cachedCategories: CategoryItem[] = [...DEFAULT_CATEGORY_ITEMS];
  private listeners: ((cats: CategoryItem[]) => void)[] = [];

  constructor() {
    // Listen for local events across tabs or components
    if (typeof window !== 'undefined') {
      window.addEventListener('kathavahini:categories-updated', () => {
        this.refreshAndNotify();
      });
      window.addEventListener('kathavahini:category-deleted', () => {
        this.refreshAndNotify();
      });
      window.addEventListener('kathavahini:refresh-content', () => {
        this.refreshAndNotify();
      });
    }
  }

  private async refreshAndNotify() {
    const cats = await this.getCategories();
    this.cachedCategories = cats;
    this.listeners.forEach(cb => {
      try {
        cb(cats);
      } catch (e) {}
    });
  }

  /**
   * Subscribe to real-time category updates from Firestore.
   * Emits updated categories whenever an Admin adds, archives, or modifies a category.
   */
  public subscribeCategories(callback: (categories: CategoryItem[]) => void): () => void {
    this.listeners.push(callback);
    // Immediately provide cached categories
    callback(this.cachedCategories);

    try {
      const colRef = collection(db, 'categories');
      const unsubscribe = onSnapshot(
        colRef,
        async (snapshot) => {
          await deletionTracker.init();

          const firestoreItems: CategoryItem[] = snapshot.docs.map((d) => {
            const data = d.data();
            const catName = data.name || data.teluguName || '';
            const status = (data.status === 'deleted' || data.deleted === true)
              ? 'deleted'
              : data.status === 'archived'
              ? 'archived'
              : 'active';
            return {
              id: d.id,
              name: catName,
              teluguName: data.teluguName || data.name || catName,
              slug: data.slug || catName.toLowerCase().replace(/\s+/g, '-'),
              description: data.description || '',
              icon: data.icon || CATEGORY_ICONS_MAP[catName] || 'BookOpen',
              contentType: data.contentType || 'all',
              storyCount: data.storyCount || 0,
              status: status as 'active' | 'archived' | 'deleted',
              isActive: status === 'active',
              sortOrder: data.sortOrder || 0,
            };
          });

          // Merge with default items so built-in categories are present unless deleted or overridden
          const mergedMap = new Map<string, CategoryItem>();

          DEFAULT_CATEGORY_ITEMS.forEach((d) => {
            if (!deletionTracker.isDeleted(d.id) && !deletionTracker.isDeleted(d.name) && !deletionTracker.isDeleted(d.teluguName)) {
              mergedMap.set(d.name, { ...d });
            }
          });

          firestoreItems.forEach((f) => {
            const isDel = f.status === 'deleted' ||
              deletionTracker.isDeleted(f.id) ||
              deletionTracker.isDeleted(f.name) ||
              deletionTracker.isDeleted(f.teluguName);

            if (isDel) {
              mergedMap.delete(f.name);
              mergedMap.delete(f.teluguName);
            } else {
              // Properly sets active or archived status
              mergedMap.set(f.name, f);
            }
          });

          const finalCategories = Array.from(mergedMap.values());
          this.cachedCategories = finalCategories;
          callback(finalCategories);
        },
        (err) => {
          console.warn('Real-time categories listener note:', err);
          callback(this.cachedCategories);
        }
      );

      return () => {
        this.listeners = this.listeners.filter(cb => cb !== callback);
        unsubscribe();
      };
    } catch (e) {
      console.warn('Could not initialize categories snapshot listener:', e);
      callback(this.cachedCategories);
      return () => {
        this.listeners = this.listeners.filter(cb => cb !== callback);
      };
    }
  }

  /**
   * Fetch categories from Firestore (falling back to predefined default list if Firestore is empty)
   */
  public async getCategories(): Promise<CategoryItem[]> {
    try {
      await deletionTracker.init();
      const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
      const snap = await getDocs(q);

      const mergedMap = new Map<string, CategoryItem>();

      DEFAULT_CATEGORY_ITEMS.forEach((d) => {
        if (!deletionTracker.isDeleted(d.id) && !deletionTracker.isDeleted(d.name) && !deletionTracker.isDeleted(d.teluguName)) {
          mergedMap.set(d.name, { ...d });
        }
      });

      if (!snap.empty) {
        snap.docs.forEach((d) => {
          const data = d.data();
          const catName = data.name || data.teluguName || '';
          const status = (data.status === 'deleted' || data.deleted === true)
            ? 'deleted'
            : data.status === 'archived'
            ? 'archived'
            : 'active';

          const isDel = status === 'deleted' ||
            deletionTracker.isDeleted(d.id) ||
            deletionTracker.isDeleted(catName) ||
            deletionTracker.isDeleted(data.teluguName);

          if (isDel) {
            mergedMap.delete(catName);
            if (data.teluguName) mergedMap.delete(data.teluguName);
          } else {
            mergedMap.set(catName, {
              id: d.id,
              name: catName,
              teluguName: data.teluguName || catName,
              slug: data.slug || catName.toLowerCase().replace(/\s+/g, '-'),
              description: data.description || '',
              icon: data.icon || CATEGORY_ICONS_MAP[catName] || 'BookOpen',
              contentType: data.contentType || 'all',
              storyCount: data.storyCount || 0,
              status: status as 'active' | 'archived' | 'deleted',
              isActive: status === 'active',
              sortOrder: data.sortOrder || 0,
            });
          }
        });
      }

      this.cachedCategories = Array.from(mergedMap.values());
      return this.cachedCategories;
    } catch (err) {
      console.warn('Error fetching categories from Firestore:', err);
    }

    return this.cachedCategories.filter(c => !deletionTracker.isDeleted(c.id) && !deletionTracker.isDeleted(c.name));
  }

  /**
   * Helper to format categories for reader views (HomeView, StoriesView, CategoriesView)
   * When onlyActive is true: strictly filters out archived and deleted categories.
   */
  public formatForViews(
    categories: CategoryItem[] = this.cachedCategories,
    onlyActive: boolean = true
  ): FormattedCategoryViewItem[] {
    const list = categories.filter((c) => {
      if (c.status === 'deleted' || (c as any).deleted) return false;
      if (deletionTracker.isDeleted(c.id) || deletionTracker.isDeleted(c.name) || deletionTracker.isDeleted(c.teluguName)) return false;
      if (onlyActive) {
        return c.status === 'active' && c.isActive !== false;
      }
      return true;
    });

    return list.map((c) => ({
      id: c.id,
      name: (c.teluguName || c.name) as StoryCategory,
      teluguName: c.teluguName || c.name,
      description: c.description || 'తెలుగు కథల సమాహారం',
      icon: c.icon || CATEGORY_ICONS_MAP[c.name] || CATEGORY_ICONS_MAP[c.teluguName] || 'BookOpen',
      count: c.storyCount || 0,
      status: c.status,
      isActive: c.status === 'active',
    }));
  }

  /**
   * Create or update a category (Admin)
   */
  public async saveCategory(category: CategoryItem): Promise<void> {
    const docRef = doc(db, 'categories', category.id);
    await setDoc(
      docRef,
      {
        id: category.id,
        name: category.name,
        teluguName: category.teluguName || category.name,
        description: category.description || '',
        icon: category.icon || CATEGORY_ICONS_MAP[category.name] || 'BookOpen',
        storyCount: category.storyCount || 0,
        status: category.status || 'active',
        isActive: category.status === 'active',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kathavahini:categories-updated', { detail: { categoryId: category.id } }));
    }
  }

  /**
   * Delete a category (Admin)
   */
  public async deleteCategory(categoryId: string, categoryName?: string): Promise<void> {
    await deletionTracker.markDeleted(categoryId, 'category');
    if (categoryName) {
      await deletionTracker.markDeleted(categoryName, 'category');
    }

    try {
      await setDoc(doc(db, 'categories', categoryId), {
        status: 'deleted',
        isActive: false,
        deleted: true,
        updatedAt: serverTimestamp(),
        deletedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kathavahini:categories-updated', { detail: { categoryId } }));
      window.dispatchEvent(new CustomEvent('kathavahini:category-deleted', { detail: { categoryId, categoryName } }));
    }
  }
}

export const categoryService = new CategoryService();
