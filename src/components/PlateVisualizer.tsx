import { useLayoutEffect, useRef, useState } from "react";
import { getPlateData, getPlates } from "@/domain/plates";
import type { Units } from "@/domain/types";
import { useElementWidth } from "@/hooks/useElementWidth";

interface PlateVisualizerProps {
  weight: number;
  units: Units;
}

export function PlateVisualizer({ weight, units }: PlateVisualizerProps) {
  const plates = getPlates(weight, units);
  const plateData = getPlateData(units);

  const plateCounts = plates.reduce<Record<string, number>>((acc, plate) => {
    acc[plate] = (acc[plate] ?? 0) + 1;
    return acc;
  }, {});

  // Auto-fit: measure the plate strip's natural width vs the space available
  // between the bar collars, and shrink uniformly so heavy loads never clip.
  // The strip's scrollWidth ignores the applied transform, so there is no
  // measure→render→remeasure loop.
  const trackRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const trackW = useElementWidth(trackRef);
  const [naturalW, setNaturalW] = useState(0);

  useLayoutEffect(() => {
    if (stripRef.current) setNaturalW(stripRef.current.scrollWidth);
  }, [plates.length, units, trackW]);

  const fit = naturalW > 0 && trackW > 0 ? Math.min(1, trackW / naturalW) : 1;

  const ariaLabel =
    plates.length === 0
      ? `Bar only at ${weight} ${units}`
      : `Loaded ${weight} ${units}. Plates per side: ${plates.join(", ")}.`;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="overflow-hidden rounded-xl border border-[#1a1a1a] bg-black p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500">
          Bar load
        </span>
        <span className="shrink-0 rounded-full border border-neutral-800 bg-neutral-950 px-2 py-1 text-[10px] font-mono font-bold text-neutral-200">
          {weight} {units}
        </span>
      </div>

      <div className="rounded-lg border border-neutral-900 bg-neutral-950/70 px-2 py-4">
        <div className="relative mx-auto flex h-24 w-full max-w-[340px] items-center justify-center sm:max-w-[420px]">
          <div className="h-2 min-w-0 flex-1 rounded-l-full bg-gradient-to-r from-neutral-800 to-neutral-600" />
          <div className="h-8 w-2 shrink-0 rounded-sm bg-neutral-500 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" />

          {/* Track: the space the plate strip may occupy. Measured so the strip
              can be scaled down to fit instead of clipping on heavy loads. */}
          <div
            ref={trackRef}
            className="flex h-24 min-w-0 shrink items-center justify-center overflow-hidden px-1"
          >
            <div
              ref={stripRef}
              className="flex h-24 shrink-0 items-center justify-center gap-[2px]"
              style={{ transform: `scale(${fit})`, transformOrigin: "center" }}
            >
              {plates.length === 0 && (
                <span className="rounded-full border border-neutral-800 px-3 py-1 text-[9px] font-mono uppercase tracking-wider text-neutral-500">
                  Bar only
                </span>
              )}
              {plates.map((plate, index) => {
                const spec = plateData[plate];
                const height = `clamp(${Math.max(spec.h - 16, 18)}px, ${spec.h / 3.2}vw, ${spec.h}px)`;
                const width = `clamp(${Math.max(spec.w - 6, 6)}px, ${spec.w / 3.8}vw, ${spec.w}px)`;

                return (
                  <div
                    key={`${plate}-${index}`}
                    className="flex shrink-0 items-center justify-center rounded-[3px] border border-black/80 px-[1px] text-[7px] font-black leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_2px_rgba(0,0,0,0.35)] sm:text-[8px]"
                    style={{ height, width, background: spec.bg, color: spec.color }}
                    title={`${spec.label} ${units}`}
                  >
                    <span className="-rotate-90 whitespace-nowrap tracking-tight sm:rotate-0">
                      {spec.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-8 w-2 shrink-0 rounded-sm bg-neutral-500 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" />
          <div className="h-2 min-w-8 flex-[0.7] rounded-r-full bg-gradient-to-r from-neutral-600 to-neutral-800" />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-neutral-400">
        {plates.length === 0 ? (
          <span className="text-neutral-600">No plates required per side</span>
        ) : (
          Object.entries(plateCounts).map(([plate, count]) => {
            const spec = plateData[Number(plate)];
            return (
              <span
                key={plate}
                className="rounded-full border border-neutral-800 bg-neutral-950 px-2 py-1"
              >
                {count}×{spec.label}
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}
