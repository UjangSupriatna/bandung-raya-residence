import { create } from "zustand";

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TestimonialStore {
  testimonials: Testimonial[];
  loading: boolean;
  initialized: boolean;
  fetchTestimonials: () => Promise<void>;
  refetchTestimonials: () => Promise<void>;
}

export const useTestimonialStore = create<TestimonialStore>((set, get) => ({
  testimonials: [],
  loading: false,
  initialized: false,
  fetchTestimonials: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const res = await fetch("/api/testimonials?limit=50");
      const data = await res.json();
      set({ testimonials: data.testimonials || [], initialized: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  refetchTestimonials: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/testimonials?limit=50");
      const data = await res.json();
      set({ testimonials: data.testimonials || [], initialized: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
