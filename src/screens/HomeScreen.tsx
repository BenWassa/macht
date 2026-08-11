import { getRunnableTemplate } from "@/domain/injuries";
import { buildTodayModel } from "@/domain/today";
import { findNextPlannedSession } from "@/domain/training/activeSession";
import { getNextTrainingTemplate } from "@/domain/trainingPlan";
import { RecentProgressCard } from "@/screens/today/RecentProgressCard";
import { TodaySessionCard } from "@/screens/today/TodaySessionCard";
import { TrainingWeekCard } from "@/screens/today/TrainingWeekCard";
import type { TabId } from "@/App";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useProgramStore } from "@/state/useProgramStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

interface HomeScreenProps {
  setActiveTab: (tab: TabId) => void;
}

const dateLabel = () =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

export function HomeScreen({ setActiveTab }: HomeScreenProps) {
  const sessions = useHistoryStore((state) => state.sessions);
  const injuries = useInjuryStore((state) => state.injuries);
  const programs = useProgramStore((state) => state.programs);
  const mesocycles = useProgramStore((state) => state.mesocycles);
  const activeProgramId = useProgramStore((state) => state.activeProgramId);
  const workoutActive = useWorkoutStore((state) => state.workoutActive);
  const startTemplate = useWorkoutStore((state) => state.startTemplate);
  const startPlannedSession = useWorkoutStore(
    (state) => state.startPlannedSession,
  );
  const nextTemplate = getNextTrainingTemplate(sessions);
  const runnable = getRunnableTemplate(nextTemplate, injuries);
  const activeProgram = programs.find((item) => item.id === activeProgramId);
  const activeMesocycle = mesocycles.find(
    (item) =>
      item.id === activeProgram?.activeMesocycleId ||
      (item.programId === activeProgram?.id && item.status === "active"),
  );
  const nextPlanned = findNextPlannedSession(activeMesocycle);
  const adjusted =
    !nextPlanned && runnable.exercises.length < nextTemplate.exercises.length;
  const model = buildTodayModel({
    sessions,
    legacyTemplate: runnable,
    weeklyTarget: activeProgram?.sessionsPerWeek ?? 3,
    activeMesocycle,
  });

  const openWorkout = () => {
    if (!workoutActive) {
      if (nextPlanned && activeProgram && activeMesocycle) {
        startPlannedSession(nextPlanned.session, {
          programId: activeProgram.id,
          mesocycleId: activeMesocycle.id,
        });
      } else {
        startTemplate(runnable);
      }
    }
    setActiveTab("workout");
  };

  return (
    <div className="animate-rise-in space-y-5">
      <header className="pb-1">
        <p className="text-sm font-medium text-text-muted">{dateLabel()}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-text">
          Today
        </h1>
      </header>

      <TodaySessionCard
        model={model}
        adjusted={adjusted}
        actionLabel={workoutActive ? "Resume workout" : "Start workout"}
        onStart={openWorkout}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TrainingWeekCard model={model} />
        <RecentProgressCard highlight={model.recentProgress} />
      </div>
    </div>
  );
}
