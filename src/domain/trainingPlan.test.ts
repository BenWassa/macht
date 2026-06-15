import { describe, expect, it } from "vitest";
import {
  getNextLoadForecastTemplate,
  getNextTrainingTemplate,
} from "./trainingPlan";
import type { SessionLog, Settings } from "./types";

const SETTINGS: Settings = {
  units: "lbs",
  defaultRest: 90,
  rpeMode: "RPE",
  haptics: true,
  audioCue: false,
};

const session = (id: string, date: string, template: string): SessionLog => ({
  id,
  date,
  template,
  duration: "40m",
  volume: 0,
  sets: 0,
  adapted: false,
  isMinimumSession: false,
});

describe("training plan forecast selection", () => {
  it("looks past conditioning sessions for the next load forecast", () => {
    const sessions = [
      session(
        "1",
        "2026-06-10",
        "Session A - Lower Strength + Shoulder Control",
      ),
    ];

    expect(getNextTrainingTemplate(sessions).name).toBe(
      "Session B - Conditioning + Core",
    );
    expect(getNextLoadForecastTemplate(sessions, [], SETTINGS)?.name).toBe(
      "Session C - Lower Hypertrophy + Stability",
    );
  });
});
