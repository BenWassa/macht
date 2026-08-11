import { TrainingConstraintsManager } from "@/screens/constraints/TrainingConstraintsManager";
import { BackupPanel } from "./BackupPanel";
import { CustomExercisesPanel } from "./CustomExercisesPanel";
import { DangerZone } from "./DangerZone";
import { PersonalTrainingModelCard } from "./PersonalTrainingModelCard";
import { SettingsPanel } from "./SettingsPanel";

export function ProfileScreen() {
  return (
    <div className="animate-rise-in space-y-5">
      <section>
        <p className="text-sm font-medium text-text-muted">You</p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-text">
          Training preferences
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
          Review what Macht has learned, manage optional training constraints, and control
          local settings and data.
        </p>
      </section>

      <PersonalTrainingModelCard />
      <TrainingConstraintsManager />
      <CustomExercisesPanel />

      <details className="surface-card group overflow-hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold text-text-secondary sm:px-5">
          Settings and local data
          <span className="text-xs font-medium text-text-muted group-open:hidden">
            Show
          </span>
          <span className="hidden text-xs font-medium text-text-muted group-open:inline">
            Hide
          </span>
        </summary>
        <div className="space-y-4 border-t border-divider p-4 sm:p-5">
          <SettingsPanel />
          <BackupPanel />
          <DangerZone />
        </div>
      </details>
    </div>
  );
}
