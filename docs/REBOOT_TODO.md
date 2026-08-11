# Macht Reboot — Execution Tracker

This file is the live implementation checklist for the Macht product reboot. Update it as work lands so implementation stays aligned with `MACHT_PRODUCT_REBOOT_PLAN.md`.

## Current focus

**Phase 6 — Workout execution**

Phases 0–5 are implemented. The latest Phase 5 code head passed the complete CI pipeline: lint, tests, TypeScript/build, bundle-size budget, and Lighthouse.

## Validation status

- Latest Phase 5 CI: lint ✅, tests ✅, TypeScript/build ✅, bundle size ✅, Lighthouse ✅.
- Replacing the old Home dashboard removed enough shipped UI code to bring the runtime bundle back under budget.
- CI includes `npm test` and targets `agent/**` pushes, `main`, and pull requests.

## Phase 0 — Reboot contract

- [x] Replace `PRODUCT.md` with the adaptive-training product contract.
- [x] Add the v3 PRD.
- [x] Define the core user loops and information architecture.
- [x] Replace `DESIGN.md` with the new visual-system brief.
- [x] Explicitly supersede injury-first positioning and the brutalist visual doctrine.

### Gate

- [x] Product purpose is unambiguous.
- [x] Major surfaces are defined.
- [x] Today → Workout → Feedback → Progression is documented end to end.
- [x] Program → Mesocycle → Week → Session → Prescription hierarchy is locked.

## Phase 1 — Data model and migration

- [x] Define Program, Mesocycle, Week, PlannedSession, ExercisePrescription, and SetPrescription.
- [x] Define WorkoutSession, ExercisePerformance, and SetPerformance.
- [x] Separate prescribed values from actual values.
- [x] Define Muscle and MusclePriority.
- [x] Define RecoveryObservation and ExerciseFeedback.
- [x] Define ProgressionDecision and RecommendationReason.
- [x] Add schema v2 envelope/versioning.
- [x] Build v1 → v2 history migration.
- [x] Add migration fixtures/tests.
- [x] Add backup/rollback protection.

### Gate

- [x] Historical load, reps, effort, date, exercise identity, and duration survive migration under test.
- [x] Raw stored records can reconstruct a workout under test/build validation.
- [x] Prescriptions belong to program slots rather than exercise IDs.

## Phase 2 — Progression engine v2

- [x] Rep progression.
- [x] Load progression using available increments.
- [x] Effort-target handling.
- [x] Mesocycle-aware effort progression.
- [x] Volume recommendations.
- [x] Recovery/stimulus inputs.
- [x] Conservative maintain behavior under uncertainty.
- [x] Persist recommendation reasons and confidence-ready evidence.
- [x] Comprehensive domain tests.

### Gate

- [x] Every automated progression decision exposes persisted reasons/evidence.
- [x] Competing signals prioritize deload/fatigue protection before progression.
- [x] Lint, tests, and TypeScript/build pass.

## Phase 3 — Program and mesocycle system

- [x] Program create/edit.
- [x] 2–6 sessions/week.
- [x] Muscle priorities.
- [x] Exercise selection/substitution.
- [x] Accumulation + deload weeks.
- [x] Session generation.
- [x] Session-time budget.
- [x] Missed-session schedule repair.
- [x] Propagate progression decisions to the next matching program slot.
- [x] Enforce program-wide unique slot IDs for independent progression streams.

### Gate

- [x] A validated program generates a complete mesocycle.
- [x] Same exercises in different program slots can progress independently.
- [x] Session-time budgets preserve higher-priority work first.
- [x] Missed-session repair preserves session order.
- [x] Equipment-aware substitutions are filterable and user overrides propagate intentionally.
- [x] Lint, tests, and TypeScript/build pass.

## Phase 4 — Design system

- [x] Typography system.
- [x] Semantic color tokens.
- [x] Surfaces / spacing / radius / elevation.
- [x] Motion system.
- [x] Numeric typography.
- [x] Chart language.
- [x] Empty / success / PR / warning / recovery states.
- [x] WCAG and reduced-motion audit.
- [x] Shared tactile button, metric, and state-panel primitives.

### Gate

- [x] Sans-serif UI typography replaces monospace as the system default.
- [x] Muted normal text meets AA contrast even on Surface 3.
- [x] Semantic state pairs meet AA contrast.
- [x] Shared button touch target is at least 44px high.
- [x] Focus-visible, forced-colors, and reduced-motion behavior are defined globally.
- [x] Lint, tests, and TypeScript/build pass.

## Phase 5 — Today

- [x] Primary Today surface.
- [x] Dominant Start Workout / Resume Workout action.
- [x] Planned session exercise preview and duration.
- [x] Active program / mesocycle / week state with safe legacy fallback.
- [x] Weekly adherence.
- [x] Recent meaningful progress.
- [x] Persisted v2 program context available to Today.
- [x] Navigation aligned to TODAY / PROGRAM / SESSION / PROGRESS / YOU.
- [x] Remove StrengthHero / ActivityHistory / ConsistencyChart from the Home render path.

### Gate

- [x] Opening a new UI state lands on Today.
- [x] An active workout shows Resume Workout and cannot be overwritten from Today.
- [x] Today view-model behavior is unit tested independently of React.
- [x] The runtime bundle is back within the configured budget.
- [x] Lint, full tests, TypeScript/build, bundle-size check, and Lighthouse pass.

## Phase 6 — Workout

- [ ] Execute a v2 PlannedSession / ExercisePrescription directly in the workout store.
- [ ] Preserve prescription snapshots separately from actual set performance.
- [ ] Exercise-focused execution surface.
- [ ] Prescription + previous performance together.
- [ ] Fast numeric entry.
- [ ] One-tap complete + undo.
- [ ] Preserve timers, haptics, wake lock, offline persistence.
- [ ] Fast substitution.
- [ ] Effort capture.
- [ ] Minimal feedback capture.
- [ ] Progress cues and restrained PR celebration.
- [ ] Prevent accidental navigation from destroying an active session.

## Phase 7 — Progress

- [ ] Overview / Exercises / Muscles / Records.
- [ ] Consistency windows.
- [ ] Exercise graphs.
- [ ] PR detection.
- [ ] Muscle-level training views.
- [ ] Mesocycle comparison.
- [ ] Exercise response history.

## Phase 8 — Habit and scheduling

- [ ] Weekly commitment.
- [ ] Rolling adherence.
- [ ] Missed-session recovery flow.
- [ ] Automatic schedule repair.
- [ ] Real training milestones.

## Phase 9 — Training constraints

- [ ] Replace injury-first IA with generic constraints.
- [ ] Preserve useful conflict/substitution logic.
- [ ] Temporary movement avoidance/discomfort.
- [ ] Remove injury state from primary Home/Progress hierarchy.
- [ ] Delete legacy injury UI after migration.

## Phase 10 — Personal training model

- [ ] Exercise-response history.
- [ ] User-specific volume-response ranges.
- [ ] Movement-specific progression tendencies.
- [ ] Fatigue/session-duration patterns.
- [ ] Schedule/adherence patterns.
- [ ] Explainable personalization only.

## Phase 11 — Cleanup and hardening

- [ ] Remove dead legacy code and obsolete docs.
- [ ] Update README and PWA manifest.
- [x] Run tests in CI configuration.
- [x] Migration fixtures.
- [x] Resolve the stale bundle-size budget or reduce the runtime below the current gate.
- [ ] Offline audit.
- [ ] Accessibility audit.
- [ ] Export/import audit.
- [ ] Mobile interaction performance audit.

## Non-negotiables

- No historical workout data loss.
- Workout logging works offline.
- Active sessions survive reload/relaunch.
- Recommendation logic stays testable outside React.
- Every automated decision can be explained from persisted evidence.
- Typical set logging remains at or below the existing three-second target.
- User overrides remain first-class.
- Recovery and rest are treated as valid parts of training.
