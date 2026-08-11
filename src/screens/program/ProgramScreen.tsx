import { useMemo, useState } from "react";
import { getAllExercises } from "@/domain/exerciseLibrary";
import { activateProgramMesocycle } from "@/domain/training/programActivation";
import {
  addProgramSlot,
  addProgramSubstitution,
  removeProgramSlot,
  removeProgramSubstitution,
  renameProgramSession,
  replaceProgramSlotExercise,
  setProgramMusclePriority,
  updateProgramSlotTraining,
} from "@/domain/training/programEditing";
import { validateProgram } from "@/domain/training/program";
import { createStarterProgram } from "@/domain/training/starterProgram";
import type { Program } from "@/domain/training/types";
import type { TabId } from "@/App";
import { ProgramConstraintsCard } from "@/screens/constraints/ProgramConstraintsCard";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useProgramStore } from "@/state/useProgramStore";
import { useToastStore } from "@/state/useToastStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";
import { ActiveMesocycleCard } from "./ActiveMesocycleCard";
import { CycleStartConfirmModal } from "./CycleStartConfirmModal";
import { MusclePriorityPicker } from "./MusclePriorityPicker";
import { PersonalProgramSignalsCard } from "./PersonalProgramSignalsCard";
import { ProgramActionsCard } from "./ProgramActionsCard";
import { ProgramSessionEditor } from "./ProgramSessionEditor";
import { ProgramSetupCard } from "./ProgramSetupCard";

interface ProgramScreenProps {
  setActiveTab: (tab: TabId) => void;
}

export function ProgramScreen({ setActiveTab: _setActiveTab }: ProgramScreenProps) {
  const programs = useProgramStore((state) => state.programs);
  const mesocycles = useProgramStore((state) => state.mesocycles);
  const activeProgramId = useProgramStore((state) => state.activeProgramId);
  const upsertProgram = useProgramStore((state) => state.upsertProgram);
  const setActiveProgram = useProgramStore((state) => state.setActiveProgram);
  const hydrateProgramData = useProgramStore((state) => state.hydrateProgramData);
  const customExercises = useCustomExerciseStore((state) => state.exercises);
  const workoutActive = useWorkoutStore((state) => state.workoutActive);
  const showToast = useToastStore((state) => state.show);
  const storedProgram =
    programs.find((program) => program.id === activeProgramId) ?? programs[0];
  const [draft, setDraft] = useState<Program>(() =>
    storedProgram ??
    createStarterProgram({
      id: crypto.randomUUID(),
      name: "My Program",
      createdAt: new Date().toISOString(),
    }),
  );
  const [accumulationWeeks, setAccumulationWeeks] = useState(4);
  const [includesDeload, setIncludesDeload] = useState(true);
  const [confirmCycleRestart, setConfirmCycleRestart] = useState(false);
  const exercises = useMemo(
    () =>
      getAllExercises(customExercises).sort((a, b) => a.name.localeCompare(b.name)),
    [customExercises],
  );
  const activeMesocycle = mesocycles.find(
    (item) =>
      item.id === storedProgram?.activeMesocycleId ||
      (item.programId === storedProgram?.id && item.status === "active"),
  );
  const activeCycleHasRemainingSessions = Boolean(
    activeMesocycle?.weeks.some((week) =>
      week.sessions.some(
        (session) => session.status === "planned" || session.status === "moved",
      ),
    ),
  );

  const persistDraft = (notify = true): Program | null => {
    const updated: Program = {
      ...draft,
      name: draft.name.trim() || "My Program",
      updatedAt: new Date().toISOString(),
    };
    const issues = validateProgram(updated);
    if (issues.length) {
      showToast(`Program needs attention · ${issues[0]}`);
      return null;
    }
    upsertProgram(updated);
    setActiveProgram(updated.id);
    setDraft(updated);
    if (notify) showToast("Program saved");
    return updated;
  };

  const activateCycle = () => {
    if (workoutActive) return;
    const saved = persistDraft(false);
    if (!saved) return;
    const result = activateProgramMesocycle({
      program: saved,
      existingMesocycles: mesocycles,
      mesocycleId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      startDate: new Date().toISOString().slice(0, 10),
      accumulationWeeks,
      includesDeload,
    });
    const nextPrograms = programs.some((item) => item.id === result.program.id)
      ? programs.map((item) =>
          item.id === result.program.id ? result.program : item,
        )
      : [...programs, result.program];
    hydrateProgramData(nextPrograms, result.mesocycles);
    setActiveProgram(result.program.id);
    setDraft(result.program);
    showToast(`Cycle ${result.mesocycle.index} activated · Today is ready`);
  };

  const requestCycleStart = () => {
    if (workoutActive) return;
    if (activeCycleHasRemainingSessions) {
      setConfirmCycleRestart(true);
      return;
    }
    activateCycle();
  };

  const rebuildSchedule = (sessionsPerWeek: 2 | 3 | 4 | 5 | 6) => {
    const rebuilt = createStarterProgram({
      id: draft.id,
      name: draft.name,
      createdAt: draft.createdAt,
      sessionsPerWeek,
      sessionDurationMinutes: draft.defaultSessionDurationMinutes,
      musclePriorities: draft.musclePriorities,
    });
    setDraft({
      ...rebuilt,
      updatedAt: draft.updatedAt,
      activeMesocycleId: draft.activeMesocycleId,
    });
  };

  return (
    <div className="animate-rise-in space-y-5">
      <header>
        <p className="text-sm font-medium text-text-muted">Program</p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-text">
          Build the plan
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
          Set a sustainable schedule, choose training priorities, then tune each session.
          Starting a cycle turns this definition into the prescriptions used by Today.
        </p>
      </header>

      {storedProgram ? <ProgramConstraintsCard program={storedProgram} /> : null}
      <PersonalProgramSignalsCard />
      <ActiveMesocycleCard mesocycle={activeMesocycle} />

      <ProgramSetupCard
        program={draft}
        onNameChange={(name) => setDraft((current) => ({ ...current, name }))}
        onSessionsChange={rebuildSchedule}
        onDurationChange={(minutes) =>
          setDraft((current) => ({
            ...current,
            defaultSessionDurationMinutes: minutes,
            sessionTemplates: current.sessionTemplates.map((template) => ({
              ...template,
              targetDurationMinutes: minutes,
            })),
          }))
        }
      />

      <MusclePriorityPicker
        program={draft}
        onChange={(muscleId, priority) =>
          setDraft((current) =>
            setProgramMusclePriority(current, muscleId, priority),
          )
        }
      />

      <div className="space-y-4">
        {draft.sessionTemplates.map((session) => (
          <ProgramSessionEditor
            key={session.id}
            session={session}
            exercises={exercises}
            onRename={(name) =>
              setDraft((current) => renameProgramSession(current, session.id, name))
            }
            onReplace={(slotId, exerciseId, targetLabel) =>
              setDraft((current) =>
                replaceProgramSlotExercise(
                  current,
                  session.id,
                  slotId,
                  exerciseId,
                  targetLabel,
                ),
              )
            }
            onTrainingChange={(slotId, patch) =>
              setDraft((current) =>
                updateProgramSlotTraining(current, session.id, slotId, patch),
              )
            }
            onAddSubstitution={(slotId, exerciseId) =>
              setDraft((current) =>
                addProgramSubstitution(current, session.id, slotId, exerciseId),
              )
            }
            onRemoveSubstitution={(slotId, exerciseId) =>
              setDraft((current) =>
                removeProgramSubstitution(current, session.id, slotId, exerciseId),
              )
            }
            onRemoveSlot={(slotId) =>
              setDraft((current) => removeProgramSlot(current, session.id, slotId))
            }
            onAddSlot={(slotId, exerciseId, targetLabel) =>
              setDraft((current) =>
                addProgramSlot(
                  current,
                  session.id,
                  slotId,
                  exerciseId,
                  targetLabel,
                ),
              )
            }
          />
        ))}
      </div>

      <ProgramActionsCard
        accumulationWeeks={accumulationWeeks}
        includesDeload={includesDeload}
        workoutActive={workoutActive}
        onAccumulationWeeksChange={setAccumulationWeeks}
        onIncludesDeloadChange={setIncludesDeload}
        onSave={() => persistDraft()}
        onStartCycle={requestCycleStart}
      />

      {confirmCycleRestart && activeMesocycle ? (
        <CycleStartConfirmModal
          currentCycleName={activeMesocycle.name ?? `Cycle ${activeMesocycle.index}`}
          onConfirm={activateCycle}
          onClose={() => setConfirmCycleRestart(false)}
        />
      ) : null}
    </div>
  );
}
