import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { RestTimerBanner } from "@/components/RestTimerBanner";
import { Toast } from "@/components/Toast";
import { useSessionClock } from "@/hooks/useSessionClock";
import { useSessionTimers } from "@/hooks/useSessionTimers";
import { formatTime, formatWorkoutName } from "@/lib/format";
import { FinishSessionModal } from "@/modals/FinishSessionModal";
import { HomeScreen } from "@/screens/HomeScreen";
import { ProfileScreen } from "@/screens/profile";
import { ProgramScreen } from "@/screens/program/ProgramScreen";
import { ProgressScreen } from "@/screens/ProgressScreen";
import { WorkoutScreen } from "@/screens/WorkoutScreen";
import { useSettingsStore } from "@/state/useSettingsStore";
import { useToastStore } from "@/state/useToastStore";
import { useUiStore } from "@/state/useUiStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

export type { TabId } from "@/state/useUiStore";

export default function App() {
  const activeTab = useUiStore((state) => state.activeTab);
  const setActiveTab = useUiStore((state) => state.setActiveTab);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const units = useSettingsStore((state) => state.units);
  const showToast = useToastStore((state) => state.show);
  const workoutActive = useWorkoutStore((state) => state.workoutActive);
  const workoutName = useWorkoutStore((state) => state.workoutName);
  const workoutDuration = useWorkoutStore((state) => state.workoutDuration);
  const { restTimer, warmupTimer, startRest, startWarmup, dismissRest, clear } =
    useSessionTimers();
  const isWorkoutScreen = activeTab === "workout" && workoutActive;

  useSessionClock();

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text selection:bg-signal-soft selection:text-text">
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur ${
          isWorkoutScreen
            ? "border-positive/20 bg-surface-1/96"
            : "border-divider bg-bg/92"
        }`}
      >
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 pr-3">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                isWorkoutScreen ? "bg-positive" : "bg-signal"
              }`}
              aria-hidden="true"
            />
            <span className="truncate text-sm font-bold tracking-[-0.02em] text-text">
              {isWorkoutScreen ? formatWorkoutName(workoutName) : "MACHT"}
            </span>
          </div>
          {workoutActive ? (
            <button
              type="button"
              onClick={() => setActiveTab("workout")}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-surface-2 px-3 text-sm font-semibold text-text-secondary transition hover:bg-surface-3 hover:text-text"
              aria-label={`Resume workout, ${formatTime(workoutDuration)} elapsed`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-positive" aria-hidden="true" />
              <span data-metric="true">{formatTime(workoutDuration)}</span>
            </button>
          ) : null}
        </div>
      </header>
      <DemoModeBanner />

      <main className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 py-6 pb-32 sm:px-5">
        {activeTab === "home" && <HomeScreen setActiveTab={setActiveTab} />}
        {activeTab === "templates" && <ProgramScreen />}
        {activeTab === "workout" && (
          <WorkoutScreen
            onFinish={() => setShowFinishModal(true)}
            onSetCompleted={startRest}
            onStartWarmup={startWarmup}
          />
        )}
        {activeTab === "progress" && <ProgressScreen />}
        {activeTab === "profile" && <ProfileScreen />}
      </main>

      {restTimer.visible ? (
        <RestTimerBanner
          seconds={restTimer.seconds}
          running={restTimer.running}
          onAdd={restTimer.add}
          onToggle={restTimer.toggle}
          onReset={restTimer.reset}
          onDismiss={dismissRest}
        />
      ) : null}

      {warmupTimer.visible && !restTimer.visible ? (
        <RestTimerBanner
          label="Warm-up"
          doneText="Done - start lifting"
          increments={[60, -60]}
          seconds={warmupTimer.seconds}
          running={warmupTimer.running}
          onAdd={warmupTimer.add}
          onToggle={warmupTimer.toggle}
          onReset={warmupTimer.reset}
          onDismiss={warmupTimer.dismiss}
        />
      ) : null}

      <Toast />

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        workoutActive={workoutActive}
      />

      {showFinishModal ? (
        <FinishSessionModal
          onClose={() => setShowFinishModal(false)}
          onSaved={(summary) => {
            setShowFinishModal(false);
            clear();
            const prReceipt =
              summary.personalRecords > 0
                ? `${summary.personalRecords} new PR${summary.personalRecords === 1 ? "" : "s"} · `
                : "";
            const personalizedReceipt =
              summary.personalizationsApplied > 0
                ? ` ${summary.personalizationsApplied} recommendation${summary.personalizationsApplied === 1 ? "" : "s"} adjusted from established training history.`
                : "";
            const adaptiveReceipt =
              summary.recommendationsApplied > 0
                ? `${summary.recommendationsApplied} next prescription${summary.recommendationsApplied === 1 ? "" : "s"} evaluated and applied.${personalizedReceipt}`
                : summary.targetsModified
                  ? "Logged changes saved for future programming."
                  : "Performance saved for future programming.";
            showToast(
              `${prReceipt}Session saved · ${summary.duration} · ${summary.sets} sets · ${summary.volume.toLocaleString()} ${units} · ${adaptiveReceipt}`,
            );
            setActiveTab("home");
          }}
        />
      ) : null}
    </div>
  );
}
