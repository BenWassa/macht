# Macht PRD v3 — Adaptive Training

**Status:** implementation contract  
**Branch:** `agent/product-reboot-work-plan`  
**Supersedes:** `docs/MACHT_PRD_v2_1.md`

## 1. Product summary

Macht is a mobile-first adaptive hypertrophy and strength training system. It plans training, guides the live workout, captures the smallest useful amount of feedback, converts performance into explainable progression decisions, and makes long-term improvement visible.

### Product promise

> Open Macht. Know what to do. Train. See what changed. Progress with evidence.

## 2. Problem

Consistent resistance training creates recurring planning work:

- choosing an appropriate program
- deciding exercise order and weekly distribution
- selecting loads and rep targets
- deciding when to add reps, load, or sets
- recognizing fatigue and recovery problems
- remembering previous performance
- interpreting plateaus
- rescheduling missed sessions
- preserving a coherent training block across real-life disruptions
- understanding whether months of training are producing useful progress

Most trackers capture what happened and leave interpretation to the user. Many coaching systems provide prescriptions while creating friction, opaque decisions, or weak longitudinal analytics.

Macht should remove repetitive planning work while preserving user control and making the evidence behind recommendations inspectable.

## 3. Primary user and context

The primary user:

- trains multiple times per week
- has enough experience to understand sets, reps, load, and RIR/RPE
- wants strength and hypertrophy progress over a long horizon
- values evidence-based training
- wants a program that adapts without constant manual recalculation
- may train in commercial gyms, home gyms, or mixed environments
- frequently uses the app one-handed between sets
- may have unreliable connectivity
- expects workout data to remain available for years

### Environmental constraints

The gym context creates hard UX requirements:

- sweaty hands
- short attention windows
- glare / inconsistent lighting
- one-handed use
- interrupted sessions
- equipment unavailability
- time pressure
- intermittent network access

## 4. Jobs to be done

### Before training

- Tell me what session comes next.
- Show me how long it should take.
- Show me the main training focus.
- Let me understand or change the plan without digging through settings.

### During training

- Tell me what exercise and set to perform.
- Show the target and previous comparable performance together.
- Let me record the result in seconds.
- Make substitutions easy when equipment is unavailable or a movement is unsuitable today.
- Track rest without demanding attention.

### After training

- Capture only feedback that can change future programming.
- Show the meaningful outcomes of the session.
- Update future prescriptions.
- Explain important changes.

### Across weeks

- Keep the mesocycle coherent.
- Adjust progression based on performance and recovery.
- Repair the schedule when sessions are missed.
- Show adherence without guilt mechanics.

### Across months

- Show which exercises are improving.
- Show useful muscle-level training exposure.
- Surface records and meaningful trends.
- Use accumulated history to personalize future recommendations.

## 5. Product goals

### G1 — Make the next action obvious

A user opening Macht on a planned training day should immediately understand the next session and be able to start it with one dominant action.

### G2 — Preserve fast execution

A normal working set should be loggable in three seconds or less once the correct exercise is active.

### G3 — Build an adaptive training engine

Progression should use multiple signals and remain deterministic/testable in the first implementation. Every change must have a stored reason.

### G4 — Make progress legible

The product should show performance and consistency across useful timescales without collapsing training into one vanity metric.

### G5 — Maintain program coherence under real life

Missed sessions, equipment changes, substitutions, time limits, and temporary constraints should alter the plan without corrupting its sequence.

### G6 — Preserve user trust

Workout history, prescriptions, overrides, and progression decisions must remain reconstructable and exportable.

## 6. Product principles

1. Execution first.
2. Three-second set logging target.
3. Prescribed and actual values are separate records.
4. Every automated change has a reason.
5. Stable programming receives preference over unnecessary rotation.
6. Recovery is a programming input.
7. Weekly consistency matters more than daily streaks.
8. User overrides are first-class data.
9. History should compound in value.
10. Personalization must be supported by repeated evidence.
11. Core workout execution remains offline-capable.
12. Meaningful milestones can be celebrated briefly and proportionally.

## 7. Core loops

### Loop A — Today → Workout

```text
Open app
  ↓
Today's session
  ↓
Review duration / focus
  ↓
Start Workout
  ↓
First working set
```

**Primary friction metric:** time from app open to workout start.

### Loop B — Set execution

```text
See prescription + previous performance
  ↓
Perform set
  ↓
Enter actual load / reps / effort
  ↓
Complete set
  ↓
Rest timer / next set
```

**Primary friction metric:** median set-log time.

### Loop C — Adaptive progression

```text
Performance
+ effort accuracy
+ recovery/stimulus
+ mesocycle context
  ↓
Recommendation engine
  ↓
Progression decision + reason
  ↓
Future prescription
```

### Loop D — Habit / schedule repair

```text
Weekly plan
  ↓
Session completed or missed
  ↓
Adherence updated
  ↓
If missed: repair schedule
  ↓
Continue coherent training sequence
```

### Loop E — Longitudinal progress

```text
Repeated sessions
  ↓
Exercise + muscle + adherence history
  ↓
Trends / PRs / mesocycle comparison
  ↓
Better interpretation and personalization
```

## 8. Information architecture

Primary navigation:

```text
TODAY | PROGRAM | PROGRESS | LIBRARY | YOU
```

### Today

Purpose: immediate action.

Required content:

- next planned session
- dominant Start Workout action
- expected session duration
- major muscles / focus
- current mesocycle and week
- weekly planned/completed sessions
- recent meaningful progress
- next-session context

### Program

Purpose: inspect and edit training structure.

Required content:

- active program
- current mesocycle
- weekly schedule
- muscle priorities
- session list
- exercise selection
- sets / rep range / effort target
- deload state
- program editing

### Progress

Purpose: interpret longitudinal training evidence.

Sections:

```text
Overview | Exercises | Muscles | Records
```

Required capabilities:

- 4 / 12 / 26-week consistency
- exercise trends
- rep/load/e1RM records
- muscle-level set exposure
- mesocycle comparison
- exercise response history

### Library

Purpose: choose and understand exercises.

Required capabilities:

- search/filter
- muscles trained
- equipment
- movement family
- substitutions
- technique notes/media when available
- user-specific history

### You

Purpose: preferences and data controls.

Required capabilities:

- units
- effort scale
- rest defaults
- available equipment
- session-time defaults
- training constraints
- backup/export/import
- app preferences

## 9. Program model

Hierarchy:

```text
Program
└── Mesocycle
    └── Week
        └── PlannedSession
            └── ExercisePrescription
                └── SetPrescription
```

### Program requirements

A Program stores:

- identity/name
- training goal/profile
- expected sessions/week
- default session-time budget
- muscle priorities
- preferred training days where applicable
- active mesocycle reference

### Mesocycle requirements

A Mesocycle stores:

- program identity
- sequence/index
- start date
- planned accumulation weeks
- deload week/state
- week collection
- status

### Week requirements

A Week stores:

- index
- phase: accumulation / deload
- target effort profile
- planned sessions

### PlannedSession requirements

A PlannedSession stores:

- stable identity
- week identity
- sequence
- planned date where scheduled
- title
- duration target
- exercise prescriptions
- completion/reschedule state

### ExercisePrescription requirements

A prescription belongs to the program slot.

It stores:

- exercise ID
- ordering
- target muscles
- planned set count
- rep range
- target effort
- load recommendation when available
- rest recommendation
- substitution family or allowed alternatives
- origin of prescription
- progression decision reference where applicable

### SetPrescription requirements

Set-level targets can store:

- set index
- target load
- rep minimum
- rep maximum
- target RIR/RPE
- set type

## 10. Workout execution model

Hierarchy:

```text
WorkoutSession
└── ExercisePerformance
    └── SetPerformance
```

### WorkoutSession

Required fields:

- identity
- plannedSessionId when applicable
- program / mesocycle / week references
- startedAt
- finishedAt
- durationSeconds
- completion state
- exercise performances
- session feedback
- adaptation/override markers

### ExercisePerformance

Required fields:

- exercise ID
- prescription reference
- order
- completed sets
- exercise feedback
- substitution origin where applicable
- notes

### SetPerformance

Required fields:

- set index
- prescription snapshot/reference
- actual load
- actual reps
- actual effort
- completion timestamp where useful
- completion state

The system must preserve both planned and actual values.

## 11. Progression engine v2

### Inputs

Initial deterministic engine may use:

- previous prescription
- actual reps
- actual load
- actual RIR/RPE
- target RIR/RPE
- rep-range position
- recent comparable performance
- mesocycle week/phase
- recovery observation
- stimulus observation
- exercise-quality feedback
- session time pressure
- accumulated set volume
- adherence context

### Outputs

Allowed decisions:

```text
MAINTAIN
ADD_REP
ADD_LOAD
ADD_SET
REMOVE_SET
DELOAD
ROTATE_EXERCISE
```

### Required recommendation record

Every automated decision stores:

- decision ID
- exercise/program-slot identity
- timestamp
- prior prescription
- resulting prescription delta
- reason codes
- evidence snapshot
- optional confidence field
- user accepted/overrode state

### Conservative behavior

When evidence is incomplete or conflicting, the engine chooses `MAINTAIN`.

### Load progression

When a rep target is achieved at acceptable effort:

- progress load when equipment increments allow a sensible next step
- otherwise progress reps within the range

### Volume progression

Volume adjustments may use recovery, stimulus, performance, workload/time pressure, and muscle priority.

Initial logic should make small changes, generally one set at a time.

### Deload

Deload state belongs to the mesocycle. The engine can also recommend an earlier transition when accumulated evidence strongly supports it.

## 12. Feedback model

Feedback must remain minimal and actionable.

### Exercise feedback

Possible signals:

- quality: poor / okay / great
- target-muscle stimulus: low / adequate / high
- joint/comfort issue: none / mild / significant

### Recovery observation

Possible signals before the next relevant session:

- recovered
- mildly fatigued/sore
- meaningfully fatigued

### Adaptive questioning

The product should ask fewer questions when repeated answers are not changing recommendations.

## 13. Muscle priorities

Supported priority levels:

```text
EMPHASIZE
GROW
MAINTAIN
```

They influence:

- initial weekly set allocation
- willingness to add volume
- exercise selection
- time-budget tradeoffs

## 14. Exercise intelligence

Exercise metadata describes the movement.

Core attributes:

- ID
- name
- primary muscles
- secondary muscles
- equipment
- movement pattern
- unilateral/bilateral
- load mode
- substitution family
- optional technique metadata

User-specific attributes accumulate separately:

- preference
- comfort history
- performance trend
- fatigue cost estimate
- progression history
- mesocycles used

## 15. Training constraints

Training constraints replace injury-first product architecture.

Constraint types may include:

- avoid movement
- temporary discomfort
- unavailable equipment
- exercise preference
- temporary load limitation

Constraints can influence:

- session generation
- substitutions
- exercise recommendations

They remain secondary to the core training experience.

## 16. Habit and scheduling

### Weekly commitment

The user chooses a realistic weekly session target.

### Adherence

Track:

- planned sessions
- completed sessions
- moved sessions
- skipped sessions

Display rolling consistency across useful windows rather than a fragile daily streak.

### Schedule repair

When a session is missed, Macht should offer or perform a repair that preserves:

- training sequence
- reasonable spacing
- user availability
- remaining weekly sessions
- mesocycle integrity

## 17. Progress and records

### Exercise-level records

Support:

- heaviest load
- rep PR at a load
- estimated performance/e1RM PR where valid
- best set within a rep range
- trend across configurable windows

### Muscle-level views

Support:

- direct sets/week
- recent set trend
- priority
- recovery context
- exercise distribution

### Consistency

Support 4-, 12-, and 26-week views.

## 18. Workout UX requirements

### Start

- one dominant start action from Today
- planned session summary visible before start
- session opens directly to first exercise

### Exercise surface

The active exercise view should show:

- exercise name
- prescription
- previous comparable performance
- current set position
- fast load/reps/effort controls
- completion control
- substitution action
- optional notes/feedback behind secondary affordances

### Interaction requirements

- numeric keyboard where appropriate
- tap targets suitable for one-handed gym use
- previous values easy to reuse
- completion produces immediate state feedback
- undo remains available
- active workout survives navigation/reload
- rest timer starts without blocking logging/navigation

## 19. Visual requirements

Visual direction: **premium athletic instrumentation**.

Required qualities:

- high hierarchy
- strong numeric typography
- distinctive but restrained accent system
- generous spacing around primary actions
- compact density in data-heavy secondary views
- tactile motion
- polished charts
- excellent dark-mode execution
- accessibility at AA target
- reduced-motion support

The previous pure-black/monospace/brutalist doctrine is deprecated.

## 20. Data and persistence requirements

### Local-first

Core workout execution must work offline.

### Schema versions

Persisted data must use an explicit schema version.

### Migrations

Migrations must be:

- deterministic
- tested with fixtures
- non-destructive
- capable of preserving an export of the pre-migration payload

### Raw versus derived data

Persist raw facts where possible.

Examples:

Persist:

- timestamps
- load
- reps
- effort
- prescription
- feedback

Derive:

- session volume
- weekly volume
- e1RM
- trends
- adherence percentages

## 21. Analytics / product telemetry model

Local metrics can be computed without external analytics infrastructure.

Key product measures:

- productive training weeks
- planned-session adherence
- app-open → workout-start time
- set-log time
- recommendation acceptance/override
- active exercises improving
- session duration versus budget
- excessive-fatigue interventions
- data-loss events

## 22. North-star metric

### Productive Training Weeks

A productive training week requires:

- sufficient adherence to the planned schedule
- valid training exposure
- usable performance data for continued progression

The precise threshold can be tuned after real usage data accumulates.

## 23. Explicit exclusions

Current horizon excludes:

- social feed
- public leaderboard
- body comparison/scoring
- nutrition tracking
- arbitrary XP
- daily-login rewards
- punitive streaks
- motivational chatbot persona
- marketplace complexity

Wearables, cloud sync, and advanced personalization remain future candidates after the core adaptive loop is proven.

## 24. Release sequence

### V3 foundation

- product contract
- schema v2
- migration
- progression engine v2
- program/mesocycle architecture

### V3 execution

- design system
- Today
- Workout
- Program

### V3 evidence

- Progress
- records
- muscle views
- adherence/schedule repair

### V3 personalization

- exercise response history
- user-specific recommendation tuning
- optional integrations

## 25. Acceptance criteria for foundation

Foundation is complete when:

1. Existing workout history migrates without losing date, exercise identity, load, reps, effort, and usable duration information.
2. Prescriptions belong to program/session slots.
3. Planned and actual set values coexist.
4. A complete workout can be reconstructed from persisted raw records.
5. Progression recommendations are pure/testable domain logic.
6. Every recommendation exposes reason codes and evidence.
7. The active workout remains offline-capable and persistent.
8. Legacy injury-first product assumptions no longer control navigation, home, progress, or program architecture.
