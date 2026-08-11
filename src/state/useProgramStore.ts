import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProgramId } from "@/domain/shared/ids";
import type { Mesocycle, Program } from "@/domain/training/types";
import { demoStorageKey } from "@/lib/demoMode";

interface ProgramState {
  programs: Program[];
  mesocycles: Mesocycle[];
  activeProgramId?: ProgramId;
  upsertProgram: (program: Program) => void;
  upsertMesocycle: (mesocycle: Mesocycle) => void;
  setActiveProgram: (programId?: ProgramId) => void;
  hydrateProgramData: (programs: Program[], mesocycles: Mesocycle[]) => void;
}

export const useProgramStore = create<ProgramState>()(
  persist(
    (set) => ({
      programs: [],
      mesocycles: [],
      activeProgramId: undefined,
      upsertProgram: (program) =>
        set((state) => ({
          programs: state.programs.some((item) => item.id === program.id)
            ? state.programs.map((item) =>
                item.id === program.id ? program : item,
              )
            : [...state.programs, program],
        })),
      upsertMesocycle: (mesocycle) =>
        set((state) => ({
          mesocycles: state.mesocycles.some((item) => item.id === mesocycle.id)
            ? state.mesocycles.map((item) =>
                item.id === mesocycle.id ? mesocycle : item,
              )
            : [...state.mesocycles, mesocycle],
        })),
      setActiveProgram: (activeProgramId) => set({ activeProgramId }),
      hydrateProgramData: (programs, mesocycles) =>
        set({ programs, mesocycles }),
    }),
    {
      name: demoStorageKey("macht_program_v2"),
      partialize: (state) => ({
        programs: state.programs,
        mesocycles: state.mesocycles,
        activeProgramId: state.activeProgramId,
      }),
    },
  ),
);
