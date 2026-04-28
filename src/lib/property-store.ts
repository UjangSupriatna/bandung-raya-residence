import { create } from "zustand";

// ──── Property Type (matches Prisma Property model) ────
export interface Property {
  id: string;
  name: string;
  slug: string;
  type: string;
  category: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  landArea: number;
  buildingArea: number;
  status: string;
  description: string;
  features: string[];
  images: string[];
  tag: string;
  installment: string;
  financingTypes: string[];
  dpOptions: number[];
  tenorOptions: number[];
  installments: Record<string, Record<string, number>>;
  syariahMargin: number;
  kprDpOptions: number[];
  kprTenorOptions: number[];
  kprInstallments: Record<string, Record<string, number>>;
  kprInterestRate: number;
  kprInterestType: string;
  videoUrl: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  // Derived fields for frontend compatibility
  gallery?: string[];
  image?: string;
}

interface PropertyStore {
  properties: Property[];
  loading: boolean;
  initialized: boolean;
  fetchProperties: () => Promise<void>;
  refetchProperties: () => Promise<void>;
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  properties: [],
  loading: false,
  initialized: false,
  fetchProperties: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const res = await fetch("/api/properties");
      const data = await res.json();
      const mapped = (data as Property[]).map((p) => ({
        ...p,
        gallery: p.images || [],
        image: (p.images || [])[0] || "",
      }));
      set({ properties: mapped, initialized: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  refetchProperties: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/properties");
      const data = await res.json();
      const mapped = (data as Property[]).map((p) => ({
        ...p,
        gallery: p.images || [],
        image: (p.images || [])[0] || "",
      }));
      set({ properties: mapped, initialized: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
