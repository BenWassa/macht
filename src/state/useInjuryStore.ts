import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExerciseInjury } from "@/domain/types";
import { INITIAL_INJURIES } from "@/data/mockData";
import { todayIso } from "@/lib/format";
import { IS_DEMO_MODE, demoStorageKey } from "@/lib/demoMode";

interface InjuryState {
  injuries: ExerciseInjury[];
  addInjury: (injury: Omit<ExerciseInjury, "id" | "dateAdded">) => void;
  updateInjury: (id: string, patch: Partial<ExerciseInjury>) => void;
  removeInjury: (id: string) => void;
  clearInjury: (id: string) => ExerciseInjury | undefined;
  clearAllInjuries: () => void;
  hydrateInjuries: (injuries: ExerciseInjury[]) => void;
}

const defaultInjuries = (): ExerciseInjury[] =>
  IS_DEMO_MODE ? [...INITIAL_INJURIES] : [];

export const useInjuryStore = create<InjuryState>()(
  persist(
    (set, get) => ({
      injuries: defaultInjuries(),
      addInjury: (injury) =>
        set((state) => ({
          injuries: [
            ...state.injuries,
            { ...injury, id: crypto.randomUUID(), dateAdded: todayIso() },
          ],
        })),
      updateInjury: (id, patch) =>
        set((state) => ({
          injuries: state.injuries.map((injury) =>
            injury.id === id ? { ...injury, ...patch } : injury,
          ),
        })),
      removeInjury: (id) =>
        set((state) => ({
          injuries: state.injuries.filter((injury) => injury.id !== id),
        })),
      clearInjury: (id) => {
        const injury = get().injuries.find((item) => item.id === id);
        if (!injury) return undefined;
        set((state) => ({
          injuries: state.injuries.map((item) =>
            item.id === id ? { ...item, clearedDate: todayIso() } : item,
          ),
        }));
        return injury;
      },
      clearAllInjuries: () => set({ injuries: [] }),
      hydrateInjuries: (injuries) => set({ injuries }),
    }),
    {
      name: demoStorageKey("macht_injuries"),
      version: 3,
      migrate: (persisted) => {
        const state = persisted as Partial<InjuryState>;
        return {
          ...state,
          injuries: state.injuries ?? defaultInjuries(),
        };
      },
    },
  ),
);
