import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SessionLog } from "@/domain/types";
import { DEMO_HISTORY } from "@/data/demoData";
import { IS_DEMO_MODE, demoStorageKey } from "@/lib/demoMode";

interface HistoryState {
  sessions: SessionLog[];
  addSession: (session: SessionLog) => void;
  updateSession: (id: string, patch: Partial<SessionLog>) => void;
  deleteSession: (id: string) => void;
  clearSessions: () => void;
  hydrateHistory: (sessions: SessionLog[]) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      sessions: IS_DEMO_MODE ? DEMO_HISTORY : [],
      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions],
        })),
      updateSession: (id, patch) =>
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id ? { ...session, ...patch } : session,
          ),
        })),
      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((session) => session.id !== id),
        })),
      clearSessions: () => set({ sessions: [] }),
      hydrateHistory: (sessions) => set({ sessions }),
    }),
    {
      name: demoStorageKey("macht_history"),
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Partial<HistoryState>;
        return { sessions: state.sessions ?? [] };
      },
      partialize: (state) => ({ sessions: state.sessions }),
    },
  ),
);
