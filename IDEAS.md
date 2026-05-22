# Ideas

> Upgrade backlog. Tiered by effort, not priority. Every idea is evaluated against
> the same yardstick: does it reduce friction during a set, prevent a real mistake,
> or open a modality the tool currently lacks? If it does none of those, it doesn't
> belong here — strike it through, don't soften it.

Legend: **[F]** reduces friction · **[M]** prevents a mistake · **[N]** new modality
· **[Q]** raises quality of the tool itself (tests, perf, a11y).

---

## Tier 0 — Quick wins (under an hour each)

These are mostly missing platform primitives. None of them add product surface area.

- **[F] Wake lock during an active session.** `navigator.wakeLock.request('screen')` so the phone doesn't sleep mid-set. Release on session end / tab hidden.
- **[F] Haptic feedback on set complete.** `navigator.vibrate(15)` — single short pulse. Honor a Settings toggle.
- **[F] Audio cue at rest timer zero.** One short tone (Web Audio, generated, no asset). Settings toggle, default off — silence-first.
- **[M] Background-safe timers.** Rest timer and session clock should derive from `performance.now()` deltas, not `setInterval` ticks — currently they drift when the tab is backgrounded.
- **[Q] `prefers-reduced-motion` support.** Listed as a known gap in DESIGN.md §Accessibility. Disable `animate-fadeIn`, `animate-pulse`, and the bar chart `transition-all`.
- **[Q] `:focus-visible` outlines.** Same a11y gap. One global rule: `:focus-visible { outline: 2px solid var(--c-blue); outline-offset: 2px; }`. Matches the zero-radius look.
- **[Q] Modal Escape + focus trap.** FinishSessionModal and InjuryModal currently don't trap focus or close on Escape.
- **[Q] `aria-label` on PlateVisualizer.** Read out as "Loaded: 80 lb. 45 + 25 + 10 per side."
- **[F] Undo toast on set complete.** Tapping done is the most frequent action; a 4-second "Undid" toast is cheaper than re-tapping.
- **[F] "Repeat last set" affordance.** Most working sets within an exercise share weight × reps. One tap to clone the prior row.
- **[F] Long-press on stepper to scrub.** Hold +5 to ramp through 80 → 95 → 110 without rapid-fire taps.
- **[M] Plate-loadability check.** If the entered weight can't be built from current bar + plate inventory, surface a faint "—2.5" hint next to the value. Don't block, don't moralize.
- **[F] Persist `activeTab` and `selectedExIndex` to storage.** A mid-session reload currently throws you back to Workout/first exercise.
- **[Q] Lint rule banning forbidden vocabulary.** DESIGN.md §Voice lists banned words ("telemetry", "execute", "protocol"…). Cheap custom ESLint rule scanning JSX string children. Future regressions become impossible.
- **[Q] CI: bundle size budget.** Fail the build if main bundle exceeds, say, 90 KB gzipped. The brand promise is "no bloat" — enforce it.
- **[Q] CI: Lighthouse PWA + perf budget.** A red bar on a PR > a red bar at the gym.

## Tier 1 — Pragmatic features (a day to a week)

Each one closes a hole that currently forces the user to compensate manually.

- **[F] Inline trend on every set row.** The `last` field exists but is unused visually beyond the badge. Show `80×8 ↑` if today's reps/weight exceeded last session's matching set. Tiny arrow, neutral color — not celebratory.
- **[F] Auto-suggested next-set weight from RPE.** If the last completed set was RPE ≤ 7 and the prescribed weight was hit, faint-suggest +5 lb on the next. RPE ≥ 9 → faint-suggest hold. Suggestion is a tap to accept, never an auto-write.
- **[F] Set-type variants.** AMRAP, drop, cluster, top-set+backoff. Today the schema assumes uniform straight sets. Encode set type on `SetEntry` and render appropriately.
- **[F] RIR mode wiring.** `EffortMode` is in `domain/types.ts` but not consumed anywhere. Plumb through to RPE buttons.
- **[N] Custom exercises with tag classification.** The injury system is tag-driven. Today, custom exercises mean the conflict detector goes silent. Add a "tags" picker on add — reusing the existing tag vocabulary — so the system stays trustworthy.
- **[N] Template editor.** TemplatesScreen exists, but the default is hard-coded in `DEFAULT_TEMPLATE`. Persist a user-defined library and let `startTemplate` accept any of them.
- **[M] Deload weight propagation across exercises.** Today deload is per-exercise. Add a "session-wide deload %" so a flare-up day is a single decision.
- **[F] Bar weight selector.** 45 lb / 35 lb / 20 kg / 15 kg / fixed-machine. Plate math is wrong without it.
- **[F] Plate inventory per location.** Gym vs home, expressed as count-per-plate. Drives the loadability check above and the visualizer.
- **[N] Bodyweight log.** A single number per day, optional. Unlocks BW-relative strength on the Progress screen.
- **[N] DOTS / Wilks / IPF GL on the Progress screen.** A self-checked benchmark that doesn't moralize — just a number next to the e1RM that updates with bodyweight.
- **[N] Per-exercise history view.** Tap an exercise → see every set ever, weight × time, with PR markers. The data is in `exerciseSnapshots`; the view doesn't exist.
- **[Q] IndexedDB-backed history.** localStorage caps at ~5 MB. Five years of sessions will get there. Migrate with a versioned schema and a one-time backfill.
- **[Q] Versioned export/import.** Backup is plain JSON; add a `schemaVersion` field and a migrator. Future-self protection.
- **[N] CSV export.** For people who want to drop history into a spreadsheet without parsing JSON. Plain, no derived columns.
- **[N] Import from Strong / Hevy / Boostcamp.** Best onboarding ramp for the one user who built this — and the next ten if it ever leaves the dev's phone.
- **[F] Print-friendly session view.** A `@media print` stylesheet that renders today's session as a single black-on-white index-card layout. Paper fallback is a real disaster-recovery tool.
- **[Q] Test harness.** Vitest + React Testing Library on the stores at minimum. The domain logic (e1RM, plate math, injury conflicts) is the part that must not silently break.
- **[Q] Playwright e2e for "log a set in 3 seconds."** The PRD names this target. Measure it in CI; fail the PR if interaction-to-state-update regresses.
- **[Q] axe-core in Playwright.** Block PRs that introduce a11y regressions.

## Tier 2 — Substantial (multi-week, but earns its place)

- **[N] E1RM trend chart with PRs and "since last cleared" markers.** Sparkline currently exists; expand to a real per-lift line with annotations for first PR, last PR, last injury pause, last clearance. Honest history, not a leaderboard.
- **[N] Body-part weekly volume.** Tag exercises by muscle group; sum hard sets per week. Surface only as a small grid on Progress — no heatmap, no gradient. Numbers protagonists.
- **[N] Microcycle planner.** A four-week wave of intensity targets per lift. Plain text, plain numbers. The plan is a reference, not a script — the app never *insists*.
- **[M] Auto-substitution ranked by tag similarity.** Today, when an exercise is flagged, the alternative is hard-coded. Compute alternatives at runtime by tag overlap minus forbidden-tag intersection. Top three, ordered.
- **[M] Injury timeline view.** Date logged · severity · cleared date · sessions affected. A factual record. Useful for surgeon visits, return-to-training arguments with self.
- **[N] Rep tempo / eccentric cue.** Optional per-exercise tempo (e.g., "3-1-1"). On set start, an unobtrusive metronome — silent visual default. The bar pulses; no beep unless asked.
- **[N] Rest timer per exercise.** Squat rest ≠ curl rest. Per-exercise override of the global default.
- **[F] Multi-template days.** Push/pull/legs rotation; A/B variants. Today's `DEFAULT_TEMPLATE` is one shape. Encode an array, surface the next session on Home from a deterministic rotation.
- **[N] Companion CLI.** `macht log bench 225x8@8` from a terminal, syncs into the same IndexedDB via a tiny native helper or a paired browser tab. For the kind of user who logs from a desk between sets at home.
- **[N] Watch companion (Apple Watch / Wear OS).** A "set complete" tap from the wrist + rest timer mirror. The phone stays in the bag. This is the highest-leverage friction reduction available.
- **[N] BLE tactile button.** Pair an off-the-shelf BLE shutter button (AB Shutter, $4) and bind it to "mark current set complete." Bar-mounted, gloved-hands compatible. Web Bluetooth is one screen of code.
- **[N] Coach mode over WebRTC.** Two devices on the same LAN pair; the coach's device sees the live session and can tap RPE / leave a note. No server. The handshake is a QR code on screen.
- **[Q] Storybook of the design system.** Every component in DESIGN.md gets a story. Becomes the regression net for any future visual lint.
- **[Q] Visual regression tests.** Chromatic, Loki, or Playwright screenshot diffs. The aesthetic is the product; regressions are silent killers.
- **[Q] Local-only crash log viewer.** A Profile panel listing the last 20 client errors. Never sent anywhere. Useful for the dev, invisible to a normal user.

## Tier 3 — Moonshots (months / R&D / new shape of tool)

Each one of these would change what MACHT *is*. Most should not be built. Listing them clarifies the boundary.

- **[N] On-device velocity tracking via phone IMU.** Strap-on-bar mount + DeviceMotion API → approximate mean concentric velocity per rep. "Approx VBT" — useful even at ±5% accuracy. The hardware barrier is a $6 phone clamp. Open-source prior art exists (BarSense, Open Barbell).
- **[N] Computer-vision rep counter.** Phone propped on the rack, browser-side pose detection (TensorFlow.js MoveNet). Counts reps, segments concentric vs eccentric, estimates depth on squats. Runs entirely in-browser, no upload.
- **[N] Voice logging.** "Eight at two-twenty-five, RPE eight." A small on-device STT (Whisper.cpp via WASM, or browser-native `SpeechRecognition` in fallback) → parsed by a regex grammar → written to the active set. The 3-second target becomes a 1-second target.
- **[N] Local LLM coach.** WebGPU-resident model (e.g., MLC Llama or Qwen 3B) that can read the local injury log + recent sessions and answer plain-language questions: *"Given my shoulder is still 'caution,' is overhead press a bad call today?"* Critical constraint: zero network calls, ever. The "honest, not encouraging" voice in DESIGN.md is the system prompt.
- **[N] CRDT sync between user's own devices.** Yjs over a tiny relay (or WebRTC peer-to-peer over LAN). End-to-end encrypted with a key derived from a QR-shared seed. No account, no cloud, but the data follows you from phone to tablet to laptop.
- **[N] Signed lift attestations.** Each completed set is signed with a device-resident key. Export produces a cryptographically chained log a federation prep coach could verify. Sounds absurd until you imagine a powerlifter using it to prove training volume to a meet director or a skeptical online community.
- **[N] Travel mode + equipment-aware substitution.** Pick a destination → optionally a known commercial gym there → templates auto-adapt to that gym's equipment profile. (Anti-feature for the current single user; transformative if MACHT ever supports more than one person.)
- **[N] Audio-only "drive mode" for the gym floor.** Bone-conducting earbuds + voice in, audio out. "Set two ready. Eighty pounds, eight reps. Tap when done." Closes the loop without ever looking at the phone.
- **[N] VR overhead warmup pyramid.** Vision Pro / Quest 3 mode: warmup percentages float above the bar in front of you. Pure novelty unless someone you know actually trains with a headset on. Listed so it's been considered and dismissed.
- **[N] "Black box" archive.** Append-only cryptographic chain (hash-of-prior-set + signature) → a tamper-evident training journal. Years from now, you can prove you actually trained between dates X and Y. Useful for: insurance, return-from-injury legal/medical timelines, online records boards.
- **[N] Anti-streak feature.** Display longest *rest break* alongside longest training stretch. Doubles down on "no guilt mechanics" by making rest visible rather than invisible.
- **[N] Rust mode.** Opt-in 30-day enforced deload — UI desaturates entirely, session start is gated behind a confirmation. For when the user (this user) won't take a break otherwise.
- **[N] Programmable triggers.** "If e1RM on squat drops 5% over two weeks, log a 'check-in' note on the next session start." Local-only rules engine. The opposite of a notification — it just leaves a quiet receipt for future-you.
- **[N] Open-source the domain.** Extract the exercise + tag + injury-conflict taxonomy as a standalone package. The data model is the most reusable thing in the codebase, and contributing to it doesn't require touching the UI.

---

## Cross-cutting upgrades

### Performance & offline

- Hard offline parity: kill switch in dev tools that disables network — every screen must still work.
- Critical-path render under 50 ms on a mid-range Android. Measure with WebPageTest mobile profile in CI.
- Preact-compat as a build-time swap experiment. The Zustand-driven app is well within Preact's surface.
- Code-split per screen (HomeScreen / TemplatesScreen / ProgressScreen are mid-session-irrelevant) but keep WorkoutScreen + RestTimer in the entry chunk.
- Static subset the monospace font to ASCII + the handful of symbols the UI actually renders. Drops 200 KB.

### Data integrity

- Every state mutation writes through to storage before returning. Today, `set()` is in-memory; persistence happens via the store's persist middleware (verify it's enabled across all four stores).
- Conflict-free schema migrations. Every migration writes a backup of the pre-migration blob into a `macht.bak.<version>` key, kept for the last three versions.
- Manual "Restore from backup" path that doesn't require leaving the app — useful when a migration goes wrong on the user's phone and they can't reach the dev console.

### Developer experience

- A `make audit` task that runs: ESLint, tsc, Vitest, axe-core, bundle size check, and `eslint max-lines` enforcement. One command, one verdict.
- A `make seed-history` task that drops five years of plausible synthetic data into a dev build. Lets you stress-test the charts before there's real history.
- A `dev-panel` toggle in Profile that surfaces store contents (read-only) and a "clear all" with three-tap confirmation. Faster than DevTools mid-debugging.
- Replace `mockData.ts` with a single typed seed function called only when the history is empty *and* the dev panel is enabled.

### Voice & brand

- A custom subset of JetBrains Mono with one tightly-spaced numeric variant for stepper readouts. Numbers protagonist, even at the glyph level.
- A single, very brief confirmation tone (Web Audio, ~80 ms, ~440 Hz square attenuated). Off by default. One sound, never a fanfare.
- The literal printed index card. Pre-formatted PDF, one session per card, designed to be torn out of a notebook. The fallback when the phone dies at the gym.
- Reverse the optics on "Console" → "Strength log" hierarchy: brand promise is plain English. Audit screen titles for any drift toward the sci-fi register DESIGN.md bans.

---

## Strikethrough — considered and rejected

- ~~Streaks, badges, levels.~~ Violates §Design Principle 4.
- ~~Cloud sync with a managed account.~~ Violates §Design Principle 5. CRDT P2P is the only acceptable sync shape.
- ~~AI motivational copy or coach personality.~~ Violates §Brand Personality. The local LLM coach above is fine *only if* it answers in the same brutalist register — no encouragement, no second-person framing.
- ~~Social feed, follower counts.~~ The signed-attestation export is the right shape for sharing. A feed is not.
- ~~Color-coded difficulty / heatmap on Home.~~ Color is restrained by spec. Numbers are the protagonist.
- ~~Gradient backgrounds, "premium dark mode" styling.~~ Listed as an anti-reference in PRODUCT.md.

---

## How to use this file

Three rules:

1. An idea moves out of this file *only when it ships or is explicitly rejected here.* No silent abandonment.
2. Before promoting an idea to a branch, write the rejection case in one line. If the rejection is weak, the idea is weak — strike it instead.
3. Every tier-3 idea that proves out shrinks to a tier-2 implementation plan before any code is written. The moonshot section is for clarity about the shape of the tool, not a roadmap.
