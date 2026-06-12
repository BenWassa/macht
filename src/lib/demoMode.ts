const DEMO_STORAGE_BASE_KEYS = [
  "macht_history",
  "macht_injuries",
  "macht_settings",
  "macht_custom_exercises",
  "macht_ui",
  "macht_workout",
] as const;

export const IS_DEMO_MODE =
  import.meta.env.MODE === "demo" || import.meta.env.VITE_DEMO_MODE === "true";

export const demoStorageKey = (key: string) =>
  IS_DEMO_MODE ? `${key}_demo` : key;

export const DEMO_STORAGE_KEYS = DEMO_STORAGE_BASE_KEYS.map(
  (key) => `${key}_demo`,
);
