import type { PlateSpec } from "@/domain/plates";

interface PlateMarkerProps {
  spec: PlateSpec;
  scale: number;
  title: string;
}

export function PlateMarker({ spec, scale, title }: PlateMarkerProps) {
  const digits = Number(spec.label) >= 10 ? spec.label.split("") : null;
  const height = spec.h * scale;
  const width = spec.w * scale;
  const fontSize = digits
    ? Math.min((height * 0.9) / digits.length, width * 0.85)
    : 0;

  return (
    <div
      className="relative shrink-0 rounded-sm border border-black"
      style={{ height, width, background: spec.bg }}
      title={title}
    >
      {digits && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ gap: 0, padding: 2 }}
        >
          {digits.map((digit, index) => (
            <span
              key={`${digit}-${index}`}
              style={{
                fontSize,
                fontFamily: "monospace",
                fontWeight: 900,
                color: spec.color,
                lineHeight: 1,
              }}
            >
              {digit}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
