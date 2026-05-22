import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TabId = "home" | "templates" | "workout" | "progress" | "profile";

interface UiState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      activeTab: "workout",
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    { name: "macht_ui" },
  ),
);
