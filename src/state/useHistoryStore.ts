import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExerciseInjury, SessionLog, Settings } from "@/domain/types";
import { MOCK_HISTORY } from "@/data/mockData";
import { todayIso } from "@/lib/format";

export interface MachtBackup {
  version: 1;
  exportedAt: string;
  history: SessionLog[];
  injuries: ExerciseInjury[];
  settings: Settings;
}

interface HistoryState {
  sessions: SessionLog[];
  snapshots: MachtBackup[];
  addSession: (session: SessionLog) => void;
  deleteSession: (id: string) => void;
  clearSessions: () => void;
  hydrateHistory: (sessions: SessionLog[]) => void;
  createBackup: (injuries: ExerciseInjury[], settings: Settings) => MachtBackup;
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
      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        })),
      clearSessions: () => set({ sessions: [] }),
      hydrateHistory: (sessions) => set({ sessions }),
      createBackup: (injuries, settings) => ({
        version: 1,
        exportedAt: todayIso(),
        history: get().sessions,
        injuries,
        settings,
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
