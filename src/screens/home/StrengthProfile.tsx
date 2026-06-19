import { ChevronRight } from "lucide-react";
import { buildStrengthProfile } from "@/domain/strengthProfile";
import { signedPct } from "@/lib/format";
import { LiftRow } from "@/screens/home/StrengthProfileRow";
import type { TabId } from "@/state/useUiStore";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useSettingsStore } from "@/state/useSettingsStore";

interface StrengthProfileProps {
  setActiveTab: (tab: TabId) => void;
}

export function StrengthProfile({ setActiveTab }: StrengthProfileProps) {
  const sessions = useHistoryStore((state) => state.sessions);
  const injuries = useInjuryStore((state) => state.injuries);
  const settings = useSettingsStore();
  const customExercises = useCustomExerciseStore((state) => state.exercises);

  const profile = buildStrengthProfile(
    sessions,
    injuries,
    settings,
    customExercises,
  );
  const units = settings.units;

  return (
    <section className="mb-10 border border-edge bg-canvas">
      <button
        type="button"
        onClick={() => setActiveTab("progress")}
        className="flex w-full items-center justify-between gap-3 border-b border-edge px-4 py-3 text-left transition hover:bg-white/[0.02]"
      >
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          Strength profile
        </span>
        <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-neutral-600">
          Big five
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </button>

      {profile.trackedCount === 0 ? (
        <div className="px-4 py-6">
          <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            Log any of the big five to build your profile.
          </p>
          <ul className="mt-3 space-y-0 divide-y divide-edge">
            {profile.lifts.map((lift) => (
              <li key={lift.exerciseId}>
                <button
                  type="button"
                  onClick={() => setActiveTab("templates")}
                  className="flex w-full items-center justify-between py-2.5 font-mono text-[11px] font-bold uppercase tracking-tight text-neutral-600 transition hover:text-neutral-400"
                >
                  {lift.name}
                  <span className="text-[9px] tracking-widest text-neutral-700">
                    Start →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <div className="border-b border-edge px-4 py-5">
            <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-neutral-500">
              Big five total
            </span>
            <div className="mt-1 flex items-end justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-4xl font-black tracking-tight text-white">
                  {profile.total}
                </span>
                <span className="font-mono text-sm font-bold uppercase text-neutral-500">
                  {units}
                </span>
              </div>
              {profile.totalChangePct !== null && (
                <span
                  className={`font-mono text-xs font-bold ${
                    profile.totalChangePct > 0
                      ? "text-emerald-400"
                      : "text-neutral-500"
                  }`}
                >
                  {profile.totalChangePct > 0 ? "▲ " : ""}
                  {signedPct(profile.totalChangePct)}
                  <span className="text-neutral-600"> / 28d</span>
                </span>
              )}
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-neutral-600">
              Sum of estimated 1RM across the five lifts
            </p>
            {profile.headroom > 0 && (
              <p className="mt-3 border-t border-edge pt-3 font-mono text-[11px] text-neutral-400">
                <span className="font-bold uppercase tracking-wider text-emerald-500">
                  +{profile.headroom} {units}
                </span>{" "}
                <span className="uppercase tracking-wider text-neutral-500">
                  on the table next session
                </span>
              </p>
            )}
          </div>

          <ul className="divide-y divide-edge">
            {profile.lifts.map((lift) => (
              <LiftRow key={lift.exerciseId} lift={lift} units={units} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
