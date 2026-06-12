import {
  suggestLoadsForExercises,
  suggestNextLoad,
} from "@/domain/progression";
import type { TemplatePlan } from "@/domain/types";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useSettingsStore } from "@/state/useSettingsStore";

export const customExercises = () =>
  useCustomExerciseStore.getState().exercises;

export const suggestFor = (exerciseId: string) =>
  suggestNextLoad(
    exerciseId,
    useHistoryStore.getState().sessions,
    useSettingsStore.getState(),
    customExercises(),
  ) ?? undefined;

export const suggestForTemplate = (template: TemplatePlan) =>
  suggestLoadsForExercises(
    template.exercises,
    useHistoryStore.getState().sessions,
    useSettingsStore.getState(),
    customExercises(),
  );
