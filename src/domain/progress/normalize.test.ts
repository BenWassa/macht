import { describe, expect, it } from "vitest";
import { inferProgressMuscles } from "./normalize";

describe("legacy muscle inference", () => {
  it("does not guess a generic legs label as quads", () => {
    expect(inferProgressMuscles("Legs")).toEqual([]);
  });

  it("still recognizes explicit quadriceps labels", () => {
    expect(inferProgressMuscles("Quadriceps")).toEqual(["quads"]);
  });
});
