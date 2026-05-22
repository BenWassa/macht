import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function useModalA11y<T extends HTMLElement>(
  onClose: () => void,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const prior = document.activeElement as HTMLElement | null;
    const container = ref.current;
    const first = container?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !container) return;
      const list = container.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!list.length) return;
      const head = list[0];
      const tail = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && active === head) {
        event.preventDefault();
        tail.focus();
      } else if (!event.shiftKey && active === tail) {
        event.preventDefault();
        head.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prior?.focus?.();
    };
  }, [onClose]);

  return ref;
}
