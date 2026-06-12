import { RotateCcw } from "lucide-react";
import { DEMO_STORAGE_KEYS, IS_DEMO_MODE } from "@/lib/demoMode";

export function DemoModeBanner() {
  if (!IS_DEMO_MODE) return null;

  const resetDemo = () => {
    DEMO_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    window.location.reload();
  };

  return (
    <div className="border-b border-yellow-900 bg-yellow-950/20 px-4 py-2">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
        <div>
          <span className="block font-mono text-[9px] font-bold uppercase tracking-widest text-yellow-500">
            Demo mode
          </span>
          <span className="font-mono text-[10px] text-neutral-500">
            Seeded history, separate local storage
          </span>
        </div>
        <button
          type="button"
          onClick={resetDemo}
          className="flex items-center gap-1.5 border border-yellow-900/80 bg-black px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-yellow-500 transition hover:bg-[#121212]"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>
    </div>
  );
}
