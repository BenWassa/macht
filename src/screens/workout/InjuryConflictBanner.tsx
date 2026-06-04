import { AlertTriangle } from "lucide-react";
import { getExerciseById } from "@/domain/exercises";
import type { ExerciseConflict } from "@/domain/types";

interface InjuryConflictBannerProps {
  conflict: ExerciseConflict;
  exerciseId: string;
  onSubstitute: (targetId: string, subId: string) => void;
}

export function InjuryConflictBanner({
  conflict,
  exerciseId,
  onSubstitute,
}: InjuryConflictBannerProps) {
  const avoid = conflict.level === "avoid";

  return (
    <div
      className={`mb-6 space-y-3 border p-4 ${
        avoid
          ? "border-red-900 bg-red-950/20"
          : "border-yellow-900 bg-yellow-950/20"
      }`}
    >
      <div
        className={`flex gap-3 ${avoid ? "text-red-300" : "text-yellow-300"}`}
      >
        <AlertTriangle
          className={`mt-0.5 h-4 w-4 shrink-0 ${avoid ? "text-red-400" : "text-yellow-400"}`}
        />
        <p
          className={`font-mono text-xs leading-relaxed ${
            avoid ? "text-red-300" : "text-yellow-300"
          }`}
        >
          Injury {conflict.level}: {conflict.injury}.{" "}
          {conflict.tags.join(", ").replace(/_/g, " ")}.
        </p>
      </div>
      {avoid && conflict.alternative && (
        <button
          onClick={() => onSubstitute(exerciseId, conflict.alternative!)}
          className="border border-red-900 bg-black px-4 py-3 font-mono text-xs font-bold uppercase text-red-300 transition hover:bg-red-950/30 active:bg-red-950/50"
        >
          Use {getExerciseById(conflict.alternative)?.name} instead
        </button>
      )}
    </div>
  );
}
