import { Play, Wand2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { TemplatePlan } from "@/domain/types";
import type { TabId } from "@/state/useUiStore";

export function NextSessionBar({
  template,
  adapted,
  onStart,
  setActiveTab,
}: {
  template: TemplatePlan;
  adapted: boolean;
  onStart: () => void;
  setActiveTab: (tab: TabId) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between border border-edge bg-canvas px-4 py-4">
        <div className="min-w-0">
          <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-blue-400">
            Next session
          </span>
          <h3 className="mt-1 truncate font-mono text-sm font-bold uppercase tracking-tight text-neutral-100">
            {template.name}
          </h3>
          <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            <span>{template.exercises.length} exercises</span>
            {adapted && (
              <span className="border border-yellow-900 bg-yellow-950/40 px-1.5 py-0.5 text-[8px] font-bold text-yellow-500">
                Injury-adapted
              </span>
            )}
          </div>
        </div>
        <motion.button
          onClick={onStart}
          whileTap={reduce ? undefined : { scale: 0.96 }}
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
          className="ml-3 flex shrink-0 items-center gap-2 bg-blue-600 px-5 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-white transition hover:bg-blue-500 active:bg-blue-700"
        >
          <Play className="h-4 w-4 fill-white" /> Start
        </motion.button>
      </div>
      <button
        onClick={() => setActiveTab("freeplay")}
        className="mt-2 flex w-full items-center justify-center gap-2 border border-edge bg-black px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400 transition hover:border-neutral-700 hover:text-neutral-200"
      >
        <Wand2 className="h-3.5 w-3.5" /> Build your own
      </button>
    </section>
  );
}
