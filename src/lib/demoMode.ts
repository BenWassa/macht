export const IS_DEMO_MODE =
  import.meta.env.DEV && import.meta.env.MODE === "demo";

export const demoStorageKey = (key: string) =>
  IS_DEMO_MODE ? `${key}_demo` : key;
