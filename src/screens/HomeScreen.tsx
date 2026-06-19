import { getRunnableTemplate } from "@/domain/injuries";
import { getNextTrainingTemplate } from "@/domain/trainingPlan";
import { ActivityHistory } from "@/screens/home/ActivityHistory";
import { ConsistencyChart } from "@/screens/home/ConsistencyChart";
import { NextSessionBar } from "@/screens/home/NextSessionBar";
import { StrengthHero } from "@/screens/home/StrengthHero";
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
  const runnable = getRunnableTemplate(nextTemplate, injuries);
  const adapted = runnable.exercises.length < nextTemplate.exercises.length;

  const start = () => {
    startTemplate(runnable);
    setActiveTab("workout");
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
          Strength log
        </p>
        <h1 className="font-mono text-xl font-bold uppercase tracking-tight">
          Console
        </h1>
      </div>

      <StrengthHero setActiveTab={setActiveTab} />

      <NextSessionBar
        template={runnable}
        adapted={adapted}
        onStart={start}
        setActiveTab={setActiveTab}
      />

      <ConsistencyChart sessions={sessions} />
      <ActivityHistory sessions={sessions} onStart={start} />
    </div>
  );
}
