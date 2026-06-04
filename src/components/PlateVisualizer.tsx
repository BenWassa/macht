import { useLayoutEffect, useRef, useState } from "react";
import { getPlateData, getPlates } from "@/domain/plates";
import type { Units } from "@/domain/types";
import { useElementWidth } from "@/hooks/useElementWidth";

interface PlateVisualizerProps {
  weight: number;
  units: Units;
}

// Scale the data's base plate dimensions up so the bar reads clearly on
// mobile. Plate height encodes weight (heavier = taller), preserved here.
const PLATE_SCALE = 1.5;

export function PlateVisualizer({ weight, units }: PlateVisualizerProps) {
  const plates = getPlates(weight, units);
  const plateData = getPlateData(units);

  const plateCounts = plates.reduce<Record<string, number>>((acc, plate) => {
    acc[plate] = (acc[plate] ?? 0) + 1;
    return acc;
  }, {});

  // Auto-fit: measure the plate strip's natural width vs the space available
  // between the bar collars and shrink uniformly so heavy loads never clip.
  // scrollWidth ignores the applied transform, so there is no remeasure loop.
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
      className="border border-edge bg-black p-4"
    >
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
          Bar load · per side
        </span>
        <span className="font-mono text-base font-bold tabular-nums text-neutral-200">
          {weight}
          <span className="ml-1 text-[10px] font-bold uppercase text-neutral-500">
            {units}
          </span>
        </span>
      </div>

      <div className="border border-[#141414] bg-well px-2 py-5">
        <div className="relative mx-auto flex h-28 w-full items-center justify-center">
          {/* shaft + inner collar (flat, brutalist) */}
          <div className="h-2.5 min-w-0 flex-1 bg-neutral-700" />
          <div className="h-12 w-2.5 shrink-0 bg-neutral-500" />

          {/* Track: the space the plate strip may occupy. Measured so the strip
              scales down to fit instead of clipping on heavy loads. */}
          <div
            ref={trackRef}
            className="flex h-28 min-w-0 shrink items-center justify-center overflow-hidden px-1"
          >
            <div
              ref={stripRef}
              className="flex h-28 shrink-0 items-center justify-center gap-[3px]"
              style={{ transform: `scale(${fit})`, transformOrigin: "center" }}
            >
              {plates.length === 0 && (
                <span className="border border-[#222] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                  Bar only
                </span>
              )}
              {plates.map((plate, index) => {
                const spec = plateData[plate];
                return (
                  <div
                    key={`${plate}-${index}`}
                    className="shrink-0 border border-black"
                    style={{
                      height: spec.h * PLATE_SCALE,
                      width: spec.w * PLATE_SCALE,
                      background: spec.bg,
                    }}
                    title={`${spec.label} ${units}`}
                  />
                );
              })}
            </div>
          </div>

          {/* outer collar + bar end (flat, brutalist) */}
          <div className="h-12 w-2.5 shrink-0 bg-neutral-500" />
          <div className="h-2.5 w-10 shrink-0 bg-neutral-700" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {plates.length === 0 ? (
          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">
            No plates needed
          </span>
        ) : (
          Object.entries(plateCounts).map(([plate, count]) => {
            const spec = plateData[Number(plate)];
            return (
              <span
                key={plate}
                className="flex items-center gap-1.5 border border-[#222] bg-black px-2 py-1.5 font-mono text-xs font-bold tabular-nums text-neutral-200"
              >
                <span
                  aria-hidden
                  className="h-3 w-3 border border-white/15"
                  style={{ background: spec.bg }}
                />
                {count}
                <span className="text-neutral-500">×</span>
                {spec.label}
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}
