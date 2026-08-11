import { useMemo } from "react";
import { buildPersonalTrainingModel } from "@/domain/personalization/model";
import type { PersonalizationConfidence } from "@/domain/personalization/types";
import { todayIso } from "@/lib/format";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useProgramStore } from "@/state/useProgramStore";
import { useProgressionStore } from "@/state/useProgressionStore";

const confidenceLabel: Record<PersonalizationConfidence, string> = {
  insufficient: "Insufficient evidence",
  emerging: "Emerging",
  established: "Established",
};

const confidenceClass: Record<PersonalizationConfidence, string> = {
  insufficient: "bg-surface-3 text-text-muted",
  emerging: "bg-warning-soft text-warning",
  established: "bg-positive-soft text-positive",
};

function EvidenceBadge({
  confidence,
  count,
}: {
  confidence: PersonalizationConfidence;
  count: number;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${confidenceClass[confidence]}`}
    >
      {confidenceLabel[confidence]} · {count} observation{count === 1 ? "" : "s"}
    </span>
  );
}

export function PersonalTrainingModelCard() {
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

  const exerciseSignals = [...model.exerciseResponses]
    .sort((a, b) => {
      const rank = { established: 2, emerging: 1, insufficient: 0 };
      return rank[b.confidence] - rank[a.confidence] || b.evidenceCount - a.evidenceCount;
    })
    .slice(0, 4);
  const volumeSignals = [...model.muscleVolumeResponses]
    .sort((a, b) => {
      const rank = { established: 2, emerging: 1, insufficient: 0 };
      return rank[b.confidence] - rank[a.confidence] || b.evidenceCount - a.evidenceCount;
    })
    .slice(0, 4);
  const adjustedDecisions = decisions
    .filter((decision) => decision.personalization)
    .slice(-3)
    .reverse();

  return (
    <section className="surface-card space-y-5 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
            Personal training model
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-text">
            What Macht has learned
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
            Signals are learned only from your training history, recovery and workload feedback, and schedule outcomes. Low-evidence patterns stay explicitly uncertain.
          </p>
        </div>
        <div className="rounded-md bg-surface-2 px-3 py-2 text-right">
          <div className="metric text-2xl font-bold text-text">
            {model.establishedSignals}
          </div>
          <div className="text-[11px] font-semibold text-text-muted">
            established signals
          </div>
        </div>
      </div>

      {model.establishedSignals === 0 ? (
        <div className="rounded-md bg-surface-2 p-4 text-sm leading-6 text-text-secondary">
          Macht is still learning. Personalization remains inactive until repeated evidence reaches the established threshold; deterministic progression continues normally in the meantime.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-text">Exercise response</h3>
          {exerciseSignals.length ? (
            exerciseSignals.map((profile) => (
              <article key={profile.exerciseId} className="rounded-md bg-surface-2 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-text">
                    {profile.exerciseName}
                  </span>
                  <EvidenceBadge confidence={profile.confidence} count={profile.evidenceCount} />
                </div>
                <p className="mt-2 text-xs leading-5 text-text-muted">
                  {profile.explanation}
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm text-text-muted">No exercise-response evidence yet.</p>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-text">Volume response</h3>
          {volumeSignals.length ? (
            volumeSignals.map((profile) => (
              <article key={profile.muscleId} className="rounded-md bg-surface-2 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold capitalize text-text">
                    {profile.muscleId}
                  </span>
                  <EvidenceBadge confidence={profile.confidence} count={profile.evidenceCount} />
                </div>
                <p className="mt-2 text-xs leading-5 text-text-muted">
                  {profile.explanation}
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm text-text-muted">No muscle-volume evidence yet.</p>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-md bg-surface-2 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-text">Session demand</h3>
            <EvidenceBadge
              confidence={model.sessionDuration.confidence}
              count={model.sessionDuration.evidenceCount}
            />
          </div>
          <p className="mt-2 text-xs leading-5 text-text-muted">
            {model.sessionDuration.explanation}
          </p>
        </article>
        <article className="rounded-md bg-surface-2 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-text">Schedule reliability</h3>
            <EvidenceBadge confidence={model.schedule.confidence} count={model.schedule.evidenceCount} />
          </div>
          <p className="mt-2 text-xs leading-5 text-text-muted">
            {model.schedule.explanation}
          </p>
        </article>
      </div>

      {adjustedDecisions.length ? (
        <div className="space-y-3 border-t border-divider pt-4">
          <h3 className="text-sm font-bold text-text">Recent personalized decisions</h3>
          {adjustedDecisions.map((decision) => (
            <article key={decision.id} className="rounded-md bg-signal-soft p-3">
              <div className="text-xs font-semibold text-signal-strong">
                Base: {decision.personalization?.baseDecision.replaceAll("_", " ")} → Applied: {decision.decision.replaceAll("_", " ")}
              </div>
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                {decision.personalization?.explanation}
              </p>
              <p className="mt-1 text-[11px] font-medium text-text-muted">
                {decision.personalization?.evidenceCount} supporting observations
              </p>
            </article>
          ))}
        </div>
      ) : null}

      <p className="border-t border-divider pt-4 text-xs leading-5 text-text-muted">
        Personalization can currently hold a proposed volume increase when repeated established fatigue evidence supports that choice. It does not automatically add training days, raise session targets, or increase load increments.
      </p>
    </section>
  );
}
