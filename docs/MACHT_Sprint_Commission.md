# Macht — Sprint Commission Document
**Version:** 1.0  
**Status:** Active  
**Scope:** Web design prototype → beta-ready single-user strength tracker  
**Reference PRD:** PRD v2 (Strength & Consistency Tracker)  
**Design reference:** `_archive/macht_v0_2_0.jsx` — read-only. Not source code. All screens, copy, and visual decisions are final here. Port logic and visuals from it; do not split it.

---

## Setup Decision

**Seed from Vite + React TS template, then port.**

```bash
npm create vite@latest macht -- --template react-ts
cd macht
npm install
npm install zustand tailwindcss @tailwindcss/vite lucide-react
```

Reason: `v0_2_0` is a single-file monolith. You cannot split a monolith — you rebuild into structure using it as reference. Vite gives you tsconfig, path aliases, HMR, and ESLint baseline from minute one. Retrofitting those after the fact is expensive.

**This repo is the web design prototype.** The production app (React Native + Expo + SQLite) is a Phase 2 milestone handled in a separate repo. Logic, types, and store structure will port directly. The styling layer (Tailwind CSS → NativeWind or StyleSheet) will need translation.

---

## Canonical File Structure

```
macht/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── TemplatesScreen.tsx
│   │   ├── WorkoutScreen.tsx
│   │   ├── ProgressScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── components/
│   │   ├── BottomNav.tsx
│   │   ├── RestTimerBanner.tsx
│   │   ├── PlateVisualizer.tsx
│   │   ├── SparklineChart.tsx
│   │   └── SetRow.tsx
│   ├── modals/
│   │   ├── InjuryModal.tsx
│   │   └── FinishSessionModal.tsx
│   ├── state/
│   │   ├── useWorkoutStore.ts
│   │   ├── useInjuryStore.ts
│   │   ├── useHistoryStore.ts
│   │   └── useSettingsStore.ts
│   ├── domain/
│   │   ├── types.ts           ← all shared TypeScript types
│   │   ├── exercises.ts       ← EXERCISE_LIBRARY constant
│   │   ├── e1rm.ts            ← Brzycki formula + history derivation
│   │   ├── plates.ts          ← getPlates() + PLATE_DATA
│   │   └── injuries.ts        ← getExerciseConflict(), getAlternativeFor()
│   ├── hooks/
│   │   ├── useRestTimer.ts
│   │   └── useSessionClock.ts
│   ├── lib/
│   │   └── format.ts          ← formatTime, formatDate
│   ├── data/
│   │   └── mockData.ts        ← MOCK_HISTORY, WEEK_CONSISTENCY (dev only)
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## Core TypeScript Types
> Define these in `domain/types.ts` before writing any component. Everything references them.

```typescript
type Severity = 'avoid' | 'caution' | 'monitor';

interface Exercise {
  id: string;
  name: string;
  target: string;
  tags: string[];
}

interface ExerciseInjury {
  id: string;
  name: string;
  severity: Severity;
  forbiddenTags: string[];
  notes: string;
  dateAdded: string;        // ISO
  targetReturn?: string;    // ISO, optional
  clearedDate?: string;     // ISO, set when cleared
}

interface SetEntry {
  id: number;
  weight: number;
  reps: number;
  rpe: number | null;
  completed: boolean;
  last: string;             // "80 × 8 @ RPE 8" — display string from previous session
}

interface SessionLog {
  id: string;
  date: string;             // ISO date
  template: string;
  duration: string;         // "48m"
  volume: number;
  sets: number;
  adapted: boolean;
  isMinimumSession: boolean;
}

interface Settings {
  units: 'lbs' | 'kgs';
  defaultRest: number;      // seconds
  rpeMode: 'RPE' | 'RIR';
}
```

---

## Sprint 0 — Foundation
**Goal:** Repo is set up, typed, and App renders HomeScreen from real modular structure.  
**Gate to Sprint 1:** All checklist items pass. App compiles with zero TypeScript errors.

### Checklist

**Repo + tooling**
- [ ] `npm create vite@latest macht -- --template react-ts`
- [ ] Install: `zustand`, `tailwindcss`, `@tailwindcss/vite`, `lucide-react`
- [ ] Configure Tailwind (`tailwind.config.ts` + `vite.config.ts` plugin)
- [ ] Add Google Fonts import (JetBrains Mono or system mono) to `index.html`
- [ ] Set `src/` path alias `@/` in `tsconfig.json` and `vite.config.ts`
- [ ] Add `animate-fadeIn` keyframe to global CSS
- [ ] Init GitHub repo, push initial commit: `chore: vite scaffold`

**Types and domain**
- [ ] Write all types in `domain/types.ts` (see above)
- [ ] Port `EXERCISE_LIBRARY` (21 exercises) to `domain/exercises.ts`, typed as `Exercise[]`
- [ ] Port `getPlates()` + `PLATE_DATA_LBS/KGS` to `domain/plates.ts`
- [ ] Port `getExerciseConflict()` + `getAlternativeFor()` to `domain/injuries.ts`
- [ ] Port `formatTime()` + `formatDate()` to `lib/format.ts`
- [ ] Write Brzycki formula to `domain/e1rm.ts`: `(weight: number, reps: number): number`

**Zustand stores (shell only — no UI yet)**
- [ ] `useSettingsStore.ts` — units, defaultRest, rpeMode. Persist to localStorage.
- [ ] `useInjuryStore.ts` — injuries array, addInjury, removeInjury. Persist.
- [ ] `useHistoryStore.ts` — sessions array, addSession. Persist.
- [ ] `useWorkoutStore.ts` — active session state (workoutSets, activeExList, selectedEx/Set indices, isMinimumSession, duration). Do NOT persist (session-scoped).

**Smoke test**
- [ ] `App.tsx` renders `<HomeScreen />` using data from `useHistoryStore`
- [ ] `HomeScreen` compiles, renders without errors, shows consistency chart from mock data
- [ ] Commit: `feat(s0): foundation — types, stores, domain, HomeScreen`

---

## Sprint 1 — All Screens Ported
**Goal:** All five screens render from modular components, navigation works, no functional regressions from `v0_2_0`.  
**Gate to Sprint 2:** Every screen renders with correct visual. Nav switches correctly. Modals open/close.

### Checklist

**Screens** (port from `v0_2_0`, typed, no mock data hardcoded in components)
- [ ] `HomeScreen.tsx` — consistency chart, quick-start, session history list
- [ ] `TemplatesScreen.tsx` — template card, injury adaptation banner, start/edit CTAs
- [ ] `WorkoutScreen.tsx` — exercise selector, set rows, steppers, plate visualizer
- [ ] `ProgressScreen.tsx` — e1RM cards with sparkline chart per lift
- [ ] `ProfileScreen.tsx` — injury list, settings toggles, backup row

**Shared components**
- [ ] `BottomNav.tsx` — receives `activeTab` + `setActiveTab`, renders 5 tabs
- [ ] `RestTimerBanner.tsx` — receives timer state + controls as props
- [ ] `PlateVisualizer.tsx` — receives `weight` + `units`, renders barbell sleeve
- [ ] `SparklineChart.tsx` — receives `data: number[]` + `paused: boolean`
- [ ] `SetRow.tsx` — receives set data + callbacks, renders one row

**Modals**
- [ ] `InjuryModal.tsx` — controlled by `useInjuryStore.addInjury`
- [ ] `FinishSessionModal.tsx` — controlled by `useWorkoutStore` + `useHistoryStore.addSession`

**Navigation**
- [ ] `App.tsx` manages `activeTab` state, renders correct screen, renders `BottomNav`
- [ ] Active session indicator dot on SESSION tab when workout is active

**Commit sequence**
- [ ] `feat(s1): screens — Home, Templates`
- [ ] `feat(s1): screens — Workout, Progress, Profile`
- [ ] `feat(s1): components — BottomNav, RestTimerBanner, PlateVisualizer, SparklineChart, SetRow`
- [ ] `feat(s1): modals — InjuryModal, FinishSessionModal`
- [ ] `feat(s1): navigation — tab switching, active session indicator`

---

## Sprint 2 — Injury System Hardened
**Goal:** Injury system is fully functional end-to-end. Adding an injury immediately affects exercise selection across all screens.  
**Gate to Sprint 3:** QA checklist passes. Injury filter works for all 21 exercises.

### Checklist

**Exercise tagging audit**
- [ ] All 21 exercises reviewed and tagged correctly against injury tag taxonomy
- [ ] Taxonomy documented in `domain/exercises.ts` as a comment block
- [ ] `getAlternativeFor()` covers: bench → neutral_db_press, OHP → landmine (add to library), pull_up → lat_pulldown_front, dip → tricep_pushdown, lat_pulldown_behind → lat_pulldown_front

**Injury CRUD**
- [ ] Add injury: name, severity, forbidden tags, notes, dateAdded (auto) ✓ (from S1)
- [ ] Edit injury: all fields editable post-creation (new — not in v0_2_0)
- [ ] Mark as cleared: sets `clearedDate`, moves injury to "Past injuries" section
- [ ] Past injuries section: collapsible list of cleared injuries with dates

**Return-to-lift deload protocol**
- [ ] When injury marked as cleared, identify all exercises that were previously blocked
- [ ] Surface a modal: "Bench Press is available again. Start with 60% of last recorded weight (X lb)?"
- [ ] If confirmed, pre-populate next session with the deload weight

**Conflict propagation**
- [ ] `WorkoutScreen`: conflict banner shows for any exercise in `activeWorkoutList` that conflicts
- [ ] `TemplatesScreen`: template card shows adapted badge + count of substituted exercises
- [ ] `ProgressScreen`: paused lifts auto-detected from active injury tags (not hardcoded)
- [ ] `HomeScreen`: consistency chart — sessions where all completed sets were injury-safe count fully; no penalty for adapted sessions

**QA checklist**
- [ ] Add injury "Left knee" tagging `knee` → leg press, squat, leg extension show conflict
- [ ] Clear that injury → deload prompt appears for those exercises
- [ ] Delete injury → conflicts disappear immediately across all screens
- [ ] Adapted session history badge shows correctly

- [ ] Commit: `feat(s2): injury system — CRUD, conflict propagation, deload protocol`

---

## Sprint 3 — Workout Logging Hardened
**Goal:** A complete session can be logged, saved, and reflected in history and progress — using real data, not mock.  
**Gate to Sprint 4:** End-to-end session flow works. No hardcoded mock data in any component.

### Checklist

**Session flow**
- [ ] Start session: resets workout store, sets template, starts clock
- [ ] Set completion: marks set done, triggers rest timer from `useRestTimer` hook
- [ ] `useRestTimer` hook: encapsulates countdown logic, reset, +30s/-10s controls
- [ ] `useSessionClock` hook: encapsulates elapsed time counter
- [ ] Minimum session toggle: saved to session log, visible in history
- [ ] End session: opens FinishSessionModal, on confirm → saves to history store

**Last time data**
- [ ] On session start, pull previous session's set data for each exercise from `useHistoryStore`
- [ ] Display in "Last time" panel per exercise (not static string from mock data)
- [ ] If no previous session for this exercise: show "—"

**e1RM computation**
- [ ] On session save, compute Brzycki e1RM for each exercise where reps ≤ 10
- [ ] Store e1RM snapshot per exercise per session in history store
- [ ] `ProgressScreen` derives e1RM chart data from history (not hardcoded `PROGRESS_LIFTS`)
- [ ] Paused state derived from active injury store (not hardcoded `status` string)

**Consistency dashboard**
- [ ] Rolling 6-week sessions/week computed from `useHistoryStore` session dates
- [ ] Injury weeks detected from sessions with `adapted: true` where injury was `avoid`
- [ ] Floor and stretch goal lines correct at 2 and 4

**Empty states — all screens**
- [ ] `HomeScreen`: "No sessions yet. Start your first session." with CTA
- [ ] `ProgressScreen`: "Log sessions to begin tracking progression."
- [ ] `WorkoutScreen` (no active session): "No session active. Go to Plans to start."

**Commit sequence**
- [ ] `feat(s3): session flow — start, log, complete, save`
- [ ] `feat(s3): last-time data — derived from history store`
- [ ] `feat(s3): e1rm — Brzycki computation on save, derived charts`
- [ ] `feat(s3): empty states — all screens`

---

## Sprint 4 — Persistence + Backup
**Goal:** Data survives browser refresh. JSON export and import works. No data loss.  
**Gate to Sprint 5:** Refresh test passes. Export → wipe → import round-trip is lossless.

### Checklist

**Zustand persist middleware**
- [ ] `useSettingsStore` persists to `localStorage` key `macht_settings`
- [ ] `useInjuryStore` persists to `localStorage` key `macht_injuries`
- [ ] `useHistoryStore` persists to `localStorage` key `macht_history`
- [ ] `useWorkoutStore` does NOT persist (session-scoped, intentional)
- [ ] Verify: all stores rehydrate correctly on page refresh

**JSON export**
- [ ] Export function in `useHistoryStore`: serialises history + injuries + settings to JSON
- [ ] Download triggered as `.json` file: `macht_backup_YYYY-MM-DD.json`
- [ ] Export button visible in Profile → Backup section
- [ ] Snapshot auto-triggered on `addSession` (in-memory rolling log, last 30)

**JSON import / restore**
- [ ] File input in Profile → Backup section: accepts `.json`
- [ ] Parse and validate structure before import (check top-level keys)
- [ ] On valid import: prompt "This will replace your current data. Continue?"
- [ ] On confirm: hydrate all stores from imported JSON
- [ ] On invalid file: show error message inline, do not import

**QA checklist**
- [ ] Log a session. Refresh. Session still in history.
- [ ] Export JSON. Inspect — all sessions, injuries, settings present.
- [ ] Clear localStorage. Import JSON. All data restored.
- [ ] Import a malformed JSON file. Error shown, data not corrupted.

- [ ] Commit: `feat(s4): persistence — localStorage, JSON export/import`

---

## Sprint 5 — Polish + Pre-Beta
**Goal:** App is demo-able end-to-end with no hardcoded data, no broken states, and no design regressions.  
**Gate to beta:** All items checked. End-to-end demo flows smoothly from cold start.

### Checklist

**Remove all mock data from components**
- [ ] `data/mockData.ts` is only imported in dev mode or deleted
- [ ] No component references `MOCK_HISTORY`, `WEEK_CONSISTENCY`, or `PROGRESS_LIFTS` directly
- [ ] All data flows through Zustand stores

**Template builder (basic)**
- [ ] Template edit: reorder exercises (up/down), remove exercise
- [ ] Exercise picker: searchable list from `EXERCISE_LIBRARY`, filtered by active injuries
- [ ] Save edited template to store (replaces DEFAULT_TEMPLATE constant)

**Design QA against v0_2_0**
- [ ] Screen-by-screen comparison: fonts, spacing, borders, colors match reference
- [ ] `animate-fadeIn` works on all tab transitions
- [ ] Plate visualizer renders correctly for all weight inputs including bar-only and heavy loads
- [ ] Rest timer banner appears, counts down, dismisses correctly
- [ ] Injury conflict banner appears and substitute flow works

**Copy audit**
- [ ] Every user-facing string reviewed: no sci-fi jargon, no exclamation marks
- [ ] Injury severity badge text correct: "Avoid" / "Caution"
- [ ] Empty states all present and correct
- [ ] Session save confirmation modal copy matches spec

**Beta definition of done**
- [ ] Cold start (no data): onboarding-equivalent empty states guide the user to create a template
- [ ] Full session logged, saved, reflected in history and e1RM chart
- [ ] Injury added, exercises filtered, session adapted, cleared with deload prompt
- [ ] JSON backup exported and re-imported cleanly
- [ ] No TypeScript errors. No console errors in normal flows.

- [ ] Commit: `chore(s5): pre-beta cleanup`
- [ ] Tag: `git tag v0.3.0-beta`

---

## Phase 2 Preview (Post-Beta)
> Not in scope for this repo. Tracked separately.

- **React Native / Expo migration** — new repo, `npx create-expo-app macht --template`. Port domain types, stores (swap localStorage → Expo SQLite via Zustand persist), and screen logic. Restyle with NativeWind or StyleSheet.
- **Google Drive backup** — replace JSON file download with Drive API push on session save.
- **Additional templates** — Pull Day, Leg Day, Upper/Lower variants.
- **Sport profile hook** — wrestling mode: flag exercises by sport relevance tags (seeded in domain but inactive).
- **Deload auto-detection** — if e1RM stalls 2+ weeks or RPE creeps, suggest a 70% week.
- **Per-exercise rest defaults** — compound vs. accessory distinction.

---

## Git Conventions

```
feat(s0): ...     ← new feature, sprint scoped
fix: ...          ← bug fix
chore: ...        ← tooling, config, cleanup
refactor: ...     ← restructuring without behaviour change
docs: ...         ← README, comments, this document
```

Branches: `main` (stable) → `dev` (integration) → `sprint/N-description` (work).  
Merge sprint branch → dev on gate pass. Merge dev → main on sprint complete.

---

## Open Decisions (resolve before Sprint 3)

| # | Decision | Options | Notes |
|---|---|---|---|
| 1 | PPL vs Upper/Lower as default template | PPL / Upper-Lower | PPL already in v0_2_0 |
| 2 | Imperial vs metric default | lbs / kg / toggle from onboarding | Toggle already in settings |
| 3 | RPE vs RIR default | RPE / RIR | Toggle already in settings |
| 4 | Canonical e1RM lift list | Squat, Deadlift, Floor Press, RDL (+ Bench paused) | Confirm before S3 |
| 5 | Minimum session definition | Time threshold / exercise count / self-attest | Self-attest (toggle) already in v0_2_0 |
