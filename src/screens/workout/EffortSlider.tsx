import type { EffortMode } from "@/domain/types";

const RPE_VALUES = [null, 6, 7, 7.5, 8, 8.5, 9, 9.5, 10] as const;
const RIR_VALUES = [null, 4, 3, 2.5, 2, 1.5, 1, 0.5, 0] as const;

interface EffortSliderProps {
  mode: EffortMode;
  value: number | null;
  onChange: (value: number | null) => void;
}

export function EffortSlider({ mode, value, onChange }: EffortSliderProps) {
  const values = mode === "RIR" ? RIR_VALUES : RPE_VALUES;
  const selectedIndex = Math.max(
    0,
    values.findIndex((option) => option === value),
  );
  const display = value === null ? "--" : value;

  return (
    <div className="border-x border-b border-[#1a1a1a] bg-[#070707] p-3">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
          Effort ({mode})
        </span>
        <span className="font-mono text-lg font-black text-white">
          {display}
        </span>
      </div>
      <input
        aria-label={`Set ${mode}`}
        type="range"
        min={0}
        max={values.length - 1}
        step={1}
        value={selectedIndex}
        onChange={(event) => onChange(values[Number(event.target.value)])}
        className="h-8 w-full accent-blue-600"
      />
      <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-wider text-neutral-600">
        <span>Unset</span>
        <span>{mode === "RIR" ? "Failure" : "Max"}</span>
      </div>
    </div>
  );
}
