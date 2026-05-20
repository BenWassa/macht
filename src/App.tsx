import { useState } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { RestTimerBanner } from '@/components/RestTimerBanner';
import { useRestTimer } from '@/hooks/useRestTimer';
import { useSessionClock } from '@/hooks/useSessionClock';
import { FinishSessionModal } from '@/modals/FinishSessionModal';
import { HomeScreen } from '@/screens/HomeScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { ProgressScreen } from '@/screens/ProgressScreen';
import { TemplatesScreen } from '@/screens/TemplatesScreen';
import { WorkoutScreen } from '@/screens/WorkoutScreen';
import { useSettingsStore } from '@/state/useSettingsStore';
import { useWorkoutStore } from '@/state/useWorkoutStore';
import { formatTime } from '@/lib/format';

export type TabId = 'home' | 'templates' | 'workout' | 'progress' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('workout');
  const [showFinishModal, setShowFinishModal] = useState(false);
  const defaultRest = useSettingsStore((state) => state.defaultRest);
  const workoutActive = useWorkoutStore((state) => state.workoutActive);
  const workoutDuration = useWorkoutStore((state) => state.workoutDuration);
  const restTimer = useRestTimer(defaultRest);

  useSessionClock();

  return (
    <div className="flex min-h-screen flex-col bg-[#060606] text-[#f0f0f0] selection:bg-blue-600 selection:text-white">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#1a1a1a] bg-[#0c0c0c] px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
          <span className="font-mono text-[11px] font-extrabold uppercase tracking-[0.28em] text-neutral-200">MACHT</span>
        </div>
        {workoutActive && (
          <button onClick={() => setActiveTab('workout')} className="flex items-center space-x-2 border border-[#222] bg-[#121212] px-3 py-1 transition hover:bg-[#1a1a1a]">
            <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-500" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-300">{formatTime(workoutDuration)}</span>
          </button>
        )}
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 py-6 pb-36">
        {activeTab === 'home' && <HomeScreen setActiveTab={setActiveTab} />}
        {activeTab === 'templates' && <TemplatesScreen setActiveTab={setActiveTab} />}
        {activeTab === 'workout' && <WorkoutScreen onFinish={() => setShowFinishModal(true)} onSetCompleted={restTimer.start} />}
        {activeTab === 'progress' && <ProgressScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </main>

      {restTimer.visible && (
        <RestTimerBanner
          seconds={restTimer.seconds}
          running={restTimer.running}
          onAdd={restTimer.add}
          onToggle={restTimer.toggle}
          onReset={restTimer.reset}
          onDismiss={restTimer.dismiss}
        />
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} workoutActive={workoutActive} />

      {showFinishModal && (
        <FinishSessionModal
          onClose={() => setShowFinishModal(false)}
          onSaved={() => {
            setShowFinishModal(false);
            setActiveTab('home');
          }}
        />
      )}
    </div>
  );
}
