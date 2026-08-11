import { useMemo } from "react";
import { buildPersonalTrainingModel } from "@/domain/personalization/model";
import { todayIso } from "@/lib/format";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useProgramStore } from "@/state/useProgramStore";
import { useProgressionStore } from "@/state/useProgressionStore";

export function PersonalProgramSignalsCard() {
  const decisions = useProgressionStore((state) => state.decisions);
  const mesocycles = useProgramStore((state) => state.mesocycles);
  const customExercises = useCustomExerciseStore((state) => state.exercises);

  const model = useMemo(
    () =>
      buildPersonalTrainingModel({
        decisions,
        mesocycles,
        customExercises,
        asOfDate: todayIso(),
      }),
    [customExercises, decisions, mesocycles],
  );

  const suggestions: string[] = [];

  model.muscleVolumeResponses
    .filter(
      (profile) =>
        profile.confidence === "established" &&
        profile.repeatedFatigueAtOrAboveSets != null,
    )
    .slice(0, 3)
    .forEach((profile) => {
      suggestions.push(
        `For ${profile.muscleId}, repeated fatigue has appeared at ${profile.repeatedFatigueAtOrAboveSets}+ planned working sets. Macht will hold automatic set increases at that exposure until the evidence changes.`,
      );
    });

  if (
    model.sessionDuration.confidence === "established" &&
    model.sessionDuration.repeatedHighWorkloadAtOrAboveMinutes != null
  ) {
    suggestions.push(
      `Higher workload has repeatedly appeared around ${Math.round(model.sessionDuration.repeatedHighWorkloadAtOrAboveMinutes)} minutes. Consider keeping session targets below that range when editing the program.`,
    );
  }

  if (
    model.schedule.confidence === "established" &&
    model.schedule.weakerWeekdays.length
  ) {
    const labels = model.schedule.weekdays
      .filter((weekday) => model.schedule.weakerWeekdays.includes(weekday.weekday))
      .map((weekday) => weekday.label)
      .join(", ");
    if (labels) {
      suggestions.push(
        `Planned sessions have been less reliable on ${labels}. Consider placing higher-priority sessions on stronger days when convenient.`,
      );
    }
  }

  if (!suggestions.length) return null;

  return (
    <section className="surface-card space-y-3 p-4 sm:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          Personal model
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-[-0.02em] text-text">
          Established programming signals
        </h2>
        <p className="mt-1 text-xs leading-5 text-text-muted">
          Advisory only. These signals never add training days or increase session targets automatically.
        </p>
      </div>
      <ul className="space-y-2">
        {suggestions.map((suggestion) => (
          <li key={suggestion} className="rounded-md bg-surface-2 p-3 text-sm leading-6 text-text-secondary">
            {suggestion}
          </li>
        ))}
      </ul>
    </section>
  );
}
