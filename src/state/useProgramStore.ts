import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlannedSessionId, ProgramId } from "@/domain/shared/ids";
import type { Mesocycle, Program } from "@/domain/training/types";
import { demoStorageKey } from "@/lib/demoMode";

interface ProgramState {
  programs: Program[];
  mesocycles: Mesocycle[];
  activeProgramId?: ProgramId;
  upsertProgram: (program: Program) => void;
  upsertMesocycle: (mesocycle: Mesocycle) => void;
  setActiveProgram: (programId?: ProgramId) => void;
  completePlannedSession: (plannedSessionId: PlannedSessionId) => void;
  hydrateProgramData: (programs: Program[], mesocycles: Mesocycle[]) => void;
}

const completeSession = (
  mesocycle: Mesocycle,
  plannedSessionId: PlannedSessionId,
): Mesocycle => {
  let changed = false;
  const weeks = mesocycle.weeks.map((week) => ({
    ...week,
    sessions: week.sessions.map((session) => {
      if (session.id !== plannedSessionId) return session;
      changed = true;
      return { ...session, status: "completed" as const };
    }),
  }));
  if (!changed) return mesocycle;
  const allResolved = weeks.every((week) =>
    week.sessions.every(
      (session) => session.status === "completed" || session.status === "skipped",
    ),
  );
  return {
    ...mesocycle,
    weeks,
    status: allResolved ? "completed" : mesocycle.status,
  };
};

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
      completePlannedSession: (plannedSessionId) =>
        set((state) => ({
          mesocycles: state.mesocycles.map((mesocycle) =>
            completeSession(mesocycle, plannedSessionId),
          ),
        })),
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
