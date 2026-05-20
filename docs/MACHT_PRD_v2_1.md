# Macht — PRD v2.1
**Updated:** 2026-05-20  
**Delta from v2:** Name locked, web prototype tier added, voice rules codified, mockup-confirmed features absorbed, sprint commission referenced.

---

## Name

**Macht** (German: power, force, strength)  
No tagline. No subtitle. The name carries itself.

---

## Premise

A local-first, injury-aware strength tracking app designed for one user with a long horizon. Not a product. Not a portfolio piece. A tool built to be used for years.

---

## Two-tier architecture

**Tier 1 — Web prototype** (current repo)  
Stack: React + Vite + TypeScript + Tailwind + Zustand  
Purpose: Design iteration, feature validation, data model proof-of-concept  
Storage: localStorage via Zustand persist  
Design reference: `macht_v0_2_0.jsx`  
Backup: JSON export/import  

**Tier 2 — Native app** (Phase 2, separate repo)  
Stack: React Native + Expo + TypeScript + NativeWind + Zustand  
Storage: Expo SQLite via Zustand persist middleware  
Backup: Auto JSON snapshot → Google Drive on session completion, rolling 30 snapshots  
Auth: None. Single user, single device.  
Migration: Domain types, store logic, and component structure port directly. Styling layer translates from Tailwind → NativeWind or StyleSheet.

---

## Decisions locked

| Decision | Choice |
|---|---|
| e1RM formula | Brzycki (most conservative, best sub-5-rep accuracy) |
| Default units | lbs (toggle to kg in settings) |
| Default effort scale | RPE 1–10 (toggle to RIR in settings) |
| Default rest | 90 seconds (adjustable: 60 / 90 / 120 / 150) |
| Voice | Plain English. No jargon. No exclamation marks. See Design.md. |
| Visual system | Brutalist dark. See Design.md. |
| Backup | JSON export (Tier 1). Drive push (Tier 2). |
| Consistency metric | Sessions per week, rolling 6 weeks. Floor: 2. Stretch: 4. |
| Minimum session | Self-attested toggle. Counts toward consistency. No penalty. |

---

## Open decisions (resolve before Sprint 3)

| # | Decision | Options |
|---|---|---|
| 1 | Default template split | PPL / Upper-Lower |
| 2 | Canonical e1RM lift list | Squat, Deadlift, Floor Press, RDL (+Bench paused) — confirm |
| 3 | Sport profile activation order | Wrestling first / Generic first |

---

## Core principles (unchanged)

1. **Speed first.** Set log under 3 seconds.
2. **Injury-aware by default.** Filter, substitute, pause progression for flagged lifts.
3. **Consistency over intensity.** Dashboard leads with sessions/week, not 1RM.
4. **No guilt mechanics.** No streak counters, no flames, no shame.
5. **Local-first, never trapped.** All data exportable as plain JSON at any time.
6. **Lean.** Nothing added that doesn't earn its place.

---

## MVP feature set (confirmed in v0.2.0)

### Exercise library
- 21 curated exercises (see `domain/exercises.ts`)
- Each tagged: joints loaded, positions, structures stressed
- Sport relevance tags seeded but inactive (Phase 2)

### Injury system
- Add / edit / remove / clear injuries
- Per-injury: name, severity (`avoid` / `caution`), forbidden movement tags, notes, dateAdded, targetReturn, clearedDate
- Conflict detection: exercise tags ∩ injury forbidden tags → hide / warn / substitute
- Substitute suggestions mapped per exercise
- e1RM tracking pauses on flagged lifts
- Consistency metric ignores gaps caused by active avoid-severity injuries
- Return-to-lift: on clearing an injury, prompt 60% deload re-entry for affected lifts

### Workout logging
- Preset sets auto-populate from template
- Per-set: weight, reps, RPE (or RIR), completion checkbox
- "Last time" panel per exercise: derived from previous session in history store
- Quick adjust steppers: weight (±2.5, ±10), reps (±1, ±5)
- Single-tap set completion → auto-starts rest timer
- Rest timer: default from settings, adjustable +30s/−10s, pause/resume, reset
- Plate calculator with barbell sleeve visualizer (inline per set)
- Minimum session toggle: still counts toward consistency
- Session clock (elapsed time)
- End session → confirm modal → saves to history

### Progress
- Estimated 1RM per canonical lift: Brzycki formula
- Sparkline chart: 12-week trailing view
- Current / best / 6-week delta per lift
- Paused state: auto-derived from active injuries (not hardcoded)

### Consistency dashboard
- Rolling 6-week sessions/week bar chart
- Floor (2/wk) and stretch (4/wk) reference lines
- Injury weeks flagged visually (not penalised)
- Recent sessions list: date, template name, duration, volume, adapted badge

### Templates
- Template card: exercise list, target sets/reps per exercise
- Injury adaptation badge + count of substituted exercises
- Edit: reorder, remove, add from library (Sprint 5)
- One active template at MVP; multiple in Sprint 5

### Profile
- Active injuries: CRUD, severity badges, forbidden tag chips
- Past injuries: cleared injuries with dates (collapsed)
- Settings: units, default rest, effort scale
- Backup: export JSON, import JSON, last save timestamp

---

## Excluded — forever

- Social / community features
- Nutrition tracking
- AI coaching or smart recommendations
- Wearables integration
- Subscriptions / payments

## Excluded — from Tier 1 prototype

- Google Drive auto-push (Tier 2)
- Advanced template marketplace
- Conditioning / mobility modules
- Sport profile UI (data model seeded only)
- Adaptive deload auto-detection

---

## Reference documents

| Document | Purpose |
|---|---|
| `macht_v0_2_0.jsx` | Visual and interaction reference. Read-only. |
| `Design.md` | Design system: tokens, components, voice rules |
| `MACHT_Sprint_Commission.md` | Sprint gates and deliverable checklists |

---

## Success criteria

- Sessions per week ≥ 3 sustained over 8 weeks
- Set log time < 3 seconds
- Zero data loss events
- Injury filter operates without manual workaround
- App opens and feels fast
