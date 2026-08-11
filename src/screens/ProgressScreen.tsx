import { useMemo, useState } from "react";
import { buildConsistencyWeeks, plannedSessionCoverage } from "@/domain/progress/consistency";
import { buildMesocycleSummaries } from "@/domain/progress/cycles";
import { buildExerciseBests, detectProgressRecords } from "@/domain/progress/exercises";
import { buildMuscleProgress } from "@/domain/progress/muscles";
import { normalizeProgressHistory } from "@/domain/progress/normalize";
import { buildExerciseResponseHistory } from "@/domain/progress/responses";
import { todayIso } from "@/lib/format";
import { ExerciseProgressView } from "@/screens/progress/ExerciseProgressView";
import { MuscleProgressView } from "@/screens/progress/MuscleProgressView";
import { ProgressOverview } from "@/screens/progress/ProgressOverview";
import { ProgressTabs, type ProgressTab } from "@/screens/progress/ProgressTabs";
import { RecordsProgressView } from "@/screens/progress/RecordsProgressView";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useExecutionHistoryStore } from "@/state/useExecutionHistoryStore";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useProgramStore } from "@/state/useProgramStore";
import { useProgressionStore } from "@/state/useProgressionStore";
import { useSettingsStore } from "@/state/useSettingsStore";

export function ProgressScreen() {
  const [tab, setTab] = useState<ProgressTab>("overview");
  const v2Workouts = useExecutionHistoryStore((state) => state.workouts);
  const legacySessions = useHistoryStore((state) => state.sessions);
  const customExercises = useCustomExerciseStore((state) => state.exercises);
  const programs = useProgramStore((state) => state.programs);
  const mesocycles = useProgramStore((state) => state.mesocycles);
  const activeProgramId = useProgramStore((state) => state.activeProgramId);
  const decisions = useProgressionStore((state) => state.decisions);
  const units = useSettingsStore((state) => state.units);
  const today = todayIso();
  const activeProgram =
    programs.find((program) => program.id === activeProgramId) ?? programs[0];

  const model = useMemo(() => {
    const workouts = normalizeProgressHistory(
      v2Workouts,
      legacySessions,
      customExercises,
    );
    const records = detectProgressRecords(workouts);
    const bests = buildExerciseBests(workouts);
    const weeks = buildConsistencyWeeks(
      workouts,
      today,
      8,
      activeProgram?.sessionsPerWeek,
    );
    const muscles = buildMuscleProgress(
      workouts,
      today,
      28,
      activeProgram?.musclePriorities ?? {},
    );
    const scopedCycles = activeProgram
      ? mesocycles.filter((cycle) => cycle.programId === activeProgram.id)
      : mesocycles;
    const cycles = buildMesocycleSummaries(scopedCycles, workouts, records);
    const responses = buildExerciseResponseHistory(decisions, customExercises);
    return {
      workouts,
      records,
      bests,
      weeks,
      coverage: plannedSessionCoverage(weeks),
      muscles,
      cycles,
      responses,
    };
  }, [
    activeProgram,
    customExercises,
    decisions,
    legacySessions,
    mesocycles,
    today,
    v2Workouts,
  ]);

  return (
    <div className="animate-rise-in space-y-5">
      <header>
        <p className="text-sm font-medium text-text-muted">Progress</p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-text">
          Training response
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
          Performance, training exposure, records, and adaptive programming response from your own completed sessions.
        </p>
      </header>

      <ProgressTabs active={tab} onChange={setTab} />

      <div role="tabpanel" aria-label={`${tab} progress`}>
        {tab === "overview" ? (
          <ProgressOverview
            workouts={model.workouts}
            weeks={model.weeks}
            plannedCoverage={model.coverage}
            records={model.records}
            cycles={model.cycles}
            units={units}
          />
        ) : null}
        {tab === "exercises" ? (
          <ExerciseProgressView
            workouts={model.workouts}
            exercises={model.bests}
            responses={model.responses}
            units={units}
          />
        ) : null}
        {tab === "muscles" ? (
          <MuscleProgressView muscles={model.muscles} />
        ) : null}
        {tab === "records" ? (
          <RecordsProgressView
            bests={model.bests}
            records={model.records}
            units={units}
          />
        ) : null}
      </div>
    </div>
  );
}
