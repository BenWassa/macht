import type { ProgressionDecision } from "@/domain/progression/types";
import type {
  ProgressRecord,
  ProgressWorkout,
} from "@/domain/progress/model";
import type { Mesocycle } from "@/domain/training/types";
import type { RollingPlanStatus, TrainingMilestone } from "./types";

const firstDate = (dates: Array<string | undefined>): string | undefined =>
  dates
    .filter((date): date is string => Boolean(date))
    .sort((a, b) => a.localeCompare(b))[0];

export interface BuildTrainingMilestonesInput {
  workouts: ProgressWorkout[];
  records: ProgressRecord[];
  decisions: ProgressionDecision[];
  mesocycles: Mesocycle[];
  rollingPlan: RollingPlanStatus;
}

export function buildTrainingMilestones({
  workouts,
  records,
  decisions,
  mesocycles,
  rollingPlan,
}: BuildTrainingMilestonesInput): TrainingMilestone[] {
  const firstPlanned = [...workouts]
    .filter((workout) => workout.programId && workout.mesocycleId)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const firstRecord = [...records].sort((a, b) =>
    a.date.localeCompare(b.date),
  )[0];
  const firstAdaptive = [...decisions].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  )[0];
  const completedCycle = [...mesocycles]
    .filter((cycle) => cycle.status === "completed")
    .sort((a, b) =>
      (a.startDate ?? a.createdAt).localeCompare(b.startDate ?? b.createdAt),
    )[0];
  const fourthPlannedWeek = rollingPlan.weeks.filter((week) => week.planMet)[3];

  return [
    {
      type: "first_planned_session",
      achieved: Boolean(firstPlanned),
      achievedOn: firstPlanned?.date,
      title: "First planned session",
      detail: "Completed a session from an active Macht program.",
    },
    {
      type: "first_performance_record",
      achieved: Boolean(firstRecord),
      achievedOn: firstRecord?.date,
      title: "First post-baseline record",
      detail: "Improved an all-time training performance after establishing a baseline.",
    },
    {
      type: "first_adaptive_change",
      achieved: Boolean(firstAdaptive),
      achievedOn: firstAdaptive?.createdAt.slice(0, 10),
      title: "First adaptive update",
      detail: "Completed performance produced an explainable change to a future prescription.",
    },
    {
      type: "first_completed_cycle",
      achieved: Boolean(completedCycle),
      achievedOn: firstDate([
        completedCycle?.startDate,
        completedCycle?.createdAt.slice(0, 10),
      ]),
      title: "First completed cycle",
      detail: "Finished a full generated training cycle, including its planned recovery phase when used.",
    },
    {
      type: "four_planned_weeks",
      achieved: Boolean(fourthPlannedWeek),
      achievedOn: fourthPlannedWeek?.weekEnd,
      title: "Four planned weeks completed",
      detail: "Met the chosen weekly session plan in four tracked weeks. The weeks do not need to be consecutive.",
    },
  ];
}
