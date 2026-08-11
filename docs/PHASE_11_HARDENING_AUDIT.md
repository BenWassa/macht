# Macht Phase 11 — Hardening Audit

Phase 11 converts the reboot from a stacked compatibility architecture into the canonical production product. This document records the final data-durability, offline, accessibility, mobile, and repository-cleanup audit.

## 1. Canonical product architecture

The live application now resolves directly through `src/App.tsx` and the five canonical product surfaces:

- Today — `src/screens/HomeScreen.tsx`
- Program — `src/screens/program/ProgramScreen.tsx`
- Session — `src/screens/WorkoutScreen.tsx`
- Progress — `src/screens/ProgressScreen.tsx`
- You — `src/screens/profile/index.tsx`

Temporary reboot routing shims were removed. The primary Program and Workout paths are v2-only. The canonical Progress screen now assembles the Phase 7 v2-first analytics rather than the earlier Big-Five/injury-oriented view.

Legacy session and injury records remain readable for migration/history. They no longer drive the primary product or receive new v2 workout dual-writes.

## 2. Data durability and migration exit

### Current backup

`src/data/backup.ts` defines backup version 2. It includes:

- Programs
- Mesocycles
- active Program identity
- completed v2 Workouts
- progression decisions and personalization audit data
- training constraints
- settings
- custom exercises
- retained legacy session history
- retained legacy injury records

The parser validates the complete payload before hydration. Unsupported or malformed backups are rejected before stores are changed.

`BackupPanel` snapshots current stores before restore. A restore is applied only after validation and user confirmation; if hydration throws, all touched stores are restored from the pre-import snapshot. Backup export and restore are disabled while a workout is active.

### Legacy backup compatibility

Version 1 backups remain importable through the explicit parser path. Their sessions, injuries, settings, and custom exercises are retained; v2 collections begin empty rather than inventing adaptive data that did not exist in the source backup.

### Automated durability coverage

Tests cover:

- v2 backup envelope round trip
- populated Program / Mesocycle / Workout / progression decision / training constraint / custom exercise round trip
- version 1 backup import
- malformed backup rejection
- unsupported version rejection
- active legacy-workout conversion into resumable v2 execution
- leaving an already-v2 active workout untouched

The old v1 exporter was removed from the retained legacy-history store. New v2 workouts are stored once in the v2 execution-history store; Progress and PR detection combine v2 history with retained legacy history through normalization/de-duplication.

## 3. Offline audit

### Local source of truth

Core training state is persisted locally through Zustand persistence. Today, Program, Session, Progress, and You derive their core data from local stores and local domain modules. There is no account or server API dependency in the training loop.

### Active-session recovery

The active workout is persisted. Phase 11 adds a store migration that converts a pre-v2 persisted active session into the current `WorkoutSession` representation while retaining its start time, exercise order, completed sets, load/reps, notes, and adaptation state. Current v2 sessions rehydrate unchanged.

### PWA shell

The Vite PWA plugin remains configured with automatic service-worker updates and a generated production service worker. Production build output is the source of truth for the precached application shell and local assets.

### Remote dependencies

The Google Fonts request was removed from `index.html`; UI typography now relies on system/local fallbacks. Core training interactions do not require a remote image, font, API, or analytics request.

## 4. Accessibility audit

### Focus and dialogs

`useModalA11y`:

- focuses the first usable control on open
- traps Tab / Shift+Tab within the modal
- closes on Escape
- restores the previously focused element on close

Finish Session, exercise substitution, and cycle-restart confirmation now expose `role="dialog"`, `aria-modal="true"`, and labelled dialog headings.

### Navigation and controls

- Bottom navigation has a primary-navigation label and `aria-current` on the active destination.
- Shared `Button` uses a 44px minimum height.
- Workout set selectors, substitutions, feedback controls, custom-exercise inputs, backup actions, and the rest timer use 44px-or-larger primary touch targets.
- Pressed/selected controls use `aria-pressed`, `aria-selected`, or `aria-current` where appropriate.
- Form fields carry visible labels or accessible names.

### Visual accessibility

The design system retains the Phase 4 contrast-tested semantic token pairs. Global `:focus-visible` styling is present. CSS includes explicit `prefers-reduced-motion` handling and `forced-colors` support. The viewport no longer disables pinch zoom.

## 5. Mobile interaction audit

- Primary content is constrained to a mobile-first `max-w-2xl` shell with responsive padding.
- The fixed bottom navigation accounts for safe-area inset.
- Main content reserves bottom space so navigation does not cover the last controls.
- The rest timer now sits above the bottom navigation using safe-area-aware positioning, uses 44px controls, and shifts to a two-row layout on narrow screens rather than compressing into an overflowing toolbar.
- Progress tabs and workout exercise/set strips use intentional horizontal scrolling only where the information model is sequential; page-level surfaces do not require horizontal scrolling.
- Planned set logging keeps load, reps, effort, completion, add-set, previous-performance, and exercise navigation on the active Session surface without routing away.

## 6. Repository and product cleanup

Removed from production source/repository history on the Phase 11 branch:

- temporary App/Home/Profile routing shims
- legacy template and Free Play screens
- legacy Home dashboard tree
- legacy Workout table/action/modal component clusters
- injury-first Profile manager/modal
- superseded Big-Five Progress route
- superseded PRD/design/training/progression documents
- generated `_archive` and `graphify-out` trees
- `.DS_Store` / graphify marker artifacts
- unused multi-megabyte temporary logo assets

`.gitignore` now excludes the removed generated/macOS artifacts.

README, browser metadata, PWA manifest, description, title, and theme color are aligned with the adaptive-training product and current warm-graphite design system.

## 7. Final automated gate

Phase 11 is complete only when the exact final PR head passes:

- ESLint with no errors
- full Vitest suite
- TypeScript/Vite production build
- existing JavaScript bundle-size budget without increasing the budget
- Lighthouse
- backup round-trip tests as part of the full test suite

## 8. Residual maintenance notes

These are maintenance follow-ups rather than reboot feature blockers:

- `npm ci` currently reports dependency-audit findings inherited from the dependency graph. Dependency upgrades should be handled as a separate package-maintenance change rather than bundled into the data/architecture cleanup.
- GitHub Actions currently warns that actions targeting the Node 20 runtime are being forced toward Node 24. The workflow still succeeds; updating the action/runtime matrix should be handled as a focused CI-maintenance change.
- ESLint may report existing max-line warnings in some large domain/UI files. The Phase 11 gate requires zero lint errors; future refactoring can reduce those warnings without changing product behavior.
