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

export const sets = (
  count: number,
  weight: number,
  reps: number,
  last: string,
): ExercisePrescription["defaultSets"] =>
  Array.from({ length: count }, () => ({ weight, reps, last }));

export const external = (
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

export const noLoad = (
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
