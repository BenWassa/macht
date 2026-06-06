import { ChevronDown } from "lucide-react";
import type { CustomExercise, ExerciseSnapshot, Units } from "@/domain/types";
import { SetLine } from "@/modals/WorkoutSummaryParts";
import { exerciseName, metricSuffix } from "@/modals/workoutSummaryHelpers";

interface WorkoutSummaryBreakdownProps {
  editing: boolean;
  hasDetails: boolean;
  showDetails: boolean;
  setShowDetails: (updater: (value: boolean) => boolean) => void;
  detailSnapshots: ExerciseSnapshot[];
  units: Units;
  customExercises: CustomExercise[];
  onUpdateSet: (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps" | "completed",
    value: number | boolean,
  ) => void;
}

export function WorkoutSummaryBreakdown({
  editing,
  hasDetails,
  showDetails,
  setShowDetails,
  detailSnapshots,
  units,
  customExercises,
  onUpdateSet,
}: WorkoutSummaryBreakdownProps) {
  if (!hasDetails) {
    return (
      <p className="border border-dashed border-[#1a1a1a] bg-black p-4 text-center font-mono text-[10px] uppercase tracking-widest text-neutral-600">
        No exercise details recorded for this session
      </p>
    );
  }

  return (
    <div>
      {!editing && (
        <button
          onClick={() => setShowDetails((value) => !value)}
          aria-expanded={showDetails}
          className="flex w-full items-center justify-between border border-[#1a1a1a] bg-black px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-300 transition hover:text-neutral-100"
        >
          <span>Exercise breakdown</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`}
          />
        </button>
      )}
      {(showDetails || editing) && (
        <div className="mt-3 space-y-3">
          {detailSnapshots.map((snapshot, exerciseIndex) => (
            <div
              key={`${snapshot.exerciseId}-${exerciseIndex}`}
              className="border border-[#1a1a1a] bg-black p-3"
            >
              <h3 className="mb-2 font-mono text-xs font-bold uppercase tracking-tight text-neutral-200">
                {exerciseName(snapshot.exerciseId, customExercises)}
              </h3>
              <div className="space-y-1.5">
                {snapshot.sets.map((set, setIndex) => (
                  <SetLine
                    key={set.id}
                    index={setIndex}
                    weight={set.weight}
                    reps={set.reps}
                    completed={set.completed}
                    units={units}
                    suffix={metricSuffix(snapshot.exerciseId)}
                    editing={editing}
                    onChange={(field, value) =>
                      onUpdateSet(exerciseIndex, setIndex, field, value)
                    }
                  />
                ))}
                {snapshot.sets.length === 0 && (
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">
                    No sets recorded
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
