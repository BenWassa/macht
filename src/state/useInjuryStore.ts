import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExerciseInjury } from '@/domain/types';
import { INITIAL_INJURIES } from '@/data/mockData';
import { todayIso } from '@/lib/format';

interface InjuryState {
  injuries: ExerciseInjury[];
  addInjury: (injury: Omit<ExerciseInjury, 'id' | 'dateAdded'>) => void;
  updateInjury: (id: string, patch: Partial<ExerciseInjury>) => void;
  removeInjury: (id: string) => void;
  clearInjury: (id: string) => ExerciseInjury | undefined;
  hydrateInjuries: (injuries: ExerciseInjury[]) => void;
}

export const useInjuryStore = create<InjuryState>()(
  persist(
    (set, get) => ({
      injuries: INITIAL_INJURIES,
      addInjury: (injury) =>
        set((state) => ({
          injuries: [
            ...state.injuries,
            { ...injury, id: crypto.randomUUID(), dateAdded: todayIso() },
          ],
        })),
      updateInjury: (id, patch) =>
        set((state) => ({
          injuries: state.injuries.map((injury) => (injury.id === id ? { ...injury, ...patch } : injury)),
        })),
      removeInjury: (id) => set((state) => ({ injuries: state.injuries.filter((injury) => injury.id !== id) })),
      clearInjury: (id) => {
        const injury = get().injuries.find((item) => item.id === id);
        if (!injury) return undefined;
        set((state) => ({
          injuries: state.injuries.map((item) => (item.id === id ? { ...item, clearedDate: todayIso() } : item)),
        }));
        return injury;
      },
      hydrateInjuries: (injuries) => set({ injuries }),
    }),
    { name: 'macht_injuries' },
  ),
);
