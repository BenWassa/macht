import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-signal text-[var(--color-on-signal)] hover:bg-signal-strong shadow-[var(--shadow-card)]",
  secondary:
    "bg-surface-2 text-text hover:bg-surface-3 shadow-[var(--shadow-card)]",
  ghost:
    "bg-transparent text-text-secondary hover:bg-surface-1 hover:text-text",
  destructive:
    "bg-[var(--color-negative-soft)] text-negative hover:bg-surface-3",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition duration-150 ease-out active:translate-y-px active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`.trim()}
      {...props}
    />
  );
}
