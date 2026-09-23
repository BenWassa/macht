# Audit 05 — Backup, Export, and Disaster Recovery

**Audit date:** 2026-09-23  
**Repository audited:** `BenWassa/macht`  
**Baseline:** `main` at `4472f0131c996599af502de618a5ee6b9dab3acc`  
**Report branch:** `audit/05-backup-export-disaster-recovery`  
**Firebase changes:** None  
**Deployment actions:** None

## Scope note

The requested brief, `docs/beta-audits/05-backup-export-disaster-recovery.md`, is not present in the pushed `main` branch or any currently visible Macht branch. It was also not available through the attached Project/Library file surfaces. I therefore could not verify the audit against that document's exact checklist.

This report executes the backup/export/disaster-recovery audit against the repository's current product contract, persistence code, migration code, beta requirements, and current Firestore disaster-recovery capabilities. The missing brief is an audit-evidence limitation and should be reconciled when the local worktree containing the audit pack is available.

## Executive conclusion

**Current status: NOT READY for beta if durable user data is expected to survive device/browser loss, destructive imports, or future cloud cutover.**

Macht has several useful foundations:

- local persistence exists for all current Zustand stores;
- active workout state survives reloads;
- a user can manually export and import a JSON backup;
- a typed v2 data envelope exists;
- a v1 → v2 migration is covered by focused unit tests;
- the migration returns the legacy input as a rollback archive.

However, those foundations are not yet connected into one durable recovery system.

The current user-visible JSON backup is a legacy v1 structure that omits persisted program/mesocycle state and the active workout. The v2 data schema and migration are not wired into the import/export path. The documented rolling local snapshot mechanism is not actually populated. Imports are only shallowly validated and are applied through multiple independent writes with no pre-import rollback. The destructive “Clear all data” action does not clear all persisted user data. There is no remote copy, automated backup, point-in-time recovery, or tested disaster-recovery runbook.

The highest-priority work is therefore **not** enabling Firebase backup settings first. The application must first define one canonical durable-data contract and prove lossless local export/import/rollback. After Firestore becomes the production persistence layer, enable Firestore PITR/scheduled backups and perform a restore drill before calling cloud persistence beta-safe.

---

## 1. Current persistence inventory

| Data surface | Current storage | Included in manual JSON export? | Included in current import? | Recovery status |
| --- | --- | ---: | ---: | --- |
| Completed session history | `macht_history` localStorage | Yes | Yes | Manual file only |
| History `snapshots` array | `macht_history` localStorage | No | No | Effectively unused |
| Injuries / constraints | `macht_injuries` localStorage | Yes | Yes | Manual file only |
| Settings | `macht_settings` localStorage | Yes | Yes | Manual file only |
| Custom exercises | `macht_custom_exercises` localStorage | Yes | Yes | Manual file only |
| Programs | `macht_program_v2` localStorage | **No** | **No** | No user backup path |
| Mesocycles | `macht_program_v2` localStorage | **No** | **No** | No user backup path |
| Active program ID | `macht_program_v2` localStorage | **No** | **No** | No user backup path |
| In-progress workout | `macht_workout` localStorage | **No** | **No** | Survives reload only |
| UI preferences/state | `macht_ui` localStorage | No | No | Re-creatable; low criticality |
| v2 workouts / recovery / progression decision records | Typed in `src/data/schema/v2.ts` | **Not wired** | **Not wired** | Schema-only today |
| Cloud copy | None | N/A | N/A | None |

### Important mismatch

The product contract says:

- “Raw user history remains exportable.”
- “Stored data uses explicit schema versions and migrations.”
- “Historical records are never silently rewritten.”
- “Active workout state persists across accidental reload/relaunch.”

The first three promises are only partially satisfied by the live backup path. The application has explicit v2 schema/migration code, but the profile backup UI still uses the legacy `MachtBackup` type declared inside `useHistoryStore.ts`.

---

## 2. Findings

### DR-01 — P0 — Manual export is not a complete restorable copy

**Evidence**

`src/screens/profile/BackupPanel.tsx` calls `useHistoryStore.createBackup()` with:

- session history;
- injuries;
- settings;
- custom exercises.

`src/state/useProgramStore.ts` separately persists:

- programs;
- mesocycles;
- active program ID.

`src/state/useWorkoutStore.ts` separately persists the active workout.

Neither store is represented by `MachtBackup`.

**Impact**

A user can reasonably believe “Backup” means “I can restore Macht.” It currently means “I can restore an older subset of Macht.” A restore after browser reset or device loss can therefore silently lose the training plan and current session state even when the user has a recent backup.

**Required action**

Define one canonical export envelope that contains every durable domain record required to rebuild the app. Explicitly classify each persisted key as:

1. durable/user-owned and included;
2. transient/recomputable and intentionally excluded;
3. sensitive/derived and included only by policy.

Programs and mesocycles are unambiguously durable and must be included.

---

### DR-02 — P0 — The v2 schema and the live backup/import path are disconnected

**Evidence**

`src/data/schema/v2.ts` defines `MachtDataV2` with:

- settings;
- programs;
- mesocycles;
- workouts;
- optional active workout;
- recovery observations;
- progression decisions;
- migration history.

`src/data/schema/migrations.ts` converts legacy v1 history into that structure.

Repository search shows `MachtDataV2`, `MACHT_DATA_SCHEMA_VERSION`, and `migrateBackupV1ToV2` are used only by the schema/migration modules and migration tests. `BackupPanel.tsx` does not call the migration.

**Impact**

There are two notions of “the data model”:

- the live v1 backup contract;
- the newer v2 canonical model.

That split is a migration hazard. New features can persist data that exports never see, while older backup files can bypass the migration code that was written to protect history.

**Required action**

Make one module responsible for:

`parse → validate → identify version → migrate to current → validate current → stage restore`.

UI code should never cast a parsed JSON object directly to a store type.

---

### DR-03 — P0 — Import validation is shallow and cannot guarantee safe restore

**Evidence**

The current import accepts a file when:

- `history` is an array;
- `injuries` is an array;
- `settings` is truthy.

It does not validate:

- `version`;
- required fields inside records;
- IDs;
- dates/timestamps;
- numeric ranges;
- enum values;
- duplicate identities;
- referential integrity;
- schema compatibility;
- whether the file is from a newer unsupported Macht version.

Several casts then force the parsed object into TypeScript types.

**Impact**

Malformed but syntactically valid JSON can be written into stores. A backup from a future incompatible version could also be partially accepted instead of being rejected safely.

**Required action**

Use a runtime validator for each supported export version. The validator may be explicit TypeScript code or a schema library, but it must run before any persistent write.

Unknown **newer** versions must fail closed with a useful message and zero state mutation.

---

### DR-04 — P0 — Restore is non-atomic and has no pre-import rollback snapshot

**Evidence**

After one confirmation, `BackupPanel.tsx` calls four independent hydration functions in sequence:

1. history;
2. injuries;
3. settings;
4. custom exercises.

There is no durable pre-import snapshot and no commit/rollback boundary.

The v1 → v2 migration function returns `rollbackArchive: backup`, but that value is not persisted or integrated with import.

**Impact**

A storage exception, quota failure, browser interruption, or future validation/hydration failure during restore can leave a mixed old/new state. The app also cannot offer a one-click rollback after a bad import.

**Required action**

Before destructive import or migration:

1. build and validate the current canonical snapshot;
2. persist it under a dedicated rollback key/store;
3. stage the incoming data in memory;
4. validate the fully migrated current model;
5. replace durable state;
6. re-read and verify counts/identities;
7. only then mark the restore complete.

Keep at least the most recent pre-import and pre-migration rollback snapshots until the next successful backup cycle.

---

### DR-05 — P0 — Documented automatic snapshots are not actually created

**Evidence**

The Sprint 4 commission requires:

> “Snapshot auto-triggered on `addSession` (in-memory rolling log, last 30).”

`useHistoryStore` initializes `snapshots: []`. On `addSession`, it executes:

`snapshots: state.snapshots.slice(0, 29)`

It never prepends or appends a new snapshot.

No other code writes to `snapshots`.

**Impact**

The code and project documentation imply a local recovery layer that does not exist. Accidental session deletion/corruption has no rolling snapshot recovery path.

**Required action**

Either implement a real bounded local snapshot strategy or remove the misleading field/documentation. A durable IndexedDB rollback store is preferable to embedding full copies inside the same localStorage blob.

---

### DR-06 — P0 — “Clear all data” is not actually clear-all

**Evidence**

`src/screens/profile/DangerZone.tsx` clears only:

- sessions;
- injuries.

It leaves:

- settings;
- custom exercises;
- programs;
- mesocycles;
- active program;
- active workout;
- UI state.

The confirmation copy says “Permanently delete all sessions and injuries,” while the control label says “Clear all data.”

**Impact**

This creates two risks:

1. users cannot reliably wipe their data;
2. a QA “wipe → import → compare” test can pass while stale omitted stores remain in the browser.

It will become more serious when cloud sync exists because deletion semantics must distinguish local reset, account data deletion, and sign-out.

**Required action**

Define explicit destructive actions with exact scope, for example:

- “Clear workout history”;
- “Reset local app state”;
- future “Delete cloud account data.”

Each action needs coverage and should offer/export a pre-delete backup where appropriate.

---

### DR-07 — P1 — localStorage is currently the only durable copy

**Evidence**

The README states that all data is saved locally. Repository search finds no Firebase/Firestore runtime, IndexedDB persistence, `navigator.storage.persist()`, or other remote persistence.

**Impact**

The following events can cause permanent loss unless the user happened to export a current JSON file:

- browser/site-data clearing;
- PWA removal with storage cleanup;
- device loss/damage;
- browser profile corruption;
- storage eviction;
- moving to a new device.

Manual export is an ownership feature, not a sufficient disaster-recovery strategy.

**Required action**

Preserve offline-first writes, but add a durable cloud copy once authentication/Firestore are implemented. Manual JSON export must remain available as the user-controlled escape hatch.

---

### DR-08 — P1 — Export metadata is too weak for long-lived recovery

**Evidence**

The current envelope has:

- `version: 1`;
- `exportedAt` as a date;
- data fields.

The filename is `macht_backup_YYYY-MM-DD.json`.

It does not include:

- app version/build;
- precise timestamp;
- export format identifier;
- backup ID;
- record counts;
- integrity/checksum metadata;
- migration provenance beyond the separate unused v2 structure.

**Impact**

Multiple backups from the same day are ambiguous. Support/debugging cannot readily determine which app build produced a file, and restore verification has little metadata to compare.

**Required action**

A future envelope should include at least:

- `format: "macht-backup"`;
- `schemaVersion`;
- `appVersion`;
- RFC 3339 `exportedAt`;
- unique `backupId`;
- record counts;
- optional integrity hash over a canonical payload.

Do not treat a checksum as encryption or authentication.

---

### DR-09 — P1 — User exports are plaintext and may contain health-adjacent data

**Evidence**

The backup is plain JSON and includes injury records. Future v2 records include recovery observations and progression evidence.

**Impact**

A downloaded backup can be read by anyone with filesystem/cloud-drive access to that file. This is not necessarily unacceptable for a personal app, but it should be intentional and documented before the export grows to include richer health/recovery data.

**Required action**

For beta:

- keep export simple and portable;
- label it as containing personal training data;
- avoid automatically uploading user exports to third parties;
- if encrypted portable backups are later added, version the format and retain a clear recovery-key story.

Firestore security is a separate requirement from backup-file privacy.

---

### DR-10 — P0 — Recovery behavior lacks end-to-end tests

**Evidence**

There are focused migration tests in `src/data/schema/migrations.test.ts`, including preservation of historical training details and the rollback object.

Repository search finds no test for `BackupPanel`, import confirmation, malformed backup handling beyond UI code, complete export coverage, destructive reset, or export→wipe→import round trip.

**Impact**

The app's highest-consequence data path is largely unprotected by regression tests.

**Required action**

Add automated tests that operate on the canonical persistence service rather than only React UI:

- current schema export/import round trip;
- v1 migration → current round trip;
- every durable collection included;
- unknown future version rejected;
- malformed nested records rejected;
- pre-import snapshot created;
- simulated write failure rolls back;
- stale local records do not survive a replace restore;
- active workout policy is explicit and tested;
- deletion scopes are exact.

---

### DR-11 — P1 — Firestore disaster recovery is not yet configured

**Evidence**

Macht currently contains no Firebase configuration or Firestore runtime code. Per this audit's constraint, no Firebase settings were changed.

**Impact**

Once Firestore becomes authoritative, cloud persistence by itself will not protect against application-level corruption or accidental deletion. A bad client can synchronize bad writes very efficiently.

**Required action after Firestore cutover is ready**

Use Firestore's native recovery features deliberately:

- **Point-in-time recovery (PITR):** up to seven days, minute-level recovery points.
- **Scheduled backups:** daily/weekly schedules, retention up to 14 weeks; requires Blaze.
- **Managed export to Cloud Storage:** suitable for longer retention/archival where needed.
- **Restore drill:** restore into a separate database first; verify record counts and representative records before any production rerouting.

Do not make an in-place destructive restore the normal first response. Firebase's current documentation warns that the source database must be deleted for the same-name restore workflow, and offline clients can later flush cached writes into a restored database.

---

### DR-12 — P1 — No documented recovery ownership or runbook

**Evidence**

The repo documents beta behavior and migration design, but there is no operational runbook for:

- accidental deletion;
- bad migration;
- bad release that corrupts records;
- lost device;
- Firestore restore;
- deciding whether local or cloud state wins after recovery;
- verifying a successful restore.

**Impact**

Recovery under pressure becomes improvisation, which increases the chance of secondary data loss.

**Required action**

Add a short version-controlled runbook before cloud beta. See the proposed runbook in this report.

---

## 3. Disaster scenarios

| Scenario | Current protection | Current recovery | Gap |
| --- | --- | --- | --- |
| Browser refresh/crash during workout | Persisted `macht_workout` | Automatic reload | Good for same browser; not exported |
| Accidental deletion of a session | None beyond manual prior export | Re-import whole old backup | Coarse; can overwrite newer data |
| Bad import | Confirmation only | None | No pre-import rollback |
| Bad schema migration | Unit-tested transform returns old object | No runtime rollback wiring | Rollback is not durable |
| Clear browser/site storage | Manual JSON only | User finds/imports file | High loss risk |
| Device lost/replaced | Manual JSON only | User transfers/imports file | High loss risk |
| Corrupt app release writes bad local data | Source-code rollback only | Manual backup if available | No data PITR |
| Firestore accidental delete (future) | Not configured | None today | Add PITR/backups |
| Firestore app-level corruption (future) | Not configured | None today | Add PITR + restore runbook |
| Regional infrastructure outage (future) | Firestore managed replication when adopted | Service-level | Choose region/multi-region based on product needs |
| Account/UID mistake (future) | Not designed | Not designed | Need identity-safe ownership/export path |

---

## 4. Required target data architecture

### 4.1 One canonical durable model

Introduce one current schema module that represents **all user-owned durable data**. The exact next version number can be decided during implementation; do not create another parallel “backup type” in a store.

Conceptually:

```text
MachtBackupEnvelope
  format
  schemaVersion
  appVersion
  backupId
  exportedAt
  payload
    settings
    customExercises
    constraints/injuries
    programs
    mesocycles
    completedWorkouts
    activeWorkout?        # policy decision, but explicit
    recoveryObservations
    progressionDecisions
    migrationHistory
```

UI/navigation state should normally remain excluded because it is recomputable and not user-owned history.

### 4.2 Persistence service boundary

React screens should not assemble backups by reaching into several stores.

Create a persistence/backup service with responsibilities such as:

- `readCanonicalData()`;
- `validateBackup(raw)`;
- `migrateToCurrent(validated)`;
- `createExport()`;
- `createRollbackSnapshot(reason)`;
- `replaceAllData(staged)`;
- `verifyRestore(expectedManifest)`.

This boundary will also make the later local + Firestore dual-write/sync architecture much safer.

### 4.3 Offline-first remains non-negotiable

Cloud persistence must not put a network request in the set-completion critical path.

Recommended behavioral contract:

1. write locally first;
2. acknowledge the workout interaction;
3. enqueue/synchronize cloud mutation;
4. expose sync health separately;
5. never discard a newer local record simply because the network is unavailable.

The backup system should preserve raw records so derived metrics can be rebuilt.

---

## 5. Firestore disaster-recovery plan — design only, no configuration change

Current official Firebase documentation supports the following capabilities for Firestore Standard and Enterprise editions:

### PITR

Firestore PITR can retain document versions for up to seven days and supports recovery points at one-minute granularity.

**Recommended use:** first-line recovery from recent accidental deletion/corruption once Firestore is authoritative.

### Scheduled backups

Firestore supports daily and weekly backup schedules with configurable retention up to 14 weeks. Scheduled backups require the Firebase Blaze plan.

**Recommended baseline for Macht once cloud beta is enabled:**

- daily backup with short/medium retention;
- weekly backup with longer retention;
- exact retention chosen from actual cost/data-volume observations.

For a single-user training app, cost should be measured rather than guessed, but the data volume is expected to be modest.

### Managed exports

Firestore managed export copies data to Cloud Storage and is appropriate for longer-lived archives or migration workflows. Exports incur Firestore document reads.

**Recommended use:** optional longer-retention archive after the basic PITR + scheduled-backup controls are working. Do not build a complex export scheduler before the app has a tested restore path.

### Restore safety

Prefer this recovery sequence:

1. freeze or disable mutating clients if practical;
2. determine the corruption/deletion window;
3. choose PITR or backup;
4. restore/clone to a separate recovery database where possible;
5. validate counts, ownership, representative workouts/programs, and index behavior;
6. reconcile offline clients;
7. only then redirect production or surgically copy corrected data.

A same-name/in-place restore should be a last-resort documented procedure because it is destructive and has offline-cache hazards.

---

## 6. Proposed recovery objectives

These are product targets, not Firebase service guarantees.

| Data class | Proposed RPO | Proposed RTO | Rationale |
| --- | --- | --- | --- |
| Active workout on same device | ~0 after local mutation | Immediate reload | Core offline promise |
| Completed workouts synced to cloud | ≤ 5 minutes in normal connectivity | ≤ 30 minutes for recent logical recovery | High-value long-term history |
| Programs/mesocycles | ≤ 5 minutes in normal connectivity | ≤ 30 minutes | Required to continue training coherently |
| Full database disaster restore | Daily backup/PITR coverage | Same working session where practical | Small single-user product; manual DR acceptable at beta |
| User portable export | On demand | Immediate download/import | Ownership/exit path |

Before beta, choose final targets and turn them into observable acceptance tests.

---

## 7. Restore runbook to add before cloud beta

### A. User-level bad import/migration

1. Stop further persistence/sync.
2. Preserve the current corrupted state for debugging.
3. Load the pre-operation rollback snapshot.
4. Validate it against the current schema.
5. Restore locally.
6. Verify record counts and representative IDs.
7. Resume sync only after deciding which revision is authoritative.
8. Record the incident and add a regression fixture.

### B. Lost device / new device

1. Authenticate the same account.
2. Hydrate cloud canonical data.
3. If cloud data is unavailable, offer JSON import.
4. Never merge two complete snapshots by array concatenation.
5. Reconcile by stable record IDs/revisions.
6. Confirm the number/date range of recovered workouts to the user.

### C. Accidental Firestore deletion/corruption

1. Stop the writer that caused the damage.
2. Capture incident time/window.
3. Use PITR for recent surgical recovery where possible.
4. Otherwise restore the appropriate scheduled backup to a recovery database.
5. Validate before production use.
6. Reconcile offline clients so stale queued writes cannot reintroduce corruption.
7. Run a post-incident export and test.

### D. Bad application release

1. Roll back the application release.
2. Determine whether the release changed stored data.
3. If no stored data changed, no database restore.
4. If data changed, identify affected records/time window.
5. Prefer surgical PITR recovery to full-database replacement.
6. Add the corrupting case to migration/persistence tests.

---

## 8. Beta release gates

### Gate A — Canonical export completeness — **BLOCKING**

A generated backup must contain every durable user-owned data class.

Test with non-empty:

- settings;
- custom exercises;
- programs;
- mesocycles;
- completed workouts/history;
- constraints/injuries;
- progression/recovery records that currently exist;
- active workout according to the chosen policy.

The test must fail if a new persisted store/domain is added without export classification.

### Gate B — Lossless round trip — **BLOCKING**

`seed → export → wipe all durable state → import → canonicalize → deep compare`

Allow differences only for explicitly regenerated metadata such as import timestamps.

### Gate C — Legacy migration — **BLOCKING**

Realistic v1 fixtures must migrate to current schema while preserving:

- workout identity;
- dates;
- exercise identities;
- completed set load/reps;
- effort;
- notes;
- duration where parseable;
- all legacy fields intentionally retained.

Migration warnings must be surfaced and never silently ignored.

### Gate D — Transactional restore/rollback — **BLOCKING**

Simulate a write failure during replacement. Original data must remain recoverable from a durable pre-import snapshot.

### Gate E — Malformed/future backup rejection — **BLOCKING**

No writes may occur when:

- JSON is invalid;
- nested schema is invalid;
- required IDs are missing;
- a future unsupported schema version is supplied;
- referential invariants fail.

### Gate F — Destructive action semantics — **BLOCKING**

“Clear all”/reset behavior must have an exact documented scope and automated coverage. A complete wipe test cannot leave hidden program/workout records behind.

### Gate G — Cloud recovery controls — **BLOCKING before Firestore beta**

Once Firestore is configured:

- PITR decision recorded and enabled if selected;
- scheduled backup policy recorded and enabled if selected;
- IAM access to backups/restores restricted;
- one real restore drill completed into a non-production database;
- restored counts and representative records verified;
- procedure documented with evidence/date.

### Gate H — User export remains independent of Firebase — **BLOCKING**

The user must be able to obtain a portable backup without depending on a functioning Firestore backend.

---

## 9. Recommended implementation order

### P0 — before Firebase cutover

1. **Unify backup schema and runtime persistence.**
   - Remove duplicate live `MachtBackup` ownership from the history store.
   - Make current schema the only export/import contract.

2. **Complete export coverage.**
   - Programs/mesocycles.
   - New workout model.
   - Recovery/progression records.
   - Decide active-workout inclusion explicitly.

3. **Implement runtime validation and version dispatch.**

4. **Implement staged restore + durable rollback snapshot.**

5. **Fix/delete the non-functional `snapshots` mechanism.**

6. **Fix destructive reset semantics.**

7. **Add end-to-end persistence tests and release gates.**

### P1 — with Firestore persistence implementation

8. Add user-scoped canonical Firestore persistence without sacrificing offline writes.

9. Add explicit sync metadata/conflict policy.

10. Enable PITR/scheduled backups according to the recorded DR policy.

11. Perform and document a restore drill.

### P2 — after cloud beta is stable

12. Add longer-retention managed exports if actual retention requirements justify them.

13. Consider CSV or another analysis-friendly export in addition to JSON. CSV is portability, not restore.

14. Consider encrypted portable backup only if the added recovery-key burden is justified.

---

## 10. What should not be done yet

Consistent with the requested constraint, this audit did **not**:

- add Firebase SDK dependencies;
- create or edit `firebase.json`;
- create or edit Firestore rules/indexes;
- enable Authentication;
- enable Firestore;
- enable PITR;
- create backup schedules;
- create Cloud Storage buckets;
- deploy anything;
- change application persistence behavior.

The next code task should be the **canonical local backup/restore boundary and tests**, not Firebase console configuration.

---

## 11. Evidence inspected

Primary repository evidence:

- `README.md`
- `PRODUCT.md`
- `IDEAS.md`
- `package.json`
- `docs/MACHT_Sprint_Commission.md`
- `docs/REBOOT_TODO.md`
- `src/screens/profile/BackupPanel.tsx`
- `src/screens/profile/DangerZone.tsx`
- `src/state/useHistoryStore.ts`
- `src/state/useSettingsStore.ts`
- `src/state/useInjuryStore.ts`
- `src/state/useCustomExerciseStore.ts`
- `src/state/useProgramStore.ts`
- `src/state/useWorkoutStore.ts`
- `src/state/useUiStore.ts`
- `src/data/schema/v1.ts`
- `src/data/schema/v2.ts`
- `src/data/schema/migrations.ts`
- `src/data/schema/migrations.test.ts`
- `src/lib/demoMode.ts`
- repository-wide searches for persistence keys, backup/import usage, schema usage, Firebase/Firestore, IndexedDB, browser persistent-storage APIs, and backup tests.

### Validation limitation

No repository checkout was mounted in this execution environment, so I could not run `npm test`, `npm run build`, or browser storage fault-injection locally. Existing test source and repository code were inspected directly. Do not treat this report as evidence that the current test suite was executed during this audit.

---

## 12. External technical references

Official Firebase / Google Cloud documentation checked on 2026-09-23:

- Firestore disaster recovery planning: https://firebase.google.com/docs/firestore/disaster-recovery
- Firestore scheduled backups and restore: https://firebase.google.com/docs/firestore/backups
- Firestore point-in-time recovery: https://firebase.google.com/docs/firestore/use-pitr
- Firestore managed export/import: https://firebase.google.com/docs/firestore/manage-data/export-import
- Firestore in-place restore considerations: https://firebase.google.com/docs/firestore/restore-in-place

Key current platform facts used in this report:

- scheduled Firestore backups support daily/weekly schedules and up to 14 weeks retention;
- scheduled backups require the Blaze pricing plan;
- PITR supports recovery points up to seven days in the past at minute granularity;
- managed exports can be retained in Cloud Storage for longer archival needs;
- Firestore recommends backups/PITR for application-level data disasters in addition to infrastructure replication.

---

## Final audit disposition

**Backup/export/disaster recovery: RED / blocking for durable-data beta.**

Macht has enough components to fix this cleanly, but the current recovery story is fragmented:

- one legacy manual export;
- newer schema/migration code not connected to it;
- several persisted stores outside the export;
- no durable rollback;
- no automatic/cloud backup;
- no proven restore drill.

The beta-safe sequence is:

**canonical local data contract → complete validated export/import → durable rollback → tests → Firestore persistence → PITR/scheduled backups → restore drill.**

Firebase configuration should remain unchanged until the local contract and recovery semantics are settled.
