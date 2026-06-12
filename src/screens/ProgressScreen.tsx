import { deriveE1rmHistory } from "@/domain/e1rm";
import { PROGRESS_LIFTS, getExerciseById } from "@/domain/exercises";
import { getExerciseConflict } from "@/domain/injuries";
import {
  monthlyGainPct,
  progressionStreak,
  projectedE1rm,
} from "@/domain/progressionStats";
import { LiftCard } from "@/screens/progress/LiftCard";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useSettingsStore } from "@/state/useSettingsStore";

export function ProgressScreen() {
  const sessions = useHistoryStore((state) => state.sessions);
  const injuries = useInjuryStore((state) => state.injuries);
  const settings = useSettingsStore();
  const customExercises = useCustomExerciseStore((state) => state.exercises);

  if (sessions.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
            Progression
          </p>
          <h1 className="font-mono text-xl font-bold uppercase tracking-tight">
            Strength progress
          </h1>
        </div>
        <div className="border border-dashed border-[#1a1a1a] bg-black p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            Log sessions to begin tracking progression.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
          Progression
        </p>
        <h1 className="font-mono text-xl font-bold uppercase tracking-tight">
          Strength progress
        </h1>
      </div>
      <div className="space-y-6">
        {PROGRESS_LIFTS.map((exerciseId) => (
          <LiftCard
            key={exerciseId}
            exercise={getExerciseById(exerciseId)}
            values={deriveE1rmHistory(sessions, exerciseId)}
            conflict={getExerciseConflict(exerciseId, injuries)}
            units={settings.units}
            streak={progressionStreak(exerciseId, sessions)}
            monthPct={monthlyGainPct(exerciseId, sessions)}
            projected={projectedE1rm(
              exerciseId,
              sessions,
              settings,
              customExercises,
            )}
          />
        ))}
      </div>
    </div>
  );
}
