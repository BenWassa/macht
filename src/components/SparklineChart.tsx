interface SparklineChartProps {
  data: number[];
  paused?: boolean;
  projected?: number | null;
}

export function SparklineChart({
  data,
  paused = false,
  projected = null,
}: SparklineChartProps) {
  // A single recorded point is drawn as a flat line at its real value rather
  // than collapsed to zero, so one logged session still reads as data.
  const values =
    data.length === 0
      ? [0, 0]
      : data.length === 1
        ? [data[0], data[0]]
        : data;
  const showProjection =
    typeof projected === "number" && projected > 0 && !paused;
  const all = showProjection ? [...values, projected] : values;
  const minVal = Math.min(...all.filter(Boolean)) - 10;
  const maxVal = Math.max(...all.filter(Boolean)) + 10;
  const range = Math.max(1, maxVal - minVal);
  const x = (index: number) => (index / (all.length - 1)) * 360 + 20;
  const y = (value: number) =>
    value ? 80 - ((value - minVal) / range) * 60 : 80;
  const points = values
    .map((value, index) => `${x(index)},${y(value)}`)
    .join(" ");

  return (
    <div className="border border-[#1a1a1a] bg-[#050505] pt-4">
      <svg viewBox="0 0 400 100" className="h-32 w-full">
        {[20, 50, 80].map((gridY) => (
          <line
            key={gridY}
            x1="20"
            y1={gridY}
            x2="380"
            y2={gridY}
            stroke="#141414"
            strokeDasharray="3,3"
          />
        ))}
        <polyline
          fill="none"
          stroke={paused ? "#333" : "#2563eb"}
          strokeWidth="1.5"
          points={points}
        />
        {values.map((value, index) => (
          <circle
            key={`${value}-${index}`}
            cx={x(index)}
            cy={y(value)}
            r="2.5"
            fill={paused ? "#444" : "#2563eb"}
          />
        ))}
        {showProjection && (
          <>
            <line
              x1={x(values.length - 1)}
              y1={y(values[values.length - 1])}
              x2={x(all.length - 1)}
              y2={y(projected)}
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
            <circle
              cx={x(all.length - 1)}
              cy={y(projected)}
              r="3"
              fill="#050505"
              stroke="#10b981"
              strokeWidth="1.5"
            />
          </>
        )}
      </svg>
    </div>
  );
}
