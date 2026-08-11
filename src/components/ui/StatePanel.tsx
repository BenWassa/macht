import type { ReactNode } from "react";
import { toneClasses, type InterfaceTone } from "@/design/system";

interface StatePanelProps {
  tone?: InterfaceTone;
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  action?: ReactNode;
  live?: "off" | "polite" | "assertive";
  className?: string;
}

export function StatePanel({
  tone = "neutral",
  eyebrow,
  title,
  description,
  meta,
  action,
  live = "off",
  className = "",
}: StatePanelProps) {
  return (
    <section
      aria-live={live}
      className={`surface-card space-y-4 p-5 ${className}`.trim()}
    >
      <div className="space-y-2">
        {eyebrow ? (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}
          >
            {eyebrow}
          </span>
        ) : null}
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-text">
            {title}
          </h3>
          {description ? (
            <p className="max-w-prose text-sm leading-6 text-text-secondary">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {meta ? <div className="text-sm text-text-muted">{meta}</div> : null}
      {action ? <div>{action}</div> : null}
    </section>
  );
}
