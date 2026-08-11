import { create } from "zustand";
import { persist } from "zustand/middleware";
import { demoStorageKey } from "@/lib/demoMode";

export type TabId = "home" | "templates" | "workout" | "progress" | "profile";

const VALID_TABS: TabId[] = [
  "home",
  "templates",
  "workout",
  "progress",
  "profile",
];

const isTabId = (value: unknown): value is TabId =>
  typeof value === "string" && VALID_TABS.includes(value as TabId);

interface UiState {
  activeTab: TabId;
  progressionHintSeen: boolean;
  setActiveTab: (tab: TabId) => void;
  dismissProgressionHint: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      activeTab: "home",
      progressionHintSeen: false,
      setActiveTab: (activeTab) => set({ activeTab }),
      dismissProgressionHint: () => set({ progressionHintSeen: true }),
    }),
    {
      name: demoStorageKey("macht_ui"),
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Partial<UiState>;
        return {
          ...state,
          activeTab: isTabId(state.activeTab) ? state.activeTab : "home",
        };
      },
    },
  ),
);
