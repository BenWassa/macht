import type { ExerciseId, MuscleId } from "@/domain/shared/ids";
import type { ProgramExerciseSlot } from "@/domain/training/types";

export interface ExerciseSubstitutionProfile {
  exerciseId: ExerciseId;
  substitutionFamilyId?: string;
  equipment?: string[];
  targetMuscleIds?: MuscleId[];
  enabled?: boolean;
}

function equipmentAvailable(required: string[] | undefined, available: string[]): boolean {
  return !required || required.every((item) => available.includes(item));
}

export function findSubstitutionCandidates(
  slot: ProgramExerciseSlot,
  profiles: ExerciseSubstitutionProfile[],
  availableEquipment: string[] = [],
  excludedExerciseIds: ExerciseId[] = [],
): ExerciseSubstitutionProfile[] {
  const allowed = slot.allowedSubstitutionExerciseIds;
  return profiles.filter((candidate) => {
    if (candidate.enabled === false || candidate.exerciseId === slot.exerciseId) return false;
    if (excludedExerciseIds.includes(candidate.exerciseId)) return false;
    if (allowed?.length && !allowed.includes(candidate.exerciseId)) return false;
    if (
      slot.substitutionFamilyId &&
      candidate.substitutionFamilyId !== slot.substitutionFamilyId
    ) {
      return false;
    }
    return equipmentAvailable(candidate.equipment, availableEquipment);
  });
}
