import { useSettingsStore } from "@/state/useSettingsStore";

type AudioCtor = new (options?: AudioContextOptions) => AudioContext;

let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const win = window as Window & {
    AudioContext?: AudioCtor;
    webkitAudioContext?: AudioCtor;
  };
  const Ctor = win.AudioContext ?? win.webkitAudioContext;
  if (!Ctor) return null;
  if (!context) context = new Ctor();
  return context;
}

function scheduleBeep(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  volume: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  osc.connect(gain).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function chirp(): void {
  if (!useSettingsStore.getState().audioCue) return;
  const ctx = getContext();
  if (!ctx) return;
  try {
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    scheduleBeep(ctx, 880, now, 0.08, 0.04);
    scheduleBeep(ctx, 1046, now + 0.15, 0.08, 0.04);
    scheduleBeep(ctx, 1318, now + 0.30, 0.12, 0.05);
  } catch {
    // ignore — autoplay policies may block
  }
}
