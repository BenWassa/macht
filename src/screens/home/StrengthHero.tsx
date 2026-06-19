import { ArrowUpRight, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { buildStrengthProfile } from "@/domain/strengthProfile";
import { useCountUp } from "@/hooks/useCountUp";
import { signedPct } from "@/lib/format";
import { strengthAccent } from "@/lib/strengthAccent";
import { LiftStrip } from "@/screens/home/LiftStrip";
import type { TabId } from "@/state/useUiStore";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useSettingsStore } from "@/state/useSettingsStore";

export function StrengthHero({
  setActiveTab,
}: {
  setActiveTab: (tab: TabId) => void;
}) {
  const sessions = useHistoryStore((state) => state.sessions);
  const injuries = useInjuryStore((state) => state.injuries);
  const settings = useSettingsStore();
  const customExercises = useCustomExerciseStore((state) => state.exercises);
  const reduce = useReducedMotion();

  const profile = buildStrengthProfile(
    sessions,
    injuries,
    settings,
    customExercises,
  );
  const units = settings.units;
  const accent = strengthAccent(profile.total);
  const display = useCountUp(profile.total);
  const trendUp = (profile.totalChangePct ?? 0) > 0;

  const openProgress = () => setActiveTab("progress");

  if (profile.trackedCount === 0) {
    return (
      <section className="mb-8 overflow-hidden border border-edge bg-canvas">
        <div className="px-5 py-7">
          <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-neutral-500">
            Total strength
          </span>
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-neutral-400">
            Log any of the Big Five to start your strength number. It climbs and
            warms as you get stronger.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className="mt-5 inline-flex items-center gap-2 border border-blue-900/60 bg-blue-950/20 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-blue-300 transition hover:bg-blue-950/40"
          >
            Start your first lift <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative mb-8 overflow-hidden border border-edge bg-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
        style={{ background: accent.glow }}
      />
      <div className="relative px-5 pt-6">
        <button
          type="button"
          onClick={openProgress}
          className="group flex w-full items-center justify-between"
        >
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-neutral-500">
            Total strength
          </span>
          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-neutral-600 transition group-hover:text-neutral-400">
            Big five
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </button>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-2 flex items-end gap-3"
        >
          <span
            className="font-mono text-[64px] font-black leading-none tracking-tighter tabular-nums"
            style={{ color: accent.hot }}
          >
            {display.toLocaleString()}
          </span>
          <span className="mb-2 font-mono text-sm font-bold uppercase text-neutral-500">
            {units}
          </span>
        </motion.div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 pb-5">
          {profile.totalChangePct !== null && (
            <span
              className="flex items-center gap-1 font-mono text-xs font-bold tabular-nums"
              style={{ color: trendUp ? accent.cool : undefined }}
            >
              {trendUp && <ArrowUpRight className="h-3.5 w-3.5" />}
              <span className={trendUp ? "" : "text-neutral-500"}>
                {signedPct(profile.totalChangePct)}
              </span>
              <span className="font-normal text-neutral-600">/ 28d</span>
            </span>
          )}
          {profile.headroom > 0 && (
            <span className="font-mono text-xs tabular-nums text-neutral-400">
              <span className="font-bold text-emerald-400">
                +{profile.headroom}
              </span>{" "}
              <span className="text-neutral-600">on the table</span>
            </span>
          )}
        </div>
      </div>

      <LiftStrip lifts={profile.lifts} units={units} onOpen={openProgress} />
    </section>
  );
}
