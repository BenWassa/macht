import { useState } from "react";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useInjuryStore } from "@/state/useInjuryStore";

type ConfirmStep = "idle" | "confirming";

export function DangerZone() {
  const clearSessions = useHistoryStore((state) => state.clearSessions);
  const clearAllInjuries = useInjuryStore((state) => state.clearAllInjuries);
  const [step, setStep] = useState<ConfirmStep>("idle");

  function handleClearAll() {
    clearSessions();
    clearAllInjuries();
    setStep("idle");
  }

  return (
    <div className="space-y-3">
      <h2 className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
        Danger zone
      </h2>
      <div className="border border-red-900/40 bg-[#0c0c0c] p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="block text-xs font-bold uppercase tracking-tight text-neutral-200">
              Clear all data
            </span>
            <span className="font-mono text-[10px] text-neutral-500">
              Permanently delete all sessions and injuries
            </span>
          </div>

          {step === "idle" ? (
            <button
              onClick={() => setStep("confirming")}
              className="border border-red-900/60 bg-black px-3 py-1 font-mono text-[10px] uppercase text-red-500 transition hover:border-red-700 hover:text-red-400 active:bg-red-950"
            >
              Clear all
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase text-red-400">
                Are you sure?
              </span>
              <button
                onClick={() => setStep("idle")}
                className="border border-[#222] bg-black px-3 py-1 font-mono text-[10px] uppercase text-neutral-400 transition hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="border border-red-700 bg-red-900/30 px-3 py-1 font-mono text-[10px] uppercase text-red-400 transition hover:bg-red-900/60 hover:text-red-300"
              >
                Yes, delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
