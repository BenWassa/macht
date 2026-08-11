import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TrainingConstraint } from "@/domain/constraints/types";
import { demoStorageKey } from "@/lib/demoMode";

interface TrainingConstraintState {
  constraints: TrainingConstraint[];
  addConstraint: (constraint: TrainingConstraint) => void;
  updateConstraint: (
    id: string,
    patch: Partial<Omit<TrainingConstraint, "id" | "createdAt">>,
  ) => void;
  removeConstraint: (id: string) => void;
  setConstraintActive: (id: string, active: boolean) => void;
  hydrateConstraints: (constraints: TrainingConstraint[]) => void;
}

export const useTrainingConstraintStore = create<TrainingConstraintState>()(
  persist(
    (set) => ({
      constraints: [],
      addConstraint: (constraint) =>
        set((state) => ({
          constraints: [
            ...state.constraints.filter((item) => item.id !== constraint.id),
            constraint,
          ],
        })),
      updateConstraint: (id, patch) =>
        set((state) => ({
          constraints: state.constraints.map((constraint) =>
            constraint.id === id ? { ...constraint, ...patch } : constraint,
          ),
        })),
      removeConstraint: (id) =>
        set((state) => ({
          constraints: state.constraints.filter((constraint) => constraint.id !== id),
        })),
      setConstraintActive: (id, active) =>
        set((state) => ({
          constraints: state.constraints.map((constraint) =>
            constraint.id === id ? { ...constraint, active } : constraint,
          ),
        })),
      hydrateConstraints: (constraints) => set({ constraints }),
    }),
    {
      name: demoStorageKey("macht_training_constraints"),
      partialize: (state) => ({ constraints: state.constraints }),
    },
  ),
);
