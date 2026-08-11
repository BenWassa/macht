# Design System Accessibility Audit

Scope: Phase 4 design-system foundations only. Screen-level audits remain required as Today, Workout, Program, and Progress are rebuilt.

## Contrast

WCAG 2.2 AA target for normal text: 4.5:1.

Representative contrast ratios from the implemented tokens:

| Foreground | Background | Ratio | Result |
| --- | --- | ---: | --- |
| Primary text `#F3F1E9` | App background `#111210` | 16.61:1 | Pass |
| Secondary text `#B9B7AF` | App background `#111210` | 9.35:1 | Pass |
| Muted text `#96948D` | Surface 3 `#292A26` | 4.76:1 | Pass |
| Positive `#63C59C` | Positive soft `#17352B` | 6.33:1 | Pass |
| Caution `#D8AA52` | Caution soft `#382D18` | 6.29:1 | Pass |
| Negative `#E07171` | Negative soft `#3A1E1E` | 4.89:1 | Pass |
| Info `#7E9EE8` | Info soft `#1E2942` | 5.47:1 | Pass |
| Signal strong `#FF7958` | Signal soft `#3B211B` | 5.73:1 | Pass |

The first muted token candidate failed on Surface 3 and was raised to `#96948D` globally.

Disabled text intentionally uses a lower-emphasis token and should only appear on controls that are programmatically disabled.

## Focus and keyboard

- Global `:focus-visible` uses a 2px signal outline with 3px offset.
- Mouse/touch focus does not leave an unnecessary persistent outline.
- Forced-colors mode switches the focus outline to the system `Highlight` color.
- New UI primitives use native semantic controls rather than clickable `div` elements.

## Motion

- Motion durations are intentionally short: acknowledgement 120ms, entry 220ms, restrained celebration 520ms.
- `prefers-reduced-motion: reduce` collapses animation and transition duration globally.
- No essential state or meaning may depend on animation.

## Touch targets

- The shared `Button` primitive has a minimum height of 44px.
- Workout-specific controls should target at least 44×44px and may be larger for set completion / numeric entry.

## State semantics

- Color is paired with text labels or descriptive copy.
- Semantic tones are centralized: neutral, positive, caution, negative, info, signal.
- `StatePanel` supports `aria-live` for states that genuinely need announcement; default is off to avoid noisy screen-reader output.
- PR/success treatments remain brief and do not block workout execution.

## Numeric readability

- Metric values use tabular lining numerals.
- Units remain text, rather than being encoded only through position or color.
- Large numbers are reserved for values with clear labels/context.

## Remaining screen-level checks

When each major surface is rebuilt, verify:

1. heading hierarchy and landmarks;
2. accessible names for icon-only controls;
3. logical focus order and modal focus trapping;
4. 200% text zoom and narrow-width reflow;
5. touch-target spacing during active workouts;
6. chart alternatives / accessible summaries;
7. status announcements only where useful;
8. color contrast against the actual composed surface used by the screen.
