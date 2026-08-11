import { TrainingConstraintsManager } from "@/screens/constraints/TrainingConstraintsManager";
import { BackupPanel } from "./BackupPanel";
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
          Review what Macht has learned from your training, manage temporary constraints,
          and control your local settings and data.
        </p>
      </section>

      <PersonalTrainingModelCard />
      <TrainingConstraintsManager />

      <section className="surface-card overflow-hidden">
        <div className="border-b border-divider px-4 py-3 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
            Settings and data
          </p>
        </div>
        <div className="space-y-0">
          <SettingsPanel />
          <BackupPanel />
        </div>
      </section>

      <DangerZone />
    </div>
  );
}
