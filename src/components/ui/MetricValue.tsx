import type { ReactNode } from "react";

interface MetricValueProps {
  value: ReactNode;
  unit?: ReactNode;
  label?: string;
  supporting?: ReactNode;
  className?: string;
}

export function MetricValue({
  value,
  unit,
  label,
  supporting,
  className = "",
}: MetricValueProps) {
  return (
    <div className={`space-y-1 ${className}`.trim()}>
      {label ? (
        <div className="text-sm font-medium text-text-secondary">{label}</div>
      ) : null}
      <div className="flex items-baseline gap-2">
        <span
          data-metric="true"
          className="text-4xl font-bold leading-none text-text sm:text-5xl"
        >
          {value}
        </span>
        {unit ? (
          <span className="text-sm font-semibold text-text-muted">{unit}</span>
        ) : null}
      </div>
      {supporting ? (
        <div className="text-sm leading-5 text-text-muted">{supporting}</div>
      ) : null}
    </div>
  );
}
