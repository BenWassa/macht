import { CalendarDays, CheckCircle2, Clock3, Dumbbell, Play, Trophy } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { getExerciseById } from "@/domain/exerciseLibrary";
import { finalizeMesocycleState } from "@/domain/habit/cycleState";
import {
  applyScheduleRecovery,
  findMissedSessionRecovery,
} from "@/domain/habit/scheduleRecovery";
import { getRunnableTemplate } from "@/domain/injuries";
import { detectProgressRecords } from "@/domain/progress/exercises";
import { normalizeProgressHistory } from "@/domain/progress/normalize";
import { findNextPlannedSession } from "@/domain/training/activeSession";
import { getNextTrainingTemplate } from "@/domain/trainingPlan";
import { todayIso } from "@/lib/format";
import type { TabId } from "@/App";
import { HabitTodayPanel } from "@/screens/habit/HabitTodayPanel";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useExecutionHistoryStore } from "@/state/useExecutionHistoryStore";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useProgramStore } from "@/state/useProgramStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

interface HomeScreenProps {
  setActiveTab: (tab: TabId) => void;
}

const phaseLabel = (phase?: "accumulation" | "deload") =>
  phase === "deload" ? "Deload" : "Build";

export function HomeScreen({ setActiveTab }: HomeScreenProps) {
  const legacySessions = useHistoryStore((state) => state.sessions);
  const v2Workouts = useExecutionHistoryStore((state) => state.workouts);
  const customExercises = useCustomExerciseStore((state) => state.exercises);
  const injuries = useInjuryStore((state) => state.injuries);
  const programs = useProgramStore((state) => state.programs);
  const mesocycles = useProgramStore((state) => state.mesocycles);
  const activeProgramId = useProgramStore((state) => state.activeProgramId);
  const hydrateProgramData = useProgramStore((state) => state.hydrateProgramData);
  const workoutActive = useWorkoutStore((state) => state.workoutActive);
  const startTemplate = useWorkoutStore((state) => state.startTemplate);
  const startPlannedSession = useWorkoutStore((state) => state.startPlannedSession);
  const today = todayIso();
  const activeProgram =
    programs.find((program) => program.id === activeProgramId) ?? programs[0];
  const storedCycle = activeProgram
    ? mesocycles.find(
        (cycle) =>
          cycle.id === activeProgram.activeMesocycleId ||
          (cycle.programId === activeProgram.id && cycle.status === "active"),
      )
    : undefined;
  const activeCycle = storedCycle ? finalizeMesocycleState(storedCycle) : undefined;
  const next =
    activeCycle?.status === "active"
      ? findNextPlannedSession(activeCycle)
      : undefined;
  const legacyTemplate = getNextTrainingTemplate(legacySessions);
  const runnableLegacy = getRunnableTemplate(legacyTemplate, injuries);

  const latestRecord = useMemo(() => {
    const history = normalizeProgressHistory(
      v2Workouts,
      legacySessions,
      customExercises,
    );
    return detectProgressRecords(history)[0];
  }, [customExercises, legacySessions, v2Workouts]);

  const start = () => {
    if (workoutActive) {
      setActiveTab("workout");
      return;
    }
    if (activeProgram && activeCycle && next) {
      let session = next.session;
      const recovery = findMissedSessionRecovery(activeCycle, today);
      if (recovery?.plannedSessionId === session.id) {
        const repaired = applyScheduleRecovery(
          activeCycle,
          recovery,
          "train_today",
          today,
        );
        hydrateProgramData(
          programs,
          mesocycles.map((cycle) =>
            cycle.id === repaired.id ? repaired : cycle,
          ),
        );
        session =
          repaired.weeks
            .flatMap((week) => week.sessions)
            .find((candidate) => candidate.id === session.id) ?? session;
      }
      startPlannedSession(session, {
        programId: activeProgram.id,
        mesocycleId: activeCycle.id,
      });
      setActiveTab("workout");
      return;
    }
    if (!activeProgram) {
      startTemplate(runnableLegacy);
      setActiveTab("workout");
      return;
    }
    setActiveTab("templates");
  };

  const exerciseNames = next
    ? next.session.prescriptions.map(
        (prescription) =>
          getExerciseById(prescription.exerciseId, customExercises)?.name ??
          prescription.exerciseId,
      )
    : runnableLegacy.exercises.map(
        (exerciseId) =>
          getExerciseById(exerciseId, customExercises)?.name ?? exerciseId,
      );
  const exerciseCount = exerciseNames.length;
  const targetDuration = next?.session.targetDurationMinutes;
  const cycleComplete = Boolean(activeProgram && activeCycle?.status === "completed");
  const programNeedsCycle = Boolean(activeProgram && !activeCycle);

  return (
    <div className="animate-rise-in space-y-5">
      <header>
        <p className="text-sm font-medium text-text-muted">Today</p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-text">
          {workoutActive ? "Session in progress" : "Ready when you are"}
        </h1>
      </header>

      {cycleComplete ? (
        <section className="surface-raised p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-positive-soft text-positive">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-positive">Cycle complete</p>
              <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-text">
                {activeCycle?.name ?? activeProgram?.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Every planned session has a recorded outcome. Review the program and start
                the next cycle when you want to continue.
              </p>
            </div>
          </div>
          <Button onClick={() => setActiveTab("templates")} className="mt-5 w-full">
            Review next cycle
          </Button>
        </section>
      ) : programNeedsCycle ? (
        <section className="surface-raised p-5 sm:p-6">
          <p className="text-sm font-semibold text-signal-strong">Program ready</p>
          <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-text">
            Start your first cycle
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Your program definition is saved. Generate the first cycle to put its sessions
            on Today.
          </p>
          <Button onClick={() => setActiveTab("templates")} className="mt-5 w-full">
            Open Program
          </Button>
        </section>
      ) : (
        <section className="surface-raised overflow-hidden p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-signal-strong">
                {next ? "Next planned session" : "Legacy rotation"}
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-[-0.035em] text-text sm:text-3xl">
                {next?.session.name ?? runnableLegacy.name}
              </h2>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary">
                <span className="inline-flex items-center gap-1.5">
                  <Dumbbell className="h-4 w-4" aria-hidden="true" />
                  {exerciseCount} exercises
                </span>
                {targetDuration ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4" aria-hidden="true" />
                    ≈{targetDuration} min
                  </span>
                ) : null}
                {next ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    Week {next.week.index} · {phaseLabel(next.week.phase)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-1.5 text-sm text-text-secondary">
            {exerciseNames.slice(0, 5).map((name, index) => (
              <div key={`${name}-${index}`} className="flex gap-3">
                <span className="metric w-5 text-right text-text-muted">{index + 1}</span>
                <span>{name}</span>
              </div>
            ))}
            {exerciseNames.length > 5 ? (
              <div className="pl-8 text-text-muted">
                +{exerciseNames.length - 5} more
              </div>
            ) : null}
          </div>

          <Button onClick={start} className="mt-6 w-full py-3.5 text-base">
            <Play className="h-4 w-4 fill-current" aria-hidden="true" />
            {workoutActive ? "Resume workout" : "Start workout"}
          </Button>
        </section>
      )}

      <HabitTodayPanel />

      {latestRecord ? (
        <section className="surface-card p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-positive" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text">Recent performance record</p>
              <p className="mt-1 truncate text-sm text-text-secondary">
                {latestRecord.exerciseName} · {latestRecord.type === "e1rm" ? "estimated strength" : "top load"}
              </p>
              <p className="metric mt-1 text-xl font-bold text-positive">
                {latestRecord.value.toFixed(latestRecord.type === "e1rm" ? 1 : 0)}
              </p>
              <p className="mt-1 text-xs text-text-muted">{latestRecord.date}</p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
