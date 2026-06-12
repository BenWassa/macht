# Progressive Overload Programme — Implementation Plan (Issue #7)

Goal: a gamified, ~10%-capped progressive overload system that tells the user
what their next workout weight should be, adapts to real (not planned) training
frequency, and frames suggestions as a guide — lift more if feeling good,
less if the body feels off. Projections update only when a completed workout
is saved, never mid-session.

## Architecture decision: derive, don't store

All required inputs already exist in `SessionLog.exerciseSnapshots` (full set
data + e1RM per lift, saved by `FinishSessionModal`). The recommendation engine
should be a **pure function of history**:

```
src/domain/progression.ts
  suggestNextLoad(exerciseId, sessions, settings) -> LoadSuggestion | null

interface LoadSuggestion {
  weight: number;            // next working weight, rounded to loadable plates
  basis: "progress" | "repeat" | "add-rep" | "deload" | "rust";
  deltaFromLast: number;     // for the "▲ +5" UI marker
  repTarget: number;
}
```

No new persisted store, no migration, no backup-format change, no sync bugs —
and it automatically satisfies the issue's key decision: since suggestions are
derived from saved sessions only, lifting more or less than projected simply
re-anchors the next projection on actuals at save time. This matches the
existing derivation pattern (`deriveE1rmHistory`, `computeSessionTotals`).

## Algorithm (double progression + frequency-aware cap)

Per lift, reading newest-first from `useHistoryStore.sessions`:

1. **Baseline** = top completed working set from the most recent session
   containing the lift (`brzyckiE1rm` already ranks top sets).
2. **Decision rule** against the lift's prescription rep range
   (`getExercisePrescription`):
   - All prescribed sets at the **top of the rep range** with RPE ≤ 8
     (RIR ≥ 2) → suggest **+1 increment** (lbs: +5 lower body / +2.5 upper;
     kgs: +2.5 / +1.25, per `settings.units`).
   - Sets completed **mid-range** → same weight, `basis: "add-rep"`.
   - **Missed reps or RPE ≥ 9.5** → repeat weight; two consecutive misses →
     suggest −7.5% micro-deload (reuses the existing `deloadWeights`
     plumbing in `useWorkoutStore` / `buildWorkoutSets`).
3. **Monthly cap**: cumulative suggested increase over the trailing 28 days
   is clamped to ~10% of the working weight (configurable constant).
4. **Frequency adaptation (real vs projected)**: gap since the lift was last
   performed > 10 days → repeat last weight (`basis: "rust"`); > 21 days →
   suggest 90% of last weight. Driven by actual session dates, not the plan.
5. **Rounding**: snap to smallest loadable increment (`lib/loadability.ts`).

Scope: any external-load exercise with ≥ 2 logged sessions — not just
`PROGRESS_LIFTS` — since snapshots are already recorded for every lift.

## UI surfaces (one PR each)

**Phase 1 — Workout prefill (core).** Inject suggested weights in
`buildWorkoutSets` (same shape as the existing `deloadWeights` parameter).
In `WorkoutSetTable`, a small marker on suggested rows — `▲ +5` in emerald
when progressing, `▼` neutral on deload/rust — tap reverts to last session's
weight. The #8 cascade makes manual overrides cheap. First-suggestion
explainer (one-time modal or inline note): guide not gospel; go heavier if
strong, lighter if beat up.

**Phase 2 — Home "Next workout" card.** Next template in rotation plus
suggested working weights for its main lifts, with the realism caveat as a
persistent footnote. This is the "shortcut … working weight on home" from
the issue.

**Phase 3 — Progress tab + gamification.** Projection overlaid on the
existing e1RM sparkline; streak badge (consecutive progressions) and a
"+X% this month" stat per lift. Streaks are derivable from history too —
still no new store.

## Testing

`progression.ts` is pure → add Vitest (repo currently has no test runner)
and table-driven tests: progress, plateau, deload, rust-decay, cap-clamp,
unit rounding.

## Open decisions

1. Increment sizes and the 10%/28-day cap value — constants, easy to tune.
2. Whether "add-rep" suggestions should bump the prefilled rep target in the
   set table (recommended) or stay weight-only.
3. Gamification depth in Phase 3 (streaks only vs. monthly % goal ring).
