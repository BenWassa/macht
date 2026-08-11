import type { ReactNode } from "react";
import { APP_VERSION } from "@/lib/appMeta";
import { useSettingsStore } from "@/state/useSettingsStore";

interface ChoiceButtonProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

function ChoiceButton({ active, label, onClick }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 rounded-sm px-3 text-sm font-semibold transition ${
        active
          ? "bg-signal-soft text-signal-strong"
          : "text-text-muted hover:bg-surface-3 hover:text-text-secondary"
      }`}
    >
      {label}
    </button>
  );
}

export function SettingsPanel() {
  const settings = useSettingsStore();

  return (
    <div>
      <SettingRow title="Units" subtitle="Weight display">
        <div role="group" aria-label="Weight units" className="flex gap-1">
          {(["lbs", "kgs"] as const).map((unit) => (
            <ChoiceButton
              key={unit}
              active={settings.units === unit}
              label={unit.toUpperCase()}
              onClick={() => settings.setUnits(unit)}
            />
          ))}
        </div>
      </SettingRow>

      <SettingRow title="Default rest" subtitle="Auto-starts after a completed set">
        <div
          role="group"
          aria-label="Default rest duration"
          className="flex flex-wrap justify-end gap-1"
        >
          {[60, 90, 120, 150].map((seconds) => (
            <ChoiceButton
              key={seconds}
              active={settings.defaultRest === seconds}
              label={`${seconds}s`}
              onClick={() => settings.setDefaultRest(seconds)}
            />
          ))}
        </div>
      </SettingRow>

      <SettingRow title="Effort scale" subtitle="How perceived effort is logged">
        <div role="group" aria-label="Effort scale" className="flex gap-1">
          {(["RPE", "RIR"] as const).map((mode) => (
            <ChoiceButton
              key={mode}
              active={settings.rpeMode === mode}
              label={mode}
              onClick={() => settings.setRpeMode(mode)}
            />
          ))}
        </div>
      </SettingRow>

      <SettingRow title="Haptics" subtitle="Vibrate on set completion">
        <div role="group" aria-label="Haptics" className="flex gap-1">
          {([true, false] as const).map((value) => (
            <ChoiceButton
              key={String(value)}
              active={settings.haptics === value}
              label={value ? "On" : "Off"}
              onClick={() => settings.setHaptics(value)}
            />
          ))}
        </div>
      </SettingRow>

      <SettingRow title="Rest sound" subtitle="Audio cue when the timer reaches zero">
        <div role="group" aria-label="Rest timer sound" className="flex gap-1">
          {([false, true] as const).map((value) => (
            <ChoiceButton
              key={String(value)}
              active={settings.audioCue === value}
              label={value ? "On" : "Off"}
              onClick={() => settings.setAudioCue(value)}
            />
          ))}
        </div>
      </SettingRow>

      <InfoRow title="App version" subtitle="Installed build">
        v{APP_VERSION}
      </InfoRow>
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
    <div className="flex flex-col gap-3 border-b border-divider p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="shrink-0">
        <span className="block text-sm font-bold text-text">{title}</span>
        <span className="mt-1 block text-xs text-text-muted">{subtitle}</span>
      </div>
      <div>{children}</div>
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
    <div className="flex items-center justify-between gap-4 border-b border-divider p-4 last:border-b-0 sm:p-5">
      <div>
        <span className="block text-sm font-bold text-text">{title}</span>
        <span className="mt-1 block text-xs text-text-muted">{subtitle}</span>
      </div>
      <span className="metric text-sm font-bold text-text-secondary">{children}</span>
    </div>
  );
}
