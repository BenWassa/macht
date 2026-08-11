import { getExerciseById } from "@/domain/exerciseLibrary";
import type { Mesocycle, PlannedSession } from "@/domain/training/types";
import type { SessionLog, TemplatePlan } from "@/domain/types";

export interface TodayProgressHighlight {
  exerciseId: string;
  exerciseName: string;
  previous: number;
  current: number;
  delta: number;
}

export interface TodayProgramContext {
  label: string;
  detail: string;
  phase?: "accumulation" | "deload";
  progress?: { current: number; total: number };
}

export interface TodayModel {
  sessionName: string;
  exerciseNames: string[];
  targetAreas: string[];
  exerciseCount: number;
  estimatedDurationMinutes: number;
  completedThisWeek: number;
  weeklyTarget: number;
  program: TodayProgramContext;
  recentProgress?: TodayProgressHighlight;
}

const DAY_MS = 86_400_000;

function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function weekBounds(today: Date): { start: string; end: string } {
  const day = today.getUTCDay();
  const sinceMonday = (day + 6) % 7;
  const start = new Date(today.getTime() - sinceMonday * DAY_MS);
  const end = new Date(start.getTime() + 6 * DAY_MS);
  return { start: dateOnly(start), end: dateOnly(end) };
}

function parseDurationMinutes(duration: string): number | null {
  const hours = duration.match(/(\d+(?:\.\d+)?)\s*h/i);
  const minutes = duration.match(/(\d+(?:\.\d+)?)\s*m/i);
  if (!hours && !minutes) return null;
  return Math.round(
    (hours ? Number(hours[1]) * 60 : 0) +
      (minutes ? Number(minutes[1]) : 0),
  );
}

function estimatedDuration(template: TemplatePlan, sessions: SessionLog[]): number {
  const matching = sessions
    .filter((session) => session.template.startsWith(template.name))
    .map((session) => parseDurationMinutes(session.duration))
    .filter((value): value is number => value != null && value > 0)
    .slice(0, 5);
  if (!matching.length) return Math.max(30, template.exercises.length * 8);
  return Math.round(matching.reduce((sum, value) => sum + value, 0) / matching.length);
}

function latestProgressHighlight(
  sessions: SessionLog[],
): TodayProgressHighlight | undefined {
  const history = new Map<string, number[]>();
  [...sessions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((session) => {
      session.exerciseSnapshots?.forEach((snapshot) => {
        if (snapshot.e1rm == null || snapshot.e1rm <= 0) return;
        const values = history.get(snapshot.exerciseId) ?? [];
        values.push(snapshot.e1rm);
        history.set(snapshot.exerciseId, values);
      });
    });

  let best: TodayProgressHighlight | undefined;
  history.forEach((values, exerciseId) => {
    if (values.length < 2) return;
    const previous = values[values.length - 2] ?? 0;
    const current = values[values.length - 1] ?? 0;
    const delta = current - previous;
    if (delta <= 0 || (best && delta <= best.delta)) return;
    best = {
      exerciseId,
      exerciseName: getExerciseById(exerciseId)?.name ?? exerciseId,
      previous,
      current,
      delta,
    };
  });
  return best;
}

function activePlannedSession(
  mesocycle: Mesocycle,
): { session: PlannedSession; weekIndex: number } | null {
  for (const week of mesocycle.weeks) {
    const session = week.sessions.find(
      (candidate) =>
        candidate.status === "planned" || candidate.status === "moved",
    );
    if (session) return { session, weekIndex: week.index };
  }
  return null;
}

export interface BuildTodayModelInput {
  sessions: SessionLog[];
  legacyTemplate: TemplatePlan;
  today?: Date;
  weeklyTarget?: number;
  activeMesocycle?: Mesocycle;
}

export function buildTodayModel({
  sessions,
  legacyTemplate,
  today = new Date(),
  weeklyTarget = 3,
  activeMesocycle,
}: BuildTodayModelInput): TodayModel {
  const { start, end } = weekBounds(today);
  const completedThisWeek = sessions.filter(
    (session) => session.date >= start && session.date <= end,
  ).length;
  const planned = activeMesocycle ? activePlannedSession(activeMesocycle) : null;

  if (planned && activeMesocycle) {
    const week = activeMesocycle.weeks.find(
      (item) => item.index === planned.weekIndex,
    );
    const exerciseIds = planned.session.prescriptions.map(
      (item) => item.exerciseId,
    );
    const exercises = exerciseIds.map((id) => getExerciseById(id));
    return {
      sessionName: planned.session.name,
      exerciseNames: exercises.map(
        (item, index) => item?.name ?? exerciseIds[index],
      ),
      targetAreas: [
        ...new Set(
          exercises.flatMap((item) => (item?.target ? [item.target] : [])),
        ),
      ],
      exerciseCount: exerciseIds.length,
      estimatedDurationMinutes: planned.session.targetDurationMinutes,
      completedThisWeek,
      weeklyTarget,
      program: {
        label: activeMesocycle.name ?? `Mesocycle ${activeMesocycle.index}`,
        detail: `Week ${planned.weekIndex} of ${activeMesocycle.weeks.length}`,
        phase: week?.phase,
        progress: {
          current: planned.weekIndex,
          total: activeMesocycle.weeks.length,
        },
      },
      recentProgress: latestProgressHighlight(sessions),
    };
  }

  const exercises = legacyTemplate.exercises.map((id) => getExerciseById(id));
  return {
    sessionName: legacyTemplate.name,
    exerciseNames: exercises.map(
      (item, index) => item?.name ?? legacyTemplate.exercises[index],
    ),
    targetAreas: [
      ...new Set(
        exercises.flatMap((item) => (item?.target ? [item.target] : [])),
      ),
    ],
    exerciseCount: legacyTemplate.exercises.length,
    estimatedDurationMinutes: estimatedDuration(legacyTemplate, sessions),
    completedThisWeek,
    weeklyTarget,
    program: {
      label: "Current rotation",
      detail: "Legacy plan · adaptive program setup pending",
    },
    recentProgress: latestProgressHighlight(sessions),
  };
}
