import { SetRow } from "@/components/SetRow";
import type { ExercisePrescription } from "@/domain/prescriptions";
import type { SetEntry, Settings } from "@/domain/types";

interface WorkoutSetTableProps {
  sets: SetEntry[];
  selectedSetIndex: number;
  prescription: ExercisePrescription;
  settings: Settings;
  onSelectSet: (index: number) => void;
  onToggleComplete: (setIndex: number) => void;
  onUpdateSet: <K extends keyof SetEntry>(
    setIndex: number,
    field: K,
    value: SetEntry[K],
  ) => void;
  onAppendSet: () => void;
}

export function WorkoutSetTable({
  sets,
  selectedSetIndex,
  prescription,
  settings,
  onSelectSet,
  onToggleComplete,
  onUpdateSet,
  onAppendSet,
}: WorkoutSetTableProps) {
  return (
    <div className="mb-3">
      <div className="mb-3 border border-[#1a1a1a] bg-black px-3 py-2">
        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
          Plan
        </span>
        <p className="mt-1 font-mono text-xs font-bold uppercase tracking-tight text-neutral-300">
          {prescription.planned}
        </p>
      </div>
      <div className="mb-2 grid grid-cols-[40px_1.4fr_1.2fr_1fr_64px] border-b border-edge pb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-neutral-500">
        <span className="text-center">#</span>
        <span className="text-center">
          {prescription.loadMode === "external" ? "Load" : "Mode"}
        </span>
        <span className="text-center">{prescription.metricLabel}</span>
        <span className="text-center">{settings.rpeMode}</span>
        <span className="text-center">Done</span>
      </div>
      <div className="border-x border-t border-edge">
        {sets.map((set, index) => (
          <SetRow
            key={set.id}
            set={set}
            index={index}
            selected={selectedSetIndex === index}
            effortLabel={settings.rpeMode}
            units={settings.units}
            loadMode={prescription.loadMode}
            loadDisplay={prescription.loadDisplay}
            metric={prescription.metric}
            onSelect={() => onSelectSet(index)}
            onToggleComplete={() => onToggleComplete(index)}
            onUpdate={(field, value) => onUpdateSet(index, field, value)}
          />
        ))}
      </div>
      <button
        onClick={onAppendSet}
        className="mt-1 w-full border border-dashed border-[#1a1a1a] py-2.5 font-mono text-[10px] uppercase tracking-widest text-neutral-600 transition hover:border-[#252525] hover:text-neutral-400"
      >
        + Repeat last set
      </button>
    </div>
  );
}
