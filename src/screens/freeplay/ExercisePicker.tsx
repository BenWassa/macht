import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  BIG_FIVE,
  groupLibraryBySection,
  type SectionKey,
} from "@/domain/categories";
import { getAllExercises, getExerciseById } from "@/domain/exerciseLibrary";
import { getExerciseConflict } from "@/domain/injuries";
import type { Exercise, ExerciseInjury } from "@/domain/types";
import {
  CreateExercisePrompt,
  type CreateExerciseResult,
} from "@/screens/freeplay/CreateExercisePrompt";
import { ExerciseSectionList } from "@/screens/freeplay/ExerciseSectionList";
import { PickerCard, PickerRow } from "@/screens/freeplay/PickerCard";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";

interface ExercisePickerProps {
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  injuries: ExerciseInjury[];
  /** Exercises already in the workout — shown checked and locked. */
  disabledIds?: Set<string>;
  allowCreate?: boolean;
  onCreateExercise?: (name: string, target: string) => CreateExerciseResult;
}

const SECTION_DEFAULT_OPEN: Record<SectionKey, boolean> = {
  lower: true,
  upper: true,
  core: false,
  conditioning: false,
  shoulder_care: false,
};

export function ExercisePicker({
  selectedIds,
  onToggle,
  injuries,
  disabledIds,
  allowCreate = false,
  onCreateExercise,
}: ExercisePickerProps) {
  const customExercises = useCustomExerciseStore((state) => state.exercises);
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [openSections, setOpenSections] =
    useState<Record<SectionKey, boolean>>(SECTION_DEFAULT_OPEN);

  const allExercises = useMemo(
    () => getAllExercises(customExercises),
    [customExercises],
  );
  const grouped = useMemo(
    () => groupLibraryBySection(allExercises),
    [allExercises],
  );
  const bigFive = useMemo(
    () =>
      BIG_FIVE.map((id) => getExerciseById(id, customExercises)).filter(
        (item): item is Exercise => Boolean(item),
      ),
    [customExercises],
  );

  const trimmed = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!trimmed) return [];
    return allExercises.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(trimmed) ||
        exercise.target.toLowerCase().includes(trimmed),
    );
  }, [allExercises, trimmed]);

  const toggleSection = (key: SectionKey) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const itemProps = (exercise: Exercise) => {
    const locked = disabledIds?.has(exercise.id) ?? false;
    return {
      exercise,
      conflict: getExerciseConflict(exercise.id, injuries),
      locked,
      selected: locked || selectedIds.has(exercise.id),
      onToggle,
    };
  };

  const createExercise = () => {
    const result = onCreateExercise?.(query, target);
    if (!result?.ok) {
      setCreateError(result?.error ?? "Cannot create exercise");
      return;
    }
    setCreateError(null);
    setTarget("");
    setQuery("");
  };

  return (
    <div>
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search exercises"
          className="w-full border border-edge bg-black py-2.5 pl-9 pr-3 font-mono text-xs uppercase tracking-wide text-neutral-200 placeholder:text-neutral-600 focus:border-blue-800 focus:outline-none"
        />
      </div>

      {trimmed ? (
        <div className="border border-edge bg-black">
          {searchResults.length > 0 ? (
            searchResults.map((exercise) => (
              <PickerRow key={exercise.id} {...itemProps(exercise)} />
            ))
          ) : (
            <>
              {allowCreate && onCreateExercise ? (
                <CreateExercisePrompt
                  name={query.trim()}
                  target={target}
                  error={createError}
                  onTargetChange={setTarget}
                  onCreate={createExercise}
                />
              ) : (
                <p className="p-4 text-center font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                  No matches
                </p>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-widest text-blue-500">
              Big five
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {bigFive.map((exercise) => (
                <PickerCard key={exercise.id} {...itemProps(exercise)} />
              ))}
            </div>
          </div>

          <ExerciseSectionList
            grouped={grouped}
            openSections={openSections}
            getItemProps={itemProps}
            onToggleSection={toggleSection}
          />
        </div>
      )}
    </div>
  );
}
