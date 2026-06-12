import { describe, expect, it } from "vitest";
import { suggestNextLoad } from "./progression";
import { buildProgressionForecast } from "./progressionForecast";
import { monthlyGainPct, progressionStreak } from "./progressionStats";
import type { SessionLog, SetEntry, Settings } from "./types";

const TODAY = "2026-06-12";

const SETTINGS: Settings = {
  units: "lbs",
  defaultRest: 90,
  rpeMode: "RPE",
  haptics: true,
  audioCue: false,
};

const set = (
  weight: number,
  reps: number,
  rpe: number | null = null,
): SetEntry => ({ id: 1, weight, reps, rpe, completed: true, last: "-" });

const session = (
  id: string,
  date: string,
  exerciseId: string,
  sets: SetEntry[],
): SessionLog => ({
  id,
  date,
  template: "Test",
  duration: "40m",
  volume: 0,
  sets: sets.length,
  adapted: false,
  isMinimumSession: false,
  exerciseSnapshots: [{ exerciseId, sets }],
});

// leg_press: prescription "3 x 8-12", lower body → +5 lbs increment.
const legPress = (date: string, sets: SetEntry[], id = date) =>
  session(id, date, "leg_press", sets);

const suggest = (sessions: SessionLog[], exerciseId = "leg_press") =>
  suggestNextLoad(exerciseId, sessions, SETTINGS, [], TODAY);

describe("suggestNextLoad", () => {
  it("returns null with fewer than two logged performances", () => {
    expect(suggest([legPress("2026-06-10", [set(100, 10)])])).toBeNull();
  });

  it("returns null for unloaded exercises", () => {
    const sessions = [
      session("1", "2026-06-08", "dead_bug", [set(0, 10)]),
      session("2", "2026-06-10", "dead_bug", [set(0, 10)]),
    ];
    expect(suggest(sessions, "dead_bug")).toBeNull();
  });

  it("progresses one increment when all sets top the range with RPE ≤ 8", () => {
    const sessions = [
      legPress("2026-06-10", [
        set(100, 12, 8),
        set(100, 12, 8),
        set(100, 12, 7),
      ]),
      legPress("2026-06-03", [set(100, 10), set(100, 10), set(100, 10)]),
    ];
    expect(suggest(sessions)).toMatchObject({
      weight: 105,
      basis: "progress",
      deltaFromLast: 5,
      repTarget: 8,
      lastWeight: 100,
    });
  });

  it("suggests add-rep mid-range, bumping the rep target", () => {
    const sessions = [
      legPress("2026-06-10", [set(100, 10, 8), set(100, 10, 8)]),
      legPress("2026-06-03", [set(100, 9), set(100, 9)]),
    ];
    expect(suggest(sessions)).toMatchObject({
      weight: 100,
      basis: "add-rep",
      deltaFromLast: 0,
      repTarget: 11,
    });
  });

  it("repeats the weight after a single missed session", () => {
    const sessions = [
      legPress("2026-06-10", [set(100, 6), set(100, 6)]),
      legPress("2026-06-03", [set(100, 10), set(100, 10)]),
    ];
    expect(suggest(sessions)).toMatchObject({
      weight: 100,
      basis: "repeat",
      deltaFromLast: 0,
    });
  });

  it("treats RPE ≥ 9.5 as a miss", () => {
    const sessions = [
      legPress("2026-06-10", [set(100, 9, 9.5), set(100, 9, 10)]),
      legPress("2026-06-03", [set(100, 10, 8)]),
    ];
    expect(suggest(sessions)).toMatchObject({ basis: "repeat", weight: 100 });
  });

  it("deloads 7.5% after two consecutive missed sessions", () => {
    const sessions = [
      legPress("2026-06-10", [set(100, 6), set(100, 6)]),
      legPress("2026-06-03", [set(100, 7), set(100, 6)]),
    ];
    expect(suggest(sessions)).toMatchObject({
      weight: 92.5,
      basis: "deload",
      deltaFromLast: -7.5,
    });
  });

  it("repeats the weight after a 10+ day gap (rust)", () => {
    const sessions = [
      legPress("2026-05-30", [set(100, 12, 8), set(100, 12, 8)]),
      legPress("2026-05-23", [set(100, 10)]),
    ];
    expect(suggest(sessions)).toMatchObject({
      weight: 100,
      basis: "rust",
      deltaFromLast: 0,
    });
  });

  it("suggests 90% after a 21+ day gap (rust decay)", () => {
    const sessions = [
      legPress("2026-05-15", [set(100, 12, 8)]),
      legPress("2026-05-08", [set(100, 10)]),
    ];
    expect(suggest(sessions)).toMatchObject({
      weight: 90,
      basis: "rust",
      deltaFromLast: -10,
    });
  });

  it("clamps cumulative monthly gain to ~10% of the 28-day anchor", () => {
    const sessions = [
      legPress("2026-06-10", [set(110, 12, 8), set(110, 12, 8)]),
      legPress("2026-05-25", [set(100, 12, 8)]),
    ];
    // +5 would reach 115, but the 28-day anchor (100) caps the month at 110.
    expect(suggest(sessions)).toMatchObject({
      weight: 110,
      basis: "repeat",
      deltaFromLast: 0,
    });
  });

  it("allows a partial step up to the monthly cap", () => {
    const sessions = [
      legPress("2026-06-10", [set(107.5, 12, 8)]),
      legPress("2026-05-25", [set(100, 12, 8)]),
    ];
    expect(suggest(sessions)).toMatchObject({
      weight: 110,
      basis: "progress",
      deltaFromLast: 2.5,
    });
  });

  it("uses smaller increments for upper body in kgs and rounds loadable", () => {
    const kgSettings: Settings = { ...SETTINGS, units: "kgs" };
    const sessions = [
      session("1", "2026-06-10", "tricep_pushdown", [set(30, 15, 8)]),
      session("2", "2026-06-03", "tricep_pushdown", [set(30, 12)]),
    ];
    expect(
      suggestNextLoad("tricep_pushdown", sessions, kgSettings, [], TODAY),
    ).toMatchObject({ weight: 31.25, basis: "progress", deltaFromLast: 1.25 });
  });

  it("normalizes effort in RIR mode (RIR ≥ 2 progresses)", () => {
    const rirSettings: Settings = { ...SETTINGS, rpeMode: "RIR" };
    const sessions = [
      legPress("2026-06-10", [set(100, 12, 2), set(100, 12, 3)]),
      legPress("2026-06-03", [set(100, 10)]),
    ];
    expect(
      suggestNextLoad("leg_press", sessions, rirSettings, [], TODAY),
    ).toMatchObject({ weight: 105, basis: "progress" });
  });
});

describe("progression stats", () => {
  it("counts consecutive top-weight increases as a streak", () => {
    const sessions = [
      legPress("2026-06-10", [set(110, 10)]),
      legPress("2026-06-03", [set(105, 10)]),
      legPress("2026-05-27", [set(100, 10)]),
      legPress("2026-05-20", [set(100, 10)]),
    ];
    expect(progressionStreak("leg_press", sessions)).toBe(2);
  });

  it("reports percent gain over the trailing 28 days", () => {
    const sessions = [
      legPress("2026-06-10", [set(110, 10)]),
      legPress("2026-05-25", [set(100, 10)]),
    ];
    expect(monthlyGainPct("leg_press", sessions, TODAY)).toBe(10);
    expect(monthlyGainPct("leg_press", [sessions[0]], TODAY)).toBeNull();
  });
});

describe("buildProgressionForecast", () => {
  it("uses a real load suggestion before a baseline placeholder", () => {
    const sessions = [
      session("1", "2026-06-10", "hamstring_curl", [set(65, 12, 8)]),
      session("2", "2026-06-03", "hamstring_curl", [set(65, 10, 8)]),
    ];

    expect(
      buildProgressionForecast(
        ["hack_squat", "hamstring_curl"],
        sessions,
        SETTINGS,
      ).primaryTarget?.exerciseId,
    ).toBe("hamstring_curl");
  });
});
