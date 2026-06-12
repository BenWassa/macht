import { RotateCcw, Timer, X } from "lucide-react";
import { formatTime } from "@/lib/format";

interface RestTimerBannerProps {
  seconds: number;
  running: boolean;
  label?: string;
  doneText?: string;
  increments?: readonly [number, number];
  onAdd: (amount: number) => void;
  onToggle: () => void;
  onReset: () => void;
  onDismiss: () => void;
}

const incrementLabel = (amount: number): string => {
  const sign = amount > 0 ? "+" : "-";
  const abs = Math.abs(amount);
  return abs % 60 === 0 ? `${sign}${abs / 60}m` : `${sign}${abs}s`;
};

export function RestTimerBanner({
  seconds,
  running,
  label = "Rest",
  doneText = "Done - load next set",
  increments = [30, -10],
  onAdd,
  onToggle,
  onReset,
  onDismiss,
}: RestTimerBannerProps) {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 flex items-center justify-between border-t border-[#1a1a1a] bg-[#0c0c0c] px-4 py-3">
      <div className="flex items-center space-x-3">
        <Timer
          className={`h-4 w-4 ${running ? "animate-pulse text-blue-500" : "text-neutral-500"}`}
        />
        <div>
          <span className="block text-[8px] font-mono uppercase leading-none tracking-wider text-neutral-500">
            {label}
          </span>
          <span
            className={`text-xs font-mono font-bold leading-none ${seconds === 0 ? "animate-pulse text-emerald-400" : "text-neutral-200"}`}
          >
            {seconds === 0 ? doneText : formatTime(seconds)}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-1 font-mono">
        {increments.map((amount) => (
          <button
            key={amount}
            onClick={() => onAdd(amount)}
            className="border border-[#222] bg-[#121212] px-2 py-1 text-[9px] text-neutral-300 hover:bg-[#1a1a1a]"
          >
            {incrementLabel(amount)}
          </button>
        ))}
        <button
          onClick={onToggle}
          className="border border-[#222] bg-[#121212] px-2.5 py-1 text-[9px] text-neutral-300 hover:bg-[#1a1a1a]"
        >
          {running ? "Pause" : "Resume"}
        </button>
        <button
          onClick={onReset}
          aria-label={`Reset ${label.toLowerCase()} timer`}
          className="border border-[#222] bg-[#121212] p-1 text-[9px] text-neutral-300 hover:bg-[#1a1a1a]"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
        <button
          onClick={onDismiss}
          aria-label={`Dismiss ${label.toLowerCase()} timer`}
          className="pl-2 text-neutral-500 hover:text-neutral-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
