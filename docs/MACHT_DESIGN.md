# Macht — Design System

**Version:** 1.0  
**Extracted from:** `macht_v0_2_0.jsx`  
**Stack:** React + Tailwind CSS (web prototype)  
**Native translation:** NativeWind or StyleSheet (Tier 2)

This document is the single source of truth for all visual and copy decisions. When writing a component, reference this before hardcoding any value.

---

## Aesthetic direction

**Brutalist functional.**  
Pure black backgrounds, off-white text, monospace type throughout, zero border radius, single accent colour (blue). Information density is high. Decoration is zero. Numbers are the protagonist — large, bold, immediate. Labels are subdued — small, tracked, muted.

The look is disciplined. The copy is plain. These are not in tension — they reinforce each other.

---

## Colour tokens

Define these as CSS custom properties in `index.css` and reference them in components.

```css
:root {
  /* Surfaces */
  --c-bg: #060606; /* page background */
  --c-surface: #0c0c0c; /* card, header, modal */
  --c-elevated: #121212; /* button backgrounds, inset controls */
  --c-inset: #070707; /* nested panels (stepper inner) */
  --c-empty: #080808; /* dashed empty state bg */

  /* Borders */
  --c-border: #1a1a1a; /* standard card/section border */
  --c-border-md: #222222; /* button borders, control borders */
  --c-border-sm: #171717; /* inner/nested borders */
  --c-border-hl: #2d2d2d; /* hover state border */

  /* Text */
  --c-text-primary: #f0f0f0; /* body copy, values */
  --c-text-high: #e5e5e5; /* neutral-200 — headings */
  --c-text-mid: #d4d4d4; /* neutral-300 — secondary values */
  --c-text-low: #a3a3a3; /* neutral-400 — muted text */
  --c-text-muted: #737373; /* neutral-500 — labels, timestamps */
  --c-text-faint: #525252; /* neutral-600 — very subdued */

  /* Accent — Blue (primary action, active state) */
  --c-blue: #2563eb; /* bg-blue-600 */
  --c-blue-hover: #1d4ed8; /* bg-blue-700 */
  --c-blue-tint: rgba(37, 99, 235, 0.15); /* bg-blue-950/15 */
  --c-blue-border: #1e3a8a; /* blue-900 — subtle blue border */
  --c-blue-text: #60a5fa; /* text-blue-400 — active labels */
  --c-blue-label: #3b82f6; /* text-blue-500 — session indicator */

  /* Success — Emerald (completion, done state) */
  --c-emerald: #059669; /* bg-emerald-600 */
  --c-emerald-hover: #047857; /* bg-emerald-700 */
  --c-emerald-dot: #10b981; /* bg-emerald-500 — indicator dot */
  --c-emerald-text: #34d399; /* text-emerald-400 — delta values */

  /* Injury — Red (avoid severity, conflict) */
  --c-red-bg: rgba(69, 10, 10, 0.2); /* bg-red-950/20 */
  --c-red-badge-bg: #450a0a; /* bg-red-950 */
  --c-red-border: #7f1d1d; /* border-red-900 */
  --c-red-text: #f87171; /* text-red-400 */

  /* Warning — Yellow (adapted, caution severity) */
  --c-yellow-bg: rgba(66, 32, 6, 0.1); /* bg-yellow-950/10 */
  --c-yellow-badge: #422006; /* bg-yellow-950 */
  --c-yellow-border: #713f12; /* border-yellow-900 */
  --c-yellow-accent: #854d0e; /* border-yellow-600 — left accent */
  --c-yellow-text: #eab308; /* text-yellow-500 */
}
```

### Plate colours (barbell visualizer)

These are fixed — they match international plate colour conventions.

```typescript
// lbs
{ 45:  { bg: '#dc2626', color: '#fff'     } }  // red
{ 35:  { bg: '#2563eb', color: '#fff'     } }  // blue
{ 25:  { bg: '#ca8a04', color: '#000'     } }  // amber
{ 10:  { bg: '#16a34a', color: '#fff'     } }  // green
{ 5:   { bg: '#737373', color: '#fff'     } }  // grey
{ 2.5: { bg: '#3a3a3a', color: '#a3a3a3'  } }  // dark grey
```

---

## Typography

**Rule: monospace everywhere, always.**  
There is no secondary font family. All copy — headings, labels, body, numbers — uses the same monospace stack. Hierarchy is achieved through size, weight, tracking, and colour, not through font switching.

```css
--font-mono:
  "JetBrains Mono", "Fira Mono", ui-monospace, "Cascadia Code", monospace;
```

Configure in `tailwind.config.ts`:

```ts
fontFamily: {
  mono: ['JetBrains Mono', 'Fira Mono', 'ui-monospace', 'monospace'],
  sans: ['JetBrains Mono', 'Fira Mono', 'ui-monospace', 'monospace'], // override sans too
}
```

### Type scale

| Role            | Size              | Weight                 | Tracking            | Colour             | Case  |
| --------------- | ----------------- | ---------------------- | ------------------- | ------------------ | ----- |
| Screen title    | `text-xl` (20px)  | `font-bold`            | `tracking-tight`    | `text-[#f0f0f0]`   | UPPER |
| Card heading    | `text-sm` (14px)  | `font-bold`            | `tracking-tight`    | `text-neutral-200` | UPPER |
| Body / value    | `text-xs` (12px)  | `font-bold` or default | —                   | `text-neutral-300` | Mixed |
| Label           | `text-[10px]`     | `font-bold`            | `tracking-wider`    | `text-neutral-400` | UPPER |
| Meta label      | `text-[9px]`      | `font-bold`            | `tracking-widest`   | `text-neutral-500` | UPPER |
| Badge           | `text-[8px]`      | `font-bold`            | `tracking-wider`    | varies by status   | UPPER |
| Stepper readout | `text-2xl` (24px) | `font-black`           | `tracking-tight`    | `text-white`       | —     |
| Nav label       | `text-[8px]`      | default                | `tracking-widest`   | active/inactive    | UPPER |
| Brand           | `text-[11px]`     | `font-extrabold`       | `tracking-[0.28em]` | `text-neutral-200` | UPPER |

### Tracking reference

```
tracking-[0.28em]  → brand header only
tracking-widest    → meta labels, nav, badge text (Tailwind default: 0.1em)
tracking-wider     → section labels
tracking-tight     → headings (condensed feel)
(no modifier)      → body text, values
```

---

## Spacing & layout

**Page container:**

```
max-w-2xl mx-auto px-4 py-6 pb-36
```

`pb-36` accounts for fixed bottom nav (h-16) + rest timer banner (when visible).

**Between major sections:** `space-y-8`  
**Within a section:** `space-y-4` or `space-y-3`  
**Within a card:** `p-4 space-y-4` or `p-5 space-y-4`  
**Inset panels:** `p-3`  
**Modals:** `p-6 space-y-4`

**Border radius:** `rounded-none` — always. Zero radius throughout. No exceptions.

**Dividers:**

```
border-b border-[#1a1a1a]          standard section divider
divide-y divide-[#1a1a1a]          list item dividers
border border-dashed border-[#1a1a1a]   empty state outline
border-l-2 border-yellow-600        warning left accent
```

---

## Component patterns

Reference these patterns when building components. Do not deviate without updating this document.

### Card

```tsx
<div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 space-y-4">
```

### Inset panel (inside a card)

```tsx
<div className="bg-[#070707] border border-[#171717] p-3">
```

### Screen header

```tsx
<div>
  <p className="text-[9px] text-neutral-500 tracking-widest uppercase font-mono mb-1">
    Strength log
  </p>
  <h1 className="text-xl font-bold tracking-tight uppercase font-mono">
    Screen title
  </h1>
</div>
```

### Section label / header row

```tsx
<h2 className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
  Section name
</h2>
```

### Label (inline, above a value)

```tsx
<span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block">
  Label
</span>
```

### Badge

```tsx
{
  /* Adapted / caution */
}
<span className="text-[8px] bg-yellow-950 text-yellow-500 px-1 border border-yellow-900 font-mono tracking-wider">
  Adapted
</span>;

{
  /* Avoid severity */
}
<span className="text-[8px] bg-red-950 border border-red-900 text-red-400 px-1.5 font-mono uppercase font-bold">
  Avoid
</span>;

{
  /* Active / injury-adapted template */
}
<span className="text-[9px] border border-blue-500/50 text-blue-400 font-mono px-1.5 py-0.5 uppercase tracking-widest">
  Injury-adapted
</span>;
```

### Primary button

```tsx
<button className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-mono uppercase tracking-widest text-xs px-4 py-2.5 rounded-none font-bold transition">
  Start session
</button>
```

### Secondary button

```tsx
<button className="bg-[#121212] hover:bg-[#1a1a1a] border border-[#222] text-neutral-300 font-mono text-[10px] uppercase tracking-widest py-3 transition rounded-none">
  Edit
</button>
```

### Ghost / destructive button

```tsx
<button className="bg-transparent hover:bg-neutral-900 border border-[#222] text-neutral-400 font-mono text-[10px] uppercase py-3 font-bold transition rounded-none">
  Cancel
</button>
```

### Ghost text link

```tsx
<button className="text-[9px] font-mono text-blue-400 hover:text-blue-300 border border-blue-900/40 px-2 py-1 bg-blue-950/15">
  + Log injury
</button>
```

### Stepper control row

```tsx
{
  /* Label */
}
<div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest px-1">
  Weight
</div>;

{
  /* Controls */
}
<div className="flex items-center justify-between gap-2 pt-1.5">
  <button className="w-12 h-10 bg-[#121212] hover:bg-[#1a1a1a] text-neutral-400 font-mono text-xs border border-[#222] transition flex items-center justify-center">
    -10
  </button>
  {/* readout */}
  <div className="flex-1 text-center">
    <span className="text-2xl font-mono font-black text-white tracking-tight">
      80
    </span>
    <span className="text-[10px] font-mono text-neutral-500 uppercase ml-1.5 font-bold">
      lbs
    </span>
  </div>
  <button className="w-12 h-10 bg-[#121212] hover:bg-[#1a1a1a] text-neutral-400 font-mono text-xs border border-[#222] transition flex items-center justify-center">
    +10
  </button>
</div>;
```

### Toggle (settings, min-session)

```tsx
<button
  className={`w-10 h-5 rounded-full border transition-colors relative
    ${active ? "bg-blue-600 border-blue-500" : "bg-[#1a1a1a] border-[#333]"}`}
>
  <span
    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform
    ${active ? "translate-x-5" : "translate-x-0.5"}`}
  />
</button>
```

Note: `rounded-full` is the one exception to the zero-radius rule — toggle thumbs only.

### Segmented control (settings tabs)

```tsx
<div className="flex border border-[#1a1a1a] bg-black p-0.5 font-mono">
  <button className="px-3 py-1 text-xs bg-blue-600 text-white font-bold">
    LBS
  </button>
  <button className="px-3 py-1 text-xs text-neutral-500 hover:text-neutral-300">
    KGS
  </button>
</div>
```

### Selection states

**Active exercise card (selector):**

```
bg-[#121212] border-blue-500 text-[#f0f0f0]
```

Inactive:

```
bg-[#0c0c0c] border-[#1a1a1a] text-neutral-500
```

**Active set row:**

```
bg-blue-950/15 border-y border-blue-900/50
```

Plus absolute left accent: `absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500`

**Active RPE button:**

```
bg-blue-600 border-blue-500 text-white font-extrabold
```

### Warning / injury banner

```tsx
<div className="border-l-2 border-yellow-600 bg-yellow-950/10 p-3 flex items-start space-x-2">
  <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
  <div>
    <span className="font-mono text-[9px] uppercase tracking-wider text-yellow-500 font-bold block">
      Warning label
    </span>
    <p className="text-neutral-400 text-[11px] mt-0.5">Warning body copy.</p>
  </div>
</div>
```

### Injury conflict banner

```tsx
<div className="border border-red-900 bg-red-950/20 p-4">
  <AlertTriangle className="h-4 w-4 text-red-500" />
  <span className="font-mono text-[9px] uppercase tracking-widest text-red-400 font-bold block">
    Injury conflict
  </span>
  <p className="text-neutral-400 text-[11px]">...</p>
</div>
```

### Empty state

```tsx
<div className="border border-dashed border-[#1a1a1a] p-8 text-center bg-[#080808]">
  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mb-4">
    No sessions yet.
  </p>
  <button className="bg-[#121212] hover:bg-[#1a1a1a] border border-[#1a1a1a] px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-neutral-300">
    Start your first session
  </button>
</div>
```

---

## Status & feedback colours

| State             | Background       | Border               | Text                           | Use                             |
| ----------------- | ---------------- | -------------------- | ------------------------------ | ------------------------------- |
| Active / primary  | `bg-blue-600`    | `border-blue-500`    | `text-white`                   | CTAs, active selections         |
| Done / complete   | `bg-emerald-600` | `border-emerald-500` | `text-white`                   | Completed sets, saved session   |
| Injury / avoid    | `bg-red-950`     | `border-red-900`     | `text-red-400`                 | Avoid badge, conflict banner    |
| Caution / adapted | `bg-yellow-950`  | `border-yellow-900`  | `text-yellow-500`              | Adapted badge, caution severity |
| Paused            | —                | —                    | `text-neutral-500`             | Paused e1RM, inactive           |
| Live indicator    | —                | —                    | `bg-emerald-500 animate-pulse` | Active session dot              |
| Brand pulse       | —                | —                    | `bg-blue-500 animate-pulse`    | Header indicator dot            |

---

## Motion & interaction

### `animate-fadeIn`

Define in `index.css`. Applied to every screen on tab switch.

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.15s ease-out forwards;
}
```

### Transitions

```
transition            on all interactive elements (colours, opacity)
transition-colors     on nav tabs and segmented controls
transition-all duration-300   on bar chart height changes
transition-transform  on toggle thumb
```

### Hover states

All interactive elements: `hover:bg-[#1a1a1a]` (one step lighter than surface) or `hover:text-neutral-300` for text links.

### Pulse animations

- `animate-pulse` on brand dot (header) — always
- `animate-pulse` on session active dot (nav) — while workout active
- `animate-pulse` on rest timer icon — while timer running
- `animate-pulse` on rest timer value — when countdown reaches 0

---

## Icon system

**Library:** `lucide-react` only. No other icon sets.

| Context                  | Size class          | Stroke      |
| ------------------------ | ------------------- | ----------- |
| Standard (cards, modals) | `h-4 w-4` (16px)    | default (2) |
| Small (badges, inline)   | `h-3 w-3` (12px)    | default     |
| Nav icons                | `h-[18px] w-[18px]` | default     |
| Destructive (trash)      | `h-4 w-4`           | default     |

**Colour pattern:**

```
text-neutral-500              default / inactive
text-neutral-400 → text-white hover: destructive
text-blue-500                 active nav tab
text-yellow-600               warning icon
text-red-500                  injury conflict icon
text-emerald-500              completion icon
```

**Icon + text alignment:**  
Always use `flex items-center space-x-2` or `space-x-1.5`. Do not use margin hacks.

---

## Voice & copy rules

These rules are non-negotiable. Any string added to the UI must pass this checklist.

### DO

- Plain English. Write the simplest accurate thing.
- Sentence case for body copy and descriptions.
- ALL CAPS for: labels, nav tabs, badge text, section meta headers, button text.
- Verb + noun for buttons: "Start session", "Save injury", "End session", "Log injury".
- Numbers prominent — large, mono, first.
- Be matter-of-fact about injury state: "Injury conflict. Flagged: posterior labrum."
- Empty states: factual, no pressure. "No sessions yet."

### DO NOT

- No exclamation marks. Ever.
- No sci-fi or system jargon: no "telemetry", "pathology", "biomechanical", "protocol", "directive", "buffer", "volatile", "reconstitution", "execute", "vector".
- No AI-coach language: no "Crush it", "You got this", "Beast mode", "Great work".
- No guilt mechanics: no "streak broken", "you missed a day", "don't give up".
- No overclaiming: no "optimised", "compliant", "protocol", "system".
- No passive voice for actions.

### Copy reference table

| Context          | ✓ Use                              | ✗ Avoid                                                 |
| ---------------- | ---------------------------------- | ------------------------------------------------------- |
| Start workout    | "Start session"                    | "Execute template", "Execute active protocol"           |
| Save session     | "Save session"                     | "Write telemetry", "Commit buffer"                      |
| Cancel           | "Cancel"                           | "Abandon"                                               |
| Injury field     | "Injury name"                      | "Pathology descriptor"                                  |
| Tags field       | "Affected movements"               | "Biomechanical tag interaction"                         |
| Severity         | "Avoid" / "Caution"                | "Strict load disengagement"                             |
| Submit injury    | "Save injury"                      | "Record directive"                                      |
| Injury conflict  | "Injury conflict"                  | "Critical system conflict", "Overload limiter arrested" |
| Substitute       | "Use this instead"                 | "Swap movement at slot N"                               |
| Template adapted | "Injury-adapted"                   | "Physio-shield compliant"                               |
| Tracking paused  | "Tracking paused"                  | "Overload limiter arrested"                             |
| Backup           | "Backup"                           | "Volatile reconstitution"                               |
| Nav: Home        | "HOME"                             | "TELEMETRY"                                             |
| Nav: Plans       | "PLANS"                            | "SEQUENCES"                                             |
| Nav: Session     | "SESSION"                          | "LOGGING"                                               |
| Nav: Progress    | "PROGRESS"                         | "DELTAS"                                                |
| Nav: Self        | "SELF"                             | "BIOLOGY"                                               |
| Rest timer done  | "Done — load next set"             | "Interval met"                                          |
| Pause timer      | "Pause"                            | "Hold"                                                  |
| Resume timer     | "Resume"                           | "Run"                                                   |
| No injuries      | "No injuries logged"               | "No pathological parameters on file"                    |
| Stepper label    | "Weight" / "Reps" / "Effort (RPE)" | "Weight config", "Repetitions", "Exertion profile"      |
| Adjust set       | "Adjust — set N"                   | "Focal stepper controllers", "Targeting set N"          |
| Settings section | "Settings"                         | "Hardware interface"                                    |
| Units setting    | "Units"                            | "Load metric deca"                                      |
| Rest setting     | "Default rest"                     | "Timer console trigger time"                            |
| RPE setting      | "Effort scale"                     | "Intensity capturer", "Exertion coefficient standard"   |

---

## Scrollbars

Hidden throughout:

```css
.scrollbar-none {
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
```

---

## Accessibility notes (future)

- All interactive elements should have `:focus-visible` outlines (currently absent — add in Sprint 5)
- Colour is not the only differentiator for status — badges use text labels too ✓
- Plate visualizer: add `aria-label` with weight description
- Modal: trap focus when open; close on Escape key
