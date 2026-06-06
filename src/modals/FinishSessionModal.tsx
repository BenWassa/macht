import { getExerciseConflict } from "@/domain/injuries";
import { computeExerciseE1rm } from "@/domain/sessionStats";
import type { SessionLog } from "@/domain/types";
import { useModalA11y } from "@/hooks/useModalA11y";
import { formatTime, todayIso } from "@/lib/format";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

interface FinishSessionModalProps {
  onClose: () => void;
  onSaved: (summary: {
    duration: string;
    sets: number;
    volume: number;
  }) => void;
}

export function FinishSessionModal({
  onClose,
  onSaved,
}: FinishSessionModalProps) {
  const addSession = useHistoryStore((state) => state.addSession);
  const injuries = useInjuryStore((state) => state.injuries);
  const workout = useWorkoutStore();
  const containerRef = useModalA11y<HTMLDivElement>(onClose);

  const save = () => {
    const completedSets = workout.activeWorkoutList.flatMap((exerciseId) =>
      (workout.workoutSets[exerciseId] ?? [])
        .filter((set) => set.completed)
        .map((set) => ({ exerciseId, set })),
    );
    const volume = completedSets.reduce(
      (sum, item) => sum + item.set.weight * item.set.reps,
      0,
    );
    const adapted =
      workout.adaptedDuringSession ||
      workout.activeWorkoutList.some(
        (exerciseId) =>
          getExerciseConflict(exerciseId, injuries)?.level === "avoid",
      );
    const exerciseSnapshots = workout.activeWorkoutList.map((exerciseId) => {
      const sets = workout.workoutSets[exerciseId] ?? [];
      return {
        exerciseId,
        sets,
        e1rm: computeExerciseE1rm(exerciseId, sets),
      };
    });
    const session: SessionLog = {
      id: crypto.randomUUID(),
      date: todayIso(),
      template:
        workout.workoutName + (workout.isMinimumSession ? " (min)" : ""),
      duration: `${Math.floor(workout.workoutDuration / 60)}m`,
      volume,
      sets: completedSets.length,
      adapted,
      isMinimumSession: workout.isMinimumSession,
      exerciseSnapshots,
    };
    addSession(session);
    workout.endSession();
    onSaved({
      duration: session.duration,
      sets: session.sets,
      volume: session.volume,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div
        ref={containerRef}
        className="w-full max-w-sm space-y-4 border border-[#1a1a1a] bg-[#0c0c0c] p-6"
      >
        <div className="space-y-2 text-center">
          <h3 className="font-mono text-sm font-bold uppercase tracking-tight text-neutral-200">
            Save this session?
          </h3>
          <p className="mx-auto max-w-xs text-xs text-neutral-500">
            Session time:{" "}
            <strong className="text-neutral-300">
              {formatTime(workout.workoutDuration)}
            </strong>
            .
            {workout.isMinimumSession && (
              <span className="text-blue-400"> Logged as minimum session.</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-[#222] bg-transparent py-3 font-mono text-[10px] font-bold uppercase text-neutral-400 transition hover:bg-neutral-900"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="flex-1 bg-emerald-600 py-3 font-mono text-[10px] font-bold uppercase text-white transition hover:bg-emerald-700"
          >
            Save session
          </button>
        </div>
      </div>
    </div>
  );
}
