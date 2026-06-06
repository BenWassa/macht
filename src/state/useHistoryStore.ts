import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CustomExercise,
  ExerciseInjury,
  SessionLog,
  Settings,
  UpgradeItem,
} from "@/domain/types";
import { MOCK_HISTORY } from "@/data/mockData";
import { todayIso } from "@/lib/format";

export interface MachtBackup {
  version: 1;
  exportedAt: string;
  history: SessionLog[];
  injuries: ExerciseInjury[];
  settings: Settings;
  customExercises?: CustomExercise[];
  upgrades?: UpgradeItem[];
}

interface HistoryState {
  sessions: SessionLog[];
  snapshots: MachtBackup[];
  addSession: (session: SessionLog) => void;
  updateSession: (id: string, patch: Partial<SessionLog>) => void;
  deleteSession: (id: string) => void;
  clearSessions: () => void;
  hydrateHistory: (sessions: SessionLog[]) => void;
  createBackup: (
    injuries: ExerciseInjury[],
    settings: Settings,
    customExercises?: CustomExercise[],
    upgrades?: UpgradeItem[],
  ) => MachtBackup;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      sessions: MOCK_HISTORY,
      snapshots: [],
      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions],
          snapshots: state.snapshots.slice(0, 29),
        })),
      updateSession: (id, patch) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, ...patch } : s,
          ),
        })),
      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        })),
      clearSessions: () => set({ sessions: [] }),
      hydrateHistory: (sessions) => set({ sessions }),
      createBackup: (
        injuries,
        settings,
        customExercises = [],
        upgrades = [],
      ) => ({
        version: 1,
        exportedAt: todayIso(),
        history: get().sessions,
        injuries,
        settings,
        customExercises,
        upgrades,
      }),
    }),
    {
      name: "macht_history",
      partialize: (state) => ({
        sessions: state.sessions,
        snapshots: state.snapshots,
      }),
    },
  ),
);
