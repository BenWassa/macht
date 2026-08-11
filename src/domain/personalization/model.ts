import type { ProgressionDecision } from "@/domain/progression/types";
import type { Mesocycle } from "@/domain/training/types";
import type { CustomExercise } from "@/domain/types";
import { buildExerciseResponseProfiles } from "./exerciseResponse";
import { buildSchedulePattern } from "./schedulePatterns";
import { buildSessionDurationPattern } from "./sessionPatterns";
import type { PersonalTrainingModel } from "./types";
import { buildMuscleVolumeResponseProfiles } from "./volumeResponse";

export interface BuildPersonalTrainingModelInput {
  decisions: ProgressionDecision[];
  mesocycles: Mesocycle[];
  customExercises?: CustomExercise[];
  asOfDate: string;
  generatedAt?: string;
}

export function buildPersonalTrainingModel({
  decisions,
  mesocycles,
  customExercises = [],
  asOfDate,
  generatedAt = new Date().toISOString(),
}: BuildPersonalTrainingModelInput): PersonalTrainingModel {
  const exerciseResponses = buildExerciseResponseProfiles(
    decisions,
    customExercises,
  );
  const muscleVolumeResponses = buildMuscleVolumeResponseProfiles(
    decisions,
    mesocycles,
  );
  const sessionDuration = buildSessionDurationPattern(decisions);
  const schedule = buildSchedulePattern(mesocycles, asOfDate);
  const establishedSignals =
    exerciseResponses.filter((profile) => profile.confidence === "established")
      .length +
    muscleVolumeResponses.filter(
      (profile) => profile.confidence === "established",
    ).length +
    Number(sessionDuration.confidence === "established") +
    Number(schedule.confidence === "established");

  return {
    generatedAt,
    exerciseResponses,
    muscleVolumeResponses,
    sessionDuration,
    schedule,
    establishedSignals,
  };
}
