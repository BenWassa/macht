import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProgressionDecision } from "@/domain/progression/types";
import { demoStorageKey } from "@/lib/demoMode";

interface ProgressionState {
  decisions: ProgressionDecision[];
  addDecisions: (decisions: ProgressionDecision[]) => void;
  hydrateDecisions: (decisions: ProgressionDecision[]) => void;
}

export const useProgressionStore = create<ProgressionState>()(
  persist(
    (set) => ({
      decisions: [],
      addDecisions: (decisions) =>
        set((state) => ({
          decisions: [
            ...decisions,
            ...state.decisions.filter(
              (existing) => !decisions.some((item) => item.id === existing.id),
            ),
          ],
        })),
      hydrateDecisions: (decisions) => set({ decisions }),
    }),
    {
      name: demoStorageKey("macht_progression_v2"),
      partialize: (state) => ({ decisions: state.decisions }),
    },
  ),
);
