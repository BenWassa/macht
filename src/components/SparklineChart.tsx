interface SparklineChartProps {
  data: number[];
  paused?: boolean;
}

export function SparklineChart({ data, paused = false }: SparklineChartProps) {
  const values = data.length > 1 ? data : [0, 0];
  const minVal = Math.min(...values.filter(Boolean)) - 10;
  const maxVal = Math.max(...values.filter(Boolean)) + 10;
  const range = Math.max(1, maxVal - minVal);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 360 + 20;
      const y = value ? 80 - ((value - minVal) / range) * 60 : 80;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="border border-[#1a1a1a] bg-[#050505] pt-4">
      <svg viewBox="0 0 400 100" className="h-32 w-full">
        <line
          x1="20"
          y1="20"
          x2="380"
          y2="20"
          stroke="#141414"
          strokeDasharray="3,3"
        />
        <line
          x1="20"
          y1="50"
          x2="380"
          y2="50"
          stroke="#141414"
          strokeDasharray="3,3"
        />
        <line
          x1="20"
          y1="80"
          x2="380"
          y2="80"
          stroke="#141414"
          strokeDasharray="3,3"
        />
        <polyline
          fill="none"
          stroke={paused ? "#333" : "#2563eb"}
          strokeWidth="1.5"
          points={points}
        />
        {values.map((value, index) => {
          const x = (index / (values.length - 1)) * 360 + 20;
          const y = value ? 80 - ((value - minVal) / range) * 60 : 80;
          return (
            <circle
              key={`${value}-${index}`}
              cx={x}
              cy={y}
              r="2.5"
              fill={paused ? "#444" : "#2563eb"}
            />
          );
        })}
      </svg>
    </div>
  );
}
