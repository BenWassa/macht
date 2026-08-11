import type { TabId } from "@/state/useUiStore";
import { FinishSessionModal } from "@/modals/FinishSessionModal";
import { FreePlayScreen } from "@/screens/FreePlayScreen";
import { ProfileScreen } from "@/screens/profile";
import { ConstraintAwareProgramScreen } from "@/screens/program/ConstraintAwareProgramScreen";
import { ProgressScreen } from "@/screens/ProgressScreen";
import { ConstraintAwareWorkoutScreen } from "@/screens/workout/ConstraintAwareWorkoutScreen";

interface SetCompletedOptions {
  advanceAfterRest: boolean;
  restSeconds?: number;
}

export interface SessionSavedSummary {
  duration: string;
  sets: number;
  volume: number;
  targetsModified: boolean;
  personalRecords: number;
  recommendationsApplied: number;
  personalizationsApplied: number;
}

interface DeferredAppSurfaceProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  showFinishModal: boolean;
  onOpenFinish: () => void;
  onCloseFinish: () => void;
  onSaved: (summary: SessionSavedSummary) => void;
  onSetCompleted: (options: SetCompletedOptions) => void;
  onStartWarmup: () => void;
}

export default function DeferredAppSurface({
  activeTab,
  setActiveTab,
  showFinishModal,
  onOpenFinish,
  onCloseFinish,
  onSaved,
  onSetCompleted,
  onStartWarmup,
}: DeferredAppSurfaceProps) {
  return (
    <>
      {activeTab === "freeplay" ? (
        <FreePlayScreen setActiveTab={setActiveTab} />
      ) : null}
      {activeTab === "templates" ? (
        <ConstraintAwareProgramScreen setActiveTab={setActiveTab} />
      ) : null}
      {activeTab === "workout" ? (
        <ConstraintAwareWorkoutScreen
          onFinish={onOpenFinish}
          onSetCompleted={onSetCompleted}
          onStartWarmup={onStartWarmup}
        />
      ) : null}
      {activeTab === "progress" ? <ProgressScreen /> : null}
      {activeTab === "profile" ? <ProfileScreen /> : null}

      {showFinishModal ? (
        <FinishSessionModal onClose={onCloseFinish} onSaved={onSaved} />
      ) : null}
    </>
  );
}
