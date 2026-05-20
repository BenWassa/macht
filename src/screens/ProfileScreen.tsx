import { useRef, useState, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { InjuryModal } from '@/modals/InjuryModal';
import type { ExerciseInjury, Settings } from '@/domain/types';
import type { MachtBackup } from '@/state/useHistoryStore';
import { useHistoryStore } from '@/state/useHistoryStore';
import { useInjuryStore } from '@/state/useInjuryStore';
import { useSettingsStore } from '@/state/useSettingsStore';

export function ProfileScreen() {
  const settings = useSettingsStore();
  const injuries = useInjuryStore((state) => state.injuries);
  const removeInjury = useInjuryStore((state) => state.removeInjury);
  const clearInjury = useInjuryStore((state) => state.clearInjury);
  const hydrateInjuries = useInjuryStore((state) => state.hydrateInjuries);
  const hydrateSettings = useSettingsStore((state) => state.hydrateSettings);
  const hydrateHistory = useHistoryStore((state) => state.hydrateHistory);
  const createBackup = useHistoryStore((state) => state.createBackup);
  const [editing, setEditing] = useState<ExerciseInjury | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const active = injuries.filter((injury) => !injury.clearedDate);
  const past = injuries.filter((injury) => injury.clearedDate);

  const exportBackup = () => {
    const backup = createBackup(injuries, {
      units: settings.units,
      defaultRest: settings.defaultRest,
      rpeMode: settings.rpeMode,
    });
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `macht_backup_${backup.exportedAt}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (file: File) => {
    setError('');
    try {
      const parsed = JSON.parse(await file.text()) as Partial<MachtBackup>;
      if (!Array.isArray(parsed.history) || !Array.isArray(parsed.injuries) || !parsed.settings) {
        setError('Invalid backup file.');
        return;
      }
      if (!window.confirm('This will replace your current data. Continue?')) return;
      hydrateHistory(parsed.history);
      hydrateInjuries(parsed.injuries);
      hydrateSettings(parsed.settings as Settings);
    } catch {
      setError('Invalid backup file.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500">Strength log</p>
        <h1 className="font-mono text-xl font-bold uppercase tracking-tight">Profile</h1>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-2">
          <h2 className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">Active injuries</h2>
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="border border-blue-900/40 bg-blue-950/15 px-2 py-1 font-mono text-[9px] text-blue-400 hover:text-blue-300">+ Log injury</button>
        </div>
        <div className="space-y-3">
          {active.map((injury) => (
            <div key={injury.id} className="flex items-start justify-between border border-[#1a1a1a] bg-[#0c0c0c] p-4">
              <button onClick={() => { setEditing(injury); setShowModal(true); }} className="space-y-2 text-left">
                <div className="flex items-center space-x-2">
                  <span className={`border px-1.5 font-mono text-[8px] font-bold uppercase ${injury.severity === 'avoid' ? 'border-red-900 bg-red-950 text-red-400' : 'border-yellow-900 bg-yellow-950 text-yellow-500'}`}>{injury.severity === 'avoid' ? 'Avoid' : 'Caution'}</span>
                  <h3 className="font-mono text-xs font-bold uppercase tracking-tight text-neutral-200">{injury.name}</h3>
                </div>
                <p className="text-xs leading-relaxed text-neutral-500">{injury.notes}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {injury.forbiddenTags.map((tag) => <span key={tag} className="border border-[#1a1a1a] bg-black px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-neutral-400">{tag.replace(/_/g, ' ')}</span>)}
                </div>
              </button>
              <div className="flex gap-2">
                <button onClick={() => clearInjury(injury.id)} className="font-mono text-[9px] uppercase text-emerald-400">Clear</button>
                <button onClick={() => removeInjury(injury.id)} className="p-1 text-neutral-500 hover:text-red-400" aria-label="Delete injury"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {active.length === 0 && <div className="border border-dashed border-[#1a1a1a] bg-black p-6 text-center"><span className="font-mono text-xs uppercase tracking-widest text-neutral-500">No injuries logged</span></div>}
        </div>
        {past.length > 0 && (
          <div className="space-y-2">
            <button onClick={() => setShowPast(!showPast)} className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Past injuries ({past.length})</button>
            {showPast && past.map((injury) => <div key={injury.id} className="border border-[#1a1a1a] bg-black p-3 font-mono text-[10px] text-neutral-500">{injury.name} / cleared {injury.clearedDate}</div>)}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">Settings</h2>
        <div className="divide-y divide-[#1a1a1a] border border-[#1a1a1a] bg-[#0c0c0c]">
          <SettingRow title="Units" subtitle="Weight display">
            {(['lbs', 'kgs'] as const).map((unit) => <button key={unit} onClick={() => settings.setUnits(unit)} className={`px-3 py-1 text-xs transition ${settings.units === unit ? 'bg-blue-600 font-bold text-white' : 'text-neutral-500 hover:text-neutral-300'}`}>{unit.toUpperCase()}</button>)}
          </SettingRow>
          <SettingRow title="Default rest" subtitle="Auto-starts after each set">
            {[60, 90, 120, 150].map((seconds) => <button key={seconds} onClick={() => settings.setDefaultRest(seconds)} className={`px-2.5 py-1 text-xs transition ${settings.defaultRest === seconds ? 'bg-blue-600 font-bold text-white' : 'text-neutral-500 hover:text-neutral-300'}`}>{seconds}s</button>)}
          </SettingRow>
          <SettingRow title="Effort scale" subtitle="How you log perceived effort">
            {(['RPE', 'RIR'] as const).map((mode) => <button key={mode} onClick={() => settings.setRpeMode(mode)} className={`px-3 py-1 text-xs transition ${settings.rpeMode === mode ? 'bg-blue-600 font-bold text-white' : 'text-neutral-500 hover:text-neutral-300'}`}>{mode}</button>)}
          </SettingRow>
          <div className="flex items-center justify-between gap-4 p-4">
            <div><span className="block text-xs font-bold uppercase tracking-tight">Backup</span><span className="font-mono text-[10px] text-neutral-500">Export or restore local data</span>{error && <span className="mt-1 block font-mono text-[10px] text-red-400">{error}</span>}</div>
            <div className="flex gap-2 font-mono">
              <button onClick={exportBackup} className="border border-[#222] bg-black px-3 py-1 text-[10px] uppercase text-neutral-300">Export</button>
              <button onClick={() => inputRef.current?.click()} className="border border-[#222] bg-black px-3 py-1 text-[10px] uppercase text-neutral-300">Import</button>
              <input ref={inputRef} type="file" accept=".json,application/json" className="hidden" onChange={(event) => event.target.files?.[0] && importBackup(event.target.files[0])} />
            </div>
          </div>
        </div>
      </div>
      {showModal && <InjuryModal injury={editing} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function SettingRow({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div><span className="block text-xs font-bold uppercase tracking-tight">{title}</span><span className="font-mono text-[10px] text-neutral-500">{subtitle}</span></div>
      <div className="flex border border-[#1a1a1a] bg-black p-0.5 font-mono">{children}</div>
    </div>
  );
}
