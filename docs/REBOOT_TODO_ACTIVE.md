# Macht Reboot — Active Execution Tracker

This file is the active phase tracker while the GitHub connector is preventing safe in-place edits to `REBOOT_TODO.md`. Phase 11 will consolidate this state back into the canonical tracker and remove this temporary file.

## Validated through Phase 9

- [x] Phase 0 — Product contract / PRD / IA
- [x] Phase 1 — v2 data model, migration, rollback
- [x] Phase 2 — progression engine v2
- [x] Phase 3 — Program / mesocycle domain
- [x] Phase 4 — design system and accessibility foundations
- [x] Phase 5 — Today
- [x] Phase 6 — v2 Workout execution
- [x] Phase 6.5 — Program surface integration
- [x] Phase 7 — Progress analytics and UI
- [x] Phase 8 — weekly training rhythm and schedule recovery
- [x] Phase 9 — generic training constraints

The final stacked Phase 9 head passed lint, full tests, TypeScript/build, bundle-size budget, and hosted CI including Lighthouse.

## Current focus — Phase 10: Personal training model

### Evidence model

- [ ] Define confidence levels and minimum evidence thresholds.
- [ ] Build exercise-response profiles from persisted progression decisions.
- [ ] Build user-specific volume-response observations from stimulus/recovery/workload evidence.
- [ ] Build movement/exercise progression tendencies without increasing load increments beyond equipment-supported values.
- [ ] Build session-duration/fatigue patterns.
- [ ] Build schedule/adherence patterns from planned versus completed sessions.

### Explainability

- [ ] Every personal signal must expose its evidence count and a human-readable explanation.
- [ ] Insufficient evidence must remain explicitly insufficient rather than generating a recommendation.
- [ ] Personalization must never use physique/body-comparison metrics.
- [ ] Personalization must not increase weekly training frequency or session targets automatically.

### Product integration

- [ ] Add a Personal Training Model view in YOU.
- [ ] Surface conservative Program suggestions only when evidence is established.
- [ ] Add a personalization wrapper for progression decisions that can suppress a volume increase when established history shows repeated fatigue at that exposure.
- [ ] Preserve the base deterministic progression recommendation and record when personalization changes it.
- [ ] Keep user overrides first-class.

### Gate

- [ ] Unit tests cover insufficient/emerging/established evidence.
- [ ] Tests cover volume-limit personalization, schedule patterns, fatigue patterns, and explanation output.
- [ ] No body/appearance comparison data or normative physique scoring exists in the model.
- [ ] Lint passes.
- [ ] Full tests pass.
- [ ] TypeScript/build passes.
- [ ] Bundle-size budget passes.
- [ ] Lighthouse passes on the stacked head.

## Phase 11 — Cleanup and hardening

- [ ] Consolidate `REBOOT_TODO_ACTIVE.md` back into `REBOOT_TODO.md` and delete the temporary tracker.
- [ ] Collapse temporary entry-point shims (`App.ts`, `AppConstraintAware.ts`, `screens/HomeScreen.ts`, `screens/profile.ts`) into canonical files.
- [ ] Remove dead legacy Home/Progress/Template/Workout compatibility UI.
- [ ] Remove legacy injury-first primary UI and migrate remaining read-only compatibility tooling.
- [ ] Remove Phase 6 legacy history dual-write after export/import compatibility is updated.
- [ ] Update README and PWA manifest.
- [ ] Offline audit.
- [ ] Accessibility audit.
- [ ] Export/import audit.
- [ ] Mobile interaction-performance audit.
