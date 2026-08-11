import { TrainingConstraintsManager } from "@/screens/constraints/TrainingConstraintsManager";
import { PersonalTrainingModelCard } from "./PersonalTrainingModelCard";
import { ProfileScreen as LegacyProfileScreen } from "./index";

export function ProfileConstraintAware() {
  return (
    <div className="space-y-5">
      <section>
        <p className="text-sm font-medium text-text-muted">You</p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-text">
          Training preferences
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
          Review what Macht has learned from your training and manage optional training constraints. Existing settings, data, and custom-exercise tools remain available below during the migration.
        </p>
      </section>

      <PersonalTrainingModelCard />
      <TrainingConstraintsManager />

      <details className="surface-card group overflow-hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold text-text-secondary sm:px-5">
          Existing settings and data tools
          <span className="text-xs font-medium text-text-muted group-open:hidden">
            Show
          </span>
          <span className="hidden text-xs font-medium text-text-muted group-open:inline">
            Hide
          </span>
        </summary>
        <div className="border-t border-divider p-4 sm:p-5">
          <LegacyProfileScreen />
        </div>
      </details>
    </div>
  );
}
