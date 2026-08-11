# MACHT — Adaptive Training

MACHT is a mobile-first, local-first strength and hypertrophy training PWA. It turns a Program into mesocycle prescriptions, makes workouts fast to execute, records actual performance separately from planned targets, and adapts future prescriptions from training evidence.

**Live app:** https://BenWassa.github.io/macht/

## Product loop

1. Build or edit a Program with weekly frequency, muscle priorities, exercises, rep ranges, effort targets, rest, and substitution rules.
2. Start a generated training cycle from **Program**.
3. Open **Today** to see the next planned session and recover missed scheduling without losing session order.
4. Execute the prescription in **Workout**, logging load, reps, effort, and optional recovery/stimulus/workload feedback.
5. MACHT evaluates the completed session and applies a conservative, explainable next-prescription decision.
6. **Progress** shows exercise trends, training exposure, records, cycle response, and adaptive decision history.
7. **You** shows generic training constraints, settings/data tools, and the evidence behind the Personal Training Model.

## Adaptive behavior

The deterministic engine can maintain, add a rep, add load, add/remove a set, or apply a deload based on the current prescription, completed performance, effort, recovery, stimulus, session workload, time budget, and cycle phase.

Personalization is deliberately conservative. It only changes a deterministic recommendation after repeated evidence reaches an established threshold. The current personal-model intervention can hold a proposed set increase when repeated fatigue evidence has appeared at that exposure. The base recommendation and evidence remain stored for auditability.

## Data and privacy

- No account is required.
- Training data is stored locally in the browser/PWA.
- v2 backups include workouts, Programs/mesocycles, adaptive decisions, training constraints, settings, custom exercises, and legacy history.
- Existing v1 backups remain importable; legacy injury entries are translated into generic training constraints.
- Legacy workout history remains readable alongside v2 workouts without double-counting matching session IDs.

Because local browser storage can be cleared by the browser or device, export a backup periodically if the data matters to you.

## PWA / offline use

After the first successful load, the production app is installable and service-worker cached for offline use. On iOS, use Safari’s **Add to Home Screen** action. On Android/desktop Chromium browsers, use the browser’s install action when available.

## Stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS 4
- Zustand
- Framer Motion
- vite-plugin-pwa / Workbox
- Vitest

## Development

```bash
npm ci
npm run dev
```

Validation commands:

```bash
npm run lint
npm test
npm run build
npm run bundle-size
```

Pull requests run lint, tests, TypeScript/build, the bundle-size budget, and Lighthouse in CI.

## Product documentation

- `PRODUCT.md` — product contract
- `DESIGN.md` — visual and interaction system
- `docs/MACHT_PRD_v3.md` — current product requirements
- `docs/MACHT_PRODUCT_REBOOT_PLAN.md` — reboot implementation plan
- `docs/REBOOT_TODO.md` — execution tracker
