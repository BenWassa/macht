import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EffortMode, Settings, Units } from "@/domain/types";

interface SettingsState extends Settings {
  setUnits: (units: Units) => void;
  setDefaultRest: (defaultRest: number) => void;
  setRpeMode: (rpeMode: EffortMode) => void;
  hydrateSettings: (settings: Settings) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      units: "lbs",
      defaultRest: 90,
      rpeMode: "RPE",
      setUnits: (units) => set({ units }),
      setDefaultRest: (defaultRest) => set({ defaultRest }),
      setRpeMode: (rpeMode) => set({ rpeMode }),
      hydrateSettings: (settings) => set(settings),
    }),
    { name: "macht_settings" },
  ),
);
