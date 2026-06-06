import { useState } from "react";
import {
  computeExerciseE1rm,
  computeSessionTotals,
} from "@/domain/sessionStats";
import type { ExerciseSnapshot, SessionLog } from "@/domain/types";
import { useModalA11y } from "@/hooks/useModalA11y";
import { WorkoutSummaryBody } from "@/modals/WorkoutSummaryBody";
import { WorkoutSummaryHeader } from "@/modals/WorkoutSummaryHeader";
import { cloneSnapshots } from "@/modals/workoutSummaryHelpers";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useSettingsStore } from "@/state/useSettingsStore";

interface WorkoutSummaryModalProps {
  session: SessionLog;
  onClose: () => void;
}

export function WorkoutSummaryModal({
  session,
  onClose,
}: WorkoutSummaryModalProps) {
  const units = useSettingsStore((state) => state.units);
  const customExercises = useCustomExerciseStore((state) => state.exercises);
  const updateSession = useHistoryStore((state) => state.updateSession);
  const containerRef = useModalA11y<HTMLDivElement>(onClose);

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [showDetails, setShowDetails] = useState(false);

  const [name, setName] = useState(session.template);
  const [date, setDate] = useState(session.date);
  const [duration, setDuration] = useState(session.duration);
  const [snapshots, setSnapshots] = useState<ExerciseSnapshot[]>(() =>
    cloneSnapshots(session.exerciseSnapshots ?? []),
  );

  const liveSnapshots = session.exerciseSnapshots ?? [];
  const hasDetails = liveSnapshots.length > 0;
  const editing = mode === "edit";
  const detailSnapshots = editing ? snapshots : liveSnapshots;

  const startEdit = () => {
    setName(session.template);
    setDate(session.date);
    setDuration(session.duration);
    setSnapshots(cloneSnapshots(session.exerciseSnapshots ?? []));
    setShowDetails(true);
    setMode("edit");
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps" | "completed",
    value: number | boolean,
  ) => {
    setSnapshots((prev) =>
      prev.map((snapshot, sIdx) =>
        sIdx !== exerciseIndex
          ? snapshot
          : {
              ...snapshot,
              sets: snapshot.sets.map((set, idx) =>
                idx === setIndex ? { ...set, [field]: value } : set,
              ),
            },
      ),
    );
  };

  const save = () => {
    const patch: Partial<SessionLog> = {
      template: name.trim() || session.template,
      date,
      duration: duration.trim() || session.duration,
    };
    if (hasDetails) {
      const recomputed = snapshots.map((snapshot) => ({
        ...snapshot,
        e1rm: computeExerciseE1rm(snapshot.exerciseId, snapshot.sets),
      }));
      const totals = computeSessionTotals(recomputed);
      patch.exerciseSnapshots = recomputed;
      patch.volume = totals.volume;
      patch.sets = totals.sets;
    }
    updateSession(session.id, patch);
    setMode("view");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 p-0 sm:items-center sm:p-4">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Workout summary"
        className="flex max-h-[90vh] w-full max-w-lg flex-col border border-[#1a1a1a] bg-[#0c0c0c]"
      >
        <WorkoutSummaryHeader
          editing={editing}
          template={session.template}
          name={name}
          setName={setName}
          onStartEdit={startEdit}
          onClose={onClose}
        />

        <WorkoutSummaryBody
          session={session}
          units={units}
          customExercises={customExercises}
          editing={editing}
          hasDetails={hasDetails}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
          detailSnapshots={detailSnapshots}
          date={date}
          setDate={setDate}
          duration={duration}
          setDuration={setDuration}
          onUpdateSet={updateSet}
        />

        {editing && (
          <div className="flex gap-2 border-t border-[#1a1a1a] p-5">
            <button
              onClick={() => setMode("view")}
              className="flex-1 border border-[#222] bg-transparent py-3 font-mono text-[10px] font-bold uppercase text-neutral-400 transition hover:bg-neutral-900"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="flex-1 bg-emerald-600 py-3 font-mono text-[10px] font-bold uppercase text-white transition hover:bg-emerald-700"
            >
              Save changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
