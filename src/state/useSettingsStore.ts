import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EffortMode, Settings, Units } from "@/domain/types";
import { demoStorageKey } from "@/lib/demoMode";

interface SettingsState extends Settings {
  setUnits: (units: Units) => void;
  setDefaultRest: (defaultRest: number) => void;
  setRpeMode: (rpeMode: EffortMode) => void;
  setHaptics: (haptics: boolean) => void;
  setAudioCue: (audioCue: boolean) => void;
  hydrateSettings: (settings: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      units: "lbs",
      defaultRest: 90,
      rpeMode: "RPE",
      haptics: true,
      audioCue: false,
      setUnits: (units) => set({ units }),
      setDefaultRest: (defaultRest) => set({ defaultRest }),
      setRpeMode: (rpeMode) => set({ rpeMode }),
      setHaptics: (haptics) => set({ haptics }),
      setAudioCue: (audioCue) => set({ audioCue }),
      hydrateSettings: (settings) =>
        set((state) => ({
          units: settings.units ?? state.units,
          defaultRest: settings.defaultRest ?? state.defaultRest,
          rpeMode: settings.rpeMode ?? state.rpeMode,
          haptics: settings.haptics ?? state.haptics,
          audioCue: settings.audioCue ?? state.audioCue,
        })),
    }),
    { name: demoStorageKey("macht_settings") },
  ),
);
