export type InterfaceTone =
  | "neutral"
  | "positive"
  | "caution"
  | "negative"
  | "info"
  | "signal";

export const toneClasses: Record<InterfaceTone, string> = {
  neutral: "bg-surface-2 text-text-secondary",
  positive: "bg-[var(--color-positive-soft)] text-positive",
  caution: "bg-[var(--color-caution-soft)] text-caution",
  negative: "bg-[var(--color-negative-soft)] text-negative",
  info: "bg-[var(--color-info-soft)] text-info",
  signal: "bg-signal-soft text-signal-strong",
};

export const chartSeries = {
  performance: "var(--chart-performance)",
  load: "var(--chart-load)",
  volume: "var(--chart-volume)",
  fatigue: "var(--chart-fatigue)",
  baseline: "var(--chart-baseline)",
} as const;

export const motion = {
  acknowledgementMs: 120,
  enterMs: 220,
  celebrationMs: 520,
} as const;

export const trainingStateTone = {
  completed: "positive",
  recovered: "positive",
  personalRecord: "signal",
  attention: "caution",
  fatigued: "caution",
  explanation: "info",
  destructive: "negative",
  empty: "neutral",
} as const satisfies Record<string, InterfaceTone>;
