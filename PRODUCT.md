# Macht — Product Contract

## Purpose

Macht is an adaptive hypertrophy and strength training system for long-horizon training.

It should make the next useful training action obvious, make logging fast enough to disappear into the workout, learn from actual performance and feedback, and turn accumulated training history into better future prescriptions.

The core product promise is simple:

> Open Macht. Know what to do. Train. See what changed. Progress with evidence.

## Primary user

The primary user trains consistently, values evidence-based programming, wants to improve over years, and prefers a system that removes repetitive planning work while preserving control.

The app is used under real gym conditions: between sets, one-handed, under time pressure, sometimes offline, and with little patience for unnecessary data entry.

## Core jobs

Macht must reliably answer six questions:

1. **What am I training today?**
2. **What should I do on this set?**
3. **What happened compared with last time?**
4. **What should change next?**
5. **Am I progressing over weeks and months?**
6. **How do I keep the plan coherent when real life disrupts it?**

## Core loop

```text
Program
  ↓
Today's prescription
  ↓
Workout execution
  ↓
Performance + minimal feedback
  ↓
Progression decision
  ↓
Next prescription
  ↓
Visible longitudinal progress
```

Every major feature should strengthen this loop.

## Product engines

### 1. Program engine

Creates and maintains the training structure:

- training days
- session-time budget
- muscle priorities
- exercise selection
- weekly distribution
- set and rep prescriptions
- effort targets
- mesocycle progression
- deload state
- schedule repair

### 2. Execution engine

Makes the live workout fast and reliable:

- clear current exercise and set target
- previous performance visible at the moment it matters
- rapid load/reps/effort entry
- one-tap set completion
- undo
- rest timer
- substitutions
- active-session persistence
- offline operation
- haptics and restrained feedback

### 3. Progression engine

Turns evidence into the next prescription:

- reps
- load
- effort accuracy
- recent performance trend
- mesocycle position
- recovery
- stimulus feedback
- session-time pressure
- accumulated fatigue
- exercise quality
- adherence context

The engine should prefer small, stable changes and preserve the current prescription when evidence is weak.

### 4. Performance engine

Makes improvement legible over meaningful timescales:

- load PRs
- rep PRs
- estimated performance
- exercise trends
- muscle-level training exposure
- mesocycle comparisons
- progression velocity
- records

### 5. Habit engine

Supports repeatable training behavior:

- weekly commitments
- rolling adherence
- schedule repair
- missed-session recovery
- consistency milestones
- mesocycle completion

Habit mechanics must remain non-punitive. Rest and recovery are valid parts of training.

## Product principles

1. **Execution first.** The live workout receives the strongest interaction priority.
2. **Three-second logging target.** A normal working set should be loggable in three seconds or less.
3. **Prescription and performance are separate records.** The system preserves what was planned and what actually happened.
4. **Every automated change has a reason.** Recommendations must be explainable from stored evidence.
5. **Stable programming wins.** Exercise and program changes require a useful reason.
6. **Recovery informs progression.** Recovery signals can hold or reduce training when appropriate.
7. **Consistency is measured over weeks.** Daily streak pressure has no role in the product.
8. **User overrides are first-class.** The user can change the prescription and the system records the override rather than fighting it.
9. **History compounds in value.** Longitudinal records should improve recommendations and interpretation.
10. **Personalization is earned by evidence.** The app becomes more individualized as repeated observations accumulate.
11. **Core training remains offline-capable.** Starting, running, and saving a workout cannot depend on network availability.
12. **The interface rewards useful behavior.** Milestones and PRs receive restrained acknowledgement tied to actual training outcomes.

## Information architecture

Primary navigation:

```text
TODAY | PROGRAM | PROGRESS | LIBRARY | YOU
```

### Today

The operational home screen.

Shows:

- the next planned session
- primary Start Workout action
- expected duration
- major muscle focus
- current mesocycle/week
- weekly adherence
- recent meaningful progress
- next session context

### Program

The training plan and mesocycle workspace.

Shows:

- schedule
- current mesocycle
- muscle priorities
- sessions
- exercise selection
- set/rep/effort structure
- deload state
- program edits

### Progress

The longitudinal record.

Sections:

```text
Overview | Exercises | Muscles | Records
```

### Library

Exercise intelligence and selection.

Shows:

- exercise search
- movement metadata
- target muscles
- equipment
- substitutions
- technique notes/media where available
- user-specific exercise history

### You

Preferences and operational settings.

Shows:

- equipment
- units
- effort scale
- rest defaults
- training constraints
- notifications/preferences
- data backup/export/import

## Active workout mode

General navigation should recede during a workout.

The workout screen prioritizes:

1. current exercise
2. current set target
3. previous comparable performance
4. input controls
5. set completion
6. rest state
7. next exercise context

The user should never need to hunt through the app to complete the planned session.

## Training constraints

Physical limitations, movement discomfort, unavailable equipment, and temporary avoidance remain supported as **training constraints**.

They are supporting inputs to programming and substitution. They do not define the product identity or dominate Home and Progress.

## Recommendation behavior

Automated recommendations may include:

- maintain
- add rep
- add load
- add set
- remove set
- deload
- rotate exercise

Each decision should retain:

- evidence used
- reason codes
- previous target
- new target
- user override status
- confidence-ready metadata

When evidence conflicts or is insufficient, the default action is **maintain**.

## Progress philosophy

Progress is interpreted through repeated performance rather than a single headline score.

The product should surface meaningful training signals such as:

- stronger performance at comparable effort
- more reps at the same load
- more load at the same reps and effort
- sustained training adherence
- productive mesocycle completion
- exercise-level PRs
- useful muscle-level training exposure

No feature should rank, shame, or compare bodies. Training quality, performance, consistency, and recovery are the primary signals.

## Voice

Macht should sound concise, calm, specific, and technically competent.

Preferred copy:

- `3 sets remaining`
- `Add 1 rep next time`
- `Hold load — recovery was incomplete`
- `Week 4 of 5`
- `Session moved to Saturday`

Avoid hype, guilt, anthropomorphic coaching, and vague encouragement.

## Visual direction

The product uses **premium athletic instrumentation**:

- strong hierarchy
- expressive but controlled typography
- excellent numeric legibility
- tactile controls
- restrained motion
- meaningful charts
- purposeful use of accent color
- generous space around high-priority actions
- dense information only when the task benefits from it

The former brutalist / monospace-everywhere doctrine is superseded by this contract.

## Local-first data principles

- Workouts must function offline.
- Active workout state persists across accidental reload/relaunch.
- Raw user history remains exportable.
- Stored data uses explicit schema versions and migrations.
- Derived metrics should be recomputable from raw records whenever practical.
- Historical records are never silently rewritten to match later prescriptions.

## Success metric

### Productive Training Weeks

A Productive Training Week combines:

- sufficient completion of the user's planned sessions
- valid recorded training exposure
- usable progression/performance evidence

Supporting metrics:

- planned-session adherence
- app-open → workout-start time
- median set-log time
- percentage of active exercises showing useful progress
- recommendation acceptance / override rate
- productive weeks retained
- manual program overrides
- fatigue-driven reductions
- data-loss events

## Explicit exclusions for the current product horizon

Macht does not require these to succeed:

- social feeds
- public leaderboards
- body-comparison mechanics
- nutrition logging
- arbitrary XP systems
- daily-login rewards
- punitive streaks
- motivational chat personas

Future integrations such as wearables or cloud sync must strengthen the core training loop before they earn implementation priority.

## Quality bars

- Historical data survives migrations.
- Core workout execution works offline.
- Active sessions survive reload/relaunch.
- Recommendation logic is testable outside React.
- Automated decisions are explainable from persisted evidence.
- Normal set logging remains within the three-second target.
- Accessibility and reduced-motion support remain first-class.
