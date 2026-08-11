# Macht

Macht is a mobile-first, local-first training app for adaptive hypertrophy and strength programming.

Its core promise is simple: **open Macht, know what to train, know what to do this set, finish the session, and see what changed.**

## Product surfaces

- **Today** — the next planned session, weekly training rhythm, schedule repair, and recent performance signals.
- **Program** — 2–6 sessions per week, muscle priorities, exercise selection and substitutions, accumulation weeks, and deloads.
- **Session** — prescription-aware set logging with previous performance, rest timing, substitutions, optional recovery/stimulus feedback, haptics, and wake lock.
- **Progress** — exercise trends, records, muscle training exposure, weekly consistency, and mesocycle comparison.
- **You** — training constraints, settings, local backup/restore, and an explainable Personal Training Model.

## Adaptive programming

Macht keeps recommendation logic deterministic and testable outside React. Completed training can update the next occurrence of the same program slot through explainable rep, load, volume, effort, and deload decisions.

Personalization is evidence-gated. Repeated established fatigue evidence can conservatively hold a proposed volume increase; insufficient evidence leaves the deterministic recommendation unchanged. User overrides remain first-class.

## Local-first and offline

Macht is a Progressive Web App. Training data is stored on the device with Zustand persistence and core training flows do not require an account or server API. The production shell and local assets are cached by the service worker after installation.

Use **You → Settings and local data → Backup and restore** to export a versioned JSON backup. Current backups include programs, mesocycles, completed v2 workouts, progression decisions, constraints, settings, custom exercises, and retained legacy history. Legacy v1 backups remain importable.

Live beta: `https://BenWassa.github.io/macht/`

## Development

```bash
npm ci
npm run dev
npm test
npm run lint
npm run build
npm run size
```

The CI gate runs lint, the full Vitest suite, TypeScript/Vite build, the configured JavaScript bundle budget, and Lighthouse.

## Architecture

The rebooted domain is organized around:

`Program → Mesocycle → Week → Planned Session → Exercise Prescription → Set Prescription`

Execution snapshots the original prescription separately from actual performance. Progression decisions persist their evidence and deltas so recommendations remain auditable. Legacy records are retained for migration/history and are no longer the source of new v2 workouts.

Primary product documentation:

- `PRODUCT.md`
- `DESIGN.md`
- `docs/MACHT_PRD_v3.md`
- `docs/REBOOT_TODO.md`
