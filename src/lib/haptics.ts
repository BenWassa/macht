import { useSettingsStore } from "@/state/useSettingsStore";

export function vibrate(pattern: number | number[]): void {
  if (!useSettingsStore.getState().haptics) return;
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // browsers may throw if vibration is disallowed by policy
  }
}
