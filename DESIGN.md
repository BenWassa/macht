# Design System

**Project:** Macht  
**Version:** 1.0  
**Stack:** React + Vite + TypeScript + Tailwind CSS (web prototype); NativeWind for Tier 2 native

---

## Aesthetic direction

Brutalist functional. Pure black backgrounds, off-white text, monospace type throughout, zero border radius, single accent color (blue). Information density is high. Decoration is zero. Numbers are the protagonist: large, bold, immediate. Labels are subdued: small, tracked, muted.

The look is disciplined. The copy is plain. These are not in tension — they reinforce each other.

---

## Colors

Color strategy: **Restrained.** Tinted near-black surfaces, one blue accent used only for primary actions and active states. Emerald for completion. Red and yellow exclusively for injury/conflict states.

### Surface palette

| Token | Value | Role |
|---|---|---|
| `--c-bg` | `#060606` | Page background |
| `--c-surface` | `#0c0c0c` | Cards, modals, headers |
| `--c-elevated` | `#121212` | Button backgrounds, inset controls |
| `--c-inset` | `#070707` | Nested panels (stepper inner) |
| `--c-empty` | `#080808` | Dashed empty state background |

### Border palette

| Token | Value | Role |
|---|---|---|
| `--c-border` | `#1a1a1a` | Standard card/section border |
| `--c-border-md` | `#222222` | Button borders, control borders |
| `--c-border-sm` | `#171717` | Inner/nested borders |
| `--c-border-hl` | `#2d2d2d` | Hover state border |

### Text palette

| Token | Value | Role |
|---|---|---|
| `--c-text-primary` | `#f0f0f0` | Body copy, values |
| `--c-text-high` | `#e5e5e5` | Headings (neutral-200) |
| `--c-text-mid` | `#d4d4d4` | Secondary values (neutral-300) |
| `--c-text-low` | `#a3a3a3` | Muted text (neutral-400) |
| `--c-text-muted` | `#737373` | Labels, timestamps (neutral-500) |
| `--c-text-faint` | `#525252` | Very subdued (neutral-600) |

### Accent: Blue (primary action, active state)

| Token | Value | Role |
|---|---|---|
| `--c-blue` | `#2563eb` | Primary button, active selection bg |
| `--c-blue-hover` | `#1d4ed8` | Hover state |
| `--c-blue-tint` | `rgba(37,99,235,0.15)` | Active set row background |
| `--c-blue-border` | `#1e3a8a` | Subtle blue border |
| `--c-blue-text` | `#60a5fa` | Active labels (blue-400) |
| `--c-blue-label` | `#3b82f6` | Session indicator (blue-500) |

### Accent: Emerald (completion, done state)

| Token | Value | Role |
|---|---|---|
| `--c-emerald` | `#059669` | Completed set bg |
| `--c-emerald-hover` | `#047857` | Hover |
| `--c-emerald-dot` | `#10b981` | Live session indicator dot |
| `--c-emerald-text` | `#34d399` | Delta values (emerald-400) |

### Accent: Red (injury / avoid)

| Token | Value | Role |
|---|---|---|
| `--c-red-bg` | `rgba(69,10,10,0.20)` | Injury conflict banner background |
| `--c-red-badge-bg` | `#450a0a` | Avoid badge background |
| `--c-red-border` | `#7f1d1d` | Avoid badge/banner border |
| `--c-red-text` | `#f87171` | Avoid text (red-400) |

### Accent: Yellow (caution severity)

| Token | Value | Role |
|---|---|---|
| `--c-yellow-bg` | `rgba(66,32,6,0.10)` | Warning banner background |
| `--c-yellow-badge` | `#422006` | Caution badge background |
| `--c-yellow-border` | `#713f12` | Caution border |
| `--c-yellow-accent` | `#854d0e` | Warning banner left accent (yellow-600 border) |
| `--c-yellow-text` | `#eab308` | Caution text (yellow-500) |

### Plate colors (barbell visualizer)

Fixed — match international plate color conventions.

| Weight (lbs) | Background | Text |
|---|---|---|
| 45 | `#dc2626` | `#fff` |
| 35 | `#2563eb` | `#fff` |
| 25 | `#ca8a04` | `#000` |
| 10 | `#16a34a` | `#fff` |
| 5 | `#737373` | `#fff` |
| 2.5 | `#3a3a3a` | `#a3a3a3` |

---

## Typography

**Rule: monospace everywhere, always.** No secondary font family. All copy — headings, labels, body, numbers — uses the same monospace stack. Hierarchy is achieved through size, weight, tracking, and color, not font switching.

```css
--font-mono: 'JetBrains Mono', 'Fira Mono', ui-monospace, 'Cascadia Code', monospace;
```

Tailwind config overrides both `mono` and `sans` to the same stack so utility classes are consistent.

### Type scale

| Role | Size | Weight | Tracking | Color | Case |
|---|---|---|---|---|---|
| Screen title | `text-xl` (20px) | `font-bold` | `tracking-tight` | `#f0f0f0` | UPPER |
| Card heading | `text-sm` (14px) | `font-bold` | `tracking-tight` | neutral-200 | UPPER |
| Body / value | `text-xs` (12px) | `font-bold` or default | — | neutral-300 | Mixed |
| Label | `text-[10px]` | `font-bold` | `tracking-wider` | neutral-400 | UPPER |
| Meta label | `text-[9px]` | `font-bold` | `tracking-widest` | neutral-500 | UPPER |
| Badge | `text-[8px]` | `font-bold` | `tracking-wider` | varies by status | UPPER |
| Stepper readout | `text-2xl` (24px) | `font-black` | `tracking-tight` | `#fff` | — |
| Nav label | `text-[8px]` | default | `tracking-widest` | active/inactive | UPPER |
| Brand header | `text-[11px]` | `font-extrabold` | `tracking-[0.28em]` | neutral-200 | UPPER |

### Tracking reference

| Value | Context |
|---|---|
| `tracking-[0.28em]` | Brand header only |
| `tracking-widest` | Meta labels, nav, badge text |
| `tracking-wider` | Section labels |
| `tracking-tight` | Headings |
| (none) | Body text, values |

---

## Spacing and layout

**Page container:** `max-w-2xl mx-auto px-4 py-6 pb-36`
`pb-36` accounts for fixed bottom nav (h-16) plus rest timer banner when visible.

| Context | Value |
|---|---|
| Between major sections | `space-y-8` |
| Within a section | `space-y-4` or `space-y-3` |
| Within a card | `p-4 space-y-4` or `p-5 space-y-4` |
| Inset panels | `p-3` |
| Modals | `p-6 space-y-4` |

**Border radius:** `rounded-none` everywhere. Zero exceptions, except toggle thumbs which use `rounded-full`.

**Dividers:**

| Pattern | Use |
|---|---|
| `border-b border-[#1a1a1a]` | Standard section divider |
| `divide-y divide-[#1a1a1a]` | List item dividers |
| `border border-dashed border-[#1a1a1a]` | Empty state outline |

---

## Components

### Card

```tsx
<div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 space-y-4">
```

### Inset panel

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

### Section label

```tsx
<h2 className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
  Section name
</h2>
```

### Inline label

```tsx
<span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block">
  Label
</span>
```

### Badges

```tsx
{/* Caution */}
<span className="text-[8px] bg-yellow-950 text-yellow-500 px-1 border border-yellow-900 font-mono tracking-wider">
  Adapted
</span>

{/* Avoid */}
<span className="text-[8px] bg-red-950 border border-red-900 text-red-400 px-1.5 font-mono uppercase font-bold">
  Avoid
</span>

{/* Injury-adapted template */}
<span className="text-[9px] border border-blue-500/50 text-blue-400 font-mono px-1.5 py-0.5 uppercase tracking-widest">
  Injury-adapted
</span>
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
<div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest px-1">
  Weight
</div>
<div className="flex items-center justify-between gap-2 pt-1.5">
  <button className="w-12 h-10 bg-[#121212] hover:bg-[#1a1a1a] text-neutral-400 font-mono text-xs border border-[#222] transition flex items-center justify-center">
    -10
  </button>
  <div className="flex-1 text-center">
    <span className="text-2xl font-mono font-black text-white tracking-tight">80</span>
    <span className="text-[10px] font-mono text-neutral-500 uppercase ml-1.5 font-bold">lbs</span>
  </div>
  <button className="w-12 h-10 bg-[#121212] hover:bg-[#1a1a1a] text-neutral-400 font-mono text-xs border border-[#222] transition flex items-center justify-center">
    +10
  </button>
</div>
```

### Toggle

```tsx
<button
  className={`w-10 h-5 rounded-full border transition-colors relative
    ${active ? 'bg-blue-600 border-blue-500' : 'bg-[#1a1a1a] border-[#333]'}`}
>
  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform
    ${active ? 'translate-x-5' : 'translate-x-0.5'}`} />
</button>
```

`rounded-full` is the one exception to the zero-radius rule: toggle thumbs only.

### Segmented control

```tsx
<div className="flex border border-[#1a1a1a] bg-black p-0.5 font-mono">
  <button className="px-3 py-1 text-xs bg-blue-600 text-white font-bold">LBS</button>
  <button className="px-3 py-1 text-xs text-neutral-500 hover:text-neutral-300">KGS</button>
</div>
```

### Selection states

**Active exercise card:**
```
bg-[#121212] border-blue-500 text-[#f0f0f0]
```
**Inactive:**
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

## Status and feedback colors

| State | Background | Border | Text | Use |
|---|---|---|---|---|
| Active / primary | `bg-blue-600` | `border-blue-500` | `text-white` | CTAs, active selections |
| Done / complete | `bg-emerald-600` | `border-emerald-500` | `text-white` | Completed sets, saved session |
| Injury / avoid | `bg-red-950` | `border-red-900` | `text-red-400` | Avoid badge, conflict banner |
| Caution / adapted | `bg-yellow-950` | `border-yellow-900` | `text-yellow-500` | Adapted badge, caution severity |
| Paused | — | — | `text-neutral-500` | Paused e1RM, inactive |
| Live indicator | — | — | `bg-emerald-500 animate-pulse` | Active session dot |
| Brand pulse | — | — | `bg-blue-500 animate-pulse` | Header indicator dot |

---

## Motion

### Screen transition

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.15s ease-out forwards;
}
```

Applied to every screen on tab switch.

### Transitions

| Class | Use |
|---|---|
| `transition` | All interactive elements (colors, opacity) |
| `transition-colors` | Nav tabs, segmented controls |
| `transition-all duration-300` | Bar chart height changes |
| `transition-transform` | Toggle thumb |

### Hover states

All interactive elements: `hover:bg-[#1a1a1a]` (one step lighter than surface) or `hover:text-neutral-300` for text links.

### Pulse animations

- Brand dot in header: always pulsing
- Session active dot in nav: while workout is active
- Rest timer icon: while timer is running
- Rest timer value: when countdown reaches zero

---

## Icons

**Library:** `lucide-react` only.

| Context | Size | Stroke |
|---|---|---|
| Standard (cards, modals) | `h-4 w-4` | default (2) |
| Small (badges, inline) | `h-3 w-3` | default |
| Nav icons | `h-[18px] w-[18px]` | default |
| Destructive (trash) | `h-4 w-4` | default |

**Color pattern:**

| Color | Use |
|---|---|
| `text-neutral-500` | Default / inactive |
| `text-neutral-400 → text-white` | Destructive hover |
| `text-blue-500` | Active nav tab |
| `text-yellow-600` | Warning icon |
| `text-red-500` | Injury conflict icon |
| `text-emerald-500` | Completion icon |

**Alignment:** Always `flex items-center space-x-2` or `space-x-1.5`. No margin hacks.

---

## Scrollbars

Hidden throughout:

```css
.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
```

---

## Voice and copy

### Rules

- Plain English. Write the simplest accurate thing.
- Sentence case for body copy and descriptions.
- ALL CAPS for: labels, nav tabs, badge text, section meta headers, button text.
- Verb + noun for buttons: "Start session", "Save injury", "End session".
- Numbers prominent: large, mono, first.
- Matter-of-fact about injury state: "Injury conflict. Flagged: posterior labrum."
- Empty states: factual, no pressure. "No sessions yet."

### Never

- No exclamation marks. Ever.
- No sci-fi jargon: "telemetry", "pathology", "biomechanical", "protocol", "directive", "buffer", "volatile", "reconstitution", "execute", "vector".
- No AI-coach language: "Crush it", "You got this", "Beast mode", "Great work".
- No guilt mechanics: "streak broken", "you missed a day", "don't give up".
- No overclaiming: "optimised", "compliant", "protocol", "system".
- No passive voice for actions.

### Copy reference

| Context | Use | Avoid |
|---|---|---|
| Start workout | "Start session" | "Execute template" |
| Save session | "Save session" | "Write telemetry" |
| Cancel | "Cancel" | "Abandon" |
| Injury field | "Injury name" | "Pathology descriptor" |
| Tags field | "Affected movements" | "Biomechanical tag interaction" |
| Severity | "Avoid" / "Caution" | "Strict load disengagement" |
| Submit injury | "Save injury" | "Record directive" |
| Injury conflict | "Injury conflict" | "Critical system conflict" |
| Substitute | "Use this instead" | "Swap movement at slot N" |
| Template adapted | "Injury-adapted" | "Physio-shield compliant" |
| Tracking paused | "Tracking paused" | "Overload limiter arrested" |
| Backup | "Backup" | "Volatile reconstitution" |
| Nav: Home | "HOME" | "TELEMETRY" |
| Nav: Plans | "PLANS" | "SEQUENCES" |
| Nav: Session | "SESSION" | "LOGGING" |
| Nav: Progress | "PROGRESS" | "DELTAS" |
| Nav: Self | "SELF" | "BIOLOGY" |
| Rest timer done | "Done — load next set" | "Interval met" |
| No injuries | "No injuries logged" | "No pathological parameters on file" |
| Settings section | "Settings" | "Hardware interface" |
| Units setting | "Units" | "Load metric deca" |
| Rest setting | "Default rest" | "Timer console trigger time" |
| RPE setting | "Effort scale" | "Intensity capturer" |

---

## Accessibility

WCAG target: AA (Sprint 5).

Known gaps (Sprint 4 and earlier):
- No `:focus-visible` outlines on interactive elements
- No focus trap in modals
- Plate visualizer lacks `aria-label`
- `prefers-reduced-motion` not yet respected

Color is never the sole differentiator for status: badges carry text labels alongside color. Modal: close on Escape key (pending).
