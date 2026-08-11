# Macht Reboot — Execution Tracker

This is the canonical implementation checklist for the Macht product reboot.

## Status

**Reboot implementation complete — Phases 0–11 closed.**

Phase 10 head `bf614503` passed the complete CI pipeline. Phase 11 then removed the remaining compatibility architecture, hardened data durability/offline/accessibility/mobile behavior, and passed the complete structural CI gate before this closeout update. `docs/PHASE_11_HARDENING_AUDIT.md` records the final audit evidence and residual maintenance notes.

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
- [x] Phase 11 — cleanup, migration exit, offline/accessibility/mobile hardening

## Phase 11 — Cleanup and hardening

### Tracker and architecture cleanup

- [x] Consolidate temporary `REBOOT_TODO_ACTIVE.md` state into this canonical tracker.
- [x] Delete `REBOOT_TODO_ACTIVE.md`.
- [x] Collapse temporary entry-point shims into canonical `App.tsx`, Home, and YOU/Profile entry points.
- [x] Remove superseded legacy Home / Progress / Template / Workout compatibility UI from the active product tree.
- [x] Remove legacy injury-first primary UI while preserving migration compatibility for retained records.
- [x] Remove obsolete product docs explicitly superseded by PRD v3 / current design doctrine.

### Data durability and migration exit

- [x] Define a current backup envelope covering v2 Programs, Mesocycles, completed v2 Workouts, progression decisions, training constraints, settings, custom exercises, and retained legacy history.
- [x] Export the current backup format from YOU.
- [x] Import and validate the current backup format without partial destructive writes.
- [x] Continue accepting legacy v1 backups through explicit migration.
- [x] Add export → import round-trip tests, including populated v2 source-of-truth records.
- [x] Remove the Phase 6 v2 → legacy SessionLog dual-write.
- [x] Preserve existing historical legacy records for users who already have them.

### Product/package cleanup

- [x] Update README to the adaptive-training product.
- [x] Update PWA manifest name/description/theme metadata.
- [x] Remove obsolete archive/generated repository artifacts and unused oversized temporary assets.
- [x] Verify canonical product metadata and primary routes are consistent.

### Offline audit

- [x] Active workout survives reload/relaunch from persisted state, including migration of pre-v2 active sessions.
- [x] Today / Program / Workout / Progress / You render their core training state locally without a network dependency after installation.
- [x] PWA production build generates the service worker and precached application shell/local assets.
- [x] No core training action requires an API, remote font, or remote asset.

### Accessibility audit

- [x] Keyboard/focus path through primary navigation and dialogs.
- [x] Modal focus trapping, Escape close, and focus restoration behavior.
- [x] 44px minimum primary touch targets.
- [x] Contrast and semantic state checks retained from the design-system audit.
- [x] Reduced-motion and forced-colors behavior.
- [x] Form controls have usable names and pressed/selected/current states.
- [x] Browser viewport allows user zoom.

### Mobile interaction/performance audit

- [x] Set logging remains direct and low-friction on narrow screens.
- [x] Primary surfaces avoid page-level horizontal overflow; sequential strips/tabs use intentional local scrolling where needed.
- [x] Active workout controls remain reachable with safe-area-aware bottom navigation and rest/warm-up timer placement.
- [x] Rest/warm-up timer controls meet touch-target requirements and reflow on narrow screens.
- [x] Bundle-size budget remains green without increasing the budget.
- [x] Lighthouse remains green.

### Final gate

- [x] Lint passes with no errors.
- [x] Full test suite passes.
- [x] TypeScript/build passes.
- [x] Bundle-size budget passes without increasing the budget.
- [x] Lighthouse passes.
- [x] Backup/export/import round-trip passes in the full test suite.
- [x] Cleanup migrations preserve retained history rather than deleting or rewriting it.
- [x] Phase 11 checklist is fully closed.

## Non-negotiables

- No historical workout data loss.
- Workout logging works offline.
- Active sessions survive reload/relaunch.
- Recommendation logic stays testable outside React.
- Every automated decision can be explained from persisted evidence.
- User overrides remain first-class.
- Recovery and rest remain valid training states.
- Personalization remains evidence-gated and does not increase weekly training frequency automatically.
