import { ChevronDown } from "lucide-react";
import { EXERCISE_SECTIONS, type SectionKey } from "@/domain/categories";
import type { Exercise, ExerciseConflict } from "@/domain/types";
import { PickerCard } from "@/screens/freeplay/PickerCard";

interface ExerciseSectionListProps {
  grouped: Record<SectionKey, Exercise[]>;
  openSections: Record<SectionKey, boolean>;
  getItemProps: (exercise: Exercise) => {
    exercise: Exercise;
    conflict: ExerciseConflict | null;
    locked: boolean;
    selected: boolean;
    onToggle: (id: string) => void;
  };
  onToggleSection: (key: SectionKey) => void;
}

export function ExerciseSectionList({
  grouped,
  openSections,
  getItemProps,
  onToggleSection,
}: ExerciseSectionListProps) {
  return (
    <>
      {EXERCISE_SECTIONS.map(({ key, label }) => {
        const items = grouped[key];
        if (items.length === 0) return null;
        const open = openSections[key];
        return (
          <div key={key}>
            <button
              type="button"
              onClick={() => onToggleSection(key)}
              aria-expanded={open}
              className="mb-2 flex w-full items-center justify-between border-b border-edge pb-2"
            >
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                {label}
                <span className="ml-2 text-neutral-600">{items.length}</span>
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
                  <PickerCard key={exercise.id} {...getItemProps(exercise)} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
