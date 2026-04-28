import { create } from "zustand";

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  videoUrl: string;
  sortOrder: number;
  createdAt: string;
}

interface GalleryStore {
  galleryItems: GalleryItem[];
  loading: boolean;
  initialized: boolean;
  fetchGalleryItems: () => Promise<void>;
  refetchGalleryItems: () => Promise<void>;
}

export const useGalleryStore = create<GalleryStore>((set, get) => ({
  galleryItems: [],
  loading: false,
  initialized: false,
  fetchGalleryItems: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const res = await fetch("/api/gallery?limit=100");
      const data = await res.json();
      set({ galleryItems: data.items || [], initialized: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  refetchGalleryItems: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/gallery?limit=100");
      const data = await res.json();
      set({ galleryItems: data.items || [], initialized: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
