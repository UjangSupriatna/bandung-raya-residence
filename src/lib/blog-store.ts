import { create } from "zustand";

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  images: string[];
  published: boolean;
  readTime: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  dateFormatted?: string;
}

interface BlogStore {
  articles: BlogArticle[];
  loading: boolean;
  initialized: boolean;
  fetchArticles: () => Promise<void>;
  refetchArticles: () => Promise<void>;
  fetchArticleBySlug: (slug: string) => Promise<BlogArticle | null>;
}

export const useBlogStore = create<BlogStore>((set, get) => ({
  articles: [],
  loading: false,
  initialized: false,
  fetchArticles: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const res = await fetch("/api/blogs?limit=20");
      const data = await res.json();
      set({ articles: data.blogs || [], initialized: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  refetchArticles: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/blogs?limit=20");
      const data = await res.json();
      set({ articles: data.blogs || [], initialized: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  fetchArticleBySlug: async (slug: string) => {
    // First check if already in store
    const existing = get().articles.find((a) => a.slug === slug);
    if (existing) return existing;

    // Otherwise fetch from API by slug
    try {
      const res = await fetch(`/api/blogs?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      const article = data.blogs?.[0] || null;
      if (article) {
        // Add to store
        const current = get().articles;
        if (!current.find((a) => a.id === article.id)) {
          set({ articles: [...current, article] });
        }
      }
      return article;
    } catch {
      return null;
    }
  },
}));
