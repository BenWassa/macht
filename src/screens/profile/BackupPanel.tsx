import { useRef, useState } from "react";
import { useHistoryStore, type MachtBackup } from "@/state/useHistoryStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useSettingsStore } from "@/state/useSettingsStore";
import type { Settings } from "@/domain/types";

export function BackupPanel() {
  const settings = useSettingsStore();
  const injuries = useInjuryStore((state) => state.injuries);
  const hydrateInjuries = useInjuryStore((state) => state.hydrateInjuries);
  const hydrateSettings = useSettingsStore((state) => state.hydrateSettings);
  const hydrateHistory = useHistoryStore((state) => state.hydrateHistory);
  const createBackup = useHistoryStore((state) => state.createBackup);

  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const exportBackup = () => {
    const backup = createBackup(injuries, {
      units: settings.units,
      defaultRest: settings.defaultRest,
      rpeMode: settings.rpeMode,
      haptics: settings.haptics,
      audioCue: settings.audioCue,
    });
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `macht_backup_${backup.exportedAt}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (file: File) => {
    setError("");
    try {
      const parsed = JSON.parse(await file.text()) as Partial<MachtBackup>;
      if (
        !Array.isArray(parsed.history) ||
        !Array.isArray(parsed.injuries) ||
        !parsed.settings
      ) {
        setError("Invalid backup file.");
        return;
      }
      if (!window.confirm("This will replace your current data. Continue?"))
        return;
      hydrateHistory(parsed.history);
      hydrateInjuries(parsed.injuries);
      hydrateSettings(parsed.settings as Settings);
    } catch {
      setError("Invalid backup file.");
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 border border-[#1a1a1a] bg-[#0c0c0c] p-4 -mt-[17px] border-t-0">
      <div>
        <span className="block text-xs font-bold uppercase tracking-tight">
          Backup
        </span>
        <span className="font-mono text-[10px] text-neutral-500">
          Export or restore local data
        </span>
        {error && (
          <span className="mt-1 block font-mono text-[10px] text-red-400">
            {error}
          </span>
        )}
      </div>
      <div className="flex gap-2 font-mono">
        <button
          onClick={exportBackup}
          className="border border-[#222] bg-black px-3 py-1 text-[10px] uppercase text-neutral-300"
        >
          Export
        </button>
        <button
          onClick={() => inputRef.current?.click()}
          className="border border-[#222] bg-black px-3 py-1 text-[10px] uppercase text-neutral-300"
        >
          Import
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(event) =>
            event.target.files?.[0] && importBackup(event.target.files[0])
          }
        />
      </div>
    </div>
  );
}
