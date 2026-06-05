import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  BIG_FIVE,
  EXERCISE_SECTIONS,
  groupLibraryBySection,
  type SectionKey,
} from "@/domain/categories";
import { EXERCISE_LIBRARY, getExerciseById } from "@/domain/exercises";
import { getExerciseConflict } from "@/domain/injuries";
import type { Exercise, ExerciseInjury } from "@/domain/types";
import { PickerCard, PickerRow } from "@/screens/freeplay/PickerCard";

interface ExercisePickerProps {
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  injuries: ExerciseInjury[];
  /** Exercises already in the workout — shown checked and locked. */
  disabledIds?: Set<string>;
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
}: ExercisePickerProps) {
  const [query, setQuery] = useState("");
  const [openSections, setOpenSections] =
    useState<Record<SectionKey, boolean>>(SECTION_DEFAULT_OPEN);

  const grouped = useMemo(() => groupLibraryBySection(), []);
  const bigFive = useMemo(
    () =>
      BIG_FIVE.map((id) => getExerciseById(id)).filter(
        (item): item is Exercise => Boolean(item),
      ),
    [],
  );

  const trimmed = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!trimmed) return [];
    return EXERCISE_LIBRARY.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(trimmed) ||
        exercise.target.toLowerCase().includes(trimmed),
    );
  }, [trimmed]);

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
            <p className="p-4 text-center font-mono text-[10px] uppercase tracking-widest text-neutral-500">
              No matches
            </p>
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

          {EXERCISE_SECTIONS.map(({ key, label }) => {
            const items = grouped[key];
            if (items.length === 0) return null;
            const open = openSections[key];
            return (
              <div key={key}>
                <button
                  type="button"
                  onClick={() => toggleSection(key)}
                  aria-expanded={open}
                  className="mb-2 flex w-full items-center justify-between border-b border-edge pb-2"
                >
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                    {label}
                    <span className="ml-2 text-neutral-600">
                      {items.length}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-500 transition-transform ${
                      open ? "" : "-rotate-90"
                    }`}
                  />
                </button>
                {open && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {items.map((exercise) => (
                      <PickerCard key={exercise.id} {...itemProps(exercise)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
