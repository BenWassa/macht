import { Play, Wand2 } from "lucide-react";
import { getRunnableTemplate } from "@/domain/injuries";
import { getNextTrainingTemplate } from "@/domain/trainingPlan";
import { ActivityHistory } from "@/screens/home/ActivityHistory";
import { ConsistencyChart } from "@/screens/home/ConsistencyChart";
import type { TabId } from "@/App";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

interface HomeScreenProps {
  setActiveTab: (tab: TabId) => void;
}

export function HomeScreen({ setActiveTab }: HomeScreenProps) {
  const sessions = useHistoryStore((state) => state.sessions);
  const injuries = useInjuryStore((state) => state.injuries);
  const startTemplate = useWorkoutStore((state) => state.startTemplate);
  const nextTemplate = getNextTrainingTemplate(sessions);

  const start = () => {
    startTemplate(getRunnableTemplate(nextTemplate, injuries));
    setActiveTab("workout");
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-400">
          Strength log
        </p>
        <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-white">
          Console
        </h1>
      </div>

      <div className="mb-10 flex flex-col items-start justify-between gap-5 border border-edge bg-canvas p-6 sm:flex-row sm:items-center">
        <div>
          <span className="mb-1 block font-mono text-[11px] uppercase tracking-[0.2em] font-bold text-blue-500">
            Next session
          </span>
          <h3 className="font-mono text-base font-bold uppercase tracking-tight text-neutral-200">
            {nextTemplate.name}
          </h3>
          <p className="mt-1 font-mono text-xs text-neutral-400">
            {nextTemplate.notes}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto">
          <button
            onClick={start}
            className="flex w-full items-center justify-center gap-2 bg-blue-600 px-6 py-4 font-mono text-sm font-bold uppercase tracking-widest text-white transition hover:bg-blue-700 active:bg-blue-800 sm:w-auto"
          >
            <Play className="h-4 w-4 fill-white" /> Start session
          </button>
          <button
            onClick={() => setActiveTab("freeplay")}
            className="flex w-full items-center justify-center gap-2 border border-edge bg-black px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-neutral-300 transition hover:border-neutral-700 hover:text-white sm:w-auto"
          >
            <Wand2 className="h-3.5 w-3.5" /> Build your own
          </button>
        </div>
      </div>

      <ConsistencyChart sessions={sessions} />
      <ActivityHistory sessions={sessions} onStart={start} />
    </div>
  );
}
