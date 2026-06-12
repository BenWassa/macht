import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TabId =
  | "home"
  | "templates"
  | "workout"
  | "progress"
  | "profile"
  | "freeplay";

interface UiState {
  activeTab: TabId;
  progressionHintSeen: boolean;
  setActiveTab: (tab: TabId) => void;
  dismissProgressionHint: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      activeTab: "workout",
      progressionHintSeen: false,
      setActiveTab: (activeTab) => set({ activeTab }),
      dismissProgressionHint: () => set({ progressionHintSeen: true }),
    }),
    { name: "macht_ui" },
  ),
);
