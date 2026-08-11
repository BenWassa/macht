import { useProgramStore } from "@/state/useProgramStore";
import type { TabId } from "@/App";
import { ProgramConstraintsCard } from "@/screens/constraints/ProgramConstraintsCard";
import { PersonalProgramSignalsCard } from "./PersonalProgramSignalsCard";
import { ProgramScreen } from "./ProgramScreen";

interface ConstraintAwareProgramScreenProps {
  setActiveTab: (tab: TabId) => void;
}

export function ConstraintAwareProgramScreen({
  setActiveTab,
}: ConstraintAwareProgramScreenProps) {
  const programs = useProgramStore((state) => state.programs);
  const activeProgramId = useProgramStore((state) => state.activeProgramId);
  const activeProgram =
    programs.find((program) => program.id === activeProgramId) ?? programs[0];

  return (
    <div className="space-y-5">
      {activeProgram ? <ProgramConstraintsCard program={activeProgram} /> : null}
      <PersonalProgramSignalsCard />
      <ProgramScreen setActiveTab={setActiveTab} />
    </div>
  );
}
