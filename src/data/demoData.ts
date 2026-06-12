import { brzyckiE1rm } from "@/domain/e1rm";
import type { ExerciseSnapshot, SessionLog, SetEntry } from "@/domain/types";
import { MOCK_HISTORY } from "@/data/mockData";

const set = (
  id: number,
  weight: number,
  reps: number,
  rpe: number,
): SetEntry => ({
  id,
  weight,
  reps,
  rpe,
  completed: true,
  last: "-",
});

const snapshot = (
  exerciseId: string,
  weight: number,
  reps: number,
  rpe = 8,
  count = 3,
): ExerciseSnapshot => ({
  exerciseId,
  e1rm: brzyckiE1rm(weight, Math.min(reps, 10)),
  sets: Array.from({ length: count }, (_, index) =>
    set(index + 1, weight, Math.max(reps - (index > 0 ? 1 : 0), 1), rpe),
  ),
});

const progressSession = (
  index: number,
  date: string,
  lifts: ExerciseSnapshot[],
): SessionLog => ({
  id: `demo-progress-${index}`,
  date,
  template: "Historical strength work",
  duration: `${52 + (index % 4) * 3}m`,
  volume: lifts.reduce(
    (total, lift) =>
      total + lift.sets.reduce((sum, item) => sum + item.weight * item.reps, 0),
    0,
  ),
  sets: lifts.reduce((total, lift) => total + lift.sets.length, 0),
  adapted: index >= 5,
  isMinimumSession: false,
  exerciseSnapshots: lifts,
});

const PROGRESS_HISTORY = [
  progressSession(12, "2026-06-09", [
    snapshot("squat", 190, 5, 8.5),
    snapshot("bench_press", 115, 6, 9),
    snapshot("barbell_row", 105, 8, 8),
  ]),
  progressSession(11, "2026-06-05", [
    snapshot("deadlift", 235, 4, 8.5, 2),
    snapshot("overhead_press", 72.5, 5, 8.5),
    snapshot("barbell_row", 100, 9, 8),
  ]),
  progressSession(10, "2026-05-30", [
    snapshot("squat", 185, 6, 8),
    snapshot("bench_press", 112.5, 7, 8.5),
    snapshot("barbell_row", 100, 8, 8),
  ]),
  progressSession(9, "2026-05-25", [
    snapshot("deadlift", 225, 5, 8),
    snapshot("overhead_press", 70, 6, 8),
    snapshot("barbell_row", 95, 9, 8),
  ]),
  progressSession(8, "2026-05-19", [
    snapshot("squat", 180, 6, 8),
    snapshot("bench_press", 110, 6, 8),
    snapshot("barbell_row", 95, 8, 8),
  ]),
  progressSession(7, "2026-05-14", [
    snapshot("deadlift", 220, 5, 8),
    snapshot("overhead_press", 67.5, 6, 8),
    snapshot("barbell_row", 92.5, 8, 8),
  ]),
  progressSession(6, "2026-05-08", [
    snapshot("squat", 175, 6, 8),
    snapshot("bench_press", 107.5, 6, 8),
    snapshot("barbell_row", 90, 8, 8),
  ]),
  progressSession(5, "2026-05-02", [
    snapshot("deadlift", 215, 5, 8),
    snapshot("overhead_press", 65, 6, 8),
    snapshot("barbell_row", 87.5, 8, 8),
  ]),
  progressSession(4, "2026-04-26", [
    snapshot("squat", 170, 6, 8),
    snapshot("bench_press", 105, 6, 8),
    snapshot("barbell_row", 85, 8, 8),
  ]),
  progressSession(3, "2026-04-20", [
    snapshot("deadlift", 205, 5, 8),
    snapshot("overhead_press", 62.5, 6, 8),
  ]),
  progressSession(2, "2026-04-14", [
    snapshot("squat", 165, 6, 8),
    snapshot("bench_press", 102.5, 6, 8),
  ]),
  progressSession(1, "2026-04-08", [
    snapshot("deadlift", 195, 5, 8),
    snapshot("overhead_press", 60, 6, 8),
  ]),
];

const RECENT_TEMPLATE_HISTORY: SessionLog[] = [
  {
    ...progressSession(15, "2026-06-10", [
      snapshot("leg_press", 180, 12, 8),
      snapshot("hamstring_curl", 65, 11, 8),
      snapshot("calf_raise", 90, 20, 8),
    ]),
    template: "Session A - Lower Strength + Shoulder Control",
  },
  {
    ...progressSession(14, "2026-06-06", [
      snapshot("hack_squat", 160, 12, 8),
      snapshot("hip_thrust", 190, 12, 8),
      snapshot("leg_extension", 70, 14, 8),
    ]),
    template: "Session C - Lower Hypertrophy + Stability",
  },
  {
    ...progressSession(13, "2026-06-03", [
      snapshot("leg_press", 170, 12, 8),
      snapshot("hamstring_curl", 65, 10, 8),
      snapshot("calf_raise", 85, 20, 8),
    ]),
    template: "Session A - Lower Strength + Shoulder Control",
  },
];

export const DEMO_HISTORY: SessionLog[] = [
  ...RECENT_TEMPLATE_HISTORY,
  ...PROGRESS_HISTORY,
  ...MOCK_HISTORY,
];
