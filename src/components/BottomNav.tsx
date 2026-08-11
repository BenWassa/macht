import { Activity, CalendarRange, Home, TrendingUp, User } from "lucide-react";
import type { TabId } from "@/App";

interface BottomNavProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  workoutActive: boolean;
}

const tabs = [
  { id: "home", Icon: Home, label: "TODAY" },
  { id: "templates", Icon: CalendarRange, label: "PROGRAM" },
  { id: "workout", Icon: Activity, label: "SESSION" },
  { id: "progress", Icon: TrendingUp, label: "PROGRESS" },
  { id: "profile", Icon: User, label: "YOU" },
] as const;

export function BottomNav({
  activeTab,
  setActiveTab,
  workoutActive,
}: BottomNavProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-divider bg-surface-1/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <div className="mx-auto flex h-[68px] max-w-2xl items-stretch justify-around">
        {tabs.map(({ id, Icon, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => setActiveTab(id)}
              className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-sm text-[11px] font-semibold transition-colors ${
                active
                  ? "text-signal-strong"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Icon className="h-[19px] w-[19px]" aria-hidden="true" />
              {id === "workout" && workoutActive ? (
                <span
                  className="absolute left-1/2 top-2.5 h-1.5 w-1.5 translate-x-3 rounded-full bg-positive"
                  aria-label="Workout active"
                />
              ) : null}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
