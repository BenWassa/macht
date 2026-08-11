# Macht Reboot — Execution Tracker

This file is the live implementation checklist for PR #12. Update it as work lands so the reboot stays aligned with `MACHT_PRODUCT_REBOOT_PLAN.md`.

## Current focus

**Phase 2 — Progression engine v2**

Phase 0 is complete. Phase 1 implementation is complete and awaiting a fresh branch CI run before its validation gate is closed.

## Validation status

- Baseline PR run: lint ✅, TypeScript/build ✅, bundle-size gate ❌ due to pre-existing bundle at 405.4 KB raw / 124.8 KB gz versus 400 / 120 budget.
- CI now includes `npm test`.
- CI now targets `agent/**` pushes in addition to `main` and pull requests.
- GitHub App content writes are currently not creating new Actions runs automatically, so Phase 1 gate remains open pending an independently triggered branch run.

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

- [ ] Historical load, reps, effort, date, exercise identity, and duration survive migration under a fresh test run.
- [ ] Raw stored records can reconstruct a workout under a fresh test/build run.
- [x] Prescriptions belong to program slots rather than exercise IDs.

## Phase 2 — Progression engine v2

- [ ] Rep progression.
- [ ] Load progression using available increments.
- [ ] Effort-target handling.
- [ ] Mesocycle-aware effort progression.
- [ ] Volume recommendations.
- [ ] Recovery/stimulus inputs.
- [ ] Conservative maintain behavior under uncertainty.
- [ ] Persist recommendation reasons and confidence-ready evidence.
- [ ] Comprehensive domain tests.

## Phase 3 — Program and mesocycle system

- [ ] Program create/edit.
- [ ] 2–6 sessions/week.
- [ ] Muscle priorities.
- [ ] Exercise selection/substitution.
- [ ] Accumulation + deload weeks.
- [ ] Session generation.
- [ ] Session-time budget.
- [ ] Missed-session schedule repair.

## Phase 4 — Design system

- [ ] Typography system.
- [ ] Semantic color tokens.
- [ ] Surfaces / spacing / radius / elevation.
- [ ] Motion system.
- [ ] Numeric typography.
- [ ] Chart language.
- [ ] Empty / success / PR / warning / recovery states.
- [ ] WCAG and reduced-motion audit.

## Phase 5 — Today

- [ ] Primary Today surface.
- [ ] Dominant Start Workout action.
- [ ] Planned session preview and duration.
- [ ] Mesocycle/week state.
- [ ] Weekly adherence.
- [ ] Recent meaningful progress.

## Phase 6 — Workout

- [ ] Exercise-focused execution surface.
- [ ] Prescription + previous performance together.
- [ ] Fast numeric entry.
- [ ] One-tap complete + undo.
- [ ] Preserve timers, haptics, wake lock, offline persistence.
- [ ] Fast substitution.
- [ ] Effort capture.
- [ ] Minimal feedback capture.
- [ ] Progress cues and restrained PR celebration.

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
- [ ] Resolve stale bundle-size budget or reduce bundle below the current gate.
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
