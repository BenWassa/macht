import type {
  CustomExercise,
  ExerciseSnapshot,
  SessionLog,
  Units,
} from "@/domain/types";
import { WorkoutSummaryBreakdown } from "@/modals/WorkoutSummaryBreakdown";
import { Stat } from "@/modals/WorkoutSummaryParts";

interface WorkoutSummaryBodyProps {
  session: SessionLog;
  units: Units;
  customExercises: CustomExercise[];
  editing: boolean;
  hasDetails: boolean;
  showDetails: boolean;
  setShowDetails: (updater: (value: boolean) => boolean) => void;
  detailSnapshots: ExerciseSnapshot[];
  date: string;
  setDate: (value: string) => void;
  duration: string;
  setDuration: (value: string) => void;
  onUpdateSet: (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps" | "completed",
    value: number | boolean,
  ) => void;
}

export function WorkoutSummaryBody({
  session,
  units,
  customExercises,
  editing,
  hasDetails,
  showDetails,
  setShowDetails,
  detailSnapshots,
  date,
  setDate,
  duration,
  setDuration,
  onUpdateSet,
}: WorkoutSummaryBodyProps) {
  return (
    <div className="flex-1 space-y-5 overflow-y-auto p-5">
      {editing ? (
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-neutral-500">
              Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full border border-[#222] bg-black px-2 py-1.5 font-mono text-xs text-neutral-200 outline-none focus:border-blue-700"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-neutral-500">
              Duration
            </span>
            <input
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              placeholder="e.g. 45m"
              className="w-full border border-[#222] bg-black px-2 py-1.5 font-mono text-xs text-neutral-200 outline-none focus:border-blue-700"
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Date" value={session.date} />
          <Stat label="Duration" value={session.duration} />
          <Stat
            label="Sets"
            value={session.sets ? String(session.sets) : "-"}
          />
          <Stat
            label="Volume"
            value={
              session.volume
                ? `${session.volume.toLocaleString()} ${units}`
                : "-"
            }
          />
          <Stat
            label="Type"
            value={session.isMinimumSession ? "Minimum" : "Standard"}
          />
          <Stat label="Adapted" value={session.adapted ? "Yes" : "No"} />
        </div>
      )}

      <WorkoutSummaryBreakdown
        editing={editing}
        hasDetails={hasDetails}
        showDetails={showDetails}
        setShowDetails={setShowDetails}
        detailSnapshots={detailSnapshots}
        units={units}
        customExercises={customExercises}
        onUpdateSet={onUpdateSet}
      />
    </div>
  );
}
