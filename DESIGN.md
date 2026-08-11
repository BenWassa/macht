# Macht Design System v3

**Direction:** Premium athletic instrumentation  
**Primary platform:** mobile-first PWA  
**Accessibility target:** WCAG 2.2 AA where applicable

This document supersedes the previous brutalist / monospace-everywhere design doctrine.

## 1. Design thesis

Macht should feel like a serious performance instrument that happens to be satisfying to use.

The interface combines:

- clear athletic energy
- excellent numerical legibility
- strong hierarchy
- tactile controls
- restrained motion
- high-information views when analysis requires them
- calm, spacious execution views during training

The visual system should make training feel active and consequential without using generic neon fitness aesthetics, macho imagery, or motivational clutter.

## 2. Experience principles

### Immediate hierarchy

Every screen has one obvious first read.

Examples:

- Today → the planned session and Start Workout
- Workout → current exercise and current set
- Program → current mesocycle/week
- Progress → selected trend and its interpretation

### Numbers with context

Large numbers earn their scale when they answer a useful question.

A number should usually be paired with one of:

- target
- previous value
- delta
- time window
- unit
- recommendation

### Quiet secondary chrome

Navigation, labels, borders, and metadata should support the task rather than compete with it.

### Tactile interaction

Buttons and completion controls should feel physical through:

- clear pressed states
- subtle scale/position motion
- haptic feedback where supported
- immediate visual acknowledgement

### Progressive disclosure

Workout execution stays sparse. Analysis screens may become denser as the user asks for detail.

## 3. Visual character

Keywords:

**precise · athletic · warm · engineered · confident · legible**

Avoid:

- pure-black voids everywhere
- monospace paragraphs
- tiny uppercase labels as the dominant language
- endless 1px bordered boxes
- generic dark-blue gradient cards
- excessive glow
- faux-metal textures
- bodybuilding imagery
- gamified confetti
- crowded metric dashboards

## 4. Color system

The initial theme is dark-first because it performs well in gym environments. Light mode can be added once the core system is stable.

### Core surfaces

| Token | Value | Role |
| --- | --- | --- |
| `--color-bg` | `#111210` | App background |
| `--color-surface-1` | `#181917` | Primary cards / navigation |
| `--color-surface-2` | `#20211E` | Raised controls / active panels |
| `--color-surface-3` | `#292A26` | Stronger selected/elevated state |
| `--color-inset` | `#0C0D0C` | Numeric fields / deeply inset areas |

These are warm graphite surfaces rather than blue-black surfaces.

### Text

| Token | Value | Role |
| --- | --- | --- |
| `--color-text` | `#F3F1E9` | Primary text |
| `--color-text-secondary` | `#B9B7AF` | Supporting text |
| `--color-text-muted` | `#85847E` | Metadata |
| `--color-text-disabled` | `#5D5D58` | Disabled content |

### Primary signal

| Token | Value | Role |
| --- | --- | --- |
| `--color-signal` | `#F06A4B` | Primary action / active training state |
| `--color-signal-strong` | `#FF7958` | Hover/high emphasis |
| `--color-signal-soft` | `#3B211B` | Tinted signal surface |

The signal color is warm vermilion. It should appear where the app asks the user to act or where live training deserves emphasis.

### Semantic colors

| Token | Value | Role |
| --- | --- | --- |
| `--color-positive` | `#63C59C` | completed / recovered / positive trend |
| `--color-caution` | `#D8AA52` | fatigue / attention needed |
| `--color-negative` | `#E07171` | destructive / significant problem |
| `--color-info` | `#7E9EE8` | explanation / neutral information |

Color must never be the only status carrier.

## 5. Typography

### UI family

Use a high-quality sans-serif stack for almost all interface copy.

Initial implementation:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", sans-serif;
```

The app must remain visually coherent when Inter is unavailable.

### Display / metric typography

Large metrics use the same family with:

- heavier weight
- tighter tracking
- tabular numerals
- clear units at reduced scale

```css
font-variant-numeric: tabular-nums;
```

### Monospace

Monospace is reserved for rare technical content such as exported identifiers or debug tooling. It is no longer the default UI voice.

### Type scale

| Role | Suggested size | Weight |
| --- | --- | --- |
| Display metric | 40–56px | 650–750 |
| Screen title | 28–32px | 650–750 |
| Card title | 18–20px | 600–700 |
| Body | 15–17px | 400–500 |
| Control | 15–17px | 550–650 |
| Metadata | 12–14px | 450–550 |

Tiny 9–10px copy should be exceptional.

## 6. Spacing

Use a 4px base grid.

Primary spacing steps:

```text
4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48
```

Execution screens should favor 16–24px separation between major interaction groups.

## 7. Shape

The old zero-radius rule is removed.

Suggested radii:

| Token | Value | Use |
| --- | --- | --- |
| `--radius-sm` | 8px | compact controls |
| `--radius-md` | 14px | cards / inputs |
| `--radius-lg` | 20px | hero/session surfaces |
| `--radius-pill` | 999px | chips / compact statuses |

Roundedness should communicate touchability rather than softness.

## 8. Borders and elevation

Avoid enclosing every region in a border.

Hierarchy can come from:

- surface change
- spacing
- typography
- subtle shadow
- divider lines only where necessary

Suggested border:

```text
1px rgba(243, 241, 233, 0.08)
```

Suggested raised shadow:

```text
0 8px 30px rgba(0, 0, 0, 0.24)
```

## 9. Motion

Motion communicates state change.

### Timing

- tap/press: 90–140ms
- normal transition: 160–240ms
- significant panel transition: 240–320ms

### Easing

Use responsive ease-out or spring motion for direct manipulation.

### Good uses

- set completion
- current-set transition
- expanding an explanation
- changing mesocycle week
- PR acknowledgement
- chart reveal after range change

### Avoid

- ambient pulsing everywhere
- looping decorative motion
- long page-entry animations
- motion that blocks input

`prefers-reduced-motion` must continue to disable nonessential movement.

## 10. Haptics

Where available:

- set complete → short light pulse
- workout complete → distinct short pattern
- destructive confirmation → no celebratory haptic
- PR → brief stronger acknowledgement

Haptics should remain supplemental.

## 11. Navigation

Primary navigation:

```text
TODAY | PROGRAM | PROGRESS | LIBRARY | YOU
```

Use icons plus labels. Five items are acceptable because each represents a stable product surface.

### Active workout

During an active workout:

- general bottom navigation recedes
- a compact escape/back-to-session affordance remains available
- current session state is persistent
- accidental navigation cannot lose data

## 12. Today composition

Today should have one dominant surface.

### Session hero

Contains:

- session name
- current mesocycle/week
- muscles/focus
- exercise count / working sets
- estimated duration
- primary Start Workout button

Below the hero:

1. weekly adherence strip
2. one recent meaningful progress signal
3. next-session context

Avoid a dashboard grid of equally weighted metrics.

## 13. Workout composition

The workout screen should feel calmer than the rest of the app.

### Header

Compact:

- session title
- elapsed time
- exercise position
- finish/menu affordance

### Exercise identity

Prominent exercise name with secondary target-muscle / substitution information.

### Prescription band

A compact band communicates:

```text
TARGET        LAST TIME
32.5 kg       30 kg
8–12 @ 2 RIR  11, 10, 9 @ ~2
```

### Set cards

Each set is a large touchable row/card rather than a spreadsheet cell grid.

Recommended fields:

```text
SET 2
[ 32.5 kg ]   [ 10 reps ]   [ 2 RIR ]   [ ✓ ]
```

The current set receives stronger elevation/signal treatment. Completed sets collapse visually while remaining inspectable.

### Rest state

Rest timing can occupy a compact sticky region without blocking exercise navigation.

## 14. Program composition

Primary visual object: the mesocycle timeline.

Suggested hierarchy:

```text
Mesocycle 2
Week 3 of 5 · Build

W1  W2  [W3]  W4  D

Mon Upper A
Wed Lower A
Fri Upper B
Sat Lower B
```

Muscle priority and volume information should be available one level deeper.

## 15. Progress composition

Progress must support comparison over time without becoming a spreadsheet.

### Overview

- training consistency trend
- active exercise improvements
- recent records
- mesocycle state/comparison

### Exercise detail

- performance chart
- selectable metric
- recent prescriptions versus actuals
- PR timeline
- recommendation history

### Muscle detail

- priority
- direct-set trend
- exercise contribution
- recovery observations

### Records

Use a clean chronological/list structure with filters.

## 16. Charts

Charts should use:

- minimal grid lines
- direct labels where possible
- tabular numeric tooltips
- clear selected range
- semantic color sparingly

Avoid decorative area gradients that obscure values.

Recommended ranges:

```text
4W · 12W · 26W · 1Y · ALL
```

## 17. Components

### PrimaryButton

- signal fill
- high-contrast text
- 48px+ touch height
- clear pressed state

### SecondaryButton

- surface-2 fill
- subtle border or tonal separation

### NumericField

- large tabular number
- unit visibly attached
- easy select-all/edit behavior
- increment controls optional and secondary

### StatusChip

Small semantic label such as:

- `RECOVERED`
- `DELOAD`
- `PR`
- `MOVED`

Chips should be used sparingly.

### RecommendationCard

Contains:

- concise recommendation
- delta
- one-sentence reason
- `Why?` disclosure for evidence

### ProgressRing / radial graphics

Use only where a circular representation carries real meaning. Avoid decorative rings around arbitrary metrics.

## 18. Feedback states

### Set completed

- immediate visual collapse/change
- short haptic
- rest timer begins
- undo available

### Personal record

Use a restrained high-quality acknowledgement:

- brief signal/positive accent motion
- `REP PR` / `LOAD PR` label
- exact record
- return focus to workout quickly

### Workout completed

Summary should emphasize:

- session completed
- duration
- meaningful records
- important recommendation changes

Avoid grading the workout with arbitrary scores.

### Recovery / fatigue

Use clear language such as:

- `Recovered`
- `Some fatigue remains`
- `Still meaningfully fatigued`

Avoid alarm styling for ordinary training fatigue.

## 19. Empty states

Empty states should explain the next useful action.

Example:

```text
No exercise history yet
Complete two sessions with this exercise to start a performance trend.
```

## 20. Copy system

Voice:

- concise
- calm
- specific
- technically literate

Preferred:

```text
Add 1 rep next time
Hold load
Recovery incomplete
3 sets remaining
Week 4 of 5
Session moved to Saturday
```

Avoid:

```text
Crush it!
Beast mode
No excuses
You failed your streak
AI Coach says...
```

## 21. Accessibility

Required:

- visible `:focus-visible`
- keyboard-operable controls
- semantic labels for icon buttons
- modal focus management
- AA contrast for essential text
- status text in addition to color
- reduced-motion support
- touch targets generally ≥44×44px
- chart summaries available in text where the chart conveys important information

## 22. Responsive behavior

Primary optimization: phone widths 320–480px.

Tablet/desktop should expand spacing and analytical layouts without turning the app into desktop SaaS chrome.

Workout controls should retain reachable widths rather than stretching across the full desktop viewport.

## 23. Implementation rule

Do not attempt to preserve the previous visual identity through incremental token changes.

The old typography, zero-radius rule, border-heavy composition, and injury status hierarchy are legacy references. New screens should be designed against this document and the v3 PRD.
