# Product

## Register

product

## Users

One user: the person who built it. A strength athlete with a long training horizon and a history of injuries. Uses the app every session, often mid-lift, under time pressure. Needs to log a set in under three seconds and trust the data completely. Not evaluating the app — relying on it.

## Product Purpose

Macht is a local-first, injury-aware strength tracker built to be used for years, not shipped. It logs sets, tracks estimated 1RM over time, flags conflicts between active injuries and planned exercises, and measures consistency without guilt. It is a tool, not a product. Every feature earns its place by reducing friction or preventing a real mistake.

## Brand Personality

Disciplined. Honest. Spare.

The visual and copy register is brutalist functional: pure dark surfaces, monospace type throughout, zero decoration. Numbers are the protagonist. Labels are subdued. The interface does not perform enthusiasm or care — it records and reflects accurately.

## Anti-references

- Fitness apps that celebrate streaks, use flames, or shame missed sessions (Duolingo, early MyFitnessPal)
- AI-coach interfaces with motivational copy ("Crush it", "Great work", "Beast mode")
- Dashboard-heavy SaaS with metric grids, hero numbers, and gradient cards
- Any UI that looks like a "dark mode fitness app" by default — generic dark blue, glow effects, neon accents

## Design Principles

1. **Speed above comfort.** Every interaction is evaluated against a 3-second set-log target. If it slows the user down, it doesn't belong.
2. **Honesty, not encouragement.** The interface reflects reality: what was lifted, what's injured, what the trend is. No softening, no framing.
3. **Injury-aware by default.** Conflict detection, substitutions, and paused tracking are not features — they are the baseline state. The system knows about injuries before the user has to think about them.
4. **No guilt mechanics.** Consistency is measured, not moralized. Gaps caused by injury are noted, not penalized. There are no streaks to protect.
5. **Local-first, never trapped.** All data lives on the device, exportable as plain JSON at any time. No account required. No dependency on external services for core function.

## Accessibility & Inclusion

WCAG target: AA (Sprint 5). Current known gaps: no `:focus-visible` outlines on interactive elements, no focus trap in modals, plate visualizer lacks aria-label. Color is never the sole differentiator for status — badges carry text labels. Reduced motion: `prefers-reduced-motion` support planned alongside focus pass.
