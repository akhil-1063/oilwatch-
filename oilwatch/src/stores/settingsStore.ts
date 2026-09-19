import { create } from "zustand";
import type { AppSettings, Role } from "../types";

const STORAGE_KEY = "oilwatch-settings";

const DEFAULT_SETTINGS: AppSettings = {
  role: "Analyst",
  highContrast: false,
  reducedMotion: false,
  textScale: 1,
  activeCaseId: null,
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function persist(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* non-fatal */
  }
}

interface SettingsStoreState extends AppSettings {
  setRole: (role: Role) => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  setTextScale: (scale: number) => void;
}

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  ...loadSettings(),

  setRole: (role) => {
    persist({ ...get(), role });
    set({ role });
  },
  toggleHighContrast: () => {
    const next = !get().highContrast;
    persist({ ...get(), highContrast: next });
    set({ highContrast: next });
  },
  toggleReducedMotion: () => {
    const next = !get().reducedMotion;
    persist({ ...get(), reducedMotion: next });
    set({ reducedMotion: next });
  },
  setTextScale: (scale) => {
    persist({ ...get(), textScale: scale });
    set({ textScale: scale });
  },
}));
