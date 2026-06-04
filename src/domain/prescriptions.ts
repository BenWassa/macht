import type { SetEntry } from "./types";

export type ExerciseMetric = "reps" | "sec" | "min";
export type ExerciseLoadMode = "external" | "none";

export interface ExercisePrescription {
  loadMode: ExerciseLoadMode;
  loadDisplay: string;
  metric: ExerciseMetric;
  metricLabel: string;
  planned: string;
  showPlateVisualizer?: boolean;
  defaultSets: Array<Pick<SetEntry, "weight" | "reps" | "last">>;
}

const sets = (
  count: number,
  weight: number,
  reps: number,
  last: string,
): Array<Pick<SetEntry, "weight" | "reps" | "last">> =>
  Array.from({ length: count }, () => ({ weight, reps, last }));

const external = (
  planned: string,
  defaultSets: ExercisePrescription["defaultSets"],
  showPlateVisualizer = false,
): ExercisePrescription => ({
  loadMode: "external",
  loadDisplay: "Load",
  metric: "reps",
  metricLabel: "Reps",
  planned,
  showPlateVisualizer,
  defaultSets,
});

const noLoad = (
  planned: string,
  defaultSets: ExercisePrescription["defaultSets"],
  metric: ExerciseMetric = "reps",
): ExercisePrescription => ({
  loadMode: "none",
  loadDisplay: metric === "min" ? "Cardio" : "Body",
  metric,
  metricLabel: metric === "min" ? "Min" : metric === "sec" ? "Sec" : "Reps",
  planned,
  defaultSets,
});

const PRESCRIPTIONS: Record<string, ExercisePrescription> = {
  leg_press: external("3 x 8-12", sets(3, 80, 10, "8-12 reps")),
  belt_squat: external("3 x 8-12", sets(3, 80, 10, "8-12 reps")),
  hack_squat: external("3 x 8-12", sets(3, 80, 10, "8-12 reps")),
  leg_extension: external("2-3 x 12-15", sets(2, 40, 12, "12-15 reps")),
  hamstring_curl: external("2-3 x 10-15", sets(3, 40, 12, "10-15 reps")),
  leg_curl: external("2-3 x 10-15", sets(3, 40, 12, "10-15 reps")),
  hip_thrust: external("3 x 8-12", sets(3, 80, 10, "8-12 reps"), true),
  calf_raise: external("3 x 12-20", sets(3, 40, 15, "12-20 reps")),
  romanian_deadlift: external("Caution: 3 x 8 only if no traction", sets(3, 80, 8, "Pain-free only"), true),
  trap_bar_deadlift: external("Caution: light only if no traction", sets(2, 80, 6, "Pain-free only")),
  deadlift: external("Paused until cleared", sets(1, 80, 5, "Paused"), true),
  squat: external("Paused until cleared", sets(1, 80, 5, "Paused"), true),
  front_squat: external("Paused until cleared", sets(1, 80, 5, "Paused")),
  bench_press: external("Paused until cleared", sets(1, 80, 5, "Paused"), true),
  overhead_press: external("Paused until cleared", sets(1, 40, 5, "Paused"), true),
  floor_press_neutral: external("Re-entry only: 2-3 x 6-10", sets(2, 40, 8, "Re-entry only"), true),
  landmine_press: external("Re-entry only: 2-3 x 8-10", sets(2, 25, 8, "Re-entry only")),
  neutral_db_press: external("Re-entry only: 2-3 x 8-10", sets(2, 20, 8, "Re-entry only")),
  incline_db_press: external("Caution: shallow ROM only", sets(2, 20, 8, "Caution")),
  chest_supported_row: external("Supported pull: 2-3 x 8-12", sets(2, 40, 10, "Supported pull")),
  neutral_cable_row: external("Supported pull: 2-3 x 10-12", sets(2, 40, 10, "Supported pull")),
  lat_pulldown_front: external("Light only if stable: 2 x 10", sets(2, 40, 10, "Light only")),
  face_pull: external("Only if no anterior symptoms: 2 x 12-15", sets(2, 15, 12, "Symptom-free")),
  barbell_row: external("Caution: heavy rowing", sets(2, 40, 8, "Caution"), true),
  dumbbell_row: external("Caution: controlled only", sets(2, 20, 10, "Caution")),
  tricep_pushdown: external("2-3 x 10-15", sets(2, 30, 12, "10-15 reps")),

  split_squat: noLoad("3 x 8-10 each side", sets(3, 0, 8, "Each side")),
  step_up: noLoad("3 x 8-10 each side", sets(3, 0, 8, "Each side")),
  walking_lunge: noLoad("2-3 x 8-10 each side", sets(2, 0, 8, "Each side")),
  glute_bridge: noLoad("3 x 10-15", sets(3, 0, 12, "10-15 reps")),
  sled_push: noLoad("Athletic re-entry only", sets(1, 0, 10, "Re-entry only")),

  stationary_bike: noLoad("25-40 min easy", sets(1, 0, 30, "Easy pace"), "min"),
  incline_walk: noLoad("Optional 10-20 min", sets(1, 0, 15, "Optional"), "min"),
  easy_jog: noLoad("Easy pace only", sets(1, 0, 15, "Easy pace"), "min"),
  stair_climber: noLoad("Easy pace only", sets(1, 0, 15, "Easy pace"), "min"),
  hands_free_elliptical: noLoad("Easy pace if tolerated", sets(1, 0, 20, "Hands-free"), "min"),
  rowing_machine: noLoad("Avoid for now", sets(1, 0, 10, "Avoid")),
  assault_bike_arms: noLoad("Avoid arm drive for now", sets(1, 0, 10, "Avoid")),
  battle_ropes: noLoad("Avoid for now", sets(1, 0, 10, "Avoid")),

  dead_bug: noLoad("3 x 8-12", sets(3, 0, 10, "8-12 reps")),
  reverse_crunch: noLoad("3 x 10-15", sets(3, 0, 12, "10-15 reps")),
  hollow_hold: noLoad("2-3 x 15-30 sec", sets(3, 0, 20, "15-30 sec"), "sec"),
  pallof_press: noLoad("2 x 10 each side", sets(2, 0, 10, "Each side")),
  front_plank: noLoad("Only if shoulder stable", sets(2, 0, 20, "Stable only"), "sec"),
  side_plank: noLoad("Only if shoulder stable", sets(2, 0, 20, "Stable only"), "sec"),
  hanging_leg_raise: noLoad("Avoid for now", sets(1, 0, 8, "Avoid")),
  ab_wheel: noLoad("Avoid for now", sets(1, 0, 8, "Avoid")),

  scapular_setting: noLoad("2 x 15", sets(2, 0, 15, "Controlled")),
  band_row_elbows_close: noLoad("2 x 15-20", sets(2, 0, 15, "Elbows close")),
  external_rotation_isometric: noLoad("5 x 10-20 sec", sets(5, 0, 10, "Pain-free"), "sec"),
  internal_rotation_isometric: noLoad("5 x 10-20 sec", sets(5, 0, 10, "Pain-free"), "sec"),
  serratus_wall_press: noLoad("2 x 15", sets(2, 0, 15, "Controlled")),
  wall_slide: noLoad("2 x 10-15", sets(2, 0, 10, "Controlled")),
  side_lying_external_rotation: noLoad("2 x 10-15 if pain-free", sets(2, 0, 10, "Pain-free")),
  wall_push_up: noLoad("Re-entry: 2 x 8-12", sets(2, 0, 8, "Re-entry only")),
  incline_push_up: noLoad("Re-entry: 2 x 8-12", sets(2, 0, 8, "Re-entry only")),
  push_up: noLoad("Re-entry only", sets(2, 0, 8, "Re-entry only")),
  pull_up: noLoad("Avoid hanging for now", sets(1, 0, 5, "Avoid")),
  chin_up: noLoad("Avoid hanging for now", sets(1, 0, 5, "Avoid")),
  dip: noLoad("Avoid dips for now", sets(1, 0, 5, "Avoid")),
  lat_pulldown_behind: noLoad("Avoid behind-neck pulling", sets(1, 0, 8, "Avoid")),
};

const FALLBACK = external("3 x 8-10", [
  { weight: 80, reps: 8, last: "-" },
  { weight: 80, reps: 8, last: "-" },
  { weight: 75, reps: 10, last: "-" },
]);

export const getExercisePrescription = (
  exerciseId: string,
): ExercisePrescription => PRESCRIPTIONS[exerciseId] ?? FALLBACK;

export function getDefaultSetsForExercise(
  exerciseId: string,
  deloadWeight?: number,
): SetEntry[] {
  const prescription = getExercisePrescription(exerciseId);
  return prescription.defaultSets.map((entry, index) => ({
    id: index + 1,
    weight:
      typeof deloadWeight === "number" && prescription.loadMode === "external"
        ? Math.max(0, deloadWeight)
        : entry.weight,
    reps: entry.reps,
    rpe: null,
    completed: false,
    last: entry.last,
  }));
}
