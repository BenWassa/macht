export function formatTime(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function formatWorkoutName(name: string): string {
  return name.replace(/^Session\s+[A-Z]\s*[-–—]\s*/i, "");
}

export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

/** A percentage with an explicit sign on gains: "+10%", "0%", "-3.2%". */
export function signedPct(value: number): string {
  return `${value > 0 ? "+" : ""}${value}%`;
}
