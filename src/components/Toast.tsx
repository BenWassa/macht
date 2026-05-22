import { useEffect } from "react";
import { useToastStore } from "@/state/useToastStore";

const TOAST_MS = 4000;

export function Toast() {
  const toast = useToastStore((state) => state.toast);
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    if (!toast) return;
    const handle = window.setTimeout(dismiss, TOAST_MS);
    return () => window.clearTimeout(handle);
  }, [toast, dismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-32 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 border border-[#1a1a1a] bg-[#0c0c0c] px-4 py-2 font-mono shadow-lg"
    >
      <span className="text-[11px] uppercase tracking-widest text-neutral-300">
        {toast.message}
      </span>
      {toast.action && (
        <button
          onClick={() => {
            toast.action?.onAction();
            dismiss();
          }}
          className="border border-[#222] bg-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-blue-400 hover:bg-neutral-900"
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
}
