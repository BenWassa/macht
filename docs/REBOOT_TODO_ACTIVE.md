# Macht Reboot — Active Execution Tracker

This file is the active phase tracker while the GitHub connector is preventing safe in-place edits to `REBOOT_TODO.md`. Phase 11 consolidates this state back into the canonical tracker and removes this temporary file.

## Validated through Phase 10

- [x] Phase 0 — Product contract / PRD / IA
- [x] Phase 1 — v2 data model, migration, rollback
- [x] Phase 2 — progression engine v2
- [x] Phase 3 — Program / mesocycle domain
- [x] Phase 4 — design system and accessibility foundations
- [x] Phase 5 — Today
- [x] Phase 6 — v2 Workout execution
- [x] Phase 6.5 — Program surface integration
- [x] Phase 7 — Progress analytics and UI components
- [x] Phase 8 — weekly training rhythm and schedule recovery
- [x] Phase 9 — generic training constraints
- [x] Phase 10 — explainable personal training model

The final Phase 10 head passed lint, 121 tests, TypeScript/build, bundle-size budget, and Lighthouse. Live volume progression now receives recovery + stimulus evidence, and established personal fatigue evidence can conservatively suppress a proposed set increase while preserving the deterministic base recommendation for auditability.

## Current focus — Phase 11: Cleanup and hardening

### Canonical product surfaces

- [ ] Collapse temporary app entry-point shims into canonical `App.tsx`.
- [ ] Collapse the temporary Home shim into the canonical Home screen.
- [ ] Collapse the temporary Profile shim into the canonical YOU screen.
- [ ] Wire the tested Phase 7 v2 Progress components into the actual root Progress route.
- [ ] Remove dead legacy Home / Progress / Program / Workout compatibility UI after route verification.
- [ ] Remove legacy injury-first primary UI; retain only migration compatibility required for old local data.

### Data durability

- [ ] Introduce a versioned v2 backup payload covering v2 workouts, programs/mesocycles, progression decisions, training constraints, settings, and custom exercises.
- [ ] Preserve v1 backup import compatibility.
- [ ] Audit export/import round-trip with tests.
- [ ] Remove Phase 6 legacy history dual-write only after v2 backup/import and Progress fallback remain safe.

### Product / PWA hardening

- [ ] Update README to the adaptive training product.
- [ ] Update PWA name/description and verify install/offline configuration.
- [ ] Offline audit.
- [ ] Accessibility audit: focus, labels, touch targets, reduced motion, semantic controls, chart alternatives.
- [ ] Mobile interaction/performance audit.
- [ ] Remove stale injury-first/minimum-strength product copy from primary runtime surfaces and docs.

### Tracker consolidation

- [ ] Consolidate final phase state into `REBOOT_TODO.md`.
- [ ] Delete `REBOOT_TODO_ACTIVE.md`.

### Final gate

- [ ] Lint passes.
- [ ] Full tests pass.
- [ ] TypeScript/build passes.
- [ ] Bundle-size budget passes.
- [ ] Lighthouse passes on the final stacked head.
- [ ] Final route/file audit confirms no temporary reboot shims remain.
