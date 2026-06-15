import type { LiftProfile } from "@/domain/strengthProfile";
import { signedPct } from "@/lib/format";

export function LiftRow({
  lift,
  units,
}: {
  lift: LiftProfile;
  units: string;
}) {
  if (!lift.hasData) {
    return (
      <li className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <span className="block truncate font-mono text-[11px] font-bold uppercase tracking-wide text-neutral-400">
            {lift.name}
          </span>
          <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-wider text-neutral-600">
            Log it to start tracking
          </span>
        </div>
        <span className="shrink-0 font-mono text-sm font-bold text-neutral-700">
          —
        </span>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <span className="block truncate font-mono text-[11px] font-bold uppercase tracking-wide text-neutral-200">
          {lift.name}
        </span>
        {lift.paused ? (
          <span className="mt-1 inline-block border border-red-900 bg-red-950/40 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-widest text-red-400">
            Tracking paused
          </span>
        ) : lift.nextWeight !== null ? (
          <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-wider text-neutral-500">
            Next {lift.nextWeight} {units}
            {lift.nextReps !== null ? ` × ${lift.nextReps}` : ""}
            {lift.loadDelta && lift.loadDelta > 0 ? (
              <span className="text-emerald-500"> ▲ +{lift.loadDelta}</span>
            ) : null}
          </span>
        ) : (
          <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-wider text-neutral-600">
            Two sessions unlock a target
          </span>
        )}
      </div>
      <div className="shrink-0 text-right">
        <span className="block font-mono text-base font-bold text-neutral-100">
          {lift.current}{" "}
          <span className="text-[10px] text-neutral-500">{units}</span>
        </span>
        {!lift.paused && lift.monthPct !== null && (
          <span
            className={`block font-mono text-[10px] font-bold ${
              lift.monthPct > 0 ? "text-emerald-400" : "text-neutral-500"
            }`}
          >
            {signedPct(lift.monthPct)}{" "}
            <span className="text-neutral-600">/ 28d</span>
          </span>
        )}
      </div>
    </li>
  );
}
