import type { MusclePriority, MusclePriorities } from "@/domain/exercises/muscles";
import type { ProgramExerciseSlot } from "./types";

const priorityRank: Record<MusclePriority, number> = {
  maintain: 0,
  grow: 1,
  emphasize: 2,
};

function slotPriority(
  slot: ProgramExerciseSlot,
  priorities: MusclePriorities,
): MusclePriority {
  let best: MusclePriority | undefined;
  for (const muscleId of slot.targetMuscleIds) {
    const priority = priorities[muscleId];
    if (!priority) continue;
    if (!best || priorityRank[priority] > priorityRank[best]) best = priority;
  }
  return best ?? "grow";
}

function minutesPerSet(slot: ProgramExerciseSlot): number {
  return slot.estimatedMinutesPerSet ?? 3.5;
}

export function allocateSetsWithinDuration(
  slots: ProgramExerciseSlot[],
  durationMinutes: number,
  priorities: MusclePriorities,
): Map<string, number> {
  const counts = new Map(slots.map((slot) => [slot.id, slot.baseSetCount]));
  const totalMinutes = () =>
    slots.reduce(
      (sum, slot) => sum + (counts.get(slot.id) ?? 0) * minutesPerSet(slot),
      0,
    );

  const reductionOrder = [...slots].sort((a, b) => {
    const priorityDifference =
      priorityRank[slotPriority(a, priorities)] - priorityRank[slotPriority(b, priorities)];
    if (priorityDifference !== 0) return priorityDifference;
    return b.order - a.order;
  });

  let safety = slots.reduce((sum, slot) => sum + slot.baseSetCount, 0);
  while (totalMinutes() > durationMinutes && safety > 0) {
    const candidate = reductionOrder.find((slot) => (counts.get(slot.id) ?? 0) > 1);
    if (!candidate) break;
    counts.set(candidate.id, (counts.get(candidate.id) ?? 1) - 1);
    safety -= 1;
  }

  return counts;
}
