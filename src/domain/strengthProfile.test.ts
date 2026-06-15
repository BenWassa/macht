import { describe, expect, it } from "vitest";
import { computeExerciseE1rm } from "./sessionStats";
import { buildStrengthProfile } from "./strengthProfile";
import type {
  ExerciseInjury,
  SessionLog,
  SetEntry,
  Settings,
} from "./types";

const TODAY = "2026-06-12";

const SETTINGS: Settings = {
  units: "lbs",
  defaultRest: 90,
  rpeMode: "RPE",
  haptics: true,
  audioCue: false,
};

const set = (weight: number, reps: number): SetEntry => ({
  id: 1,
  weight,
  reps,
  rpe: null,
  completed: true,
  last: "-",
});

const squatSession = (
  id: string,
  date: string,
  weight: number,
  reps: number,
  e1rm: number,
): SessionLog => ({
  id,
  date,
  template: "Test",
  duration: "40m",
  volume: 0,
  sets: 1,
  adapted: false,
  isMinimumSession: false,
  exerciseSnapshots: [{ exerciseId: "squat", sets: [set(weight, reps)], e1rm }],
});

describe("computeExerciseE1rm", () => {
  it("records a tracked lift even when every set is above 10 reps", () => {
    const e1rm = computeExerciseE1rm("squat", [set(140, 12)]);
    // reps clamp to 10 → brzycki(140, 10) = 187
    expect(e1rm).toBe(187);
  });

  it("picks the highest estimate across working sets", () => {
    const e1rm = computeExerciseE1rm("squat", [
      set(140, 5),
      set(150, 5),
      set(145, 5),
    ]);
    expect(e1rm).toBe(Math.round(150 * (36 / 32)));
  });

  it("ignores incomplete and unloaded sets", () => {
    const e1rm = computeExerciseE1rm("squat", [
      { ...set(0, 8), weight: 0 },
      { ...set(150, 5), completed: false },
    ]);
    expect(e1rm).toBeUndefined();
  });

  it("does not track non-progress lifts", () => {
    expect(computeExerciseE1rm("leg_press", [set(200, 5)])).toBeUndefined();
  });
});

describe("buildStrengthProfile", () => {
  it("returns an empty profile when nothing is logged", () => {
    const profile = buildStrengthProfile([], [], SETTINGS, [], TODAY);
    expect(profile.trackedCount).toBe(0);
    expect(profile.total).toBe(0);
    expect(profile.totalChangePct).toBeNull();
    expect(profile.lifts).toHaveLength(5);
  });

  it("totals the latest e1RM across logged lifts and computes 28-day trend", () => {
    const sessions: SessionLog[] = [
      squatSession("a", "2026-05-10", 180, 5, 200),
      squatSession("b", "2026-06-10", 200, 5, 220),
    ];
    const profile = buildStrengthProfile(sessions, [], SETTINGS, [], TODAY);
    const squat = profile.lifts.find((l) => l.exerciseId === "squat");

    expect(squat?.current).toBe(220);
    expect(squat?.best).toBe(220);
    expect(profile.total).toBe(220);
    // baseline 28d ago = 200 → (220-200)/200 = +10%
    expect(profile.totalChangePct).toBe(10);
    expect(profile.trackedCount).toBe(1);
  });

  it("marks lifts paused by an avoid-level injury and excludes their forecast", () => {
    const injuries: ExerciseInjury[] = [
      {
        id: "shoulder",
        name: "Labral tear",
        severity: "avoid",
        forbiddenTags: ["barbell_rack_position"],
        notes: "",
        dateAdded: "2026-01-01",
      },
    ];
    const sessions = [
      squatSession("a", "2026-05-10", 180, 5, 200),
      squatSession("b", "2026-06-10", 200, 5, 220),
    ];
    const profile = buildStrengthProfile(sessions, injuries, SETTINGS, [], TODAY);
    const squat = profile.lifts.find((l) => l.exerciseId === "squat");

    expect(squat?.paused).toBe(true);
    expect(squat?.projected).toBeNull();
    expect(squat?.nextWeight).toBeNull();
    // last known strength still counts toward the total
    expect(squat?.current).toBe(220);
    expect(profile.total).toBe(220);
  });
});
