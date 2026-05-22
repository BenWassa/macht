import { getPlateData, getPlates } from "@/domain/plates";
import type { Units } from "@/domain/types";

interface PlateVisualizerProps {
  weight: number;
  units: Units;
}

export function PlateVisualizer({ weight, units }: PlateVisualizerProps) {
  const plates = getPlates(weight, units);
  const plateData = getPlateData(units);

  const ariaLabel =
    plates.length === 0
      ? `Bar only at ${weight} ${units}`
      : `Loaded ${weight} ${units}. Plates per side: ${plates.join(", ")}.`;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="border border-[#1a1a1a] bg-black p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500">
          Bar load
        </span>
        <span className="text-[10px] font-mono font-bold text-neutral-300">
          {weight} {units}
        </span>
      </div>
      <div className="flex h-20 items-center justify-center">
        <div className="h-3 w-24 bg-neutral-700" />
        <div className="h-7 w-2 bg-neutral-500" />
        <div className="flex h-20 items-center gap-0.5">
          {plates.length === 0 && (
            <span className="px-3 text-[9px] font-mono uppercase text-neutral-600">
              Bar only
            </span>
          )}
          {plates.map((plate, index) => {
            const spec = plateData[plate];
            return (
              <div
                key={`${plate}-${index}`}
                className="flex items-center justify-center border border-black text-[7px] font-bold"
                style={{ height: spec.h, width: spec.w, background: spec.bg, color: spec.color }}
              >
                {spec.label}
              </div>
            );
          })}
        </div>
        <div className="h-7 w-2 bg-neutral-500" />
        <div className="h-3 w-10 bg-neutral-700" />
      </div>
    </div>
  );
}
