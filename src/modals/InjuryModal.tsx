import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { FRAMEWORK_TAGS } from "@/domain/exercises";
import type { ExerciseInjury, Severity } from "@/domain/types";
import { useModalA11y } from "@/hooks/useModalA11y";
import { useInjuryStore } from "@/state/useInjuryStore";

interface InjuryModalProps {
  injury?: ExerciseInjury | null;
  onClose: () => void;
}

export function InjuryModal({ injury, onClose }: InjuryModalProps) {
  const addInjury = useInjuryStore((state) => state.addInjury);
  const updateInjury = useInjuryStore((state) => state.updateInjury);
  const [name, setName] = useState("");
  const [severity, setSeverity] = useState<Severity>("avoid");
  const [forbiddenTags, setForbiddenTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const editing = useMemo(() => Boolean(injury), [injury]);
  const containerRef = useModalA11y<HTMLDivElement>(onClose);

  useEffect(() => {
    setName(injury?.name ?? "");
    setSeverity(injury?.severity ?? "avoid");
    setForbiddenTags(injury?.forbiddenTags ?? []);
    setNotes(injury?.notes ?? "");
  }, [injury]);

  const toggleTag = (tag: string) => {
    setForbiddenTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  };

  const save = () => {
    if (!name.trim()) return;
    if (injury) {
      updateInjury(injury.id, { name, severity, forbiddenTags, notes });
    } else {
      addInjury({ name, severity, forbiddenTags, notes });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div
        ref={containerRef}
        className="w-full max-w-md space-y-4 border border-[#1a1a1a] bg-[#0c0c0c] p-6"
      >
        <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-300">
            {editing ? "Edit injury" : "Log injury"}
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-100"
            aria-label="Close injury modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 font-mono text-xs">
          <label className="block space-y-1">
            <span className="block text-[9px] uppercase tracking-widest text-neutral-500">
              Injury name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Left posterior shoulder labrum"
              className="w-full border border-[#1a1a1a] bg-black px-3 py-2 text-xs text-neutral-100 outline-none focus:border-blue-500"
            />
          </label>
          <label className="block space-y-1">
            <span className="block text-[9px] uppercase tracking-widest text-neutral-500">
              Severity
            </span>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="w-full border border-[#1a1a1a] bg-black px-3 py-2 text-xs text-neutral-100 outline-none focus:border-blue-500"
            >
              <option value="avoid">Avoid</option>
              <option value="caution">Caution</option>
              <option value="monitor">Monitor</option>
            </select>
          </label>
          <div className="space-y-1">
            <span className="block text-[9px] uppercase tracking-widest text-neutral-500">
              Affected movements
            </span>
            <div className="grid grid-cols-2 gap-1 border border-[#1a1a1a] bg-black p-2">
              {FRAMEWORK_TAGS.map((tag) => {
                const active = forbiddenTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`border px-2 py-1.5 text-left text-[9px] uppercase tracking-wider ${
                      active
                        ? "border-red-500 bg-red-950/40 font-bold text-red-400"
                        : "border-transparent bg-transparent text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {tag.replace(/_/g, " ")}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="block space-y-1">
            <span className="block text-[9px] uppercase tracking-widest text-neutral-500">
              Notes
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Avoid external rotation under load."
              className="w-full resize-none border border-[#1a1a1a] bg-black px-3 py-2 text-xs text-neutral-100 outline-none focus:border-blue-500"
            />
          </label>
          <button
            onClick={save}
            className="mt-2 w-full bg-blue-600 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-blue-700"
          >
            Save injury
          </button>
        </div>
      </div>
    </div>
  );
}
