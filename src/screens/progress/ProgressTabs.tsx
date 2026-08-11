export type ProgressTab = "overview" | "exercises" | "muscles" | "records";

interface ProgressTabsProps {
  active: ProgressTab;
  onChange: (tab: ProgressTab) => void;
}

const tabs: Array<{ id: ProgressTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "exercises", label: "Exercises" },
  { id: "muscles", label: "Muscles" },
  { id: "records", label: "Records" },
];

export function ProgressTabs({ active, onChange }: ProgressTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Progress sections"
      className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`min-h-11 min-w-fit rounded-md px-4 text-sm font-semibold transition ${
            active === tab.id
              ? "bg-surface-3 text-text shadow-card"
              : "text-text-muted hover:bg-surface-1 hover:text-text-secondary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
