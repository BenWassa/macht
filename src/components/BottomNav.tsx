import { Activity, Clipboard, Home, TrendingUp, User } from 'lucide-react';
import type { TabId } from '@/App';

interface BottomNavProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  workoutActive: boolean;
}

const tabs = [
  { id: 'home', Icon: Home, label: 'HOME' },
  { id: 'templates', Icon: Clipboard, label: 'PLANS' },
  { id: 'workout', Icon: Activity, label: 'SESSION' },
  { id: 'progress', Icon: TrendingUp, label: 'PROGRESS' },
  { id: 'profile', Icon: User, label: 'SELF' },
] as const;

export function BottomNav({ activeTab, setActiveTab, workoutActive }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-[#1a1a1a] bg-[#0c0c0c]">
      {tabs.map(({ id, Icon, label }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`relative flex h-full w-full flex-col items-center justify-center transition-colors ${
            activeTab === id ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Icon className="h-[18px] w-[18px]" />
          {id === 'workout' && workoutActive && (
            <span className="absolute right-1/2 top-3 h-1.5 w-1.5 translate-x-5 rounded-full bg-emerald-500" />
          )}
          <span className="mt-1 text-[8px] font-mono uppercase tracking-widest">{label}</span>
        </button>
      ))}
    </nav>
  );
}
