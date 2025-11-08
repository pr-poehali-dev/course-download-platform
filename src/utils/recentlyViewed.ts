interface RecentWork {
  id: string;
  title: string;
  workType: string;
  subject: string;
  price: number;
  rating: number;
  previewUrl: string | null;
  viewedAt: number;
}

const STORAGE_KEY = 'recently_viewed_works';
const MAX_RECENT = 5;

export const recentlyViewedStorage = {
  add: (work: Omit<RecentWork, 'viewedAt'>): void => {
    try {
      const existing = recentlyViewedStorage.get();
      
      const filtered = existing.filter(w => w.id !== work.id);
      
      const updated = [
        { ...work, viewedAt: Date.now() },
        ...filtered
      ].slice(0, MAX_RECENT);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recently viewed:', error);
    }
  },

  get: (): RecentWork[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to load recently viewed:', error);
      return [];
    }
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear recently viewed:', error);
    }
  }
};
