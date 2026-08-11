# Macht Reboot — Execution Tracker

This is the canonical implementation checklist for the Macht product reboot. Keep it current as Phase 11 lands.

## Current focus

**Phase 11 — Cleanup and hardening**

Phases 0–10 are implemented. The final Phase 10 head `bf614503` passed the complete CI pipeline: lint, full tests, TypeScript/build, bundle-size budget, and Lighthouse.

## Completed phases

- [x] Phase 0 — Product contract, PRD v3, IA, design doctrine
- [x] Phase 1 — v2 data model, versioning, migration, rollback protection
- [x] Phase 2 — progression engine v2 with persisted evidence and conservative uncertainty behavior
- [x] Phase 3 — Program / mesocycle generation, scheduling, substitutions, time budgets
- [x] Phase 4 — design system, semantic states, accessibility foundations
- [x] Phase 5 — Today / Home reboot
- [x] Phase 6 — v2 planned Workout execution and next-slot progression
- [x] Phase 6.5 — PROGRAM creation/editing/activation surface
- [x] Phase 7 — Progress analytics and UI: overview, exercises, muscles, records, cycle comparison
- [x] Phase 8 — weekly training rhythm, adherence, missed-session recovery, schedule repair, milestones
- [x] Phase 9 — generic training constraints with legacy injury compatibility
- [x] Phase 10 — explainable Personal Training Model and conservative personalization

## Phase 11 — Cleanup and hardening

### Tracker and architecture cleanup

- [x] Consolidate temporary `REBOOT_TODO_ACTIVE.md` state into this canonical tracker.
- [ ] Delete `REBOOT_TODO_ACTIVE.md`.
- [ ] Collapse temporary entry-point shims into canonical `App.tsx`, Home, and YOU/Profile entry points.
- [ ] Remove superseded legacy Home / Progress / Template / Workout compatibility UI from the active product tree.
- [ ] Remove legacy injury-first primary UI while preserving read-only migration compatibility where required.
- [ ] Remove obsolete product docs that are explicitly superseded by PRD v3 / current design doctrine.

### Data durability and migration exit

- [ ] Define a current backup envelope that includes v2 Programs, Mesocycles, completed v2 Workouts, progression decisions, training constraints, settings, custom exercises, and retained legacy history where needed.
- [ ] Export the current backup format from YOU.
- [ ] Import/validate the current backup format without partial destructive writes.
- [ ] Continue accepting legacy v1 backups through explicit migration.
- [ ] Add export → import round-trip tests.
- [ ] Remove the Phase 6 v2 → legacy SessionLog dual-write after current Progress/backup paths no longer depend on it.
- [ ] Preserve existing historical legacy records for users who already have them.

### Product/package cleanup

- [ ] Update README to the adaptive-training product.
- [ ] Update PWA manifest name/description/theme metadata.
- [ ] Remove obsolete archive/generated repository artifacts that do not belong in the production source tree.
- [ ] Verify canonical product/version references are consistent.

### Offline audit

- [ ] Active workout survives reload/relaunch from persisted state.
- [ ] Today / Program / Workout / Progress / You render from local state without a network dependency after installation.
- [ ] PWA service worker precaches the production shell and required local assets.
- [ ] No core training action requires an API or remote asset.

### Accessibility audit

- [ ] Keyboard/focus path through primary navigation and dialogs.
- [ ] Modal focus trapping / close behavior.
- [ ] 44px minimum primary touch targets.
- [ ] Contrast and semantic state checks.
- [ ] Reduced-motion and forced-colors behavior.
- [ ] Form controls have usable names and pressed/selected states.

### Mobile interaction/performance audit

- [ ] Set logging remains direct and low-friction on narrow screens.
- [ ] No horizontal overflow on primary surfaces.
- [ ] Active workout controls remain reachable with bottom navigation/timers present.
- [ ] Bundle-size budget remains green.
- [ ] Lighthouse remains green.

### Final gate

- [ ] Lint passes with no errors.
- [ ] Full test suite passes.
- [ ] TypeScript/build passes.
- [ ] Bundle-size budget passes without increasing the budget.
- [ ] Lighthouse passes.
- [ ] Backup/export/import round-trip passes.
- [ ] No user history is deleted or rewritten during the cleanup migration.
- [ ] Phase 11 checklist is fully closed.

## Non-negotiables

- No historical workout data loss.
- Workout logging works offline.
- Active sessions survive reload/relaunch.
- Recommendation logic stays testable outside React.
- Every automated decision can be explained from persisted evidence.
- User overrides remain first-class.
- Recovery and rest remain valid training states.
- Personalization remains evidence-gated and does not increase weekly training frequency automatically.
