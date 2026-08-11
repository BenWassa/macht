interface TrendPoint {
  date: string;
  value: number;
}

interface TrendChartProps {
  points: TrendPoint[];
  label: string;
  unit?: string;
  series?: "performance" | "load" | "volume" | "fatigue";
}

const strokeFor = (series: TrendChartProps["series"]) =>
  `var(--chart-${series ?? "performance"})`;

export function TrendChart({
  points,
  label,
  unit = "",
  series = "performance",
}: TrendChartProps) {
  if (points.length < 2) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-md bg-inset px-6 text-center text-sm text-text-muted">
        Two completed exposures are needed to draw this trend.
      </div>
    );
  }

  const width = 320;
  const height = 140;
  const paddingX = 14;
  const paddingY = 18;
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(max - min, Math.max(1, max * 0.05));
  const x = (index: number) =>
    paddingX + (index / Math.max(1, points.length - 1)) * (width - paddingX * 2);
  const y = (value: number) =>
    height -
    paddingY -
    ((value - min) / spread) * (height - paddingY * 2);
  const polyline = points
    .map((point, index) => `${x(index)},${y(point.value)}`)
    .join(" ");
  const first = points[0];
  const latest = points[points.length - 1];

  return (
    <figure className="rounded-md bg-inset p-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${label}: ${first.value.toFixed(1)}${unit} on ${first.date}, latest ${latest.value.toFixed(1)}${unit} on ${latest.date}`}
        className="h-44 w-full overflow-visible"
      >
        <title>{label}</title>
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line
            key={fraction}
            x1={paddingX}
            x2={width - paddingX}
            y1={paddingY + fraction * (height - paddingY * 2)}
            y2={paddingY + fraction * (height - paddingY * 2)}
            stroke="var(--color-divider)"
            strokeWidth="1"
          />
        ))}
        <polyline
          points={polyline}
          fill="none"
          stroke={strokeFor(series)}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point, index) => (
          <circle
            key={`${point.date}-${index}`}
            cx={x(index)}
            cy={y(point.value)}
            r={index === points.length - 1 ? 4 : 2.5}
            fill={strokeFor(series)}
          />
        ))}
      </svg>
      <figcaption className="flex items-center justify-between gap-3 text-xs text-text-muted">
        <span>{first.date}</span>
        <span className="metric font-semibold text-text-secondary">
          {latest.value.toFixed(1)}{unit}
        </span>
        <span>{latest.date}</span>
      </figcaption>
    </figure>
  );
}
