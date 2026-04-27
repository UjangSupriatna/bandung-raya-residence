import { create } from "zustand";

export interface BankItem {
  id: string;
  name: string;
  description: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface BankStore {
  bankItems: BankItem[];
  loading: boolean;
  initialized: boolean;
  fetchBankItems: () => Promise<void>;
  refetchBankItems: () => Promise<void>;
}

export const useBankStore = create<BankStore>((set, get) => ({
  bankItems: [],
  loading: false,
  initialized: false,
  fetchBankItems: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const res = await fetch("/api/banks?limit=50");
      const data = await res.json();
      set({ bankItems: data.items || [], initialized: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  refetchBankItems: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/banks?limit=50");
      const data = await res.json();
      set({ bankItems: data.items || [], initialized: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
