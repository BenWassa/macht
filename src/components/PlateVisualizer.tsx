import { useRef } from "react";
import { PlateMarker } from "@/components/PlateMarker";
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

  // Auto-fit: compute the bar assembly's natural width arithmetically and
  // shrink the whole thing to fit the card so heavy loads never overflow.
  // (flex-1 shafts make scrollWidth unreliable, so we sum widths directly.)
  const trackRef = useRef<HTMLDivElement>(null);
  const trackW = useElementWidth(trackRef);

  // Fixed bar furniture widths (px): two w-8 ends, one w-6 center knurl, four
  // flex shafts at their 8px minimum, plus side padding.
  const BAR_FURNITURE = 32 * 2 + 24 + 8 * 4 + 8;
  const platesNaturalW = plates.reduce(
    (sum, p) => sum + plateData[p].w * PLATE_SCALE + 3,
    0,
  );
  // ×2 because the same plates load both sleeves.
  const naturalW = platesNaturalW * 2 + BAR_FURNITURE;

  const fit = trackW > 0 ? Math.min(1, trackW / naturalW) : 1;

  const ariaLabel =
    plates.length === 0
      ? `Bar only at ${weight} ${units}`
      : `Loaded ${weight} ${units}. Plates per side: ${plates.join(", ")}.`;

  const renderPlate = (plate: number, key: string) => {
    const spec = plateData[plate];
    return (
      <PlateMarker
        key={key}
        spec={spec}
        scale={PLATE_SCALE}
        title={`${spec.label} ${units}`}
      />
    );
  };

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

      {/* trackRef measures the available width; the bar assembly inside is
          scaled down as a unit by `fit` so heavy loads never overflow. */}
      <div
        ref={trackRef}
        className="overflow-hidden border border-[#141414] bg-well px-2 py-5"
      >
        <div
          className="relative mx-auto flex h-28 w-full items-center justify-center"
          style={{ transform: `scale(${fit})`, transformOrigin: "center" }}
        >
          {/* left bar end */}
          <div className="h-2.5 w-8 shrink-0 bg-neutral-700" />

          {plates.length === 0 ? (
            <>
              <div className="h-2.5 flex-1 bg-neutral-700" />
              <span className="mx-1 shrink-0 border border-[#222] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                Bar only
              </span>
              <div className="h-2.5 flex-1 bg-neutral-700" />
            </>
          ) : (
            <>
              {/* left sleeve: plates sit against the bar end, outermost first */}
              <div className="flex h-28 shrink-0 items-center gap-[3px] pr-1">
                {[...plates]
                  .reverse()
                  .map((plate, i) => renderPlate(plate, `l-${plate}-${i}`))}
              </div>
              {/* flex shaft + center knurl + flex shaft */}
              <div className="h-2.5 min-w-[8px] flex-1 bg-neutral-700" />
              <div className="h-2.5 w-6 shrink-0 bg-neutral-600" />
              <div className="h-2.5 min-w-[8px] flex-1 bg-neutral-700" />
              {/* right sleeve: heaviest nearest center → outermost against bar end */}
              <div className="flex h-28 shrink-0 items-center gap-[3px] pl-1">
                {plates.map((plate, i) =>
                  renderPlate(plate, `r-${plate}-${i}`),
                )}
              </div>
            </>
          )}

          {/* right bar end */}
          <div className="h-2.5 w-8 shrink-0 bg-neutral-700" />
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
