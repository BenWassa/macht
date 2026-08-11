# Macht Reboot — Execution Tracker

This is the canonical implementation checklist for the Macht product reboot defined in `MACHT_PRODUCT_REBOOT_PLAN.md` and `MACHT_PRD_v3.md`.

## Status

**Reboot implementation complete through Phase 11.**

Final enforced quality measurements on the completed implementation:

- lint passes
- 126 tests pass across 21 files
- TypeScript/build passes
- total JavaScript: 399.6 KB raw / 118.8 KB gzip, inside the unchanged 400 KB / 120 KB budget
- Lighthouse: performance 0.98, accessibility 1.00, best practices 0.96, PWA 1.00
- enforced CI minimums: performance 0.90, accessibility 0.95, best practices 0.90

Primary information architecture:

**TODAY / PROGRAM / SESSION / PROGRESS / YOU**

## Phase 0 — Reboot contract

- [x] Replace `PRODUCT.md` with the adaptive-training product contract.
- [x] Add the v3 PRD.
- [x] Define the core user loops and information architecture.
- [x] Replace `DESIGN.md` with the new visual-system brief.
- [x] Supersede injury-first positioning and the old brutalist visual doctrine.

### Gate

- [x] Product purpose is unambiguous.
- [x] Major surfaces are defined.
- [x] Today → Workout → Feedback → Progression is documented end to end.
- [x] Program → Mesocycle → Week → Session → Prescription hierarchy is locked.

## Phase 1 — Data model and migration

- [x] Define Program, Mesocycle, Week, PlannedSession, ExercisePrescription, and SetPrescription.
- [x] Define WorkoutSession, ExercisePerformance, and SetPerformance.
- [x] Separate prescribed values from actual values.
- [x] Define muscle priorities, recovery observations, exercise feedback, progression decisions, and recommendation reasons.
- [x] Add schema v2 envelope/versioning.
- [x] Build v1 → v2 history migration.
- [x] Add migration fixtures/tests.
- [x] Add rollback/backup protection.

### Gate

- [x] Historical load, reps, effort, date, exercise identity, and duration survive migration under test.
- [x] Raw stored records can reconstruct a workout under test/build validation.
- [x] Prescriptions belong to program slots rather than global exercise IDs.

## Phase 2 — Progression engine v2

- [x] Rep progression.
- [x] Load progression using available equipment increments.
- [x] Effort-target handling.
- [x] Mesocycle-aware effort progression.
- [x] Volume recommendations.
- [x] Recovery/stimulus inputs.
- [x] Session workload and time-budget protection.
- [x] Conservative maintain behavior under uncertainty.
- [x] Persist recommendation reasons, evidence, and confidence-ready data.
- [x] Comprehensive pure-domain tests.

### Gate

- [x] Every automated decision exposes persisted reasons/evidence.
- [x] Deload/fatigue protection outranks progression when signals conflict.
- [x] Recommendation logic remains testable outside React.

## Phase 3 — Program and mesocycle system

- [x] Program create/edit domain model.
- [x] 2–6 sessions/week.
- [x] Muscle priorities.
- [x] Exercise selection/substitution model.
- [x] Accumulation + deload weeks.
- [x] Session generation and time budgets.
- [x] Missed-session schedule repair.
- [x] Progression decisions propagate only to the next matching stable program slot.
- [x] Program-wide unique slot IDs preserve independent progression streams.

### Gate

- [x] A validated program generates a complete mesocycle.
- [x] Same exercises in different slots progress independently.
- [x] Session-time budgets preserve higher-priority work first.
- [x] Missed-session repair preserves session order.
- [x] Substitutions and user overrides propagate intentionally.

## Phase 4 — Design system

- [x] Sans-serif UI typography and numeric metric typography.
- [x] Semantic color tokens.
- [x] Surfaces, spacing, radius, elevation, and chart language.
- [x] Motion system.
- [x] Empty, success, PR, warning, and recovery states.
- [x] Shared tactile button, metric, and state-panel primitives.
- [x] WCAG/reduced-motion foundation.

### Gate

- [x] Muted normal text and semantic state pairs meet the intended contrast bar.
- [x] Shared primary touch targets are at least 44px high.
- [x] Focus-visible, forced-colors, and reduced-motion behavior are defined globally.

## Phase 5 — Today

- [x] Primary Today surface.
- [x] Dominant Start Workout / Resume Workout action.
- [x] Planned session exercise preview and duration.
- [x] Active Program / mesocycle / week state with safe legacy fallback.
- [x] Weekly training rhythm and recent meaningful progress.
- [x] Persisted v2 Program context available to Today.
- [x] Navigation aligned to TODAY / PROGRAM / SESSION / PROGRESS / YOU.
- [x] Remove the old StrengthHero / ActivityHistory / ConsistencyChart experience from the product.

### Gate

- [x] New UI state lands on Today.
- [x] Active workouts cannot be overwritten from Today.
- [x] Today behavior is testable independently of React.
- [x] Runtime remains inside the configured bundle budget.

## Phase 6 — Workout execution

- [x] Execute the exact v2 PlannedSession / ExercisePrescription shown on Today.
- [x] Preserve immutable prescription snapshots separately from actual performance.
- [x] Exercise-focused execution surface with prescription + previous performance.
- [x] Fast numeric entry, load/rep nudges, complete, and undo.
- [x] Preserve rest/warm-up timers, haptics, media session, wake lock, and persisted active sessions.
- [x] Prescription-specific rest durations.
- [x] Fast substitution with stored Program allow-lists.
- [x] RIR/RPE effort capture.
- [x] Optional recovery, stimulus, and session-workload feedback.
- [x] Exercise notes and explicit Add Set override.
- [x] Restrained PR/save feedback.
- [x] Persist completed workouts in dedicated v2 history.
- [x] Mark completed planned sessions in the mesocycle.
- [x] Apply/persist progression decisions to the next matching program slot.
- [x] Preserve substitution and user-added-set provenance.
- [x] Prevent active workouts from being overwritten by any start entry point.
- [x] Temporary v2→legacy history dual-write was used during migration and retired in Phase 11 after v2 backup/Progress compatibility was complete.

### Gate

- [x] Today and Workout resolve the same planned session.
- [x] Editing actuals cannot mutate prescription snapshots.
- [x] Active v2 sessions survive persisted-store reload.
- [x] Completed performance updates only the correct future slot.
- [x] User-added sets and one-session substitutions cannot corrupt future load progression.
- [x] Upcoming deloads outrank rep/load progression.

## Phase 6.5 — Program surface integration

- [x] Replace the injury-heavy Templates experience as primary PROGRAM.
- [x] Create and activate a v2 Program without developer tooling.
- [x] Configure sessions/week and target session duration.
- [x] Configure Emphasize / Grow / Maintain priorities.
- [x] Edit exercise slots, sets, rep ranges, effort, rest, and substitutions.
- [x] Generate/activate mesocycles.
- [x] Show active cycle, week, planned sessions, and deload state.
- [x] Edit future programming without rewriting completed history.
- [x] Keep legacy templates only as collapsed compatibility fallback.
- [x] Establish first working-load baseline from completed performance when needed.
- [x] Confirm before archiving an unfinished cycle.

### Gate

- [x] A normal user can create and activate a v2 Program entirely in PROGRAM.
- [x] PROGRAM → TODAY → SESSION shares one v2 source of truth.
- [x] Program edits preserve completed history and cannot overwrite an active workout.
- [x] Program → cycle → Today → Workout → next-slot progression is covered end to end.

## Phase 7 — Progress

- [x] Overview / Exercises / Muscles / Records structure.
- [x] Consistency windows and planned-session coverage.
- [x] Exercise performance graphs.
- [x] Post-baseline PR detection.
- [x] Muscle-level training exposure views.
- [x] Mesocycle summaries and latest-vs-previous comparison.
- [x] Exercise response / adaptive decision history.
- [x] v2-first history normalization with legacy fallback and ID de-duplication.
- [x] Wire the v2 Progress analytics/components into the canonical live Progress route.
- [x] Scope cycle analytics to the active Program.
- [x] Avoid inventing generic `Legs` as quadriceps in legacy muscle inference.

### Gate

- [x] Progress counts a dual-written historical workout once.
- [x] First exposure establishes a baseline rather than an artificial PR.
- [x] Training metrics stay descriptive and avoid physique/body-comparison scoring.

## Phase 8 — Habit and scheduling

- [x] Weekly commitment derived from the chosen Program.
- [x] Rolling adherence/plan coverage.
- [x] Extra sessions do not raise the commitment target.
- [x] Missed-session recovery flow.
- [x] Automatic schedule repair that preserves session order.
- [x] Explicit skip behavior.
- [x] Cycle terminal-state handling.
- [x] Real training milestones: planned start, record, adaptive update, completed cycle, and sustained plan coverage.
- [x] No punitive daily streak mechanics.

## Phase 9 — Training constraints

- [x] Replace injury-first product IA with generic training constraints.
- [x] Preserve useful conflict/substitution behavior.
- [x] Support temporary movement avoidance, discomfort, and similar constraints.
- [x] Remove injury state from primary Today/Progress hierarchy.
- [x] Remove legacy injury manager/modal UI after migration support exists.
- [x] Preserve old injury data only for migration and legacy compatibility.

## Phase 10 — Personal training model

- [x] Exercise-response history.
- [x] Muscle volume-response patterns.
- [x] Movement/progression evidence model.
- [x] Fatigue/session-duration patterns.
- [x] Schedule/adherence patterns.
- [x] Explicit insufficient / emerging / established confidence states.
- [x] Explainable Personal Training Model in YOU.
- [x] Advisory-only established signals in PROGRAM.
- [x] Conservative personalization integrated into the real workout-completion progression path.
- [x] Persist the deterministic base recommendation and delta when personalization adjusts it.
- [x] Established repeated-fatigue evidence can hold a proposed set increase.
- [x] Insufficient/emerging evidence cannot change the deterministic recommendation.
- [x] Personalization cannot automatically add training days, raise load increments, or invent extra volume.

### Gate

- [x] Live recovered + low-stimulus + easy-workload + time-headroom evidence can produce one-set progression.
- [x] Established fatigue history can suppress that increase while preserving the base `add_set` audit record.
- [x] Personalization remains explainable from persisted evidence.

## Phase 11 — Cleanup and hardening

### Canonical runtime

- [x] Collapse App routing shims into canonical `App.tsx`.
- [x] Collapse Today and YOU shims into their canonical screens.
- [x] Collapse duplicate habit-panel implementation into one canonical component.
- [x] Remove dead legacy Home components, old Templates screen, and old injury-aware Progress card.
- [x] Remove obsolete injury manager/modal UI.
- [x] Remove superseded injury-first PRD.
- [x] Retain only compatibility code required for old local history/backups.

### Data durability

- [x] Add versioned v2 backup covering v2 workouts, legacy-only history, Programs/mesocycles, active Program, progression decisions, constraints, settings, and custom exercises.
- [x] Preserve v1 backup import compatibility.
- [x] Translate v1 injury records into generic constraints on restore.
- [x] Add backup round-trip and v1 migration tests.
- [x] Retire the Phase 6 v2→legacy history dual-write.
- [x] Make Clear All actually clear/reset every durable training store.
- [x] Remove obsolete v1-only backup API from the legacy history store.

### Product / PWA hardening

- [x] Rewrite README for the adaptive training product.
- [x] Update PWA name/description while preserving installable standalone configuration.
- [x] Offline audit: local persisted stores, persisted active workout, local-first execution, and generated service worker remain intact.
- [x] Accessibility audit: focus-visible, forced colors, reduced motion, semantic charts, dialog semantics, labels, pressed state, browser zoom, and minimum primary touch targets.
- [x] Upgrade settings controls and substitution/finish dialogs where the audit found gaps.
- [x] Mobile interaction audit: safe-area bottom navigation, large workout controls, responsive settings, and bundle/Lighthouse gates.
- [x] Export/import audit completed against complete v2 payload + v1 migration path.
- [x] Reduce first-load main-thread work by deferring secondary application routes and below-the-fold Today insights.
- [x] Defer service-worker registration until after page load.
- [x] Remove the external font request from the startup path.
- [x] Convert Lighthouse performance/accessibility/best-practices targets from warnings into CI errors.

### Gate

- [x] Lint passes.
- [x] 126 tests pass across 21 files.
- [x] TypeScript/build passes.
- [x] Bundle-size budget passes at 399.6 KB raw / 118.8 KB gzip against 400 KB / 120 KB limits.
- [x] Lighthouse performance passes at 0.98 against a hard 0.90 minimum.
- [x] Lighthouse accessibility passes at 1.00 against a hard 0.95 minimum.
- [x] Lighthouse best practices passes at 0.96 against a hard 0.90 minimum.
- [x] Lighthouse PWA scores 1.00.
- [x] Final implementation route/file audit shows no temporary App/Today/You/Habit `V2` shims remain.

## Non-negotiables — final status

- [x] Historical workout data is preserved through migration/fallback/backup paths.
- [x] Workout logging remains local-first and offline-capable.
- [x] Active sessions persist through reload/relaunch via the workout store.
- [x] Recommendation logic remains pure/testable outside React.
- [x] Automated decisions are explainable from persisted reasons/evidence.
- [x] Set logging remains optimized for direct, low-friction interaction.
- [x] User overrides are explicit first-class records.
- [x] Recovery and rest are valid parts of training and can prevent progression.
