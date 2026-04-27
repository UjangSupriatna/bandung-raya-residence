import { create } from "zustand";

export interface SiteSettings {
  company_name: string;
  total_units_sold: string;
  company_legal_name: string;
  logo_url: string;
  hero_bg_image: string;
  location_bg_image: string;
  page_banner_image: string;
  tentangkami_image: string;
  contact_phone: string;
  contact_email: string;
  contact_wa: string;
  contact_address: string;
  contact_person: string;
  map_latitude: string;
  map_longitude: string;
  social_instagram: string;
  social_facebook: string;
  social_youtube: string;
  social_tiktok: string;
}

const DEFAULTS: SiteSettings = {
  company_name: "Bandung Raya Residence",
  total_units_sold: "500",
  company_legal_name: "PT Bumi Sanggar Meubel",
  logo_url: "",
  hero_bg_image: "/images/properties/hero_cover.png",
  location_bg_image: "/images/location.png",
  page_banner_image: "/images/properties/hero_cover.png",
  tentangkami_image: "/images/properties/hero_cover.png",
  contact_phone: "0812-8965-6707",
  contact_email: "info@brr.co.id",
  contact_wa: "6281289656707",
  contact_address: "Bandung, Jawa Barat",
  contact_person: "Fadhil BSM",
  map_latitude: "-6.9204",
  map_longitude: "107.7518",
  social_instagram: "bandung.raya.residence",
  social_facebook: "",
  social_youtube: "",
  social_tiktok: "",
};

interface SettingsStore {
  settings: SiteSettings;
  loading: boolean;
  initialized: boolean;
  fetchSettings: () => Promise<void>;
  refetchSettings: () => Promise<void>;
  get: <K extends keyof SiteSettings>(key: K) => SiteSettings[K];
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULTS,
  loading: false,
  initialized: false,
  fetchSettings: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      const merged: SiteSettings = { ...DEFAULTS };
      for (const key of Object.keys(DEFAULTS) as (keyof SiteSettings)[]) {
        if (data[key] !== undefined && data[key] !== "") {
          (merged as Record<string, string>)[key] = data[key];
        }
      }
      set({ settings: merged, initialized: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  refetchSettings: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      const merged: SiteSettings = { ...DEFAULTS };
      for (const key of Object.keys(DEFAULTS) as (keyof SiteSettings)[]) {
        if (data[key] !== undefined && data[key] !== "") {
          (merged as Record<string, string>)[key] = data[key];
        }
      }
      set({ settings: merged, initialized: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  get: <K extends keyof SiteSettings>(key: K): SiteSettings[K] => {
    return get().settings[key];
  },
}));
