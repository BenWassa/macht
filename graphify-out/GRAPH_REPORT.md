# Graph Report - .  (2026-05-20)

## Corpus Check
- Corpus is ~14,611 words - fits in a single context window. You may not need a graph.

## Summary
- 98 nodes · 63 edges · 42 communities detected
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Core Application Logic|Core Application Logic]]
- [[_COMMUNITY_Formatting Utilities|Formatting Utilities]]
- [[_COMMUNITY_Domain Calculation Models|Domain Calculation Models]]
- [[_COMMUNITY_Injury Logic Helpers|Injury Logic Helpers]]
- [[_COMMUNITY_Workout Session State|Workout Session State]]
- [[_COMMUNITY_1RM Calculation Logic|1RM Calculation Logic]]
- [[_COMMUNITY_Plate Loading Math|Plate Loading Math]]
- [[_COMMUNITY_Injury Modal UI|Injury Modal UI]]
- [[_COMMUNITY_Home Screen Controller|Home Screen Controller]]
- [[_COMMUNITY_User Settings & Export|User Settings & Export]]
- [[_COMMUNITY_In-Workout Controls|In-Workout Controls]]
- [[_COMMUNITY_Workout Data Seeding|Workout Data Seeding]]
- [[_COMMUNITY_App Navigation|App Navigation]]
- [[_COMMUNITY_Exercise Input Helpers|Exercise Input Helpers]]
- [[_COMMUNITY_Charts & Visualization|Charts & Visualization]]
- [[_COMMUNITY_Exercise Library Logic|Exercise Library Logic]]
- [[_COMMUNITY_Rest Timer Logic|Rest Timer Logic]]
- [[_COMMUNITY_Session Timing Hook|Session Timing Hook]]
- [[_COMMUNITY_Finish Session Controller|Finish Session Controller]]
- [[_COMMUNITY_Template Management|Template Management]]
- [[_COMMUNITY_ESLint Configuration|ESLint Configuration]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]
- [[_COMMUNITY_Vite Project Config|Vite Project Config]]
- [[_COMMUNITY_App Root|App Root]]
- [[_COMMUNITY_App Entry Point|App Entry Point]]
- [[_COMMUNITY_Plate Visualizer Component|Plate Visualizer Component]]
- [[_COMMUNITY_Mock Data Seeding|Mock Data Seeding]]
- [[_COMMUNITY_Core Domain Types|Core Domain Types]]
- [[_COMMUNITY_Progress Screen|Progress Screen]]
- [[_COMMUNITY_History State Management|History State Management]]
- [[_COMMUNITY_Injury State Management|Injury State Management]]
- [[_COMMUNITY_User Settings Store|User Settings Store]]
- [[_COMMUNITY_ESLint Metadata|ESLint Metadata]]
- [[_COMMUNITY_Tailwind Metadata|Tailwind Metadata]]
- [[_COMMUNITY_Vite Metadata|Vite Metadata]]
- [[_COMMUNITY_Main Loop Entry|Main Loop Entry]]
- [[_COMMUNITY_Bottom Nav UI|Bottom Nav UI]]
- [[_COMMUNITY_Sparkline Chart UI|Sparkline Chart UI]]
- [[_COMMUNITY_Mock Data Reference|Mock Data Reference]]
- [[_COMMUNITY_Formatting Utils (Sem)|Formatting Utils (Sem)]]
- [[_COMMUNITY_Settings Store|Settings Store]]
- [[_COMMUNITY_Index HTML Entry|Index HTML Entry]]

## God Nodes (most connected - your core abstractions)
1. `Core Type Definitions` - 5 edges
2. `Injury Store` - 5 edges
3. `History Store` - 4 edges
4. `formatTime()` - 3 edges
5. `Exercise Library` - 3 edges
6. `Injury Logic` - 3 edges
7. `ProfileScreen` - 3 edges
8. `WorkoutScreen` - 3 edges
9. `Workout Store` - 3 edges
10. `RestTimerBanner()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `WorkoutScreen` --implements--> `Injury Adaptation System`  [INFERRED]
  src/screens/WorkoutScreen.tsx → docs/MACHT_Sprint_Commission.md
- `ProgressScreen` --cites--> `Brzycki 1RM Formula`  [EXTRACTED]
  src/screens/ProgressScreen.tsx → docs/MACHT_Sprint_Commission.md
- `Sprint Commission Document` --rationale_for--> `v0.2.0 Monolith Reference`  [EXTRACTED]
  docs/MACHT_Sprint_Commission.md → _archive/macht_v0_2_0.jsx
- `RestTimerBanner()` --calls--> `formatTime()`  [INFERRED]
  src\components\RestTimerBanner.tsx → src\lib\format.ts
- `App()` --calls--> `formatTime()`  [INFERRED]
  _archive\macht_v0_2_0.jsx → src\lib\format.ts

## Hyperedges (group relationships)
- **Workout Session Lifecycle** — app_main, hook_session_clock, modal_finish_session [INFERRED 0.90]
- **Injury-Aware Exercise System** — domain_injuries, domain_exercises, modal_finish_session [INFERRED 0.90]
- **Intra-workout Rest Feedback** — app_main, hook_rest_timer, banner_rest_timer [INFERRED 0.85]
- **Injury Management Flow** — src_modals_InjuryModal_tsx, src_state_useInjuryStore_ts, src_screens_WorkoutScreen_tsx, src_screens_TemplatesScreen_tsx [EXTRACTED 0.95]
- **Persisted State Architecture** — src_state_useHistoryStore_ts, src_state_useInjuryStore_ts, src_state_useSettingsStore_ts [EXTRACTED 1.00]

## Communities

### Community 0 - "Core Application Logic"
Cohesion: 0.21
Nodes (13): v0.2.0 Monolith Reference, Brzycki 1RM Formula, Injury Adaptation System, Sprint Commission Document, InjuryModal, HomeScreen, ProfileScreen, ProgressScreen (+5 more)

### Community 1 - "Formatting Utilities"
Cohesion: 0.22
Nodes (3): formatTime(), App(), RestTimerBanner()

### Community 2 - "Domain Calculation Models"
Cohesion: 0.28
Nodes (9): E1RM Calculations, Exercise Library, Injury Logic, Plate Loading Logic, Core Type Definitions, Finish Session Modal, Injury Tag Taxonomy Design, Set Entry Row (+1 more)

### Community 3 - "Injury Logic Helpers"
Cohesion: 0.67
Nodes (2): getAlternativeFor(), getExerciseConflict()

### Community 4 - "Workout Session State"
Cohesion: 0.5
Nodes (4): Main App Component, Rest Timer Banner, Rest Timer Hook, Session Clock Hook

### Community 5 - "1RM Calculation Logic"
Cohesion: 0.67
Nodes (0): 

### Community 6 - "Plate Loading Math"
Cohesion: 0.67
Nodes (0): 

### Community 7 - "Injury Modal UI"
Cohesion: 0.67
Nodes (0): 

### Community 8 - "Home Screen Controller"
Cohesion: 0.67
Nodes (0): 

### Community 9 - "User Settings & Export"
Cohesion: 0.67
Nodes (0): 

### Community 10 - "In-Workout Controls"
Cohesion: 0.67
Nodes (0): 

### Community 11 - "Workout Data Seeding"
Cohesion: 0.67
Nodes (0): 

### Community 12 - "App Navigation"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Exercise Input Helpers"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Charts & Visualization"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Exercise Library Logic"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Rest Timer Logic"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Session Timing Hook"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Finish Session Controller"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Template Management"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "ESLint Configuration"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Tailwind Config"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Vite Project Config"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "App Root"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "App Entry Point"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Plate Visualizer Component"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Mock Data Seeding"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Core Domain Types"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Progress Screen"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "History State Management"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Injury State Management"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "User Settings Store"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "ESLint Metadata"
Cohesion: 1.0
Nodes (1): ESLint Configuration

### Community 33 - "Tailwind Metadata"
Cohesion: 1.0
Nodes (1): Tailwind Configuration

### Community 34 - "Vite Metadata"
Cohesion: 1.0
Nodes (1): Vite Configuration

### Community 35 - "Main Loop Entry"
Cohesion: 1.0
Nodes (1): Application Entry Point

### Community 36 - "Bottom Nav UI"
Cohesion: 1.0
Nodes (1): Bottom Navigation

### Community 37 - "Sparkline Chart UI"
Cohesion: 1.0
Nodes (1): Progression Sparkline

### Community 38 - "Mock Data Reference"
Cohesion: 1.0
Nodes (1): Mock History & Injuries

### Community 39 - "Formatting Utils (Sem)"
Cohesion: 1.0
Nodes (1): Formatting Utilities

### Community 40 - "Settings Store"
Cohesion: 1.0
Nodes (1): Settings Store

### Community 41 - "Index HTML Entry"
Cohesion: 1.0
Nodes (1): Application Entry

## Knowledge Gaps
- **17 isolated node(s):** `ESLint Configuration`, `Tailwind Configuration`, `Vite Configuration`, `Application Entry Point`, `Bottom Navigation` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `App Navigation`** (2 nodes): `BottomNav()`, `BottomNav.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Exercise Input Helpers`** (2 nodes): `nudge()`, `SetRow.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Charts & Visualization`** (2 nodes): `SparklineChart()`, `SparklineChart.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Exercise Library Logic`** (2 nodes): `getExerciseById()`, `exercises.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Rest Timer Logic`** (2 nodes): `useRestTimer.ts`, `useRestTimer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Session Timing Hook`** (2 nodes): `useSessionClock.ts`, `useSessionClock()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Finish Session Controller`** (2 nodes): `FinishSessionModal()`, `FinishSessionModal.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Template Management`** (2 nodes): `TemplatesScreen.tsx`, `start()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ESLint Configuration`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tailwind Config`** (1 nodes): `tailwind.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Project Config`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Root`** (1 nodes): `App.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Entry Point`** (1 nodes): `main.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Plate Visualizer Component`** (1 nodes): `PlateVisualizer.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mock Data Seeding`** (1 nodes): `mockData.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Core Domain Types`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Progress Screen`** (1 nodes): `ProgressScreen.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `History State Management`** (1 nodes): `useHistoryStore.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Injury State Management`** (1 nodes): `useInjuryStore.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `User Settings Store`** (1 nodes): `useSettingsStore.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ESLint Metadata`** (1 nodes): `ESLint Configuration`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tailwind Metadata`** (1 nodes): `Tailwind Configuration`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Metadata`** (1 nodes): `Vite Configuration`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Main Loop Entry`** (1 nodes): `Application Entry Point`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Bottom Nav UI`** (1 nodes): `Bottom Navigation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sparkline Chart UI`** (1 nodes): `Progression Sparkline`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mock Data Reference`** (1 nodes): `Mock History & Injuries`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Formatting Utils (Sem)`** (1 nodes): `Formatting Utilities`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Settings Store`** (1 nodes): `Settings Store`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Index HTML Entry`** (1 nodes): `Application Entry`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 2 inferred relationships involving `formatTime()` (e.g. with `RestTimerBanner()` and `App()`) actually correct?**
  _`formatTime()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ESLint Configuration`, `Tailwind Configuration`, `Vite Configuration` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._