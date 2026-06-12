import { BottomNav } from "@/components/BottomNav";
import { RestTimerBanner } from "@/components/RestTimerBanner";
import { Toast } from "@/components/Toast";
import { useSessionClock } from "@/hooks/useSessionClock";
import { useSessionTimers } from "@/hooks/useSessionTimers";
import { FinishSessionModal } from "@/modals/FinishSessionModal";
import { FreePlayScreen } from "@/screens/FreePlayScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { ProfileScreen } from "@/screens/profile";
import { ProgressScreen } from "@/screens/ProgressScreen";
import { TemplatesScreen } from "@/screens/TemplatesScreen";
import { WorkoutScreen } from "@/screens/WorkoutScreen";
import { useToastStore } from "@/state/useToastStore";
import { useUiStore } from "@/state/useUiStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";
import { formatTime, formatWorkoutName } from "@/lib/format";
import { useState } from "react";

export type { TabId } from "@/state/useUiStore";

export default function App() {
  const activeTab = useUiStore((state) => state.activeTab);
  const setActiveTab = useUiStore((state) => state.setActiveTab);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const showToast = useToastStore((state) => state.show);
  const workoutActive = useWorkoutStore((state) => state.workoutActive);
  const workoutName = useWorkoutStore((state) => state.workoutName);
  const workoutDuration = useWorkoutStore((state) => state.workoutDuration);
  const { restTimer, warmupTimer, startRest, startWarmup, dismissRest, clear } =
    useSessionTimers();
  const isWorkoutScreen = activeTab === "workout" && workoutActive;

  useSessionClock();

  return (
    <div className="flex min-h-screen flex-col bg-[#060606] text-[#f0f0f0] selection:bg-blue-600 selection:text-white">
      <header
        className={`sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 ${
          isWorkoutScreen
            ? "border-blue-900/60 bg-blue-950/15"
            : "border-[#1a1a1a] bg-[#0c0c0c]"
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center space-x-3 pr-3">
          <div
            className={`h-1.5 w-1.5 animate-pulse rounded-full ${
              isWorkoutScreen ? "bg-emerald-500" : "bg-blue-500"
            }`}
          />
          <span
            className={`truncate font-mono font-bold tracking-tight ${
              isWorkoutScreen
                ? "text-[12px] text-neutral-100"
                : "text-[11px] uppercase tracking-[0.28em] text-neutral-200"
            }`}
          >
            {isWorkoutScreen ? formatWorkoutName(workoutName) : "MACHT"}
          </span>
        </div>
        {workoutActive && (
          <button
            onClick={() => setActiveTab("workout")}
            className="flex items-center space-x-2 border border-[#222] bg-[#121212] px-3 py-1 transition hover:bg-[#1a1a1a]"
          >
            <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-500" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-300">
              {formatTime(workoutDuration)}
            </span>
          </button>
        )}
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 py-6 pb-36">
        {activeTab === "home" && <HomeScreen setActiveTab={setActiveTab} />}
        {activeTab === "freeplay" && (
          <FreePlayScreen setActiveTab={setActiveTab} />
        )}
        {activeTab === "templates" && (
          <TemplatesScreen setActiveTab={setActiveTab} />
        )}
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

      {restTimer.visible && (
        <RestTimerBanner
          seconds={restTimer.seconds}
          running={restTimer.running}
          onAdd={restTimer.add}
          onToggle={restTimer.toggle}
          onReset={restTimer.reset}
          onDismiss={dismissRest}
        />
      )}

      {warmupTimer.visible && !restTimer.visible && (
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
      )}

      <Toast />

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        workoutActive={workoutActive}
      />

      {showFinishModal && (
        <FinishSessionModal
          onClose={() => setShowFinishModal(false)}
          onSaved={(summary) => {
            setShowFinishModal(false);
            clear();
            showToast(
              `Session saved · ${summary.duration} · ${summary.sets} sets · ${summary.volume.toLocaleString()} lbs`,
            );
            setActiveTab("home");
          }}
        />
      )}
    </div>
  );
}
