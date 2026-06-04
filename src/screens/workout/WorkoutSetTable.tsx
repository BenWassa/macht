import { SetRow } from "@/components/SetRow";
import type { ExercisePrescription } from "@/domain/prescriptions";
import type { SetEntry, Settings } from "@/domain/types";
import { EffortSlider } from "@/screens/workout/EffortSlider";
import { SetNavigator } from "@/screens/workout/SetNavigator";

interface WorkoutSetTableProps {
  sets: SetEntry[];
  selectedSetIndex: number;
  prescription: ExercisePrescription;
  settings: Settings;
  onSelectSet: (index: number) => void;
  onToggleComplete: (setIndex: number) => boolean;
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
  const activeIndex = sets[selectedSetIndex] ? selectedSetIndex : 0;
  const selectedSet = sets[activeIndex];
  const canGoNext = activeIndex < sets.length - 1;

  const handleToggleComplete = () => {
    const completedNow = onToggleComplete(activeIndex);
    if (completedNow && canGoNext) onSelectSet(activeIndex + 1);
  };

  const handleAppendSet = () => {
    onAppendSet();
    onSelectSet(sets.length);
  };

  if (!selectedSet) {
    return (
      <div className="mb-3">
        <SetNavigator
          sets={sets}
          selectedIndex={activeIndex}
          onSelect={onSelectSet}
          onAppendSet={handleAppendSet}
        />
      </div>
    );
  }

  return (
    <div className="mb-3">
      <SetNavigator
        sets={sets}
        selectedIndex={activeIndex}
        onSelect={onSelectSet}
        onAppendSet={handleAppendSet}
      />
      <div className="grid grid-cols-[1.45fr_1.2fr_64px] border-b border-edge pb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-neutral-500">
        <span className="text-center">
          {prescription.loadMode === "external" ? "Load" : "Mode"}
        </span>
        <span className="text-center">{prescription.metricLabel}</span>
        <span className="text-center">Done</span>
      </div>
      <div className="border-x border-t border-edge">
        <SetRow
          key={selectedSet.id}
          set={selectedSet}
          selected
          units={settings.units}
          loadMode={prescription.loadMode}
          loadDisplay={prescription.loadDisplay}
          metric={prescription.metric}
          onSelect={() => onSelectSet(activeIndex)}
          onToggleComplete={handleToggleComplete}
          onUpdate={(field, value) => onUpdateSet(activeIndex, field, value)}
        />
      </div>
      <EffortSlider
        mode={settings.rpeMode}
        value={selectedSet.rpe}
        onChange={(value) => onUpdateSet(activeIndex, "rpe", value)}
      />
    </div>
  );
}
