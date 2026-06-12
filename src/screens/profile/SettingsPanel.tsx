import { APP_VERSION } from "@/lib/appMeta";
import { useSettingsStore } from "@/state/useSettingsStore";
import type { ReactNode } from "react";

export function SettingsPanel() {
  const settings = useSettingsStore();

  return (
    <div className="space-y-4">
      <h2 className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
        Settings
      </h2>
      <div className="divide-y divide-[#1a1a1a] border border-[#1a1a1a] bg-[#0c0c0c]">
        <SettingRow title="Units" subtitle="Weight display">
          {(["lbs", "kgs"] as const).map((unit) => (
            <button
              key={unit}
              onClick={() => settings.setUnits(unit)}
              className={`px-3 py-1 text-xs transition ${settings.units === unit ? "bg-blue-600 font-bold text-white" : "text-neutral-500 hover:text-neutral-300"}`}
            >
              {unit.toUpperCase()}
            </button>
          ))}
        </SettingRow>
        <SettingRow title="Default rest" subtitle="Auto-starts after each set">
          {[60, 90, 120, 150].map((seconds) => (
            <button
              key={seconds}
              onClick={() => settings.setDefaultRest(seconds)}
              className={`px-2.5 py-1 text-xs transition ${settings.defaultRest === seconds ? "bg-blue-600 font-bold text-white" : "text-neutral-500 hover:text-neutral-300"}`}
            >
              {seconds}s
            </button>
          ))}
        </SettingRow>
        <SettingRow
          title="Effort scale"
          subtitle="How you log perceived effort"
        >
          {(["RPE", "RIR"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => settings.setRpeMode(mode)}
              className={`px-3 py-1 text-xs transition ${settings.rpeMode === mode ? "bg-blue-600 font-bold text-white" : "text-neutral-500 hover:text-neutral-300"}`}
            >
              {mode}
            </button>
          ))}
        </SettingRow>
        <SettingRow title="Haptics" subtitle="Vibrate on set complete">
          {([true, false] as const).map((val) => (
            <button
              key={String(val)}
              onClick={() => settings.setHaptics(val)}
              className={`px-3 py-1 text-xs transition ${settings.haptics === val ? "bg-blue-600 font-bold text-white" : "text-neutral-500 hover:text-neutral-300"}`}
            >
              {val ? "ON" : "OFF"}
            </button>
          ))}
        </SettingRow>
        <SettingRow title="Rest sound" subtitle="Audio cue at timer zero">
          {([false, true] as const).map((val) => (
            <button
              key={String(val)}
              onClick={() => settings.setAudioCue(val)}
              className={`px-3 py-1 text-xs transition ${settings.audioCue === val ? "bg-blue-600 font-bold text-white" : "text-neutral-500 hover:text-neutral-300"}`}
            >
              {val ? "ON" : "OFF"}
            </button>
          ))}
        </SettingRow>
        <InfoRow title="App version" subtitle="Installed build">
          v{APP_VERSION}
        </InfoRow>
      </div>
    </div>
  );
}

function SettingRow({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div>
        <span className="block text-xs font-bold uppercase tracking-tight">
          {title}
        </span>
        <span className="font-mono text-[10px] text-neutral-500">
          {subtitle}
        </span>
      </div>
      <div className="flex border border-[#1a1a1a] bg-black p-0.5 font-mono">
        {children}
      </div>
    </div>
  );
}

function InfoRow({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div>
        <span className="block text-xs font-bold uppercase tracking-tight">
          {title}
        </span>
        <span className="font-mono text-[10px] text-neutral-500">
          {subtitle}
        </span>
      </div>
      <span className="font-mono text-xs font-bold text-neutral-300">
        {children}
      </span>
    </div>
  );
}
