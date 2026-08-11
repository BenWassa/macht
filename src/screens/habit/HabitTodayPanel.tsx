import { useMemo } from "react";
import { finalizeMesocycleState } from "@/domain/habit/cycleState";
import { buildTrainingMilestones } from "@/domain/habit/milestones";
import {
  applyScheduleRecovery,
  findMissedSessionRecovery,
} from "@/domain/habit/scheduleRecovery";
import { rollingPlanStatus, weeklyPlanStatus } from "@/domain/habit/weeklyPlan";
import type { ScheduleRecoveryChoice } from "@/domain/habit/types";
import { detectProgressRecords } from "@/domain/progress/exercises";
import { normalizeProgressHistory } from "@/domain/progress/normalize";
import { todayIso } from "@/lib/format";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useExecutionHistoryStore } from "@/state/useExecutionHistoryStore";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useProgramStore } from "@/state/useProgramStore";
import { useProgressionStore } from "@/state/useProgressionStore";
import { useToastStore } from "@/state/useToastStore";
import { ScheduleRecoveryCard } from "./ScheduleRecoveryCard";
import { TrainingMilestonesCard } from "./TrainingMilestonesCard";
import { TrainingRhythmCard } from "./TrainingRhythmCard";

export function HabitTodayPanel() {
  const programs = useProgramStore((state) => state.programs);
  const mesocycles = useProgramStore((state) => state.mesocycles);
  const activeProgramId = useProgramStore((state) => state.activeProgramId);
  const hydrateProgramData = useProgramStore((state) => state.hydrateProgramData);
  const v2Workouts = useExecutionHistoryStore((state) => state.workouts);
  const legacySessions = useHistoryStore((state) => state.sessions);
  const customExercises = useCustomExerciseStore((state) => state.exercises);
  const decisions = useProgressionStore((state) => state.decisions);
  const showToast = useToastStore((state) => state.show);
  const today = todayIso();
  const activeProgram =
    programs.find((program) => program.id === activeProgramId) ?? programs[0];
  const activeMesocycle = activeProgram
    ? mesocycles.find(
        (cycle) =>
          cycle.id === activeProgram.activeMesocycleId ||
          (cycle.programId === activeProgram.id && cycle.status === "active"),
      )
    : undefined;

  const model = useMemo(() => {
    if (!activeProgram) return undefined;
    const workouts = normalizeProgressHistory(
      v2Workouts,
      legacySessions,
      customExercises,
    );
    const current = weeklyPlanStatus(
      workouts,
      today,
      activeProgram.sessionsPerWeek,
    );
    const rolling = rollingPlanStatus(
      workouts,
      today,
      activeProgram.sessionsPerWeek,
      4,
    );
    const milestoneWindow = rollingPlanStatus(
      workouts,
      today,
      activeProgram.sessionsPerWeek,
      12,
    );
    const records = detectProgressRecords(workouts);
    return {
      current,
      rolling,
      recovery: findMissedSessionRecovery(activeMesocycle, today),
      milestones: buildTrainingMilestones({
        workouts,
        records,
        decisions,
        mesocycles,
        rollingPlan: milestoneWindow,
      }),
    };
  }, [
    activeMesocycle,
    activeProgram,
    customExercises,
    decisions,
    legacySessions,
    mesocycles,
    today,
    v2Workouts,
  ]);

  if (!activeProgram || !model) return null;

  const recover = (choice: ScheduleRecoveryChoice) => {
    if (!activeMesocycle || !model.recovery) return;
    const repaired = finalizeMesocycleState(
      applyScheduleRecovery(
        activeMesocycle,
        model.recovery,
        choice,
        today,
      ),
    );
    hydrateProgramData(
      programs,
      mesocycles.map((cycle) =>
        cycle.id === repaired.id ? repaired : cycle,
      ),
    );
    const copy: Record<ScheduleRecoveryChoice, string> = {
      train_today: `${model.recovery.sessionName} moved to today`,
      move_forward: `${model.recovery.sessionName} moved to ${model.recovery.suggestedMoveDate}`,
      skip: `${model.recovery.sessionName} skipped · later sessions unchanged`,
    };
    showToast(copy[choice]);
  };

  return (
    <div className="space-y-4">
      {model.recovery ? (
        <ScheduleRecoveryCard
          recovery={model.recovery}
          onTrainToday={() => recover("train_today")}
          onMoveForward={() => recover("move_forward")}
          onSkip={() => recover("skip")}
        />
      ) : null}
      <TrainingRhythmCard current={model.current} rolling={model.rolling} />
      <TrainingMilestonesCard milestones={model.milestones} />
    </div>
  );
}
