import type { Mesocycle } from "@/domain/training/types";

const terminalStatuses = new Set(["completed", "skipped"]);

export function finalizeMesocycleState(mesocycle: Mesocycle): Mesocycle {
  if (mesocycle.status !== "active") return mesocycle;
  const sessions = mesocycle.weeks.flatMap((week) => week.sessions);
  if (!sessions.length) return mesocycle;
  const finished = sessions.every((session) => terminalStatuses.has(session.status));
  return finished ? { ...mesocycle, status: "completed" } : mesocycle;
}
