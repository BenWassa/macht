# Macht Product Reboot — Work Plan

## Decision

Keep the existing repository and rebuild the product inside it.

Macht has a useful engineering backbone: React + TypeScript + Vite + Tailwind + Zustand, PWA/offline support, persistent workout state, history, timers, haptics, wake lock, tests, CI, and a separated domain/state/UI structure. The current product model, training architecture, and visual doctrine are too constrained for the next version.

The reboot therefore follows an **architectural salvage + product overhaul** strategy.

## Product direction

Macht becomes an adaptive hypertrophy and strength training system designed to:

1. Tell the user what to train.
2. Tell the user what to do this set.
3. Learn from actual performance and feedback.
4. Progress training intelligently.
5. Make gains visible over long periods.
6. Support a durable training habit with low-friction execution.

The product should combine RP-style adaptive programming with stronger workout execution, habit formation, longitudinal analytics, and explainable progression.

## Product principles

- Execution first.
- Set logging must remain extremely fast.
- Progress must be visible.
- Recommendations should be explainable.
- Stable programming is preferred to unnecessary novelty.
- Recovery is part of programming.
- Consistency is measured over weeks rather than punitive daily streaks.
- Users can override prescriptions.
- Historical data becomes progressively more useful.
- The app should become increasingly personalized with use.
- Core workout execution remains usable offline.

## Preserve

Retain and adapt where useful:

- React / Vite / TypeScript
- Tailwind
- Zustand
- Framer Motion
- PWA install/offline shell
- Rest timer
- Session timer
- Wake lock
- Haptics and audio infrastructure
- Modal accessibility utilities
- Toast / undo interaction pattern
- Local-first history
- Export/import concept
- Plate calculation
- e1RM calculations
- Loadability calculations
- Testing setup
- CI and GitHub deployment
- Existing workout history via migration

## Rewrite

Rebuild substantially:

- `PRODUCT.md`
- Design doctrine and visual system
- Main PRD
- Core domain types
- Program architecture
- Prescription architecture
- Progression engine
- Home / Today
- Workout execution UI
- Program / mesocycle UI
- Progress analytics
- Profile / settings IA
- Exercise metadata schema
- Saved workout schema
- Recommendation model

## Delete or demote

Remove from the product centre and preserve only where useful as supporting capability:

- Injury-centric product positioning
- Injury-first home and progress behavior
- Injury manager as a primary feature
- Big-Five-total-as-primary-product concept
- Global exercise prescriptions
- Hard-coded monthly progression cap
- Hard-coded rust algorithm
- Brutalist visual doctrine
- Monospace-everywhere typography

Injury-related logic should become an optional **training constraints** capability: temporary limitations, movement avoidance, discomfort, exercise substitutions, and equipment constraints.

---

# Target product architecture

## 1. Training engine

The prescription belongs to a specific program slot rather than globally to an exercise.

Target hierarchy:

```text
Program
└── Mesocycle
    └── Week
        └── PlannedSession
            └── ExercisePrescription
                └── SetPrescription
```

A single exercise can therefore have different prescriptions across programs, weeks, sessions, and deloads.

## 2. Execution engine

```text
WorkoutSession
└── ExercisePerformance
    └── SetPerformance
```

Persist both prescribed and actual values.

Examples:

- prescribed load / actual load
- prescribed reps / actual reps
- prescribed RIR / actual RIR
- prescribed sets / completed sets

Avoid storing presentation strings as authoritative source data when numeric/raw values can be persisted instead.

## 3. Progression engine

Replace deterministic double progression with a multi-signal recommendation model.

Inputs can include:

- load and reps
- RIR / RPE
- target RIR
- set performance
- rep-range position
- mesocycle week
- muscle volume
- stimulus feedback
- recovery state
- exercise quality
- recent performance trend
- accumulated fatigue
- session time constraint
- adherence context

Outputs can include:

- maintain
- add rep
- add load
- add set
- remove set
- deload
- rotate exercise

Each recommendation should store its reason and eventually a confidence score.

## 4. Performance engine

Support:

- load PRs
- rep PRs
- e1RM / normalized performance
- exercise trends
- muscle-level volume trends
- mesocycle trends
- historical records
- progression velocity

## 5. Habit engine

Support:

- weekly planned sessions
- rolling adherence
- consistency windows
- missed-session rescheduling
- schedule repair
- non-punitive habit mechanics

## 6. Exercise intelligence

Exercise metadata should describe the movement rather than prescribe training.

Future attributes may include:

- primary and secondary muscles
- equipment
- movement pattern
- stability requirements
- fatigue cost
- joint / comfort constraints
- substitution families
- user-specific preference and response history

---

# Proposed domain organization

```text
src/domain/

  training/
    program.ts
    mesocycle.ts
    prescription.ts
    scheduling.ts

  progression/
    loadProgression.ts
    volumeProgression.ts
    fatigue.ts
    recommendation.ts
    explanation.ts

  performance/
    records.ts
    e1rm.ts
    trends.ts
    muscleStats.ts

  exercises/
    exercise.ts
    muscles.ts
    library.ts
    substitutions.ts

  habit/
    adherence.ts
    consistency.ts
    scheduling.ts
```

Persistence should move toward explicit schemas and migrations:

```text
src/data/

  schema/
    v1.ts
    v2.ts
    migrations.ts

  repositories/
    workoutRepository.ts
    programRepository.ts
    settingsRepository.ts
```

Zustand should increasingly represent application/session state rather than serving simultaneously as database schema and domain model.

---

# Work sequence

## Phase 0 — Reboot contract

- [ ] Replace the old product vision with the adaptive-training vision.
- [ ] Write the new PRD.
- [ ] Define product principles and explicit exclusions.
- [ ] Define the new information architecture.
- [ ] Establish a new visual direction and design-system brief.
- [ ] Preserve the current implementation as legacy reference through Git history rather than allowing it to constrain the redesign.

### Exit criteria

- Product purpose is unambiguous.
- Core user loops are documented.
- New navigation and major surfaces are defined.
- Legacy injury-first and brutalist design requirements are formally superseded.

## Phase 1 — Data model and migration

- [ ] Define Program, Mesocycle, Week, PlannedSession, ExercisePrescription, and SetPrescription.
- [ ] Define WorkoutSession, ExercisePerformance, and SetPerformance.
- [ ] Separate prescribed values from actual values.
- [ ] Define Muscle and MusclePriority.
- [ ] Define RecoveryObservation and ExerciseFeedback.
- [ ] Define ProgressionDecision and RecommendationReason.
- [ ] Version the persisted data schema.
- [ ] Build v1 → v2 migration for existing workout history.
- [ ] Add migration tests and backup/rollback protections.

### Exit criteria

- Existing historical sessions migrate without loss of load, reps, effort, date, exercise identity, and usable duration/history information.
- A workout can be reconstructed from raw stored data.
- Prescriptions are tied to program slots rather than exercise IDs.

## Phase 2 — Progression engine v2

- [ ] Preserve the current pure-function recommendation pattern where useful.
- [ ] Implement rep progression.
- [ ] Implement load progression based on available increments.
- [ ] Implement effort-target handling.
- [ ] Implement mesocycle-aware difficulty progression.
- [ ] Implement volume recommendations.
- [ ] Add recovery/stimulus inputs.
- [ ] Add conservative maintain behavior when evidence is weak.
- [ ] Persist progression decisions and reasons.
- [ ] Add confidence-ready recommendation structure.
- [ ] Build comprehensive domain tests.

### Exit criteria

- Every automated prescription change is reproducible from persisted inputs.
- Recommendation reasons can be shown directly in UI.
- Current deterministic progression behavior is no longer the primary engine.

## Phase 3 — Program and mesocycle system

- [ ] Build program creation/editing.
- [ ] Support 2–6 training days per week.
- [ ] Add muscle priorities: Emphasize / Grow / Maintain.
- [ ] Support exercise selection and substitution.
- [ ] Add accumulation weeks and deload state.
- [ ] Generate session prescriptions from the mesocycle.
- [ ] Add session-time budget as a programming constraint.
- [ ] Add schedule repair for missed sessions.

### Exit criteria

- The app can generate and run a complete mesocycle.
- Prescriptions evolve across weeks.
- Missed sessions can be rescheduled without corrupting the training sequence.

## Phase 4 — New design system

- [ ] Replace monospace-everywhere typography.
- [ ] Define semantic color tokens.
- [ ] Define surface, spacing, radius, elevation, and motion systems.
- [ ] Define numeric typography for workout data.
- [ ] Define chart language.
- [ ] Define loading, empty, success, PR, warning, and recovery states.
- [ ] Preserve WCAG/reduced-motion behavior.

### Direction

**Premium athletic instrumentation**: visually distinctive, data-dense only where useful, tactile, highly legible, modern, and rewarding without resorting to generic neon fitness styling.

## Phase 5 — Today / Home rebuild

- [ ] Make Today the primary surface.
- [ ] Create one dominant Start Workout action.
- [ ] Show session summary: muscles, exercises, sets, expected duration.
- [ ] Show current mesocycle/week state.
- [ ] Show weekly adherence.
- [ ] Surface recent meaningful progress/PRs.
- [ ] Show next session without dashboard clutter.

### Exit criteria

- Opening the app makes the next action immediately obvious.
- Time from app open to starting the planned workout is minimal.

## Phase 6 — Workout execution rebuild

- [ ] Replace the current table-first workout UI with an exercise-focused execution surface.
- [ ] Show prescribed target and previous performance together.
- [ ] Optimize numeric entry.
- [ ] Preserve one-tap completion and undo.
- [ ] Preserve rest timer, haptics, wake lock, offline operation, and active-session persistence.
- [ ] Add fast exercise substitution.
- [ ] Add optional set-level effort capture.
- [ ] Add minimal exercise/stimulus feedback.
- [ ] Add progress-to-target cues.
- [ ] Add subtle PR celebration.

### Exit criteria

- Typical working set logging remains under the existing three-second target.
- Accidental navigation cannot destroy an active session.
- Workout state survives refresh/relaunch.

## Phase 7 — Progress rebuild

- [ ] Create Overview / Exercises / Muscles / Records structure.
- [ ] Add 4-, 12-, and 26-week consistency views.
- [ ] Add exercise performance graphs.
- [ ] Add rep/load/e1RM PR detection.
- [ ] Add muscle-level set/volume views.
- [ ] Add mesocycle comparison.
- [ ] Add exercise response history.
- [ ] Keep e1RM as one metric rather than the product's dominant metric.

## Phase 8 — Habit and scheduling intelligence

- [ ] Define weekly training commitment.
- [ ] Add rolling adherence metrics.
- [ ] Add missed-session recovery flow.
- [ ] Add automatic schedule repair.
- [ ] Avoid punitive streak-loss mechanics.
- [ ] Add mesocycle and consistency milestones tied to real training behavior.

## Phase 9 — Training constraints refactor

- [ ] Replace injury-first IA with generic training constraints.
- [ ] Preserve useful exercise-conflict/substitution logic.
- [ ] Support temporary movement avoidance and discomfort.
- [ ] Remove injury status from primary Home/Progress hierarchy.
- [ ] Delete dead injury-specific UI after migration.

## Phase 10 — Personal training model

Later-stage personalization should estimate user-specific response patterns such as:

- effective muscle-volume ranges
- preferred exercise response
- progression style by movement
- fatigue sensitivity
- session-duration effects
- adherence by schedule pattern

This phase should use accumulated longitudinal data and remain explainable.

## Phase 11 — Cleanup and hardening

- [ ] Remove legacy dead code.
- [ ] Remove obsolete docs.
- [ ] Update README and manifest copy.
- [ ] Run tests in CI in addition to lint/build/Lighthouse/bundle checks.
- [ ] Add migration fixtures.
- [ ] Audit offline behavior.
- [ ] Audit accessibility.
- [ ] Audit data export/import.
- [ ] Performance-test workout interactions on mobile.

---

# Major product surfaces

Target top-level navigation:

```text
TODAY | PROGRAM | PROGRESS | LIBRARY | YOU
```

During an active workout, general navigation can be reduced so execution remains the focus.

## Today

Immediate session, mesocycle state, adherence, recent meaningful progress.

## Program

Mesocycle, schedule, muscle priorities, session structure, exercise selection, substitutions.

## Progress

Performance, exercises, muscles, records, consistency.

## Library

Exercise search, metadata, technique, substitutions.

## You

Preferences, equipment, training constraints, settings, backup/export.

---

# Recommendation record

Automated decisions should eventually persist a structure similar to:

```json
{
  "exerciseId": "incline_dumbbell_press",
  "decision": "increase_load",
  "previousLoad": 32.5,
  "newLoad": 35,
  "confidence": 0.87,
  "signals": {
    "repTargetAchieved": true,
    "effortMatched": true,
    "recovery": "good",
    "performanceTrend": 0.08
  },
  "reasonCodes": [
    "REP_TARGET_REACHED",
    "EFFORT_ON_TARGET",
    "RECOVERY_GOOD"
  ]
}
```

Confidence can be introduced after the deterministic recommendation model is stable, but the schema should leave room for it.

---

# Success metrics

Primary product metric:

**Productive Training Weeks**

Supporting metrics:

- planned-session adherence
- time from app open to workout start
- median set-log time
- percentage of active exercises improving
- recommendation acceptance/override rate
- productive weeks retained
- manual program overrides
- excessive-fatigue interventions
- data-loss events

## Non-negotiable quality bars

- No historical workout data loss during migration.
- Core workout logging works offline.
- Active-session state survives accidental reload/relaunch.
- Recommendation logic is testable outside React.
- Automated decisions can be explained from stored evidence.
- Existing fast set-entry ergonomics are preserved or improved.
- New design remains accessible and reduced-motion aware.

---

# Implementation strategy

This branch establishes the reboot contract and work sequence. Subsequent implementation should be delivered in reviewable increments against this plan rather than as one monolithic rewrite.

Recommended implementation order:

1. Product contract and PRD
2. Domain schema
3. Migration
4. Progression engine
5. Program/mesocycle engine
6. Design system
7. Today
8. Workout
9. Progress
10. Habit/scheduling
11. Training constraints cleanup
12. Personalization and hardening
